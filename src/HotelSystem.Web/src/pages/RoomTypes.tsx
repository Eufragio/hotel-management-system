import { useState, useEffect, useMemo } from 'react';
import { roomService } from '../services/api';
import { RoomType } from '../types';
import { FaBed, FaEdit, FaPowerOff, FaUsers, FaCheck, FaFileExcel, FaFilePdf, FaPlus, FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import RoomTypeModal from '../components/roomtypes/RoomTypeModal';
import { generateRoomTypesPDF } from '../utils/pdfExports';
import { exportRoomTypesToExcel } from '../utils/excelExports';
import { useTranslation } from 'react-i18next';
import { useSettings } from '../hooks/useSettings';
import { useCurrency } from '../hooks/useCurrency';


const RoomTypes = () => {
    const { t } = useTranslation();
    const { data: settings } = useSettings();
    const { formatCurrency } = useCurrency();
    const [types, setTypes] = useState<RoomType[]>([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingType, setEditingType] = useState<RoomType | null>(null);

    // Pagination
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 6;

    useEffect(() => {
        fetchTypes();
    }, []);

    const fetchTypes = async () => {
        setLoading(true);
        try {
            const data = await roomService.getTypes();
            setTypes(data);
        } catch (error) {
            console.error('Failed to fetch room types', error);
        } finally {
            setLoading(false);
        }
    };

    const handleEdit = (type: RoomType) => {
        setEditingType(type);
        setIsModalOpen(true);
    };

    const handleToggleActive = async (type: RoomType) => {
        if (!confirm(t('common.confirm') + '?')) return;
        try {
            await roomService.toggleTypeStatus(type.id);
            await fetchTypes();
        } catch (error) {
            console.error('Failed to toggle status', error);
            alert('Failed to update status');
        }
    };

    const openCreateModal = () => {
        setEditingType(null);
        setIsModalOpen(true);
    };

    // Pagination Logic
    const totalPages = Math.ceil(types.length / itemsPerPage);
    const paginatedTypes = useMemo(() => {
        const start = (currentPage - 1) * itemsPerPage;
        return types.slice(start, start + itemsPerPage);
    }, [types, currentPage]);

    // Enhanced gradient colors for different room types
    // Now using custom colors from database


    return (
        <div className="min-h-screen space-y-8 p-6 bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50">
            {/* Enhanced Header with Glassmorphism */}
            <div className="relative overflow-hidden rounded-3xl bg-white/70 backdrop-blur-xl shadow-2xl border border-white/20 p-4 md:p-8">
                <div className="absolute inset-0 bg-gradient-to-r from-purple-600/10 via-blue-600/10 to-cyan-600/10"></div>
                <div className="relative flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-extrabold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-600 bg-clip-text text-transparent mb-2 text-center md:text-left">
                            {t('roomTypes.title')}
                        </h1>
                        <p className="text-slate-600 text-base md:text-lg font-medium text-center md:text-left">{t('roomTypes.subtitle')}</p>
                    </div>
                    <div className="flex gap-3 flex-wrap justify-center md:justify-end">
                        <button
                            onClick={() => exportRoomTypesToExcel(types)}
                            className="group relative bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white px-4 md:px-5 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            title={t('common.exportToExcel') || "Export to Excel"}
                        >
                            <FaFileExcel className="text-lg" />
                            <span className="hidden sm:inline font-semibold">{t('common.excel') || "Excel"}</span>
                        </button>
                        <button
                            onClick={() => settings && generateRoomTypesPDF(types, settings)}
                            className="group relative bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white px-4 md:px-5 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                            title={t('common.exportToPDF') || "Export to PDF"}
                        >
                            <FaFilePdf className="text-lg" />
                            <span className="hidden sm:inline font-semibold">{t('common.pdf') || "PDF"}</span>
                        </button>
                        <button
                            onClick={openCreateModal}
                            className="group relative bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white px-4 md:px-6 py-3 rounded-xl flex items-center gap-3 transition-all duration-300 shadow-lg hover:shadow-2xl hover:scale-105"
                        >
                            <FaPlus className="text-lg group-hover:rotate-90 transition-transform duration-300" />
                            <span className="font-semibold">{t('roomTypes.addRoomType')}</span>
                        </button>
                    </div>
                </div>
            </div>

            <RoomTypeModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onSuccess={fetchTypes}
                initialData={editingType}
            />

            {loading ? (
                <div className="flex justify-center p-20">
                    <div className="relative">
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-purple-200"></div>
                        <div className="animate-spin rounded-full h-16 w-16 border-4 border-transparent border-t-purple-600 absolute inset-0"></div>
                    </div>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {paginatedTypes.map((type, index) => (
                            <div
                                key={type.id}
                                className="group relative bg-white rounded-3xl shadow-xl hover:shadow-2xl transition-all duration-500 overflow-hidden border border-slate-100 hover:border-transparent hover:-translate-y-2"
                                style={{
                                    animation: `fadeInUp 0.6s ease-out ${index * 0.1}s both`
                                }}
                            >
                                {/* Gradient Header */}
                                <div className="relative h-40 overflow-hidden" style={{ background: `linear-gradient(135deg, ${type.color}dd, ${type.color})` }}>
                                    {/* Animated Background Pattern */}
                                    <div className="absolute inset-0 opacity-20">
                                        <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16 group-hover:scale-150 transition-transform duration-700"></div>
                                        <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20 group-hover:scale-150 transition-transform duration-700"></div>
                                    </div>

                                    {/* Icon & Status Badge */}
                                    <div className="relative h-full flex items-center justify-between p-6">
                                        <div className="bg-white/20 backdrop-blur-md p-4 rounded-2xl shadow-xl group-hover:scale-110 transition-transform duration-300">
                                            <FaBed className="text-4xl text-white drop-shadow-lg" />
                                        </div>
                                        <div className="flex flex-col gap-2 items-end">
                                            {type.isActive !== false && (
                                                <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg flex items-center gap-2">
                                                    <FaCheck className="text-green-500 text-xs" />
                                                    <span className="text-xs font-bold text-green-700">{t('common.active')}</span>
                                                </div>
                                            )}
                                            {type.isActive === false && (
                                                <div className="bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg">
                                                    <span className="text-xs font-bold text-red-700">{t('common.inactive')}</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-6 space-y-4">
                                    {/* Title & Description */}
                                    <div>
                                        <h3 className="text-2xl font-extrabold text-slate-800 mb-2 group-hover:text-purple-600 transition-colors duration-300">
                                            {type.name}
                                        </h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 leading-relaxed">
                                            {type.description || t('roomTypes.noDescription')}
                                        </p>
                                    </div>

                                    {/* Price & Capacity */}
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                                        <div className="flex items-center gap-3 bg-gradient-to-r from-slate-50 to-slate-100 px-4 py-2.5 rounded-xl">
                                            <FaUsers className="text-slate-400 text-lg" />
                                            <div className="flex flex-col">
                                                <span className="text-xs text-slate-500 font-medium">{t('roomTypes.maxCapacity')}</span>
                                                <span className="text-lg font-bold text-slate-800">{type.capacity}</span>
                                            </div>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-xs text-slate-500 font-medium mb-1">Precio Base</span>
                                            <span className="text-2xl font-extrabold" style={{ color: type.color }}>{formatCurrency(type.basePrice)}</span>
                                        </div>
                                    </div>

                                    {/* Action Buttons */}
                                    <div className="flex gap-2 pt-4">
                                        <button
                                            onClick={() => handleEdit(type)}
                                            className="flex-1 text-white font-semibold rounded-xl px-5 py-3 flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105 shadow-lg hover:shadow-xl group/btn"
                                            style={{ background: `linear-gradient(135deg, ${type.color}, ${type.color}dd)` }}
                                            title={t('common.edit') || "Edit"}
                                        >
                                            <FaEdit className="group-hover/btn:rotate-12 transition-transform duration-300" />
                                            <span>{t('common.edit')}</span>
                                        </button>
                                        <button
                                            onClick={() => handleToggleActive(type)}
                                            className="px-4 py-3 rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 flex items-center justify-center gap-2 text-white"
                                            style={{ background: type.isActive ? `linear-gradient(135deg, ${type.color}, ${type.color}dd)` : 'linear-gradient(135deg, #ef4444, #dc2626)' }}
                                            title={type.isActive !== false ? t('users.deactivate') : t('users.activate')}
                                        >
                                            <FaPowerOff className="hover:scale-110 transition-transform duration-300" />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}

                        {types.length === 0 && (
                            <div className="col-span-full p-20 text-center bg-white/70 backdrop-blur-xl rounded-3xl border-2 border-dashed border-slate-200 shadow-xl">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="bg-gradient-to-br from-slate-100 to-slate-200 p-6 rounded-full">
                                        <FaBed className="text-5xl text-slate-400" />
                                    </div>
                                    <p className="text-slate-400 text-lg font-medium">{t('roomTypes.noRoomTypes')}</p>
                                </div>
                            </div>
                        )}
                    </div>
                </>
            )}

            {/* Enhanced Pagination */}
            {totalPages > 1 && (
                <div className="flex items-center justify-center gap-4 mt-8 bg-white/70 backdrop-blur-xl p-6 rounded-2xl shadow-xl border border-white/20">
                    <button
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        className="group p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl disabled:hover:shadow-lg hover:scale-110 disabled:hover:scale-100"
                    >
                        <FaChevronLeft className="group-hover:-translate-x-1 transition-transform duration-300" />
                    </button>
                    <div className="bg-gradient-to-r from-blue-50 to-purple-50 px-6 py-3 rounded-xl border border-blue-100">
                        <span className="text-sm font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            {t('common.page')} {currentPage} {t('common.of')} {totalPages}
                        </span>
                    </div>
                    <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        className="group p-3 rounded-xl bg-gradient-to-r from-blue-500 to-purple-500 hover:from-blue-600 hover:to-purple-600 text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all duration-300 shadow-lg hover:shadow-xl disabled:hover:shadow-lg hover:scale-110 disabled:hover:scale-100"
                    >
                        <FaChevronRight className="group-hover:translate-x-1 transition-transform duration-300" />
                    </button>
                </div>
            )}

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

export default RoomTypes;
