import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { FaBed, FaCalendarCheck, FaChartLine, FaMoneyBillWave, FaArrowRight } from 'react-icons/fa';
import { Link } from 'react-router-dom';
import StatsCard from '../components/dashboard/StatsCard';
import RevenueChart from '../components/dashboard/RevenueChart';
import DataOverview from '../components/dashboard/DataOverview';
import SalesAnalytics from '../components/dashboard/SalesAnalytics';
import PerformanceDevice from '../components/dashboard/PerformanceDevice';
import { useQuery } from '@tanstack/react-query';
import { dashboardService, DashboardStats, ReservationStatus } from '../services/api';
import { useNotifications } from '../context/NotificationContext';
import { format, subDays } from 'date-fns';
import { useCurrency } from '../hooks/useCurrency';

const Dashboard = () => {
    const { t } = useTranslation();
    const { notifications } = useNotifications();
    const { formatCurrency } = useCurrency();
    const [stats, setStats] = useState<DashboardStats | null>(null);

    // Initial Data Fetch
    const { data, isLoading, refetch } = useQuery({
        queryKey: ['dashboard-stats'],
        queryFn: dashboardService.getStats
    });

    // Revenue Data
    const endDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subDays(new Date(), 6), 'yyyy-MM-dd');

    const { data: revenueData = [] } = useQuery({
        queryKey: ['dashboard-revenue', startDate, endDate],
        queryFn: () => dashboardService.getRevenueChart(startDate, endDate)
    });

    useEffect(() => {
        if (data) {
            setStats(data);
        }
    }, [data]);

    // Listen for new notifications to refresh stats (Real-time simulation)
    useEffect(() => {
        if (notifications.length > 0) {
            refetch();
        }
    }, [notifications, refetch]);

    const getOccupancyRate = () => {
        if (!stats || stats.totalRooms === 0) return 0;
        return Math.round((stats.occupiedRooms / stats.totalRooms) * 100);
    };

    const getStatusColor = (status: ReservationStatus) => {
        switch (status) {
            case ReservationStatus.Confirmed: return 'text-green-600 bg-green-50';
            case ReservationStatus.CheckedIn: return 'text-blue-600 bg-blue-50';
            case ReservationStatus.CheckedOut: return 'text-gray-600 bg-gray-50';
            case ReservationStatus.Cancelled: return 'text-red-600 bg-red-50';
            case ReservationStatus.NoShow: return 'text-orange-600 bg-orange-50';
            default: return 'text-slate-600 bg-slate-50';
        }
    };

    const getStatusLabel = (status: ReservationStatus) => {
        const labels = ['Pending', 'Confirmed', 'Checked In', 'Checked Out', 'Cancelled', 'No Show'];
        return labels[status] || 'Unknown';
    };

    return (
        <div className="space-y-6 md:space-y-8 pb-10 p-4 md:p-6">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-800">
                        {t('dashboard.welcome', { name: 'Admin' })} 👋
                    </h1>
                    <p className="text-slate-500 mt-1 text-sm md:text-base">{t('dashboard.subtitle')}</p>
                </div>
            </div>

            {/* Row 1: Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
                <StatsCard
                    title={t('dashboard.stats.totalRevenue')}
                    value={stats ? formatCurrency(stats.totalRevenue) : formatCurrency(0)}
                    icon={FaMoneyBillWave}
                    color="from-sky-400 to-sky-600"
                    trend={{ value: 21.5, isPositive: false }}
                    loading={isLoading}
                />
                <StatsCard
                    title={t('dashboard.stats.totalReservations')}
                    value={stats?.totalBookings || 0}
                    icon={FaCalendarCheck}
                    color="from-violet-500 to-purple-600"
                    trend={{ value: 21.5, isPositive: true }}
                    loading={isLoading}
                />
                <StatsCard
                    title={t('dashboard.stats.availableRooms')}
                    value={stats?.availableRooms || 0}
                    icon={FaBed}
                    color="from-teal-400 to-teal-600"
                    trend={{ value: 21.5, isPositive: false }}
                    loading={isLoading}
                />
                <StatsCard
                    title={t('dashboard.stats.occupancyRate')}
                    value={`${getOccupancyRate()}%`}
                    icon={FaChartLine}
                    color="from-orange-400 to-orange-500"
                    trend={{ value: 21.5, isPositive: false }}
                    loading={isLoading}
                />
            </div>

            {/* Row 2: Data Overview & Income */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="lg:col-span-1 h-full">
                    <DataOverview />
                </div>
                <div className="lg:col-span-2 h-full">
                    <RevenueChart data={revenueData} />
                </div>
            </div>

            {/* Row 3: Sales, Performance, Storage */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
                <div className="h-full">
                    <SalesAnalytics />
                </div>
                <div className="h-full">
                    <PerformanceDevice />
                </div>

                {/* Reusing Recent Activity as the 3rd column for now */}
                <div className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="font-bold text-lg text-slate-800">{t('dashboard.recentBookings')}</h3>
                        <Link to="/reservations" className="text-sm text-primary-600 font-medium hover:text-primary-700 flex items-center gap-1">
                            {t('dashboard.viewAll')} <FaArrowRight size={12} />
                        </Link>
                    </div>

                    <div className="space-y-4 flex-1">
                        {isLoading ? (
                            Array(3).fill(0).map((_, i) => (
                                <div key={i} className="flex gap-4 items-center animate-pulse">
                                    <div className="w-10 h-10 rounded-full bg-slate-100"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-slate-100 rounded w-2/3"></div>
                                        <div className="h-3 bg-slate-100 rounded w-1/3"></div>
                                    </div>
                                </div>
                            ))
                        ) : stats?.recentBookings?.length ? (
                            stats.recentBookings.slice(0, 4).map(booking => (
                                <div key={booking.id} className="flex items-center gap-4 p-3 hover:bg-slate-50 rounded-xl transition-colors cursor-pointer group">
                                    <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold text-sm">
                                        {booking.guestName.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-medium text-slate-800 truncate group-hover:text-primary-600 transition-colors">
                                            {booking.guestName}
                                        </p>
                                        <p className="text-xs text-slate-500 truncate">
                                            Room {booking.roomNumber}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-medium text-slate-800 text-sm">{formatCurrency(booking.totalPrice)}</p>
                                        <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full ${getStatusColor(booking.status)}`}>
                                            {getStatusLabel(booking.status)}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <p className="text-slate-400 text-center py-4 text-sm">{t('dashboard.noRecentBookings')}</p>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
