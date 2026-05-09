import { useState } from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from './Sidebar';
import Navbar from './Navbar';

const Layout = () => {
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);

    const toggleSidebar = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const closeSidebar = () => {
        setIsSidebarOpen(false);
    };

    return (
        <div className="bg-slate-50 min-h-screen font-sans">
            <Sidebar isOpen={isSidebarOpen} onClose={closeSidebar} />
            <Navbar onMenuClick={toggleSidebar} />

            {/* Overlay for mobile */}
            {isSidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-40 lg:hidden"
                    onClick={closeSidebar}
                />
            )}

            {/* Main content with responsive margin */}
            <main className="lg:ml-64 p-4 sm:p-6 lg:p-8 pt-6">
                <Outlet />
            </main>
        </div>
    );
};

export default Layout;
