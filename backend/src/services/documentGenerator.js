const { Document, Packer, Paragraph, TextRun, HeadingLevel } = require('docx');
const { PDFDocument, StandardFonts, rgb } = require('pdf-lib');

/**
 * Parses markdown text into a structured block format with rich text support.
 * Supports: Headers (#), Bold (**), Italic (*), Lists (-, 1., a))
 */
const parseMarkdown = (text) => {
    if (!text) return [];

    // Normalize newlines and split
    const lines = text.split(/\r?\n/);
    const blocks = [];

    for (const line of lines) {
        const trimmed = line.trim();
        if (!trimmed) continue;

        // 1. Headers (Flexible: # Title, #Title, ## Title)
        const headerMatch = trimmed.match(/^(#{1,6})\s*(.*)/);
        if (headerMatch) {
            const level = headerMatch[1].length;
            const content = headerMatch[2];
            // Normalize level to supported h1-h6 (mapped to h1-h3 for now in generator)
            blocks.push({ type: `h${Math.min(level, 3)}`, content: parseRichText(content) });
            continue;
        }

        // 2. Lists (Flexible: - Item, * Item, 1. Item, a) Item)
        // Note: Gemini sometimes outputs "1) Item" or "a) Item" for options
        const listMatch = trimmed.match(/^([-*]|\d+[\.)]|[a-zA-Z][\.)])\s+(.*)/);
        if (listMatch) {
            blocks.push({ type: 'number', num: listMatch[1], content: parseRichText(listMatch[2]) });
            continue;
        }

        // 3. Paragraphs
        blocks.push({ type: 'p', content: parseRichText(trimmed) });
    }
    return blocks;
};

/**
 * Parses a string for **bold** and *italic* markers.
 * Handles multiline bolding if occurring within a paragraph block.
 */
const parseRichText = (text) => {
    const segments = [];
    // Regex for **bold** and *italic*
    // We use [\s\S] instead of . to match newlines if they somehow exist in the chunk
    // Order matters: match bold (double char) before italic (single char)
    const regex = /(\*\*[\s\S]*?\*\*|\*[\s\S]*?\*)/g;
    const parts = text.split(regex);

    for (const part of parts) {
        if (!part) continue;

        if (part.startsWith('**') && part.endsWith('**')) {
            const content = part.slice(2, -2);
            // Ensure content isn't empty
            if (content) segments.push({ text: content, bold: true });
        } else if (part.startsWith('*') && part.endsWith('*')) {
            const content = part.slice(1, -1);
            if (content) segments.push({ text: content, italic: true });
        } else {
            segments.push({ text: part });
        }
    }
    return segments;
};

exports.createDocx = async (markdown) => {
    const blocks = parseMarkdown(markdown);

    // Helper to convert rich text segments to docx TextRun objects
    const createRuns = (content) => content.map(seg => new TextRun({
        text: seg.text,
        bold: seg.bold,
        italics: seg.italic,
        size: 24, // 12pt
        font: "Calibri" // Proper font for cleaner look
    }));

    const children = blocks.map(block => {
        switch (block.type) {
            case 'h1':
                return new Paragraph({
                    children: createRuns(block.content),
                    heading: HeadingLevel.HEADING_1,
                    spacing: { before: 240, after: 120 }
                });
            case 'h2':
                return new Paragraph({
                    children: createRuns(block.content),
                    heading: HeadingLevel.HEADING_2,
                    spacing: { before: 240, after: 120 }
                });
            case 'h3':
                return new Paragraph({
                    children: createRuns(block.content),
                    heading: HeadingLevel.HEADING_3,
                    spacing: { before: 200, after: 100 }
                });
            case 'number':
                return new Paragraph({
                    children: [
                        new TextRun({ text: block.num + " ", bold: true, size: 24, font: "Calibri" }),
                        ...createRuns(block.content)
                    ],
                    // Hanging indent simulation
                    indent: { left: 720, hanging: 360 },
                    spacing: { after: 120 }
                });
            default: // p
                return new Paragraph({
                    children: createRuns(block.content),
                    spacing: { after: 120 }
                });
        }
    });

    const doc = new Document({
        sections: [{
            properties: {},
            children: children
        }]
    });

    return await Packer.toBuffer(doc);
};

