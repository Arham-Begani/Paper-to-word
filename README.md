# Paper-to-Word AI Converter

Try it Here: https://paper-to-word-frontend.onrender.com/

A production-ready web application that converts scanned documents, PDFs, and images into editable Word (.docx) and PDF files using **Google Gemini AI** and **Tesseract OCR**.

## Features
- **AI-Powered OCR**: Uses Tesseract for text extraction and Gemini AI for error correction and formatting.
- **Smart Structure detection**: Distinguishes between Question Papers and Books.
- **Perfect Formatting**: Preserves headings, lists, and question numbering.
- **Format Support**: Upload Images or Scanned PDFs. Download as Word or PDF.

## Tech Stack
- **Frontend**: React (Vite), Tailwind CSS, Framer Motion
- **Backend**: Node.js, Express, Multer
- **AI & OCR**: Google Gemini API, Tesseract.js, pdf-parse
- **Generators**: docx, pdf-lib

## Setup Instructions

### 1. Backend Setup
1. Navigate to the backend folder:
   ```bash
   cd backend
   ```
2. Install dependencies (if not already):
   ```bash
   npm install
   ```
3. **Configure API Key**:
   - Open `.env` file in `backend/`.
   - Replace `YOUR_GEMINI_API_KEY` with your actual Google Gemini API Key.
   - (Get one here: https://aistudio.google.com/app/apikey)
4. Start the server:
   ```bash
   npm start
   # or
   node server.js
   ```
   Server runs on http://localhost:5000

### 2. Frontend Setup
1. Navigate to the frontend folder:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   Open http://localhost:5173 in your browser.

## usage
1. Go to the Home page.
2. Click "Get Started".
3. Upload an Image or PDF of your text book or question paper.
4. Wait for AI processing.
5. Preview the result and Download as Word or PDF.
