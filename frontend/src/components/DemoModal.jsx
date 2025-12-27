import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaTimes, FaMagic, FaArrowRight } from 'react-icons/fa';
import { HiSparkles } from 'react-icons/hi';
import { useNavigate } from 'react-router-dom';

const DemoModal = ({ isOpen, onClose }) => {
    const navigate = useNavigate();
    const [sliderPos, setSliderPos] = useState(50);

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        setSliderPos(Math.min(Math.max(x, 0), 100));
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-2 md:p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/90 backdrop-blur-xl"
                    />

                    {/* Modal Content */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 40 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 40 }}
                        className="relative w-full max-w-5xl bg-white dark:bg-slate-900 rounded-[1.5rem] md:rounded-[2rem] overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[95vh] md:max-h-[90vh]"
                    >
                        {/* Header */}
                        <div className="p-5 md:p-8 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between shrink-0">
                            <div className="space-y-1">
                                <h2 className="text-xl md:text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2 md:gap-3 tracking-tight">
                                    <span className="bg-blue-600 p-1.5 md:p-2 rounded-lg text-white text-base md:text-xl">
                                        <FaMagic />
                                    </span>
                                    The Transformation
                                </h2>
                                <p className="text-xs md:text-sm text-slate-500 dark:text-slate-400 font-medium">
                                    Drag the slider to see how AI reconstructs your documents.
                                </p>
                            </div>
                            <button
                                onClick={onClose}
                                className="p-2 md:p-3 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl md:rounded-2xl transition-all group"
                            >
                                <FaTimes className="text-xl md:text-2xl text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-200" />
                            </button>
                        </div>

                        {/* Content Area - Scrollable */}
                        <div className="overflow-y-auto custom-scrollbar flex-grow">
                            {/* Interactive Comparison */}
                            <div className="p-4 md:p-8 relative">
                                <div
                                    className="relative aspect-[4/3] md:aspect-[16/9] w-full rounded-xl md:rounded-2xl overflow-hidden cursor-ew-resize select-none border border-slate-200 dark:border-slate-800 shadow-inner"
                                    onMouseMove={handleMouseMove}
                                    onTouchMove={(e) => {
                                        const touch = e.touches[0];
                                        const rect = e.currentTarget.getBoundingClientRect();
                                        const x = ((touch.clientX - rect.left) / rect.width) * 100;
                                        setSliderPos(Math.min(Math.max(x, 0), 100));
                                    }}
                                >
                                    {/* After (Base) */}
                                    <img
                                        src="/word_document_demo.png"
                                        alt="After"
                                        className="absolute inset-0 w-full h-full object-cover"
                                    />

                                    {/* Labels */}
                                    <div className="absolute top-2 md:top-4 right-2 md:right-4 z-20 px-2 md:px-4 py-1 md:py-2 bg-green-500 text-white text-[10px] md:text-xs font-bold rounded-full shadow-lg">
                                        AFTER: WORD
                                    </div>
                                    <div className="absolute top-2 md:top-4 left-2 md:left-4 z-20 px-2 md:px-4 py-1 md:py-2 bg-slate-800 text-white text-[10px] md:text-xs font-bold rounded-full shadow-lg">
                                        BEFORE: SCAN
                                    </div>

                                    {/* Before (Clipped) */}
                                    <div
                                        className="absolute inset-0 w-full h-full object-cover overflow-hidden"
                                        style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
                                    >
                                        <img
                                            src="/scanned_paper_demo.png"
                                            alt="Before"
                                            className="w-full h-full object-cover"
                                        />
                                    </div>

                                    {/* Slider Line */}
                                    <div
                                        className="absolute top-0 bottom-0 w-1 bg-white shadow-[0_0_15px_rgba(0,0,0,0.3)] z-30 flex items-center justify-center pointer-events-none"
                                        style={{ left: `${sliderPos}%` }}
                                    >
                                        <div className="w-8 h-8 md:w-10 md:h-10 bg-white dark:bg-slate-800 rounded-full flex items-center justify-center shadow-2xl border-2 md:border-4 border-blue-500">
                                            <FaArrowRight className="text-blue-500 text-xs md:text-sm" />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Features Info */}
                            <div className="px-4 md:px-8 pb-8 grid grid-cols-1 md:grid-cols-3 gap-3 md:gap-6">
                                {[
                                    { title: "Math OCR", desc: "Recognizes complex LaTeX formulas with high accuracy." },
                                    { title: "Layout Engine", desc: "Preserves tables, margins, and complex alignments." },
                                    { title: "AI Solving", desc: "Optionally explains and solves mathematical steps." }
                                ].map((f, i) => (
                                    <div key={i} className="p-3 md:p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl md:rounded-2xl border border-slate-100 dark:border-slate-800">
                                        <h4 className="font-bold text-sm md:text-base text-slate-800 dark:text-white mb-0.5 md:mb-1 flex items-center gap-2">
                                            <HiSparkles className="text-blue-500 text-[10px] md:text-xs" /> {f.title}
                                        </h4>
                                        <p className="text-[11px] md:text-sm text-slate-500 dark:text-slate-400 leading-snug">{f.desc}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer / CTA */}
                        <div className="p-6 md:p-8 bg-blue-600 dark:bg-blue-700 text-white flex flex-col md:flex-row items-center justify-between gap-4 md:gap-6 shrink-0">
                            <div className="text-center md:text-left">
                                <h3 className="text-lg md:text-2xl font-black mb-0.5 italic">Ready to transform yours?</h3>
                                <p className="text-[10px] md:text-sm text-blue-100 font-medium whitespace-nowrap">Start converting your first document for free.</p>
                            </div>
                            <button
                                onClick={() => {
                                    onClose();
                                    navigate('/upload');
                                }}
                                className="w-full md:w-auto px-8 md:px-10 py-3 md:py-5 bg-white text-blue-600 font-black rounded-xl md:rounded-2xl hover:bg-blue-50 transition-all shadow-lg shrink-0 uppercase tracking-wider text-xs md:text-sm"
                            >
                                Start For Free
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
};

export default DemoModal;
