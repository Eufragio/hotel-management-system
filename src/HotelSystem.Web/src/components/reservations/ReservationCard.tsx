import { Reservation, ReservationStatus } from '../../services/api';
import { FaUser, FaBed, FaCalendarCheck, FaCalendarAlt, FaUsers, FaChild, FaFileInvoiceDollar, FaSuitcase, FaSignOutAlt, FaCheckCircle, FaEdit, FaTimesCircle, FaEye, FaClock, FaArrowRight } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../hooks/useCurrency';
import { Link } from 'react-router-dom';

interface ReservationCardProps {
    reservation: Reservation;
    onViewInvoice: () => void;
    onCancel: () => void;
    onEdit: () => void;
    onViewDetails: () => void;
}

// Guest Avatar Component
const GuestAvatar = ({ name, status }: { name: string; status: ReservationStatus }) => {
    const initials = name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .slice(0, 2);

    const getGradient = () => {
        switch (status) {
            case ReservationStatus.CheckedIn:
                return 'from-green-400 via-emerald-500 to-teal-600';
            case ReservationStatus.Cancelled:
                return 'from-red-400 via-rose-500 to-pink-600';
            case ReservationStatus.CheckedOut:
                return 'from-gray-400 via-slate-500 to-zinc-600';
            case ReservationStatus.Confirmed:
                return 'from-blue-400 via-indigo-500 to-violet-600';
            default:
                return 'from-purple-400 via-pink-500 to-rose-600';
        }
    };

    return (
        <div className={`relative w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradient()} flex items-center justify-center text-white shadow-lg transform group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
            <span className="text-xl font-black tracking-tight">{initials}</span>
            <div className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        </div>
    );
};

// Timeline Progress Component
const TimelineProgress = ({ checkInDate, checkOutDate }: { checkInDate: string; checkOutDate: string }) => {
    const { t } = useTranslation();
    const checkIn = new Date(checkInDate);
    const checkOut = new Date(checkOutDate);
    const today = new Date();

    const totalDays = Math.ceil((checkOut.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24));
    const daysElapsed = Math.max(0, Math.ceil((today.getTime() - checkIn.getTime()) / (1000 * 60 * 60 * 24)));
    const progress = Math.min(100, Math.max(0, (daysElapsed / totalDays) * 100));
    const isActive = today >= checkIn && today <= checkOut;

    return (
        <div className="relative bg-gradient-to-r from-purple-50 via-pink-50 to-rose-50 p-5 rounded-2xl border border-purple-100/50 group/timeline hover:shadow-md transition-all duration-300">
            {/* Timeline Dots & Line */}
            <div className="flex items-center justify-between mb-4 relative">
                {/* Start Dot */}
                <div className="flex flex-col items-center gap-2 z-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-lg group-hover/timeline:scale-110 transition-transform">
                        <FaCalendarCheck className="text-white text-lg" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('reservations.checkIn')}</span>
                </div>

                {/* Progress Line */}
                <div className="absolute left-10 right-10 top-5 h-1.5 bg-gradient-to-r from-slate-200 to-slate-300 rounded-full overflow-hidden">
                    {isActive && (
                        <div
                            className="h-full bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 rounded-full transition-all duration-1000 ease-out relative overflow-hidden"
                            style={{ width: `${progress}%` }}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/40 to-transparent animate-shimmer"></div>
                        </div>
                    )}
                </div>

                {/* End Dot */}
                <div className="flex flex-col items-center gap-2 z-10">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-pink-400 to-rose-600 flex items-center justify-center shadow-lg group-hover/timeline:scale-110 transition-transform">
                        <FaCalendarAlt className="text-white text-lg" />
                    </div>
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">{t('reservations.checkOut')}</span>
                </div>
            </div>

            {/* Dates */}
            <div className="flex items-center justify-between">
                <div className="text-sm font-bold text-slate-700">
                    {checkIn.toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 px-4 py-2 bg-white/80 backdrop-blur-sm rounded-xl shadow-sm border border-purple-200/50">
                    <FaClock className="text-purple-500 text-sm" />
                    <span className="text-sm font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {totalDays} {totalDays === 1 ? t('reservations.card.night') : t('reservations.card.nights')}
                    </span>
                </div>
                <div className="text-sm font-bold text-slate-700">
                    {checkOut.toLocaleDateString()}
                </div>
            </div>

            <style>{`
                @keyframes shimmer {
                    0% { transform: translateX(-100%); }
                    100% { transform: translateX(100%); }
                }
                .animate-shimmer {
                    animation: shimmer 2s infinite;
                }
            `}</style>
        </div>
    );
};

// Animated Status Badge Component
const AnimatedStatusBadge = ({ status }: { status: ReservationStatus }) => {
    const { t } = useTranslation();
    let colors = 'bg-slate-100 text-slate-700 border-slate-200';
    let label = 'Unknown';
    let Icon = FaCalendarAlt;
    let shouldPulse = false;

    switch (status) {
        case ReservationStatus.Pending:
            colors = 'bg-yellow-100 text-yellow-700 border-yellow-300';
            label = t('reservations.status.pending');
            Icon = FaClock;
            shouldPulse = true;
            break;
        case ReservationStatus.Confirmed:
            colors = 'bg-blue-100 text-blue-700 border-blue-300';
            label = t('reservations.status.confirmed');
            Icon = FaCheckCircle;
            break;
        case ReservationStatus.CheckedIn:
            colors = 'bg-green-100 text-green-700 border-green-300';
            label = t('reservations.status.checkedIn');
            Icon = FaSuitcase;
            shouldPulse = true;
            break;
        case ReservationStatus.CheckedOut:
            colors = 'bg-gray-100 text-gray-700 border-gray-300';
            label = t('reservations.status.checkedOut');
            Icon = FaSignOutAlt;
            break;
        case ReservationStatus.Cancelled:
            colors = 'bg-red-100 text-red-700 border-red-300';
            label = t('reservations.status.cancelled');
            Icon = FaTimesCircle;
            break;
    }

    return (
        <div className="relative inline-flex">
            <span className={`relative px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 shadow-md border-2 ${colors} transition-all duration-300 hover:scale-105`}>
                <Icon className="text-base" />
                {label}
            </span>
            {shouldPulse && (
                <span className={`absolute inset-0 rounded-xl ${colors} opacity-75 animate-ping`}></span>
            )}
        </div>
    );
};

// Info Pill Component
const InfoPill = ({ icon: Icon, value, label, color = 'purple' }: { icon: any; value: number; label: string; color?: string }) => {
    const colorClasses = {
        purple: 'bg-purple-100 text-purple-700 border-purple-200',
        pink: 'bg-pink-100 text-pink-700 border-pink-200',
        blue: 'bg-blue-100 text-blue-700 border-blue-200',
    }[color] || 'bg-purple-100 text-purple-700 border-purple-200';

    return (
        <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl border-2 ${colorClasses} shadow-sm hover:shadow-md transition-all duration-300 hover:scale-105`}>
            <Icon className="text-base" />
            <span className="font-bold text-sm">{value}</span>
            <span className="text-xs font-semibold opacity-80">{label}</span>
        </div>
    );
};

