import { useEffect, useState } from 'react';
import { reservationService, frontDeskService, roomService } from '../services/api';
import { Reservation, ReservationStatus, Room, RoomStatus } from '../types';
import { FaCheck, FaSignOutAlt, FaCalendarAlt, FaUser, FaBed, FaFileInvoiceDollar, FaFilePdf, FaTools, FaBroom, FaCheckCircle, FaClock, FaHourglassHalf, FaUserCircle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../hooks/useSettings';
import { generateInvoicePDF, generateDailyReportPDF } from '../utils/pdfExports';
import { showSuccessToast, showErrorToast } from '../utils/toast';
import ConfirmDialog from '../components/common/ConfirmDialog';

// Room Card Component with enhanced design
const RoomCard = ({ room }: { room: Room }) => {
    const { t } = useTranslation();

    const getGradient = (status: RoomStatus) => {
        switch (status) {
            case RoomStatus.Available:
                return 'from-green-400 via-emerald-500 to-teal-600';
            case RoomStatus.Occupied:
                return 'from-red-400 via-rose-500 to-pink-600';
            case RoomStatus.Cleaning:
                return 'from-yellow-400 via-amber-500 to-orange-600';
            case RoomStatus.Maintenance:
                return 'from-gray-400 via-slate-500 to-zinc-600';
            default:
                return 'from-slate-400 to-slate-600';
        }
    };

    const getIcon = (status: RoomStatus) => {
        switch (status) {
            case RoomStatus.Available:
                return <FaCheckCircle className="text-2xl" />;
            case RoomStatus.Occupied:
                return <FaBed className="text-2xl" />;
            case RoomStatus.Cleaning:
                return <FaBroom className="text-2xl" />;
            case RoomStatus.Maintenance:
                return <FaTools className="text-2xl" />;
            default:
                return <FaBed className="text-2xl" />;
        }
    };

    const getStatusLabel = (status: RoomStatus) => {
        switch (status) {
            case RoomStatus.Available: return t('rooms.status.available');
            case RoomStatus.Occupied: return t('rooms.status.occupied');
            case RoomStatus.Cleaning: return t('rooms.status.cleaning');
            case RoomStatus.Maintenance: return t('rooms.status.maintenance');
            default: return 'Unknown';
        }
    };

    return (
        <div
            className={`group relative bg-gradient-to-br ${getGradient(room.status)} rounded-2xl p-4 shadow-lg border-2 border-white/40 cursor-pointer hover:scale-110 hover:rotate-2 hover:shadow-2xl transition-all duration-300 overflow-hidden`}
            title={`${room.roomTypeName || ''} - ${t('common.floor')} ${room.floor}`}
        >
            {/* Decorative glow */}
            <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-2xl"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-white">
                {/* Icon */}
                <div className="transform group-hover:scale-110 transition-transform duration-300">
                    {getIcon(room.status)}
                </div>

                {/* Room Number */}
                <span className="font-black text-2xl tracking-tight">{room.number}</span>

                {/* Status Label */}
                <span className="text-[10px] uppercase font-bold tracking-wider opacity-90 group-hover:opacity-100 transition-opacity">
                    {getStatusLabel(room.status)}
                </span>
            </div>

            {/* Border glow effect */}
            <div className="absolute inset-0 rounded-2xl border-2 border-white/0 group-hover:border-white/60 transition-all duration-300"></div>
        </div>
    );
};

// Arrival Card Component
const ArrivalCard = ({
    reservation,
    onCheckIn,
    isProcessing
}: {
    reservation: Reservation;
    onCheckIn: () => void;
    isProcessing: boolean;
}) => {
    const { t } = useTranslation();

    const initials = reservation.guestName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const getStatusChip = (status: ReservationStatus) => {
        if (status === ReservationStatus.Confirmed) {
            return (
                <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full border border-blue-200 flex items-center gap-1">
                    <FaCheckCircle className="text-xs" />
                    {t('reservations.status.confirmed')}
                </span>
            );
        }
        return (
            <span className="px-3 py-1 bg-yellow-100 text-yellow-700 text-xs font-bold rounded-full border border-yellow-200 flex items-center gap-1 animate-pulse">
                <FaClock className="text-xs" />
                {t('reservations.status.pending')}
            </span>
        );
    };

    return (
        <div className="group relative bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border-2 border-white/40 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 via-emerald-500/5 to-teal-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center text-white text-lg font-black shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            {initials}
                        </div>

                        {/* Guest Info */}
                        <div>
                            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                <FaUser className="text-slate-400 text-sm" />
                                {reservation.guestName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="px-3 py-1 bg-gradient-to-r from-green-100 to-emerald-100 border border-green-200 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <FaBed className="text-green-600 text-sm" />
                                        <span className="text-sm font-black bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                                            {t('common.room')} {reservation.roomNumber}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Status Chip */}
                    {getStatusChip(reservation.status)}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-slate-600 mb-4 ml-1">
                    <FaCalendarAlt className="text-green-500" />
                    <span className="font-semibold text-sm">
                        {new Date(reservation.checkInDate).toLocaleDateString()}
                    </span>
                </div>

                {/* Check-in Button */}
                <button
                    onClick={onCheckIn}
                    disabled={isProcessing}
                    className="w-full px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-green-400/50 group/btn hover:scale-105"
                >
                    {isProcessing ? (
                        <div className="flex items-center gap-2">
                            <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                            <span>{t('common.processing')}</span>
                        </div>
                    ) : (
                        <>
                            <FaCheck className="group-hover/btn:rotate-12 transition-transform" />
                            {t('frontDesk.checkIn')}
                        </>
                    )}
                </button>
            </div>
        </div>
    );
};

// Departure Card Component
const DepartureCard = ({
    reservation,
    onCheckOut,
    onInvoice,
    isProcessing
}: {
    reservation: Reservation;
    onCheckOut: () => void;
    onInvoice: () => void;
    isProcessing: boolean;
}) => {
    const { t } = useTranslation();

    const initials = reservation.guestName
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const calculateDaysRemaining = () => {
        const today = new Date();
        const checkOut = new Date(reservation.checkOutDate);
        const diffTime = checkOut.getTime() - today.getTime();
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    const daysRemaining = calculateDaysRemaining();
    const isCheckoutToday = daysRemaining === 0;

    return (
        <div className="group relative bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border-2 border-white/40 hover:shadow-xl hover:scale-[1.02] transition-all duration-300">
            {/* Gradient overlay */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-indigo-500/5 to-violet-500/5 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

            <div className="relative z-10">
                <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-3">
                        {/* Avatar */}
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-400 to-indigo-600 flex items-center justify-center text-white text-lg font-black shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
                            {initials}
                        </div>

                        {/* Guest Info */}
                        <div>
                            <h3 className="font-black text-slate-800 text-lg flex items-center gap-2">
                                <FaUserCircle className="text-slate-400 text-sm" />
                                {reservation.guestName}
                            </h3>
                            <div className="flex items-center gap-2 mt-1">
                                <div className="px-3 py-1 bg-gradient-to-r from-blue-100 to-indigo-100 border border-blue-200 rounded-lg shadow-sm">
                                    <div className="flex items-center gap-2">
                                        <FaBed className="text-blue-600 text-sm" />
                                        <span className="text-sm font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                            {t('common.room')} {reservation.roomNumber}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Time Remaining Indicator */}
                    {isCheckoutToday ? (
                        <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full border border-orange-200 flex items-center gap-1 animate-pulse">
                            <FaClock className="text-xs" />
                            {t('frontDesk.checkoutToday', 'Checkout Hoy')}
                        </span>
                    ) : daysRemaining > 0 ? (
                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full border border-blue-200 flex items-center gap-1">
                            <FaHourglassHalf className="text-xs" />
                            {daysRemaining} {daysRemaining === 1 ? t('frontDesk.dayRemaining', 'día') : t('frontDesk.daysRemaining', 'días')}
                        </span>
                    ) : (
                        <span className="px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full border border-red-200 flex items-center gap-1">
                            <FaClock className="text-xs" />
                            {t('frontDesk.overdue', 'Vencido')}
                        </span>
                    )}
                </div>

                {/* Date */}
                <div className="flex items-center gap-2 text-slate-600 mb-4 ml-1">
                    <FaCalendarAlt className="text-blue-500" />
                    <span className="font-semibold text-sm">
                        Check-out: {new Date(reservation.checkOutDate).toLocaleDateString()}
                    </span>
                </div>

                {/* Progress Bar (if checkout today) */}
                {isCheckoutToday && (
                    <div className="mb-4 px-1">
                        <div className="h-2 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full overflow-hidden">
                            <div className="h-full bg-gradient-to-r from-orange-400 via-amber-500 to-yellow-500 rounded-full animate-pulse"></div>
                        </div>
                    </div>
                )}

                {/* Action Buttons */}
                <div className="flex gap-2">
                    <button
                        onClick={onInvoice}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-bold text-sm flex items-center justify-center gap-2 border-2 border-purple-400/50 group/btn hover:scale-105"
                    >
                        <FaFileInvoiceDollar className="group-hover/btn:rotate-12 transition-transform" />
                        <span className="hidden sm:inline">{t('invoicing.invoice')}</span>
                    </button>

                    <button
                        onClick={onCheckOut}
                        disabled={isProcessing}
                        className="flex-1 px-4 py-3 bg-gradient-to-r from-slate-700 to-slate-900 hover:from-slate-800 hover:to-black text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed border-2 border-slate-500/50 group/btn hover:scale-105"
                    >
                        {isProcessing ? (
                            <div className="flex items-center gap-2">
                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                <span>{t('common.processing')}</span>
                            </div>
                        ) : (
                            <>
                                <FaSignOutAlt className="group-hover/btn:translate-x-1 transition-transform" />
                                {t('frontDesk.checkOut')}
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const FrontDesk = () => {
    const { t } = useTranslation();
    const { data: settings } = useSettings();
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [rooms, setRooms] = useState<Room[]>([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState<string | null>(null);

    // Confirm Dialog State
    const [confirmAction, setConfirmAction] = useState<{ type: 'checkin' | 'checkout', id: string, name: string } | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [resData, roomsData] = await Promise.all([
                reservationService.getAll(),
                roomService.getAll()
            ]);
            console.log('FrontDesk data loaded successfully:', { reservations: resData.length, rooms: roomsData.length });
            setReservations(resData);
            setRooms(roomsData);
        } catch (error: any) {
            console.error('Failed to fetch FrontDesk data', error);
            console.error('Error details:', {
                message: error.message,
                response: error.response?.data,
                status: error.response?.status
            });
            showErrorToast(t('frontDesk.loadError'));
        } finally {
            setLoading(false);
        }
    };

    const executeCheckIn = async () => {
        if (!confirmAction) return;
        const { id } = confirmAction;
        setProcessingId(id);
        setConfirmAction(null);
        try {
            await frontDeskService.checkIn(id);
            await fetchData();
            showSuccessToast(t('frontDesk.checkInSuccess'));
        } catch (error: any) {
            console.error(error);
            showErrorToast(t('frontDesk.checkInError') + ': ' + (error.response?.data || error.message));
        } finally {
            setProcessingId(null);
        }
    };

    const executeCheckOut = async () => {
        if (!confirmAction) return;
        const { id } = confirmAction;
        setProcessingId(id);
        setConfirmAction(null);
        try {
            await frontDeskService.checkOut(id);
            await fetchData();
            showSuccessToast(t('frontDesk.checkOutSuccess'));
        } catch (error: any) {
            console.error(error);
            showErrorToast(t('frontDesk.checkOutError') + ': ' + (error.response?.data || error.message));
        } finally {
            setProcessingId(null);
        }
    };

    // Filter logic
    const pendingCheckIns = reservations.filter(r => r.status === ReservationStatus.Confirmed || r.status === ReservationStatus.Pending);
    const activeStays = reservations.filter(r => r.status === ReservationStatus.CheckedIn);

    return (
        <div className="min-h-screen space-y-8 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
            {/* Enhanced Header with Glassmorphism */}
            <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/20 p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 via-indigo-600/10 to-violet-600/10"></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 bg-clip-text text-transparent mb-2">
                            {t('frontDesk.title')}
                        </h1>
                        <p className="text-slate-600 text-lg font-medium">{t('frontDesk.subtitle')}</p>
                    </div>
                    <button
                        onClick={() => settings && generateDailyReportPDF(reservations, rooms, settings)}
                        className="group relative bg-gradient-to-r from-slate-800 to-black hover:from-slate-900 hover:to-slate-950 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        <FaFilePdf className="text-lg group-hover:rotate-12 transition-transform" />
                        <span className="font-semibold">{t('frontDesk.dailyReport')}</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-indigo-600"></div>
                </div>
            ) : (
                <>
                    {/* Room Rack - Enhanced Visual Status Grid */}
                    <div className="relative overflow-hidden bg-white/70 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
                        <div className="absolute inset-0 bg-gradient-to-br from-slate-500/5 via-blue-500/5 to-indigo-500/5"></div>
                        <div className="relative">
                            <h2 className="text-2xl font-black bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent mb-6 flex items-center gap-3">
                                <FaBed className="text-indigo-600" />
                                {t('frontDesk.liveRoomRack')}
                            </h2>
                            <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 gap-4">
                                {rooms.sort((a, b) => a.number.localeCompare(b.number)).map((room, index) => (
                                    <div
                                        key={room.id}
                                        style={{ animationDelay: `${index * 30}ms` }}
                                        className="animate-fade-in"
                                    >
                                        <RoomCard room={room} />
                                    </div>
                                ))}
                            </div>

                            {/* Enhanced Legend */}
                            <div className="flex gap-6 mt-6 text-sm font-semibold text-slate-600 justify-end flex-wrap">
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gradient-to-br from-green-400 to-emerald-600 rounded shadow-sm"></div>
                                    {t('rooms.status.available')}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gradient-to-br from-red-400 to-rose-600 rounded shadow-sm"></div>
                                    {t('rooms.status.occupied')}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gradient-to-br from-yellow-400 to-amber-600 rounded shadow-sm"></div>
                                    {t('rooms.status.cleaning')}
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-4 h-4 bg-gradient-to-br from-gray-400 to-slate-600 rounded shadow-sm"></div>
                                    {t('rooms.status.maintenance')}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Arrivals and Departures Grid */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                        {/* Arrivals Column */}
                        <div className="space-y-5">
                            <h2 className="text-2xl font-black text-slate-700 flex items-center gap-3">
                                <span className="w-4 h-4 rounded-full bg-gradient-to-r from-green-400 to-emerald-600 shadow-lg"></span>
                                {t('frontDesk.incomingArrivals')}
                            </h2>
                            <div className="space-y-4">
                                {pendingCheckIns.map((res, index) => (
                                    <div
                                        key={res.id}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                        className="animate-slide-up"
                                    >
                                        <ArrivalCard
                                            reservation={res}
                                            onCheckIn={() => setConfirmAction({ type: 'checkin', id: res.id, name: res.guestName })}
                                            isProcessing={processingId === res.id}
                                        />
                                    </div>
                                ))}
                                {pendingCheckIns.length === 0 && (
                                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                                        <FaCalendarAlt className="text-6xl text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-400 font-semibold text-lg">{t('frontDesk.noPendingArrivals')}</p>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Departures/Active Column */}
                        <div className="space-y-5">
                            <h2 className="text-2xl font-black text-slate-700 flex items-center gap-3">
                                <span className="w-4 h-4 rounded-full bg-gradient-to-r from-blue-400 to-indigo-600 shadow-lg"></span>
                                {t('frontDesk.activeStays')}
                            </h2>
                            <div className="space-y-4">
                                {activeStays.map((res, index) => (
                                    <div
                                        key={res.id}
                                        style={{ animationDelay: `${index * 50}ms` }}
                                        className="animate-slide-up"
                                    >
                                        <DepartureCard
                                            reservation={res}
                                            onCheckOut={() => setConfirmAction({ type: 'checkout', id: res.id, name: res.guestName })}
                                            onInvoice={() => settings && generateInvoicePDF(res, settings)}
                                            isProcessing={processingId === res.id}
                                        />
                                    </div>
                                ))}
                                {activeStays.length === 0 && (
                                    <div className="bg-white/70 backdrop-blur-xl rounded-2xl shadow-lg border border-white/20 p-12 text-center">
                                        <FaBed className="text-6xl text-slate-300 mx-auto mb-4" />
                                        <p className="text-slate-400 font-semibold text-lg">{t('frontDesk.noActiveStays')}</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}

            <ConfirmDialog
                isOpen={!!confirmAction}
                onClose={() => setConfirmAction(null)}
                onConfirm={confirmAction?.type === 'checkin' ? executeCheckIn : executeCheckOut}
                title={confirmAction?.type === 'checkin' ? t('frontDesk.checkIn') : t('frontDesk.checkOut')}
                message={confirmAction ? (confirmAction.type === 'checkin' ? t('frontDesk.confirmCheckIn') : t('frontDesk.confirmCheckOut')) + ' ' + confirmAction.name + '?' : ''}
                confirmText={t('common.confirm')}
                cancelText={t('common.cancel')}
                type={confirmAction?.type === 'checkout' ? 'warning' : 'info'}
            />

            {/* Animation Keyframes */}
            <style>{`
                @keyframes fade-in {
                    from { opacity: 0; }
                    to { opacity: 1; }
                }
                @keyframes slide-up {
                    from {
                        opacity: 0;
                        transform: translateY(20px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }
                .animate-fade-in {
                    animation: fade-in 0.5s ease-out forwards;
                }
                .animate-slide-up {
                    animation: slide-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default FrontDesk;
