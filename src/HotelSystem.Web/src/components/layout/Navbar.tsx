import { useNavigate } from 'react-router-dom';
import { authService } from '../../services/api';
import { FaSearch, FaUserCircle, FaSignOutAlt, FaGlobe, FaBars, FaMoon, FaSun } from 'react-icons/fa';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useTheme } from '../../contexts/ThemeContext';
import NotificationBell from './NotificationBell';

interface NavbarProps {
    onMenuClick: () => void;
}

const Navbar = ({ onMenuClick }: NavbarProps) => {
    const navigate = useNavigate();
    const { t, i18n } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const [showDropdown, setShowDropdown] = useState(false);

    const handleLogout = () => {
        authService.logout();
        navigate('/login');
    };

    const changeLanguage = (lng: string) => {
        i18n.changeLanguage(lng);
    };

    return (
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-md h-16 flex items-center justify-between px-4 lg:px-8 shadow-sm sticky top-0 right-0 left-0 lg:left-64 z-40 transition-theme">
            {/* Left side: Hamburger + Search Button */}
            <div className="flex items-center gap-4 flex-1">
                {/* Hamburger menu for mobile/tablet */}
                <button
                    onClick={onMenuClick}
                    className="lg:hidden text-slate-600 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-2"
                    aria-label="Toggle menu"
                >
                    <FaBars className="text-xl" />
                </button>

                {/* Global Search trigger - visible md+ */}
                <button
                    onClick={() => {
                        // Trigger global search (⌘K)
                        const event = new KeyboardEvent('keydown', {
                            key: 'k',
                            ctrlKey: true,
                            bubbles: true
                        });
                        document.dispatchEvent(event);
                    }}
                    className="hidden md:flex items-center bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-full px-4 py-2 flex-1 max-w-lg mx-auto transition-colors group"
                >
                    <FaSearch className="text-slate-400 dark:text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300" />
                    <span className="bg-transparent border-none outline-none ml-2 flex-1 text-slate-400 dark:text-slate-400 group-hover:text-slate-500 dark:group-hover:text-slate-300 text-left">
                        {t('common.search')}
                    </span>
                    <kbd className="hidden lg:inline-block px-2 py-1 bg-white dark:bg-slate-600 border border-slate-300 dark:border-slate-500 rounded text-xs font-mono text-slate-500 dark:text-slate-300">
                        {navigator.platform.includes('Mac') ? '⌘K' : 'Ctrl+K'}
                    </kbd>
                </button>
            </div>

            {/* Right side: Language switcher, notifications, user menu */}
            <div className="flex items-center gap-3 sm:gap-4 lg:gap-6">
                {/* Language Switcher */}
                <div className="flex items-center gap-2 bg-slate-50 px-2 sm:px-3 py-1 rounded-full border border-slate-100">
                    <FaGlobe className="text-slate-400 text-sm" />
                    <button
                        onClick={() => changeLanguage('en')}
                        className={`text-xs font-bold transition-colors ${i18n.language === 'en' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        EN
                    </button>
                    <span className="text-slate-300">|</span>
                    <button
                        onClick={() => changeLanguage('es')}
                        className={`text-xs font-bold transition-colors ${i18n.language === 'es' ? 'text-primary-600' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        ES
                    </button>
                </div>

                {/* Theme Toggle */}
                <button
                    onClick={toggleTheme}
                    className="relative text-slate-500 dark:text-slate-300 hover:text-primary-600 dark:hover:text-primary-400 transition-colors p-2"
                    aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                    title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
                >
                    {theme === 'light' ? (
                        <FaMoon className="text-xl" />
                    ) : (
                        <FaSun className="text-xl" />
                    )}
                </button>

                {/* Notifications */}
                <NotificationBell />

                {/* User menu */}
                <div className="flex items-center gap-3 pl-3 sm:pl-6 border-l border-slate-200">
                    <div className="text-right hidden lg:block">
                        <p className="text-sm font-semibold text-slate-800 dark:text-slate-200">Admin User</p>
                        <p className="text-xs text-slate-500 dark:text-slate-400">Manager</p>
                    </div>

                    <div className="relative">
                        <button
                            onClick={() => setShowDropdown(!showDropdown)}
                            className="flex items-center gap-2 text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                        >
                            <FaUserCircle className="text-2xl sm:text-3xl" />
                        </button>

                        {/* Dropdown */}
                        {showDropdown && (
                            <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-slate-800 rounded-lg shadow-lg border border-slate-100 dark:border-slate-700 py-1 animate-in fade-in zoom-in-95 duration-200">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-slate-50 flex items-center gap-2"
                                >
                                    <FaSignOutAlt /> {t('common.logout')}
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Navbar;
