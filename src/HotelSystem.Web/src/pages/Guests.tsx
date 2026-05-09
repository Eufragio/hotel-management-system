import { useState, useMemo } from 'react';
import { Guest } from '../services/api';
import { FaPlus, FaEnvelope, FaPhone, FaIdCard, FaEdit, FaHistory, FaSearch, FaUserFriends, FaFileExcel, FaFilePdf, FaChevronLeft, FaChevronRight, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import CreateGuestModal from '../components/guests/CreateGuestModal';
import EditGuestModal from '../components/guests/EditGuestModal';
import GuestHistoryModal from '../components/guests/GuestHistoryModal';
import { useTranslation } from 'react-i18next';
import SkeletonTable from '../components/common/SkeletonTable';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useGuests, useToggleGuestActive } from '../hooks/useGuests';
import { exportGuestsToExcel } from '../utils/excelExports';
import { generateGuestListPDF } from '../utils/pdfExports';
import { useSettings } from '../hooks/useSettings';


const Guests = () => {
    const { t } = useTranslation();
    const { data: settings } = useSettings();

    // React Query hooks
    const { data: guests = [], isLoading: loading, error } = useGuests();

    const toggleGuestActiveMutation = useToggleGuestActive();

    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    // CRM Modal States
    const [editGuest, setEditGuest] = useState<Guest | null>(null);
    const [historyGuest, setHistoryGuest] = useState<Guest | null>(null);

    // Toggle Confirmation
    const [guestToToggle, setGuestToToggle] = useState<Guest | null>(null);

    // Search
    const [searchTerm, setSearchTerm] = useState('');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Memoized filtered guests for performance
    const filteredGuests = useMemo(() => {
        const term = searchTerm.toLowerCase();
        return guests.filter((guest: Guest) =>
            guest.firstName.toLowerCase().includes(term) ||
            guest.lastName.toLowerCase().includes(term) ||
            guest.email.toLowerCase().includes(term) ||
            guest.identificationNumber.toLowerCase().includes(term)
        );
    }, [guests, searchTerm]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredGuests.length / itemsPerPage);
    const paginatedGuests = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredGuests.slice(start, start + itemsPerPage);
    }, [filteredGuests, currentPage]);

    // Reset to page 1 when search changes
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm]);

    const handleToggle = () => {
        if (!guestToToggle) return;
        toggleGuestActiveMutation.mutate(guestToToggle.id);
        setGuestToToggle(null);
    };

    const getInitials = (firstName: string, lastName: string) => {
        return `${firstName.charAt(0)}${lastName.charAt(0)}`.toUpperCase();
    };

    // Premium gradient colors for avatars
    const getGradientColors = (index: number) => {
        const gradients = [
            'from-purple-500 via-fuchsia-500 to-pink-500',
            'from-blue-500 via-indigo-500 to-purple-500',
            'from-cyan-500 via-teal-500 to-emerald-500',
            'from-emerald-500 via-green-500 to-teal-500',
            'from-orange-500 via-amber-500 to-yellow-500',
            'from-pink-500 via-rose-500 to-red-500',
            'from-red-500 via-orange-500 to-amber-500',
            'from-indigo-500 via-blue-500 to-cyan-500',
        ];
        return gradients[index % gradients.length];
    };

    return (
        <div className="min-h-screen space-y-8 p-6 bg-gradient-to-br from-slate-50 via-emerald-50 to-teal-50">
            {/* Enhanced Header with Glassmorphism */}
            <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/20 p-4 md:p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-emerald-600/10 via-teal-600/10 to-cyan-600/10"></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-emerald-600 via-teal-600 to-cyan-600 bg-clip-text text-transparent mb-2 text-center md:text-left">
                            {t('guests.title')}
                        </h1>
                        <p className="text-slate-600 text-base md:text-lg font-medium text-center md:text-left">{t('guests.subtitle')}</p>
                    </div>
                    <div className="flex gap-3 flex-wrap justify-center md:justify-end">
                        <button
                            onClick={() => exportGuestsToExcel(filteredGuests)}
                            className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 md:px-5 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            title="Export to Excel"
                        >
                            <FaFileExcel className="text-lg" />
                            <span className="hidden sm:inline font-semibold">Excel</span>
                        </button>
                        <button
                            onClick={() => settings && generateGuestListPDF(filteredGuests, settings)}
                            className="group relative bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 md:px-5 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            title="Export to PDF"
                        >
                            <FaFilePdf className="text-lg" />
                            <span className="hidden sm:inline font-semibold">PDF</span>
                        </button>
                        <button
                            onClick={() => setIsCreateModalOpen(true)}
                            className="group relative bg-gradient-to-r from-teal-600 to-emerald-600 hover:from-teal-700 hover:to-emerald-700 text-white px-4 md:px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
                        >
                            <FaPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                            <span className="font-semibold">{t('guests.registerGuest')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Search Bar */}
            <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl shadow-xl border border-white/20 p-6">
                <div className="relative">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder={t('guests.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>
            </div>

            {loading ? (
                <SkeletonTable rows={8} />
            ) : error ? (
                <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center text-red-600">
                    <p className="font-semibold">Error loading guests</p>
                    <p className="text-sm mt-1">{(error as any)?.message || 'Unknown error occurred'}</p>
                    {(error as any)?.response?.status === 401 && (
                        <p className="text-sm mt-2 font-mono bg-red-100 inline-block px-2 py-1 rounded">Status: 401 Unauthorized - Check your login session</p>
                    )}
                </div>
            ) : filteredGuests.length === 0 ? (
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
                    <EmptyState
                        icon={<FaUserFriends />}
                        title={searchTerm ? t('guests.noGuests') : t('guests.noGuestsStart')}
                        description={searchTerm ? t('guests.noGuestsFiltered') : t('guests.noGuestsDescription')}
                        action={!searchTerm ? {
                            label: t('guests.registerGuest'),
                            onClick: () => setIsCreateModalOpen(true)
                        } : undefined}
                    />
                </div>
            ) : (
                <>
                    {/* Premium Cards Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedGuests.map((guest: Guest, index: number) => (
                            <div
                                key={guest.id}
                                className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:border-transparent hover:-translate-y-2"
                                style={{
                                    animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                                }}
                            >
                                {/* Gradient Header with Avatar */}
                                <div className={`relative h-32 bg-gradient-to-br ${getGradientColors(index)} overflow-hidden`}>
                                    <div className="absolute inset-0 opacity-20">
                                        <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700"></div>
                                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                                    </div>

                                    {/* Avatar positioned at bottom center, overlapping header and content */}
                                    <div className="absolute -bottom-12 left-1/2 -translate-x-1/2">
                                        <div className="relative">
                                            <div className="bg-white/20 backdrop-blur-md p-1 rounded-2xl shadow-2xl group-hover:scale-110 transition-transform duration-300">
                                                <div className="w-24 h-24 bg-white rounded-xl flex items-center justify-center">
                                                    <span className={`text-3xl font-extrabold bg-gradient-to-br ${getGradientColors(index)} bg-clip-text text-transparent`}>
                                                        {getInitials(guest.firstName, guest.lastName)}
                                                    </span>
                                                </div>
                                            </div>
                                            {/* Status Badge */}
                                            <div className="absolute -top-2 -right-2">
                                                <span className={`flex items-center justify-center w-8 h-8 rounded-full shadow-lg border-2 border-white ${guest.isActive ? 'bg-gradient-to-br from-green-400 to-emerald-500' : 'bg-gradient-to-br from-red-400 to-rose-500'}`}>
                                                    {guest.isActive ? (
                                                        <FaToggleOn className="text-white text-sm" />
                                                    ) : (
                                                        <FaToggleOff className="text-white text-sm" />
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 pt-16 space-y-4">
                                    {/* Name */}
                                    <div className="text-center">
                                        <h3 className="text-xl font-extrabold text-slate-800 mb-1 group-hover:text-emerald-600 transition-colors duration-300">
                                            {guest.firstName} {guest.lastName}
                                        </h3>
                                        <span className={`inline-flex px-3 py-1 rounded-full text-xs font-bold shadow-sm ${guest.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                            {guest.isActive ? t('common.active') : t('common.inactive')}
                                        </span>
                                    </div>

                                    {/* Contact Info */}
                                    <div className="space-y-2 text-sm">
                                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                            <FaEnvelope className="text-emerald-500 flex-shrink-0" />
                                            <span className="truncate">{guest.email}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                            <FaPhone className="text-teal-500 flex-shrink-0" />
                                            <span>{guest.phone}</span>
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                                            <FaIdCard className="text-cyan-500 flex-shrink-0" />
                                            <span className="font-mono font-semibold">{guest.identificationNumber}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-3">
                                        <button
                                            onClick={() => setEditGuest(guest)}
                                            className="flex-1 bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white px-3 py-2.5 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 shadow-md hover:shadow-lg font-semibold text-sm group/btn"
                                            title={t('common.edit') || "Editar"}
                                        >
                                            <FaEdit className="group-hover/btn:rotate-12 transition-transform duration-300" />
                                            <span>{t('common.edit')}</span>
                                        </button>
                                        <button
                                            onClick={() => setHistoryGuest(guest)}
                                            className="bg-gradient-to-r from-teal-500 to-cyan-500 hover:from-teal-600 hover:to-cyan-600 text-white px-3 py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg"
                                            title={t('guests.actions.viewHistory') || "Ver Historial"}
                                        >
                                            <FaHistory />
                                        </button>
                                        <button
                                            onClick={() => setGuestToToggle(guest)}
                                            className={`px-3 py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg ${guest.isActive
                                                ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white'
                                                : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                                                }`}
                                            title={t('rooms.toggleActive') || "Activar/Desactivar"}
                                        >
                                            {guest.isActive ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Enhanced Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="group p-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl disabled:hover:shadow-lg hover:scale-110 disabled:hover:scale-100"
                            >
                                <FaChevronLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
                            </button>
                            <div className="bg-white/80 backdrop-blur-sm px-6 py-3 rounded-xl border border-emerald-200 shadow-md">
                                <span className="text-sm font-bold bg-gradient-to-r from-emerald-600 to-teal-600 bg-clip-text text-transparent">
                                    {t('common.page')} {currentPage} {t('common.of')} {totalPages}
                                </span>
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="group p-3 rounded-xl bg-gradient-to-r from-teal-500 to-emerald-500 hover:from-teal-600 hover:to-emerald-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl disabled:hover:shadow-lg hover:scale-110 disabled:hover:scale-100"
                            >
                                <FaChevronRight className="group-hover:translate-x-1 transition-transform duration-300" />
                            </button>
                        </div>
                    )}
                </>
            )
            }

            {/* Modals */}
            <CreateGuestModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onSuccess={() => { }} // React Query handles refetching automatically
            />

            <EditGuestModal
                isOpen={!!editGuest}
                onClose={() => setEditGuest(null)}
                onSuccess={() => { }} // React Query handles refetching automatically
                guest={editGuest}
            />

            <GuestHistoryModal
                isOpen={!!historyGuest}
                onClose={() => setHistoryGuest(null)}
                guest={historyGuest}
            />

            <ConfirmDialog
                isOpen={!!guestToToggle}
                onClose={() => setGuestToToggle(null)}
                onConfirm={handleToggle}
                title={t('guests.actions.toggleActive')}
                message={guestToToggle?.isActive
                    ? t('guests.confirmDeactivate')
                    : t('guests.confirmActivate')}
                confirmText={t('common.confirm')}
                cancelText={t('common.cancel')}
                type={guestToToggle?.isActive ? "warning" : "info"}
            />
            {/* Custom Animation Keyframes */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
            `}</style>
        </div >
    );
};

export default Guests;
