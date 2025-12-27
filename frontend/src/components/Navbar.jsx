import { Link } from 'react-router-dom';
import { FaBookOpen, FaMoon, FaSun } from 'react-icons/fa';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const { theme, toggleTheme } = useTheme();

    return (
        <nav className="flex justify-between items-center px-6 md:px-12 py-4 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md shadow-sm sticky top-0 z-50 border-b border-gray-100 dark:border-slate-800 transition-colors duration-300">
            <Link to="/" className="flex items-center gap-2 text-2xl font-bold text-blue-600 tracking-tight">
                <FaBookOpen />
                <span>Paper2Word</span>
            </Link>
            <div className="flex items-center gap-6 font-medium text-gray-600 dark:text-gray-300">
                <button
                    onClick={toggleTheme}
                    className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition text-xl"
                    aria-label="Toggle Theme"
                >
                    {theme === 'light' ? <FaMoon className="text-slate-600" /> : <FaSun className="text-yellow-400" />}
                </button>
                <Link to="/" className="hover:text-blue-600 transition hidden md:block">Home</Link>
                <Link to="/upload" className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition shadow-lg shadow-blue-500/20">Convert Now</Link>
            </div>
        </nav>
    );
};
export default Navbar;
