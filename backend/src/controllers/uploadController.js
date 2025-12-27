const ocrService = require('../services/ocrService');
const geminiService = require('../services/geminiService');
const documentGenerator = require('../services/documentGenerator');
const fs = require('fs');
const path = require('path');

exports.uploadFile = (req, res) => {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    res.json({
        fileId: req.file.filename,
        originalName: req.file.originalname,
        message: "File uploaded successfully"
    });
};

exports.processFile = async (req, res) => {
    try {
        const { fileId, solveQuestions } = req.body;
        if (!fileId) return res.status(400).json({ error: 'fileId required' });

        const filePath = path.join(__dirname, '../../uploads', fileId);

        if (!fs.existsSync(filePath)) {
            return res.status(404).json({ error: 'File not found' });
        }

        const ext = path.extname(fileId).toLowerCase();
        let mimetype = 'application/octet-stream';
        if (['.png', '.jpg', '.jpeg'].includes(ext)) mimetype = 'image/jpeg';
        if (ext === '.pdf') mimetype = 'application/pdf';

        // 1. Process File (Extract Text OR Get Image Buffer)
        // Now returns { type, data, mimeType } OR { type, content }
        console.log(`Processing ${fileId}...`);
        const processedInput = await ocrService.processFile({ path: filePath, mimetype });

        // 2. Multimodal Gemini Processing
        // We pass the entire processedInput object
        console.log(`Sending to Gemini (${processedInput.type}) [Solve: ${!!solveQuestions}]...`);
        const processed = await geminiService.processWithGemini(processedInput, solveQuestions);

        // Return raw text only if available (for debug), otherwise null for images
        const debugRaw = processedInput.type === 'text' ? processedInput.content : '[Image Data]';

        res.json({ success: true, ...processed, rawText: debugRaw });
    } catch (error) {
        console.error("Processing Error:", error);
        res.status(500).json({ error: error.message });
    }
};

exports.generateDownload = async (req, res) => {
    try {
        const { markdown, format } = req.body;
        if (!markdown || !format) return res.status(400).json({ error: 'markdown and format required' });

        let buffer;
        let filename;

        if (format === 'docx') {
            buffer = await documentGenerator.createDocx(markdown);
            filename = 'converted_document.docx';
            res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document');
        } else if (format === 'pdf') {
            buffer = await documentGenerator.createPdf(markdown);
            filename = 'converted_document.pdf';
            res.setHeader('Content-Type', 'application/pdf');
        } else {
            return res.status(400).json({ error: 'Invalid format. Use "docx" or "pdf".' });
        }

        res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
        res.send(buffer);
    } catch (error) {
        console.error("Generation Error:", error);
        res.status(500).json({ error: error.message });
    }
};