exports.createPdf = async (markdown) => {
    const doc = await PDFDocument.create();
    let page = doc.addPage();
    let { width, height } = page.getSize();

    const fontRegular = await doc.embedFont(StandardFonts.Helvetica);
    const fontBold = await doc.embedFont(StandardFonts.HelveticaBold);
    const fontItalic = await doc.embedFont(StandardFonts.HelveticaOblique);
    const fontBoldItalic = await doc.embedFont(StandardFonts.HelveticaBoldOblique);

    const margin = 50;
    let y = height - margin;
    const maxWidth = width - 2 * margin;

    const blocks = parseMarkdown(markdown);

    const drawRichTextLine = (content, startX, currentY, size, defaultFont) => {
        let currentX = startX;

        for (const seg of content) {
            let fontToUse = defaultFont;
            if (seg.bold && seg.italic) fontToUse = fontBoldItalic;
            else if (seg.bold) fontToUse = fontBold;
            else if (seg.italic) fontToUse = fontItalic;

            const textWidth = fontToUse.widthOfTextAtSize(seg.text, size);
            page.drawText(seg.text, { x: currentX, y: currentY, size, font: fontToUse, color: rgb(0, 0, 0) });
            currentX += textWidth;
        }
    };

    const wrapAndResegment = (content, size, fontReg, fontBd, fontIt) => {
        let lines = [];
        let currentLine = [];
        let currentCmdWidth = 0;

        for (const seg of content) {
            // Split by words but preserve leading/trailing spaces if needed for continuity
            // Simplified: split by space, but this loses multiple spaces. 
            // Better: split by (\s+)
            const parts = seg.text.split(/(\s+)/);

            let font = fontReg;
            if (seg.bold) font = fontBd;
            if (seg.italic) font = fontIt;

            for (const part of parts) {
                // If part is empty (e.g. split start), skip
                if (part.length === 0) continue;

                const partW = font.widthOfTextAtSize(part, size);

                // If this is a whitespace char, just add it if fits, or if wrapping, it might be dropped at start of line
                if (currentCmdWidth + partW > maxWidth && part.trim().length > 0) {
                    lines.push(currentLine);
                    currentLine = [];
                    currentCmdWidth = 0;
                }

                currentLine.push({ text: part, bold: seg.bold, italic: seg.italic });
                currentCmdWidth += partW;
            }
        }
        if (currentLine.length > 0) lines.push(currentLine);
        return lines;
    };

    for (const block of blocks) {
        let size = 11;
        let spacing = 15;
        let font = fontRegular;
        let indent = 0;

        if (block.type === 'h1') { size = 18; font = fontBold; spacing = 24; }
        else if (block.type === 'h2') { size = 16; font = fontBold; spacing = 20; }
        else if (block.type === 'h3') { size = 14; font = fontBold; spacing = 18; }
        else if (block.type === 'number') {
            // Draw the number at margin, indent the rest
            const numberWidth = fontBold.widthOfTextAtSize(block.num + " ", size);

            // Check page break
            if (y < margin) { page = doc.addPage(); y = height - margin; }

            page.drawText(block.num, { x: margin, y, size, font: fontBold, color: rgb(0, 0, 0) });

            // Indent content
            // We need to wrap content with reduced maxWidth
            // Simplified: just shift X start for the first line. 
            // For robust wrapping with indent, it's complex in pdf-lib.
            // We'll just prepend it to the text flow for PDF simplicity
            block.content.unshift({ text: "  " }); // Spacer
        }

        const lines = wrapAndResegment(block.content, size, fontRegular, fontBold, fontItalic);

        for (const lineSegments of lines) {
            if (y < margin) {
                page = doc.addPage();
                y = height - margin;
            }
            // For list items, we might want to offset x if we did proper hanging indent logic
            // For now, simple left align
            drawRichTextLine(lineSegments, block.type === 'number' ? margin + 20 : margin, y, size, font);
            y -= spacing;
        }
        y -= 6; // Paragraph gap
    }

    const pdfBytes = await doc.save();
    return Buffer.from(pdfBytes);
};
