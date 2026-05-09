import { useState, useMemo } from 'react';
import { Room, RoomStatus, RoomType } from '../types';
import { FaPlus, FaBed, FaEdit, FaSearch, FaDoorOpen, FaFileExcel, FaFilePdf, FaChevronLeft, FaChevronRight, FaToggleOn, FaToggleOff } from 'react-icons/fa';
import EditRoomModal from '../components/layout/EditRoomModal';
import CreateRoomModal from '../components/layout/CreateRoomModal';
import { useTranslation } from 'react-i18next';
import EmptyState from '../components/common/EmptyState';
import ConfirmDialog from '../components/common/ConfirmDialog';
import { useRooms, useRoomTypes, useToggleRoomActive } from '../hooks/useRooms';
import { exportRoomsToExcel } from '../utils/excelExports';
import { generateRoomListPDF } from '../utils/pdfExports';
import { useSettings } from '../hooks/useSettings';
import { useCurrency } from '../hooks/useCurrency';


const Rooms = () => {
    const { t } = useTranslation();
    const { data: settings } = useSettings();
    const { formatCurrency } = useCurrency();

    // React Query hooks - replaces manual state management!
    const { data: rooms = [], isLoading: loading } = useRooms();
    const { data: roomTypes = [] } = useRoomTypes();
    const toggleRoomActiveMutation = useToggleRoomActive();

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editRoom, setEditRoom] = useState<Room | null>(null);

    // Toggle Confirmation State
    const [toggleRoom, setToggleRoom] = useState<Room | null>(null);

    // Filter States
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState<RoomStatus | 'all'>('all');
    const [typeFilter, setTypeFilter] = useState<string>('all');

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 8;

    // Memoized filtering for performance
    const filteredRooms = useMemo(() => {
        return rooms.filter((room: Room) => {
            const matchesSearch = room.number.toString().includes(searchTerm);
            const matchesStatus = statusFilter === 'all' || room.status === statusFilter;
            const matchesType = typeFilter === 'all' || room.roomTypeId === typeFilter;
            return matchesSearch && matchesStatus && matchesType;
        });
    }, [rooms, searchTerm, statusFilter, typeFilter]);

    // Pagination Logic
    const totalPages = Math.ceil(filteredRooms.length / itemsPerPage);
    const paginatedRooms = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return filteredRooms.slice(start, start + itemsPerPage);
    }, [filteredRooms, currentPage]);

    // Reset to page 1 when filters change
    useMemo(() => {
        setCurrentPage(1);
    }, [searchTerm, statusFilter, typeFilter]);

    const handleToggleActive = async () => {
        if (!toggleRoom) return;
        try {
            await toggleRoomActiveMutation.mutateAsync(toggleRoom.id);
            setToggleRoom(null);
        } catch (error) {
            console.error('Failed to toggle room status', error);
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
        <div className="min-h-screen space-y-8 p-6 bg-gradient-to-br from-slate-50 via-indigo-50 to-blue-50">
            {/* Enhanced Header with Glassmorphism */}
            <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/20 p-4 md:p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-indigo-600/10 via-blue-600/10 to-cyan-600/10"></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-indigo-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 text-center md:text-left">
                            {t('rooms.title')}
                        </h1>
                        <p className="text-slate-600 text-base md:text-lg font-medium text-center md:text-left">{t('rooms.subtitle')}</p>
                    </div>
                    <div className="flex gap-3 flex-wrap justify-center md:justify-end">
                        <button
                            onClick={() => exportRoomsToExcel(filteredRooms)}
                            className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 md:px-5 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            title={t('common.exportToExcel')}
                        >
                            <FaFileExcel className="text-lg" />
                            <span className="hidden sm:inline font-semibold">{t('common.excel')}</span>
                        </button>
                        <button
                            onClick={() => settings && generateRoomListPDF(filteredRooms, settings)}
                            className="group relative bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 md:px-5 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            title={t('common.exportToPDF')}
                        >
                            <FaFilePdf className="text-lg" />
                            <span className="hidden sm:inline font-semibold">{t('common.pdf')}</span>
                        </button>
                        <button
                            onClick={() => setIsModalOpen(true)}
                            className="group relative bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-4 md:px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
                        >
                            <FaPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                            <span className="font-semibold">{t('rooms.addRoom')}</span>
                        </button>
                    </div>
                </div>
            </div>

            {/* Enhanced Search & Filter Bar */}
            <div className="relative overflow-hidden rounded-2xl bg-white/70 backdrop-blur-xl shadow-xl border border-white/20 p-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative flex-1 w-full">
                    <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                        type="text"
                        placeholder={t('rooms.searchPlaceholder')}
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                    />
                </div>

                <div className="flex w-full md:w-auto gap-4">
                    <select
                        value={statusFilter}
                        onChange={(e) => {
                            const value = e.target.value;
                            setStatusFilter(value === 'all' ? 'all' : parseInt(value) as RoomStatus);
                        }}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-slate-700"
                    >
                        <option value="all">{t('rooms.allStatuses')}</option>
                        <option value={RoomStatus.Available}>{t('rooms.status.available')}</option>
                        <option value={RoomStatus.Occupied}>{t('rooms.status.occupied')}</option>
                        <option value={RoomStatus.Cleaning}>{t('rooms.status.cleaning')}</option>
                        <option value={RoomStatus.Maintenance}>{t('rooms.status.maintenance')}</option>
                    </select>

                    <select
                        value={typeFilter}
                        onChange={(e) => setTypeFilter(e.target.value)}
                        className="px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 bg-white text-slate-700"
                    >
                        <option value="all">{t('rooms.allTypes')}</option>
                        {roomTypes.map((type: RoomType) => (
                            <option key={type.id} value={type.id}>{type.name}</option>
                        ))}
                    </select>
                </div>
            </div>

            <CreateRoomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { }} // React Query handles refetching automatically
            />

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-indigo-600 absolute inset-0"></div>
                    </div>
                </div>
            ) : filteredRooms.length === 0 ? (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100">
                    <EmptyState
                        icon={<FaDoorOpen />}
                        title={searchTerm || typeFilter !== 'all' || statusFilter !== 'all' ? t('rooms.noRooms') : t('rooms.noRoomsRegistered')}
                        description={searchTerm || typeFilter !== 'all' || statusFilter !== 'all' ?
                            t('rooms.noRoomsFiltered') :
                            t('rooms.noRoomsDescription')
                        }
                        action={!searchTerm && typeFilter === 'all' && statusFilter === 'all' ? {
                            label: t('rooms.addRoom'),
                            onClick: () => setIsModalOpen(true)
                        } : undefined}
                    />
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {paginatedRooms.map((room: Room, index: number) => {
                            // Get the room type to access its color
                            const roomType = roomTypes.find((rt: RoomType) => rt.id === room.roomTypeId);
                            const roomColor = roomType?.color || '#2563eb'; // Default blue if not found

                            return (
                                <div
                                    key={room.id}
                                    className="group relative bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:border-transparent hover:-translate-y-2"
                                    style={{
                                        animation: `fadeInUp 0.5s ease-out ${index * 0.05}s both`
                                    }}
                                >
                                    {/* Gradient Header - Using Room Type Color */}
                                    <div className="relative h-24 overflow-hidden" style={{ background: `linear-gradient(135deg, ${roomColor}dd, ${roomColor})` }}>
                                        <div className="absolute inset-0 opacity-20">
                                            <div className="absolute top-0 left-0 w-24 h-24 bg-white rounded-full -translate-x-12 -translate-y-12 group-hover:scale-150 transition-transform duration-700"></div>
                                            <div className="absolute bottom-0 right-0 w-32 h-32 bg-white rounded-full translate-x-16 translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                                        </div>

                                        <div className="relative h-full flex items-center justify-between px-5">
                                            <div className="bg-white/20 backdrop-blur-md p-3 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                                                <FaBed className="text-2xl text-white drop-shadow-lg" />
                                            </div>
                                            <div className="flex flex-col gap-1.5 items-end">
                                                <span className={`px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-sm shadow-md ${room.status === RoomStatus.Available ? 'text-green-700' : room.status === RoomStatus.Occupied ? 'text-red-700' : room.status === RoomStatus.Cleaning ? 'text-yellow-700' : 'text-gray-700'}`}>
                                                    {getStatusLabel(room.status)}
                                                </span>
                                                {!room.isActive && (
                                                    <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-white/95 backdrop-blur-sm text-slate-700 shadow-md">
                                                        {t('rooms.inactive')}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-5 space-y-3">
                                        <div>
                                            <h3 className="text-xl font-extrabold text-slate-800 mb-1 group-hover:text-indigo-600 transition-colors duration-300">
                                                {t('common.room')} {room.number}
                                            </h3>
                                            <p className="text-slate-500 text-sm">{room.roomTypeName || t('rooms.standardRoom')}</p>
                                        </div>

                                        <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-500 font-medium">{t('common.floor')}</span>
                                                <span className="text-lg font-bold text-slate-800">{room.floor}</span>
                                            </div>
                                            <div className="flex flex-col items-end">
                                                <span className="text-xs text-slate-500 font-medium mb-1">{t('common.night')}</span>
                                                <span className="text-xl font-extrabold" style={{ color: roomColor }}>{formatCurrency(room.pricePerNight)}</span>
                                            </div>
                                        </div>

                                        {/* Action Buttons */}
                                        <div className="flex gap-2 pt-3">
                                            <button
                                                onClick={() => setEditRoom(room)}
                                                className="flex-1 text-white font-semibold rounded-xl px-4 py-2.5 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl"
                                                style={{ background: `linear-gradient(135deg, ${roomColor}, ${roomColor}dd)` }}
                                                title={t('common.edit') || "Editar"}
                                            >
                                                <FaEdit className="group-hover/btn:rotate-12 transition-transform duration-300" />
                                                <span>{t('common.edit')}</span>
                                            </button>
                                            <button
                                                onClick={() => setToggleRoom(room)}
                                                className={`px-3 py-2.5 rounded-xl transition-all duration-300 shadow-md hover:shadow-lg font-semibold ${room.isActive
                                                    ? 'bg-gradient-to-r from-red-500 to-rose-500 hover:from-red-600 hover:to-rose-600 text-white'
                                                    : 'bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white'
                                                    }`}
                                                title={t('rooms.toggleActive') || "Activar/Desactivar"}
                                            >
                                                {room.isActive ? <FaToggleOn size={18} /> : <FaToggleOff size={18} />}
                                            </button>
                                        </div>
                                    </div>


                                </div>
                            );
                        })}
                    </div>

                    {/* Enhanced Pagination */}
                    {totalPages > 1 && (
                        <div className="flex items-center justify-center gap-4 mt-8 bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20">
                            <button
                                onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                                disabled={currentPage === 1}
                                className="group p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl disabled:hover:shadow-lg hover:scale-110 disabled:hover:scale-100"
                            >
                                <FaChevronLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
                            </button>
                            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 rounded-xl border border-blue-100">
                                <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                                    Página {currentPage} de {totalPages}
                                </span>
                            </div>
                            <button
                                onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                                disabled={currentPage === totalPages}
                                className="group p-3 rounded-xl bg-gradient-to-r from-blue-500 to-indigo-500 hover:from-blue-600 hover:to-indigo-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl disabled:hover:shadow-lg hover:scale-110 disabled:hover:scale-100"
                            >
                                <FaChevronRight className="group-hover:translate-x-1 transition-transform duration-300" />
                            </button>
                        </div>
                    )}
                </>
            )}

            {/* Modals */}
            <CreateRoomModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={() => { }} // React Query handles refetching automatically
            />

            <EditRoomModal
                isOpen={!!editRoom}
                onClose={() => setEditRoom(null)}
                room={editRoom}
            />

            <ConfirmDialog
                isOpen={!!toggleRoom}
                onClose={() => setToggleRoom(null)}
                onConfirm={handleToggleActive}
                title={toggleRoom?.isActive ? t('rooms.inactive') : t('rooms.active')}
                message={toggleRoom ? (toggleRoom.isActive ? t('rooms.confirmDeactivate') : t('rooms.confirmActivate')) : ''}
                confirmText={t('common.confirm')}
                cancelText={t('common.cancel')}
                type={toggleRoom?.isActive ? "danger" : "info"}
            />
            {/* Custom Animation Keyframes */}
            <style>{`
                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
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

export default Rooms;
