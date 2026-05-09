import { useMemo } from 'react';
import { Room, RoomStatus } from '../services/api';
import { FaBroom, FaCheck, FaSprayCan, FaFilePdf, FaBed, FaTools, FaCheckCircle, FaExclamationTriangle } from 'react-icons/fa';
import { useTranslation } from 'react-i18next';
import { useRooms, useUpdateRoomStatus } from '../hooks/useRooms';
import { generateHousekeepingReportPDF } from '../utils/pdfExports';

// Statistics Card Component
const StatCard = ({
    icon: Icon,
    value,
    label,
    color
}: {
    icon: any;
    value: number;
    label: string;
    color: 'red' | 'yellow' | 'gray' | 'green';
}) => {
    const gradients = {
        red: 'from-red-400 to-rose-600',
        yellow: 'from-yellow-400 to-amber-600',
        gray: 'from-gray-400 to-slate-600',
        green: 'from-green-400 to-emerald-600',
    };

    const bgColors = {
        red: 'from-red-500/10 to-rose-500/10',
        yellow: 'from-yellow-500/10 to-amber-500/10',
        gray: 'from-gray-500/10 to-slate-500/10',
        green: 'from-green-500/10 to-emerald-500/10',
    };

    return (
        <div className="group relative bg-white/70 backdrop-blur-xl rounded-2xl p-6 border-2 border-white/40 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
            {/* Background gradient */}
            <div className={`absolute inset-0 bg-gradient-to-br ${bgColors[color]} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}></div>

            <div className="relative z-10">
                {/* Icon */}
                <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${gradients[color]} flex items-center justify-center shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300 mb-4`}>
                    <Icon className="text-2xl text-white" />
                </div>

                {/* Value */}
                <p className={`text-4xl font-black bg-gradient-to-r ${gradients[color]} bg-clip-text text-transparent mb-1`}>
                    {value}
                </p>

                {/* Label */}
                <p className="text-sm font-semibold text-slate-600">
                    {label}
                </p>
            </div>
        </div>
    );
};

