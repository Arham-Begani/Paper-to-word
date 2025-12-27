const Tesseract = require('tesseract.js');
const pdfParse = require('pdf-parse');
const fs = require('fs');

/**
 * Processes the uploaded file.
 * - If Image: Returns raw image buffer for Gemini Vision (High Accuracy).
 * - If PDF: Extracts text using pdf-parse (Medium Accuracy, but no dependencies).
 *   (Ideally, we'd convert PDF to Image, but that requires ImageMagick/Ghostscript).
 */
exports.processFile = async (file) => {
    const { path: filePath, mimetype } = file;

    try {
        if (mimetype.startsWith('image/')) {
            // For Images: Return binary data for Multimodal AI
            const imageBuffer = fs.readFileSync(filePath);
            return {
                type: 'image',
                mimeType: mimetype,
                data: imageBuffer.toString('base64'),
                path: filePath
            };
        } else if (mimetype === 'application/pdf') {
            // For PDFs: Extract Text Fallback
            const dataBuffer = fs.readFileSync(filePath);
            const data = await pdfParse(dataBuffer);

            let text = data.text;
            if (!text || text.trim().length < 50) {
                text = "[SCANNED_PDF_DETECTED] This PDF seems to be an image scan. Text extraction might be poor. For best results, convert to JPG/PNG.";
            }

            return {
                type: 'text',
                content: text
            };
        } else {
            throw new Error('Unsupported file type');
        }
    } catch (error) {
        console.error("File Processing Error:", error);
        throw new Error('Failed to process file.');
    }
};
