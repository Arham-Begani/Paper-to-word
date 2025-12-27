import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaBookOpen, FaMagic, FaDownload, FaRocket } from 'react-icons/fa';

const LandingPage = () => {
    const navigate = useNavigate();

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: { opacity: 1, transition: { staggerChildren: 0.1 } }
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 30 },
        visible: { opacity: 1, y: 0 }
    };

    return (
        <div className="flex flex-col items-center justify-center min-h-[calc(100vh-80px)] text-slate-800 dark:text-slate-100 overflow-hidden relative">

            {/* Background Gradients */}
            <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-purple-400/30 rounded-full blur-[100px] -z-10 animate-pulse-slow"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-400/30 rounded-full blur-[100px] -z-10 animate-pulse-slow delay-1000"></div>

            <motion.div
                variants={containerVariants}
                initial="hidden"
                animate="visible"
                className="max-w-6xl px-6 w-full text-center mt-12 md:mt-20 mb-20 md:mb-32"
            >
                {/* Hero Section */}
                <motion.div variants={itemVariants} className="mb-6">
                    <span className="px-4 py-2 rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-300 font-semibold text-sm border border-blue-200 dark:border-blue-800">
                        ✨ AI-Powered Document Converter
                    </span>
                </motion.div>

                <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-extrabold mb-6 tracking-tight leading-tight">
                    Stop Typesetting.<br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 dark:from-blue-400 dark:to-purple-400">
                        Start Converting.
                    </span>
                </motion.h1>

                <motion.p variants={itemVariants} className="text-xl md:text-2xl text-slate-500 dark:text-slate-400 mb-10 max-w-2xl mx-auto">
                    Turn books, math papers, and scanned PDFs into perfect, editable Word documents in seconds.
                    <span className="hidden md:inline"> Now with AI math solving.</span>
                </motion.p>

                <motion.div variants={itemVariants} className="flex flex-col md:flex-row gap-4 justify-center items-center">
                    <button
                        onClick={() => navigate('/upload')}
                        className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-lg font-bold shadow-xl shadow-blue-600/20 transform transition hover:-translate-y-1 w-full md:w-auto flex items-center justify-center gap-2"
                    >
                        <FaRocket /> Start Converting Free
                    </button>
                    <button className="px-8 py-4 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl text-lg font-bold hover:bg-slate-50 dark:hover:bg-slate-700 transition w-full md:w-auto">
                        View Demo
                    </button>
                </motion.div>
            </motion.div>

            {/* Feature Cards */}
            <motion.div
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="grid grid-cols-1 md:grid-cols-3 gap-8 px-6 max-w-6xl w-full mb-24"
            >
                {[
                    { icon: <FaBookOpen />, title: "Format Preservation", text: "Keeps headers, bold text, and lists exactly as they appear." },
                    { icon: <FaMagic />, title: "AI Math & Vision", text: "Understands complex math formulas and tables via Gemini Vision." },
                    { icon: <FaDownload />, title: "Docx & PDF", text: "Get high-fidelity Word files ready for editing immediately." }
                ].map((feature, i) => (
                    <motion.div
                        key={i}
                        variants={itemVariants}
                        className="bg-white/50 dark:bg-slate-800/50 backdrop-blur-lg p-8 rounded-3xl border border-white/20 dark:border-slate-700/50 shadow-lg hover:shadow-xl transition-shadow"
                    >
                        <div className="w-14 h-14 bg-blue-100 dark:bg-blue-900/50 rounded-2xl flex items-center justify-center text-2xl text-blue-600 dark:text-blue-400 mb-6">
                            {feature.icon}
                        </div>
                        <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed">
                            {feature.text}
                        </p>
                    </motion.div>
                ))}
            </motion.div>
        </div>
    );
};

export default LandingPage;