// Enhanced Room Card Component
const HousekeepingRoomCard = ({
    room,
    onMarkAsClean,
    onMarkAsCleaning
}: {
    room: Room;
    onMarkAsClean: () => void;
    onMarkAsCleaning: () => void;
}) => {
    const { t } = useTranslation();

    const getGradient = (status: RoomStatus) => {
        switch (status) {
            case RoomStatus.Cleaning:
                return 'from-yellow-400 via-amber-500 to-orange-600';
            case RoomStatus.Occupied:
                return 'from-red-400 via-rose-500 to-pink-600';
            case RoomStatus.Maintenance:
                return 'from-gray-400 via-slate-500 to-zinc-600';
            default:
                return 'from-green-400 via-emerald-500 to-teal-600';
        }
    };

    const getStatusBadge = (status: RoomStatus) => {
        switch (status) {
            case RoomStatus.Cleaning:
                return (
                    <span className="px-3 py-1.5 bg-yellow-100 text-yellow-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-2 border-yellow-200 shadow-sm">
                        <FaBroom className="text-sm" />
                        {t('rooms.status.cleaning')}
                    </span>
                );
            case RoomStatus.Occupied:
                return (
                    <span className="px-3 py-1.5 bg-red-100 text-red-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-2 border-red-200 shadow-sm">
                        <FaBed className="text-sm" />
                        {t('rooms.status.occupied')}
                    </span>
                );
            case RoomStatus.Maintenance:
                return (
                    <span className="px-3 py-1.5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 border-2 border-gray-200 shadow-sm">
                        <FaTools className="text-sm" />
                        {t('rooms.status.maintenance')}
                    </span>
                );
            default:
                return null;
        }
    };

    return (
        <div className="group relative bg-white/80 backdrop-blur-xl rounded-2xl p-5 shadow-lg border-2 border-white/40 hover:shadow-xl hover:scale-105 transition-all duration-300 overflow-hidden">
            {/* Gradient overlay */}
            <div className={`absolute inset-0 bg-gradient-to-br ${getGradient(room.status)} opacity-5 group-hover:opacity-10 transition-opacity duration-300 rounded-2xl`}></div>

            <div className="relative z-10">
                {/* Header */}
                <div className="flex justify-between items-start mb-4">
                    {/* Room Number Badge */}
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${getGradient(room.status)} flex items-center justify-center text-white shadow-lg group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                        <span className="text-2xl font-black">{room.number}</span>
                    </div>

                    {/* Status Badge */}
                    {getStatusBadge(room.status)}
                </div>

                {/* Room Info */}
                <div className="mb-4">
                    <h3 className="font-black text-slate-800 text-lg mb-1">
                        {room.roomTypeName}
                    </h3>
                    <div className="flex items-center gap-2">
                        <span className="px-3 py-1 bg-slate-100 text-slate-600 text-xs font-bold rounded-lg">
                            {t('common.floor')} {room.floor}
                        </span>
                    </div>
                </div>

                {/* Divider */}
                <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent my-4"></div>

                {/* Actions */}
                <div className="space-y-2">
                    {/* Mark as Clean Button (for Cleaning and Maintenance) */}
                    {(room.status === RoomStatus.Cleaning || room.status === RoomStatus.Maintenance) && (
                        <button
                            onClick={onMarkAsClean}
                            className="group/btn w-full px-5 py-3 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-bold text-sm flex items-center justify-center gap-2 border-2 border-green-400/50 hover:scale-105"
                        >
                            <FaCheck className="group-hover/btn:rotate-12 transition-transform" />
                            {t('housekeeping.markAsClean')}
                        </button>
                    )}

                    {/* Request Cleaning Button (for Occupied) */}
                    {room.status === RoomStatus.Occupied && (
                        <button
                            onClick={onMarkAsCleaning}
                            className="group/btn w-full px-5 py-3 bg-gradient-to-r from-yellow-500 to-amber-600 hover:from-yellow-600 hover:to-amber-700 text-white rounded-xl shadow-lg hover:shadow-xl transition-all font-bold text-sm flex items-center justify-center gap-2 border-2 border-yellow-400/50 hover:scale-105"
                        >
                            <FaSprayCan className="group-hover/btn:scale-110 transition-transform" />
                            {t('housekeeping.requestCleaning')}
                        </button>
                    )}

                    {/* Currently Occupied Notice */}
                    {room.status === RoomStatus.Occupied && (
                        <p className="text-xs text-slate-500 text-center italic mt-2">
                            {t('housekeeping.currentlyOccupied')}
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
};

const Housekeeping = () => {
    const { t } = useTranslation();

    // React Query hooks
    const { data: allRooms = [], isLoading: loading } = useRooms();
    const updateStatusMutation = useUpdateRoomStatus();

    // Filter and group rooms
    const { cleaningRooms, occupiedRooms, maintenanceRooms, stats } = useMemo(() => {
        const cleaning = allRooms.filter((room: Room) => room.status === RoomStatus.Cleaning);
        const occupied = allRooms.filter((room: Room) => room.status === RoomStatus.Occupied);
        const maintenance = allRooms.filter((room: Room) => room.status === RoomStatus.Maintenance);
        const available = allRooms.filter((room: Room) => room.status === RoomStatus.Available);

        return {
            cleaningRooms: cleaning.sort((a: Room, b: Room) => a.number.localeCompare(b.number)),
            occupiedRooms: occupied.sort((a: Room, b: Room) => a.number.localeCompare(b.number)),
            maintenanceRooms: maintenance.sort((a: Room, b: Room) => a.number.localeCompare(b.number)),
            stats: {
                cleaning: cleaning.length,
                occupied: occupied.length,
                maintenance: maintenance.length,
                clean: available.length,
                total: allRooms.length,
            }
        };
    }, [allRooms]);

    const markAsClean = (room: Room) => {
        updateStatusMutation.mutate({
            id: room.id,
            status: RoomStatus.Available,
            successMessage: `${t('common.room')} ${room.number} ${t('housekeeping.markedAsClean')}`
        });
    };

    const markAsCleaning = (room: Room) => {
        updateStatusMutation.mutate({
            id: room.id,
            status: RoomStatus.Cleaning,
            successMessage: `${t('common.room')} ${room.number} ${t('housekeeping.markedAsCleaning')}`
        });
    };

    const totalRoomsNeedingAttention = stats.cleaning + stats.maintenance;

    return (
        <div className="min-h- space-y-8 p-6 bg-gradient-to-br from-slate-50 via-yellow-50 to-amber-50">
            {/* Enhanced Header with Glassmorphism */}
            <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/20 p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-yellow-600/10 via-amber-600/10 to-orange-600/10"></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-4xl font-extrabold bg-gradient-to-r from-yellow-600 via-amber-600 to-orange-600 bg-clip-text text-transparent mb-2">
                            {t('housekeeping.title')}
                        </h1>
                        <p className="text-slate-600 text-lg font-medium">{t('housekeeping.subtitle')}</p>
                    </div>
                    <button
                        onClick={() => generateHousekeepingReportPDF([...cleaningRooms, ...occupiedRooms, ...maintenanceRooms])}
                        className="group relative bg-gradient-to-r from-slate-800 to-black hover:from-slate-900 hover:to-slate-950 text-white px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                    >
                        <FaFilePdf className="text-lg group-hover:rotate-12 transition-transform" />
                        <span className="font-semibold">{t('housekeeping.printReport')}</span>
                    </button>
                </div>
            </div>

            {loading ? (
                <div className="flex justify-center p-12 bg-white/70 backdrop-blur-xl rounded-3xl shadow-xl border border-white/20">
                    <div className="animate-spin rounded-full h-16 w-16 border-b-4 border-amber-600"></div>
                </div>
            ) : (
                <>
                    {/* Statistics Dashboard */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        <StatCard
                            icon={FaBroom}
                            value={stats.cleaning}
                            label={t('housekeeping.cleaningNeeded', 'En Limpieza')}
                            color="yellow"
                        />
                        <StatCard
                            icon={FaBed}
                            value={stats.occupied}
                            label={t('housekeeping.occupiedRooms', 'Habitaciones Ocupadas')}
                            color="red"
                        />
                        <StatCard
                            icon={FaTools}
                            value={stats.maintenance}
                            label={t('housekeeping.inMaintenance', 'En Mantenimiento')}
                            color="gray"
                        />
                        <StatCard
                            icon={FaCheckCircle}
                            value={stats.clean}
                            label={t('housekeeping.cleanRooms', 'Limpias')}
                            color="green"
                        />
                    </div>

                    {/* No Tasks - All Clean State */}
                    {totalRoomsNeedingAttention === 0 ? (
                        <div className="bg-white/70 backdrop-blur-xl rounded-3xl p-16 text-center shadow-xl border border-white/20">
                            <div className="w-32 h-32 mx-auto bg-gradient-to-br from-green-400 to-emerald-600 rounded-full flex items-center justify-center mb-6 shadow-2xl">
                                <FaCheckCircle className="text-6xl text-white" />
                            </div>
                            <h3 className="text-3xl font-black text-slate-700 mb-3">
                                {t('housekeeping.allClean', '¡Todo Limpio!')}
                            </h3>
                            <p className="text-slate-500 text-lg">
                                {t('housekeeping.noTasks', 'No hay tareas de limpieza pendientes')}
                            </p>
                        </div>
                    ) : (
                        <>
                            {/* Section 1: Cleaning Needed (Priority 1) */}
                            {cleaningRooms.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-yellow-400 to-amber-600 shadow-lg animate-pulse"></div>
                                        <h2 className="text-2xl font-black bg-gradient-to-r from-yellow-600 to-amber-600 bg-clip-text text-transparent">
                                            {t('housekeeping.cleaningNeeded', 'Requieren Limpieza')} ({cleaningRooms.length})
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {cleaningRooms.map((room, index) => (
                                            <div
                                                key={room.id}
                                                style={{ animationDelay: `${index * 50}ms` }}
                                                className="animate-slide-up"
                                            >
                                                <HousekeepingRoomCard
                                                    room={room}
                                                    onMarkAsClean={() => markAsClean(room)}
                                                    onMarkAsCleaning={() => markAsCleaning(room)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Section 2: Occupied Rooms (Reference) */}
                            {occupiedRooms.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-red-400 to-rose-600 shadow-lg"></div>
                                        <h2 className="text-2xl font-black bg-gradient-to-r from-red-600 to-rose-600 bg-clip-text text-transparent">
                                            {t('housekeeping.occupiedRooms', 'Habitaciones Ocupadas')} ({occupiedRooms.length})
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {occupiedRooms.map((room, index) => (
                                            <div
                                                key={room.id}
                                                style={{ animationDelay: `${index * 50}ms` }}
                                                className="animate-slide-up"
                                            >
                                                <HousekeepingRoomCard
                                                    room={room}
                                                    onMarkAsClean={() => markAsClean(room)}
                                                    onMarkAsCleaning={() => markAsCleaning(room)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            {/* Section 3: Maintenance (Priority 2) */}
                            {maintenanceRooms.length > 0 && (
                                <div className="space-y-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full bg-gradient-to-r from-gray-400 to-slate-600 shadow-lg"></div>
                                        <h2 className="text-2xl font-black bg-gradient-to-r from-gray-600 to-slate-600 bg-clip-text text-transparent">
                                            {t('housekeeping.inMaintenance', 'En Mantenimiento')} ({maintenanceRooms.length})
                                        </h2>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                        {maintenanceRooms.map((room, index) => (
                                            <div
                                                key={room.id}
                                                style={{ animationDelay: `${index * 50}ms` }}
                                                className="animate-slide-up"
                                            >
                                                <HousekeepingRoomCard
                                                    room={room}
                                                    onMarkAsClean={() => markAsClean(room)}
                                                    onMarkAsCleaning={() => markAsCleaning(room)}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </>
            )}

            {/* Animation Keyframes */}
            <style>{`
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
                .animate-slide-up {
                    animation: slide-up 0.5s ease-out forwards;
                }
            `}</style>
        </div>
    );
};

export default Housekeeping;
