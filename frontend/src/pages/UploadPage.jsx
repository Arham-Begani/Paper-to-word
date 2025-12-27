import { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaCloudUploadAlt, FaFilePdf, FaImage, FaSpinner, FaTimes } from 'react-icons/fa';
import api from '../api/axios';

const UploadPage = () => {
    const [file, setFile] = useState(null);
    const [dragging, setDragging] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [solveQuestions, setSolveQuestions] = useState(false);
    const [statusText, setStatusText] = useState('');
    const fileInputRef = useRef(null);
    const navigate = useNavigate();

    const handleDragEnter = (e) => { e.preventDefault(); e.stopPropagation(); setDragging(true); };
    const handleDragLeave = (e) => { e.preventDefault(); e.stopPropagation(); setDragging(false); };
    const handleDragOver = (e) => { e.preventDefault(); e.stopPropagation(); };
    const handleDrop = (e) => {
        e.preventDefault(); e.stopPropagation(); setDragging(false);
        if (e.dataTransfer.files && e.dataTransfer.files[0]) {
            setFile(e.dataTransfer.files[0]);
        }
    };

    const handleFileSelect = (e) => {
        if (e.target.files && e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const clearFile = () => setFile(null);

    const startConversion = async () => {
        if (!file) return;
        setIsProcessing(true);
        setStatusText('Uploading your document...');

        try {
            const formData = new FormData();
            formData.append('file', file);

            // 1. Upload
            const uploadRes = await api.post('/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            if (uploadRes.data.error) throw new Error(uploadRes.data.error);

            // 2. Process
            setStatusText(solveQuestions
                ? 'Gemini AI is analyzing and solving questions... (This might take longer)'
                : 'Gemini AI is reading and formatting... (This might take 30-60s)');

            const processRes = await api.post('/process', {
                fileId: uploadRes.data.fileId,
                solveQuestions
            });

            if (processRes.data.error) throw new Error(processRes.data.error);

            // Success -> Navigate
            navigate('/result', { state: { data: processRes.data } });

        } catch (error) {
            console.error(error);
            setStatusText('Error: ' + (error.response?.data?.error || error.message));
            setTimeout(() => {
                setIsProcessing(false);
                setStatusText('');
            }, 3000);
        }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6">
            <AnimatePresence mode='wait'>
                {isProcessing ? (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="text-center"
                        key="processing"
                    >
                        <motion.div
                            animate={{ rotate: 360 }}
                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                            className="inline-block text-6xl text-blue-600 dark:text-blue-400 mb-6"
                        >
                            <FaSpinner />
                        </motion.div>
                        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100 mb-2">Analyzing Document</h2>
                        <p className="text-slate-500 dark:text-slate-400 animate-pulse">{statusText}</p>
                    </motion.div>
                ) : (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                        className="w-full max-w-2xl bg-white dark:bg-slate-800 rounded-3xl shadow-xl p-8 md:p-12 border border-slate-100 dark:border-slate-700 transition-colors"
                        key="upload"
                    >
                        <h2 className="text-3xl font-bold text-slate-800 dark:text-white mb-2 text-center">Upload File</h2>
                        <p className="text-slate-500 dark:text-slate-400 text-center mb-8">Supports Scanned PDFs, Images (JPG, PNG)</p>

                        {!file ? (
                            <div
                                className={`border-3 border-dashed rounded-2xl p-12 flex flex-col items-center justify-center cursor-pointer transition-colors ${dragging ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20' : 'border-slate-200 dark:border-slate-600 hover:border-blue-400 dark:hover:border-blue-500 hover:bg-slate-50 dark:hover:bg-slate-700/50'}`}
                                onDragEnter={handleDragEnter}
                                onDragOver={handleDragOver}
                                onDragLeave={handleDragLeave}
                                onDrop={handleDrop}
                                onClick={() => fileInputRef.current.click()}
                            >
                                <FaCloudUploadAlt className="text-6xl text-slate-300 dark:text-slate-500 mb-4" />
                                <p className="font-semibold text-slate-600 dark:text-slate-300">Click to upload or drag & drop</p>
                                <p className="text-sm text-slate-400 dark:text-slate-500 mt-2">Max file size 10MB</p>
                                <input type="file" ref={fileInputRef} onChange={handleFileSelect} className="hidden" accept="image/*,application/pdf" />
                            </div>
                        ) : (
                            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-2xl p-6 flex items-center justify-between border border-slate-200 dark:border-slate-600">
                                <div className="flex items-center gap-4">
                                    <div className="p-4 bg-white dark:bg-slate-600 rounded-xl shadow-sm text-blue-600 dark:text-blue-400 text-2xl">
                                        {file.type.includes('pdf') ? <FaFilePdf /> : <FaImage />}
                                    </div>
                                    <div>
                                        <p className="font-semibold text-slate-800 dark:text-white line-clamp-1">{file.name}</p>
                                        <p className="text-sm text-slate-500 dark:text-slate-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                    </div>
                                </div>
                                <button onClick={clearFile} className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 text-slate-400 hover:text-red-500 transition rounded-full">
                                    <FaTimes />
                                </button>
                            </div>
                        )}


                        <div className="mt-6 flex items-center justify-center gap-3">
                            <input
                                type="checkbox"
                                id="solveQuestions"
                                checked={solveQuestions}
                                onChange={(e) => setSolveQuestions(e.target.checked)}
                                className="w-5 h-5 text-blue-600 rounded focus:ring-blue-500 border-gray-300 dark:border-slate-600 dark:bg-slate-700"
                            />
                            <label htmlFor="solveQuestions" className="text-slate-600 dark:text-slate-300 font-medium cursor-pointer select-none">
                                Solve Math Questions (AI)
                            </label>
                        </div>

                        <div className="mt-8">
                            <button
                                onClick={startConversion}
                                disabled={!file}
                                className={`w-full py-4 rounded-xl text-lg font-bold transition-all transform ${file ? 'bg-blue-600 text-white shadow-lg hover:shadow-blue-500/30 hover:-translate-y-1' : 'bg-slate-200 dark:bg-slate-700 text-slate-400 dark:text-slate-500 cursor-not-allowed'}`}
                            >
                                Convert to Word
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default UploadPage;
