import { Link, useLocation } from 'react-router-dom';
import { FaHome, FaBed, FaCalendarAlt, FaConciergeBell, FaUser, FaSignOutAlt, FaBroom, FaShapes, FaTimes, FaCog, FaUserShield, FaSun, FaMoon, FaHistory, FaChartLine } from 'react-icons/fa';
import { clsx } from 'clsx';
import { useTranslation } from 'react-i18next';
import { authService } from '../../services/api';
import { useTheme } from '../../contexts/ThemeContext';
import { useSettings } from '../../hooks/useSettings';

interface SidebarProps {
    isOpen: boolean;
    onClose: () => void;
}

const Sidebar = ({ isOpen, onClose }: SidebarProps) => {
    const location = useLocation();
    const { t } = useTranslation();
    const { theme, toggleTheme } = useTheme();
    const { data: settings } = useSettings();

    const menuItems = [
        { name: t('sidebar.dashboard'), icon: FaHome, path: '/' },
        { name: t('sidebar.frontDesk'), icon: FaConciergeBell, path: '/front-desk' },
        { name: t('sidebar.reservations'), icon: FaCalendarAlt, path: '/reservations' },
        { name: t('sidebar.guests'), icon: FaUser, path: '/guests' },
        { name: t('sidebar.rooms'), icon: FaBed, path: '/rooms' },
        { name: t('sidebar.housekeeping'), icon: FaBroom, path: '/housekeeping' },
        { name: t('sidebar.roomTypes'), icon: FaShapes, path: '/room-types' },
        { name: t('sidebar.profile'), icon: FaUser, path: '/profile' },
        { name: t('sidebar.reports'), icon: FaChartLine, path: '/reports' },
        { name: t('sidebar.users'), icon: FaUserShield, path: '/users' },
        { name: t('sidebar.auditLogs'), icon: FaHistory, path: '/audit-logs' },
        { name: t('sidebar.settings'), icon: FaCog, path: '/settings' },
    ];

    const handleLogout = () => {
        authService.logout();
        window.location.href = '/login';
    };

    const handleLinkClick = () => {
        // Close sidebar on mobile when navigating
        if (window.innerWidth < 1024) {
            onClose();
        }
    };

    return (
        <div
            className={clsx(
                'h-screen w-64 bg-slate-900 text-white flex flex-col fixed left-0 top-0 shadow-lg z-50 transition-transform duration-300',
                // Mobile: slide in from left
                'lg:translate-x-0',
                isOpen ? 'translate-x-0' : '-translate-x-full'
            )}
        >
            {/* Header with close button for mobile */}
            <div className="p-6 border-b border-slate-700 flex items-center justify-between">
                <div className="flex items-center gap-3 overflow-hidden">
                    {settings?.logoBase64 && (
                        <img
                            src={settings.logoBase64}
                            alt="Logo"
                            className="h-8 w-8 object-contain bg-white rounded-md p-0.5 flex-shrink-0"
                        />
                    )}
                    <h1 className="text-xl font-bold text-white truncate shadow-sm">
                        {settings?.companyName || 'Hotel OS'}
                    </h1>
                </div>
                <button
                    onClick={onClose}
                    className="lg:hidden text-slate-400 hover:text-white transition-colors"
                >
                    <FaTimes className="text-xl" />
                </button>
            </div>

            <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
                {menuItems.map((item) => {
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            onClick={handleLinkClick}
                            className={clsx(
                                'flex items-center gap-4 px-4 py-3 rounded-lg transition-all duration-200 group relative overflow-hidden',
                                isActive
                                    ? 'bg-primary-600 text-white shadow-md shadow-primary-500/30'
                                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                            )}
                        >
                            <item.icon className={clsx("text-lg transition-transform duration-200 group-hover:scale-110", isActive && "text-white")} />
                            <span className="font-medium">{item.name}</span>
                            {isActive && (
                                <div className="absolute left-0 top-0 h-full w-1 bg-white rounded-r-full" />
                            )}
                        </Link>
                    );
                })}
            </nav>

            {/* Footer: Theme & Logout */}
            <div className="p-4 border-t border-slate-700 space-y-2">
                <button
                    onClick={toggleTheme}
                    className="flex items-center gap-3 px-4 py-3 w-full rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
                >
                    {theme === 'light' ? <FaMoon /> : <FaSun />}
                    <span>{theme === 'light' ? 'Dark Mode' : 'Light Mode'}</span>
                </button>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-4 py-3 rounded-lg text-slate-400 hover:bg-red-600 hover:text-white transition-all duration-200 group w-full"
                >
                    <FaSignOutAlt className="text-xl group-hover:scale-110 transition-transform" />
                    <span className="font-medium">{t('sidebar.logout')}</span>
                </button>
            </div>
        </div>
    );
};

export default Sidebar;
