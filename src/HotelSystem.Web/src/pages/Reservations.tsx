import { useEffect, useState } from 'react';
import { reservationService, Reservation, ReservationStatus } from '../services/api';
import { FaPlus, FaCalendarAlt, FaSearch, FaFileInvoiceDollar, FaCalendarTimes, FaFileExcel, FaFilePdf, FaTh, FaList } from 'react-icons/fa';
import ReservationModal from '../components/reservations/ReservationModal';
import InvoiceModal from '../components/reservations/InvoiceModal';
import ReservationDetailsModal from '../components/reservations/ReservationDetailsModal';
import ReservationCard from '../components/reservations/ReservationCard';
import { useTranslation } from 'react-i18next';
import { generateReservationReportPDF } from '../utils/pdfExports';
import { exportReservationsToExcel } from '../utils/excelExports';
import { useSettings } from '../hooks/useSettings';
import SkeletonTable from '../components/common/SkeletonTable';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import { useCurrency } from '../hooks/useCurrency';

const Reservations = () => {
    const { t } = useTranslation();
    const { data: settings } = useSettings();
    const { formatCurrency } = useCurrency();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingReservation, setEditingReservation] = useState<Reservation | null>(null);

    // Invoice Modal State
    const [invoiceReservation, setInvoiceReservation] = useState<Reservation | null>(null);

    // Details Modal State
    const [viewDetailsReservation, setViewDetailsReservation] = useState<Reservation | null>(null);

    // Cancel Confirmation
    const [cancelReservation, setCancelReservation] = useState<Reservation | null>(null);

    // ... existing code ...

    const handleEditReservation = (reservation: Reservation) => {
        setEditingReservation(reservation);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setEditingReservation(null);
    };

    // ... existing code ...

    // Filters
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<ReservationStatus | 'all'>('all');

    // View Mode
    const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

    useEffect(() => {
        fetchReservations();
    }, []);

    const fetchReservations = async () => {
        setLoading(true);
        try {
            const data = await reservationService.getAll();
            setReservations(data);
        } catch (error) {
            console.error('Failed to fetch reservations', error);
        } finally {
            setLoading(false);
        }
    };

    // Filter Logic
    const filteredReservations = reservations.filter(reservation => {
        const matchesSearch =
            reservation.guestName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            reservation.roomNumber?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesStatus = statusFilter === 'all' || reservation.status === statusFilter;
        return matchesSearch && matchesStatus;
    });

    const handleCancelReservation = async () => {
        if (!cancelReservation) return;

        try {
            await reservationService.cancel(cancelReservation.id);
            showSuccessToast(t('reservations.cancelledReservation', { room: cancelReservation.roomNumber }));
            fetchReservations();
        } catch (error) {
            console.error('Failed to cancel reservation', error);
            showErrorToast(t('reservations.cancelError'));
        }
    };

    const getStatusColor = (status: ReservationStatus) => {
        switch (status) {
            case ReservationStatus.Pending: return 'bg-yellow-100 text-yellow-700 border-yellow-200';
            case ReservationStatus.Confirmed: return 'bg-blue-100 text-blue-700 border-blue-200';
            case ReservationStatus.Cancelled: return 'bg-red-100 text-red-700';
            case ReservationStatus.CheckedIn: return 'bg-green-100 text-green-700 border-green-200';
            case ReservationStatus.CheckedOut: return 'bg-gray-100 text-gray-700';
            default: return 'bg-slate-100 text-slate-700';
        }
    };

    const getStatusLabel = (status: ReservationStatus) => {
        const labels: Record<number, string> = {
            [ReservationStatus.Pending]: t('reservations.status.pending'),
            [ReservationStatus.Confirmed]: t('reservations.status.confirmed'),
            [ReservationStatus.CheckedIn]: t('reservations.status.checkedIn'),
            [ReservationStatus.CheckedOut]: t('reservations.status.checkedOut'),
            [ReservationStatus.Cancelled]: t('reservations.status.cancelled'),
            [ReservationStatus.NoShow]: t('reservations.status.noShow')
        };
        return labels[status] || 'Unknown';
    };

    const StatusTab = ({ status, label }: { status: ReservationStatus | 'all', label: string }) => (
        <button
            onClick={() => setStatusFilter(status)}
            className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 ${statusFilter === status
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                : 'bg-white/90 backdrop-blur-sm text-slate-600 hover:bg-white border border-slate-200'
                }`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen space-y-8 p-6 bg-gradient-to-br from-slate-50 via-purple-50 to-pink-50">
            {/* Enhanced Header with Glassmorphism */}
            <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/20 p-4 md:p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-pink-600/10 to-rose-600/10"></div>
                <div className="relative flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent mb-2 text-center lg:text-left">
                            {t('reservations.title')}
                        </h1>
                        <p className="text-slate-600 text-base md:text-lg font-medium text-center lg:text-left">{t('reservations.subtitle')}</p>
                    </div>
                    <div className="flex gap-3 flex-wrap justify-center lg:justify-end">
                        {/* View Toggle */}
                        <div className="flex gap-1 bg-white/80 backdrop-blur-sm p-1.5 rounded-xl shadow-lg border border-white/40">
                            <button
                                onClick={() => setViewMode('cards')}
                                className={`px-3 md:px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-300 font-semibold ${viewMode === 'cards'
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md scale-105'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                title="Vista de tarjetas"
                            >
                                <FaTh />
                                <span className="hidden sm:inline text-sm">{t('reservations.viewToggle.cards')}</span>
                            </button>
                            <button
                                onClick={() => setViewMode('table')}
                                className={`px-3 md:px-4 py-2.5 rounded-lg flex items-center gap-2 transition-all duration-300 font-semibold ${viewMode === 'table'
                                    ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md scale-105'
                                    : 'text-slate-600 hover:bg-slate-50'
                                    }`}
                                title="Vista de tabla"
                            >
                                <FaList />
                                <span className="hidden sm:inline text-sm">{t('reservations.viewToggle.table')}</span>
                            </button>
                        </div>

                        <button
                            onClick={() => exportReservationsToExcel(filteredReservations)}
                            className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 md:px-5 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            title="Export to Excel"
                        >
                            <FaFileExcel className="text-lg" />
                            <span className="hidden xl:inline font-semibold">Excel</span>
                        </button>
                        <button
                            onClick={() => settings && generateReservationReportPDF(filteredReservations, settings)}
                            className="group relative bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 md:px-5 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            title="Export to PDF"
                        >
                            <FaFilePdf className="text-lg" />
                            <span className="hidden xl:inline font-semibold">PDF</span>
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="group relative bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-4 md:px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
                        >
                            <FaPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                            <span className="hidden md:inline font-semibold">{t('reservations.newReservation')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Filters */}
            <div className="space-y-4">
                <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl shadow-xl border border-white/20 p-4 md:p-6">
                    <div className="relative flex-1">
                        <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input
                            type="text"
                            placeholder={t('reservations.searchPlaceholder')}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent transition-all duration-300 bg-white/90 backdrop-blur-sm font-medium"
                        />
                    </div>
                </div>

                <div className="flex flex-wrap gap-2 md:gap-3 overflow-x-auto pb-2 items-center justify-start md:justify-start">
                    <StatusTab status="all" label={t('reservations.status.all')} />
                    <StatusTab status={ReservationStatus.Pending} label={t('reservations.status.pending')} />
                    <StatusTab status={ReservationStatus.Confirmed} label={t('reservations.status.confirmed')} />
                    <StatusTab status={ReservationStatus.CheckedIn} label={t('reservations.status.checkedIn')} />
                    <StatusTab status={ReservationStatus.CheckedOut} label={t('reservations.status.checkedOut')} />
                    <StatusTab status={ReservationStatus.Cancelled} label={t('reservations.status.cancelled')} />
                </div>
            </div>

            {loading ? (
                <SkeletonTable rows={10} />
            ) : filteredReservations.length === 0 ? (
                <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20">
                    <EmptyState
                        icon={<FaCalendarTimes />}
                        title={searchTerm || statusFilter !== 'all' ? t('reservations.noReservations') : "No hay reservas registradas"}
                        description={searchTerm || statusFilter !== 'all' ?
                            "No se encontraron reservas que coincidan con los filtros seleccionados." :
                            "Comienza creando tu primera reserva para gestionar el alojamiento de huéspedes."
                        }
                        action={!searchTerm && statusFilter === 'all' ? {
                            label: t('reservations.newReservation'),
                            onClick: () => setIsModalOpen(true)
                        } : undefined}
                    />
                </div>
            ) : (
                <>
                    {viewMode === 'cards' ? (
                        /* Cards Grid View */
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 animate-fade-in">
                            {filteredReservations.map((reservation, index) => (
                                <div
                                    key={reservation.id}
                                    className="animate-slide-up"
                                    style={{ animationDelay: `${index * 50}ms` }}
                                >
                                    <ReservationCard
                                        reservation={reservation}
                                        onViewInvoice={() => setInvoiceReservation(reservation)}
                                        onCancel={() => setCancelReservation(reservation)}
                                        onEdit={() => handleEditReservation(reservation)}
                                        onViewDetails={() => setViewDetailsReservation(reservation)}
                                    />
                                </div>
                            ))}
                        </div>
                    ) : (
                        /* Table View */
                        <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl border border-white/20 overflow-hidden">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gradient-to-r from-purple-50 to-pink-50 border-b-2 border-purple-200">
                                            <th className="px-6 py-4 text-purple-800 font-bold uppercase tracking-wider text-sm whitespace-nowrap">{t('reservations.guest')}</th>
                                            <th className="px-6 py-4 text-purple-800 font-bold uppercase tracking-wider text-sm whitespace-nowrap">{t('reservations.room')}</th>
                                            <th className="px-6 py-4 text-purple-800 font-bold uppercase tracking-wider text-sm whitespace-nowrap">{t('reservations.checkIn')}</th>
                                            <th className="px-6 py-4 text-purple-800 font-bold uppercase tracking-wider text-sm whitespace-nowrap">{t('reservations.checkOut')}</th>
                                            <th className="px-6 py-4 text-purple-800 font-bold uppercase tracking-wider text-sm whitespace-nowrap">{t('reservations.status')}</th>
                                            <th className="px-6 py-4 text-right text-purple-800 font-bold uppercase tracking-wider text-sm whitespace-nowrap">{t('reservations.total')}</th>
                                            <th className="px-6 py-4 text-center text-purple-800 font-bold uppercase tracking-wider text-sm whitespace-nowrap">{t('common.actions')}</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {filteredReservations.map((reservation, index) => (
                                            <tr
                                                key={reservation.id}
                                                className="hover:bg-gradient-to-r hover:from-purple-50/50 hover:to-pink-50/50 transition-all duration-200 border-b border-slate-100 last:border-0"
                                                style={{
                                                    animation: `fadeInUp 0.4s ease-out ${index * 0.03}s both`
                                                }}
                                            >
                                                <td className="px-6 py-4 font-bold text-slate-800 whitespace-nowrap">{reservation.guestName}</td>
                                                <td className="px-6 py-4 text-slate-600 whitespace-nowrap font-medium">{t('common.room')} {reservation.roomNumber}</td>
                                                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <FaCalendarAlt className="text-purple-400" />
                                                        <span className="font-medium">{new Date(reservation.checkInDate).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                                    <div className="flex items-center gap-2">
                                                        <FaCalendarAlt className="text-pink-400" />
                                                        <span className="font-medium">{new Date(reservation.checkOutDate).toLocaleDateString()}</span>
                                                    </div>
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold shadow-md border ${getStatusColor(reservation.status)}`}>
                                                        {getStatusLabel(reservation.status)}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4 text-right font-extrabold text-lg bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent whitespace-nowrap">
                                                    {formatCurrency(reservation.totalPrice)}
                                                </td>
                                                <td className="px-6 py-4 whitespace-nowrap">
                                                    <div className="flex justify-center gap-2">
                                                        <button
                                                            onClick={() => setInvoiceReservation(reservation)}
                                                            className="p-2.5 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:scale-110"
                                                            title={t('reservations.viewInvoice')}
                                                        >
                                                            <FaFileInvoiceDollar />
                                                        </button>
                                                        {reservation.status !== ReservationStatus.Cancelled && reservation.status !== ReservationStatus.CheckedOut && (
                                                            <button
                                                                onClick={() => setCancelReservation(reservation)}
                                                                className="p-2.5 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-red-500 hover:to-rose-500 rounded-xl transition-all duration-300 shadow-sm hover:shadow-md hover:scale-110"
                                                                title="Cancelar Reservación"
                                                            >
                                                                <FaCalendarTimes />
                                                            </button>
                                                        )}
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            <ReservationModal
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onSuccess={fetchReservations}
                initialData={editingReservation}
            />

            <InvoiceModal
                isOpen={!!invoiceReservation}
                onClose={() => setInvoiceReservation(null)}
                reservation={invoiceReservation}
            />

            <ReservationDetailsModal
                isOpen={!!viewDetailsReservation}
                onClose={() => setViewDetailsReservation(null)}
                reservation={viewDetailsReservation}
            />

            <ConfirmDialog
                isOpen={!!cancelReservation}
                onClose={() => setCancelReservation(null)}
                onConfirm={handleCancelReservation}
                title="Cancelar Reservación"
                message={cancelReservation ? `¿Estás seguro de cancelar la reservación de ${cancelReservation.guestName} para la habitación ${cancelReservation.roomNumber}? Esta acción no se puede deshacer.` : ''}
                confirmText="Cancelar Reservación"
                cancelText="Volver"
                type="warning"
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
        </div>
    );
};

export default Reservations;