const ReservationCard = ({ reservation, onViewInvoice, onCancel, onEdit, onViewDetails }: ReservationCardProps) => {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();

    return (
        <>
            <div className="group relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 shadow-xl border-2 border-white/40 hover:shadow-2xl hover:scale-[1.02] transition-all duration-500 overflow-hidden">
                {/* Animated Gradient Background */}
                <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 via-pink-500/5 to-rose-500/5 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

                {/* Decorative Corner Element */}
                <div className="absolute -top-8 -right-8 w-24 h-24 bg-gradient-to-br from-purple-400/20 to-pink-400/20 rounded-full blur-2xl group-hover:scale-150 transition-transform duration-700"></div>

                <div className="relative z-10">
                    {/* Header Section */}
                    <div className="flex justify-between items-start mb-6">
                        <div className="flex items-center gap-4 flex-1">
                            {/* Guest Avatar */}
                            <GuestAvatar name={reservation.guestName || 'Guest'} status={reservation.status} />

                            {/* Guest Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                    <div className="px-3 py-1 bg-gradient-to-r from-purple-100 to-pink-100 border border-purple-200 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-2">
                                            <FaBed className="text-purple-600 text-sm" />
                                            <span className="text-sm font-black bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                                                {t('common.room')} {reservation.roomNumber}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                                <h3 className="font-black text-slate-800 text-xl flex items-center gap-2 group/name">
                                    <FaUser className="text-slate-400 text-sm group-hover/name:text-purple-500 transition-colors" />
                                    <Link
                                        to={`/guests?search=${reservation.guestName}`}
                                        className="hover:text-transparent hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:bg-clip-text transition-all duration-300 flex items-center gap-1"
                                        title="Ver detalles del huésped"
                                    >
                                        {reservation.guestName}
                                        <FaArrowRight className="text-xs opacity-0 group-hover/name:opacity-100 transition-opacity" />
                                    </Link>
                                </h3>
                            </div>
                        </div>

                        {/* Status Badge */}
                        <AnimatedStatusBadge status={reservation.status} />
                    </div>

                    {/* Timeline Progress */}
                    <TimelineProgress checkInDate={reservation.checkInDate} checkOutDate={reservation.checkOutDate} />

                    {/* Guest Details */}
                    <div className="flex flex-wrap gap-3 my-5">
                        <InfoPill
                            icon={FaUsers}
                            value={reservation.adults}
                            label={t('reservations.card.adults')}
                            color="purple"
                        />
                        {reservation.children > 0 && (
                            <InfoPill
                                icon={FaChild}
                                value={reservation.children}
                                label={t('reservations.card.children')}
                                color="pink"
                            />
                        )}
                    </div>

                    {/* Divider */}
                    <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-5"></div>

                    {/* Footer Actions */}
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4">
                        {/* Price Display */}
                        <div className="group/price">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1.5 group-hover/price:text-purple-500 transition-colors">
                                {t('reservations.card.total')}
                            </p>
                            <div className="relative inline-block">
                                <p className="text-3xl font-black bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 bg-clip-text text-transparent group-hover/price:scale-110 transition-transform">
                                    {formatCurrency(reservation.totalPrice)}
                                </p>
                                <div className="absolute -bottom-1 left-0 right-0 h-1 bg-gradient-to-r from-purple-600 via-pink-600 to-rose-600 rounded-full transform scale-x-0 group-hover/price:scale-x-100 transition-transform duration-300"></div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex gap-2 flex-wrap w-full sm:w-auto justify-end">
                            {/* Edit Button */}
                            {(reservation.status === ReservationStatus.Pending || reservation.status === ReservationStatus.Confirmed) && (
                                <button
                                    onClick={onEdit}
                                    className="group/btn p-3 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-blue-500 hover:to-indigo-600 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-110 border-2 border-transparent hover:border-blue-300"
                                    title={t('reservations.card.editReservation')}
                                >
                                    <FaEdit size={18} className="group-hover/btn:rotate-12 transition-transform" />
                                </button>
                            )}

                            {/* View Details Button */}
                            <button
                                onClick={onViewDetails}
                                className="group/btn p-3 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-cyan-500 hover:to-blue-600 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-110 border-2 border-transparent hover:border-cyan-300"
                                title={t('reservations.viewDetails', 'Ver Detalles')}
                            >
                                <FaEye size={18} className="group-hover/btn:scale-125 transition-transform" />
                            </button>

                            {/* Invoice Button */}
                            <button
                                onClick={onViewInvoice}
                                className="group/btn p-3 text-slate-400 hover:text-white hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-600 rounded-xl transition-all shadow-md hover:shadow-lg hover:scale-110 border-2 border-transparent hover:border-purple-300"
                                title={t('reservations.viewInvoice')}
                            >
                                <FaFileInvoiceDollar size={18} className="group-hover/btn:rotate-12 transition-transform" />
                            </button>



                            {/* Cancel Button */}
                            {reservation.status !== ReservationStatus.Cancelled && reservation.status !== ReservationStatus.CheckedOut && (
                                <button
                                    onClick={onCancel}
                                    className="group/btn px-5 py-3 bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-bold text-sm flex items-center gap-2 hover:scale-105 border-2 border-red-400/50"
                                >
                                    <FaTimesCircle className="group-hover/btn:rotate-90 transition-transform" />
                                    <span className="hidden sm:inline">{t('common.cancel')}</span>
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>


        </>
    );
};

export default ReservationCard;
