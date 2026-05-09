import { useState, useEffect } from 'react';
import { FaChartLine, FaCalendar, FaUsers, FaDollarSign, FaBed } from 'react-icons/fa';
import { reportService, RevenueReport, OccupancyReport, GuestStats } from '../services/api';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import toast from 'react-hot-toast';
import { useCurrency } from '../hooks/useCurrency';
import { useTranslation } from 'react-i18next';

const Reports = () => {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();
    const [revenueData, setRevenueData] = useState<RevenueReport | null>(null);
    const [occupancyData, setOccupancyData] = useState<OccupancyReport | null>(null);
    const [guestStats, setGuestStats] = useState<GuestStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [dateRange, setDateRange] = useState({
        startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        endDate: new Date().toISOString().split('T')[0]
    });

    const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f97316', '#eab308', '#22c55e', '#14b8a6'];

    useEffect(() => {
        loadReports();
    }, []);

    const loadReports = async () => {
        try {
            setLoading(true);
            const [revenue, occupancy, guests] = await Promise.all([
                reportService.getRevenue(dateRange.startDate, dateRange.endDate),
                reportService.getOccupancy(dateRange.startDate, dateRange.endDate),
                reportService.getGuestStats()
            ]);
            setRevenueData(revenue);
            setOccupancyData(occupancy);
            setGuestStats(guests);
        } catch (error: any) {
            toast.error(t('reports.error'));
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const handleDateRangeUpdate = () => {
        loadReports();
    };

    const formatDate = (dateStr: string) => {
        return new Date(dateStr).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    };

    if (loading) {
        return (
            <div className="p-6 min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block w-12 h-12 border-4 border-primary-500 border-t-transparent rounded-full animate-spin"></div>
                    <p className="mt-4 text-slate-600 dark:text-slate-400">{t('reports.loading')}</p>
                </div>
            </div>
        );
    }

    return (
        <div className="p-6">
            {/* Header */}
            <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-white flex items-center gap-2">
                        <FaChartLine className="text-primary-500" />
                        {t('reports.title')}
                    </h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-1">{t('reports.subtitle')}</p>
                </div>

                {/* Date Range Picker */}
                <div className="flex items-center gap-3 bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700">
                    <FaCalendar className="text-slate-400" />
                    <input
                        type="date"
                        className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                        value={dateRange.startDate}
                        onChange={e => setDateRange({ ...dateRange, startDate: e.target.value })}
                    />
                    <span className="text-slate-400">to</span>
                    <input
                        type="date"
                        className="px-2 py-1 border border-slate-300 dark:border-slate-600 rounded bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                        value={dateRange.endDate}
                        onChange={e => setDateRange({ ...dateRange, endDate: e.target.value })}
                    />
                    <button
                        onClick={handleDateRangeUpdate}
                        className="px-4 py-1.5 bg-primary-500 text-white rounded hover:bg-primary-600 transition-colors"
                    >
                        {t('reports.dateRange.update')}
                    </button>
                </div>
            </div>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-green-100 text-sm font-medium">{t('reports.metrics.totalRevenue')}</p>
                            <h2 className="text-3xl font-bold mt-1">{formatCurrency(revenueData?.totalRevenue || 0)}</h2>
                        </div>
                        <FaDollarSign className="text-5xl text-green-200 opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-blue-100 text-sm font-medium">{t('reports.metrics.occupancyRate')}</p>
                            <h2 className="text-3xl font-bold mt-1">{occupancyData?.currentOccupancyRate.toFixed(1)}%</h2>
                            <p className="text-blue-100 text-xs mt-1">{occupancyData?.occupiedRooms} {t('reports.metrics.ofRooms')} {occupancyData?.totalRooms} {t('reports.metrics.rooms')}</p>
                        </div>
                        <FaBed className="text-5xl text-blue-200 opacity-50" />
                    </div>
                </div>

                <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-xl p-6 shadow-lg">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-purple-100 text-sm font-medium">{t('reports.metrics.totalGuests')}</p>
                            <h2 className="text-3xl font-bold mt-1">{guestStats?.totalGuests || 0}</h2>
                            <p className="text-purple-100 text-xs mt-1">{guestStats?.newGuestsThisMonth || 0} {t('reports.metrics.newThisMonth')}</p>
                        </div>
                        <FaUsers className="text-5xl text-purple-200 opacity-50" />
                    </div>
                </div>
            </div>

            {/* Charts Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Revenue Trend */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">{t('reports.charts.revenueTrend')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={revenueData?.revenueByDate.map(d => ({ ...d, date: formatDate(d.date) }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                formatter={(value: any) => formatCurrency(value)}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="amount" stroke="#6366f1" strokeWidth={3} name={t('reports.charts.revenue')} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Revenue by Room Type */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">{t('reports.charts.revenueByRoomType')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={revenueData?.revenueByRoomType}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="roomTypeName" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                formatter={(value: any) => formatCurrency(value)}
                            />
                            <Legend />
                            <Bar dataKey="revenue" fill="#8b5cf6" name={t('reports.charts.revenue')} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Occupancy Trend */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">{t('reports.charts.occupancyTrend')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={occupancyData?.occupancyByDate.map(d => ({ ...d, date: formatDate(d.date) }))}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                            <XAxis dataKey="date" stroke="#64748b" />
                            <YAxis stroke="#64748b" />
                            <Tooltip
                                contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }}
                                formatter={(value: any) => `${value}%`}
                            />
                            <Legend />
                            <Line type="monotone" dataKey="occupancyRate" stroke="#22c55e" strokeWidth={3} name={t('reports.charts.occupancy')} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

                {/* Guests by Country */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-white mb-4">{t('reports.charts.guestsByCountry')}</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={guestStats?.guestsByCountry}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="count"
                                nameKey="country"
                            >
                                {guestStats?.guestsByCountry.map((_entry, index) => (
                                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                            </Pie>
                            <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
                        </PieChart>
                    </ResponsiveContainer>
                </div>
            </div>
        </div>
    );
};

export default Reports;
