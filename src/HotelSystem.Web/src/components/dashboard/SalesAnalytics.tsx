import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../hooks/useCurrency';
import { useQuery } from '@tanstack/react-query';
import { dashboardService, reportService } from '../../services/api';

const SalesAnalytics = () => {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();

    const { data: stats } = useQuery({
        queryKey: ['sales-analytics-stats'],
        queryFn: dashboardService.getStats
    });

    const { data: revenueReport } = useQuery({
        queryKey: ['sales-analytics-revenue-report'],
        queryFn: () => reportService.getRevenue()
    });

    const totalIncome = stats?.totalRevenue || 0;

    // Transform revenue by room type
    const roomTypeData = revenueReport?.revenueByRoomType?.map((item, index) => ({
        name: item.roomTypeName,
        value: item.revenue,
        color: ['#10B981', '#3B82F6', '#F59E0B', '#6366F1', '#EC4899'][index % 5]
    })) || [];

    const hasData = roomTypeData.length > 0 && totalIncome > 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800">{t('dashboard.salesAnalytics.title')}</h3>
            </div>

            <div className="flex items-center">
                <div className="w-[180px] h-[180px] relative">
                    <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                            <Pie
                                data={hasData ? roomTypeData : [{ name: 'No Data', value: 1, color: '#E5E7EB' }]}
                                cx="50%"
                                cy="50%"
                                innerRadius={60}
                                outerRadius={80}
                                startAngle={90}
                                endAngle={-270}
                                dataKey="value"
                                stroke="none"
                            >
                                {hasData ? roomTypeData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                )) : <Cell fill="#E5E7EB" />}
                            </Pie>
                            <Tooltip formatter={(value: any) => formatCurrency(Number(value) || 0)} />
                        </PieChart>
                    </ResponsiveContainer>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                        <span className="text-2xl font-bold text-slate-800">100%</span>
                    </div>
                </div>

                <div className="ml-6 space-y-4">
                    <div>
                        <p className="text-slate-400 text-sm">{t('dashboard.salesAnalytics.totalIncome')}</p>
                        <div className="flex items-center gap-2">
                            <span className="text-xl font-bold text-slate-800">{formatCurrency(totalIncome)}</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="mt-8 grid grid-cols-2 gap-4">
                {roomTypeData.map((item) => (
                    <div key={item.name} className="flex items-center gap-3">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <div>
                            <p className="text-xs text-slate-400">{item.name}</p>
                            <p className="font-bold text-slate-700">{formatCurrency(item.value)}</p>
                        </div>
                    </div>
                ))}
                {!hasData && (
                    <p className="text-slate-400 text-sm col-span-2">No data available</p>
                )}
            </div>
        </motion.div>
    );
};

export default SalesAnalytics;
