import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../hooks/useCurrency';
import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/api';
import { format, subDays } from 'date-fns';

const DataOverview = () => {
    const { t } = useTranslation();
    const { formatCurrency } = useCurrency();

    // Fetch revenue data for last 7 days
    const endDate = format(new Date(), 'yyyy-MM-dd');
    const startDate = format(subDays(new Date(), 6), 'yyyy-MM-dd');

    const { data: revenueData = [] } = useQuery({
        queryKey: ['data-overview-revenue', startDate, endDate],
        queryFn: () => dashboardService.getRevenueChart(startDate, endDate)
    });

    const { data: stats } = useQuery({
        queryKey: ['data-overview-stats'],
        queryFn: dashboardService.getStats
    });

    // Transform data for chart
    const chartData = revenueData.map((item: any) => ({
        name: format(new Date(item.date), 'dd MMM'),
        amount: item.amount
    }));

    const totalIncome = stats?.totalRevenue || 0;
    const totalExpenses = 0; // Could be calculated from other data

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 flex flex-col h-full"
        >
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-lg text-slate-800">{t('dashboard.dataOverview.title')}</h3>
                <span className="text-slate-400">...</span>
            </div>

            <p className="text-slate-400 text-sm mb-6">{t('dashboard.dataOverview.subtitle')}</p>

            <div className="grid grid-cols-2 gap-4 mb-8">
                <div className="bg-primary-600 rounded-2xl p-4 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-2xl font-bold mb-1">{formatCurrency(totalIncome)}</div>
                        <div className="text-sm opacity-80 flex items-center gap-1">
                            <div className="bg-white/20 p-1 rounded-full"><FaArrowDown size={10} /></div>
                            {t('dashboard.dataOverview.income')}
                        </div>
                    </div>
                </div>
                <div className="bg-purple-600 rounded-2xl p-4 text-white relative overflow-hidden">
                    <div className="relative z-10">
                        <div className="text-2xl font-bold mb-1">{formatCurrency(totalExpenses)}</div>
                        <div className="text-sm opacity-80 flex items-center gap-1">
                            <div className="bg-white/20 p-1 rounded-full"><FaArrowUp size={10} /></div>
                            {t('dashboard.dataOverview.expenses')}
                        </div>
                    </div>
                </div>
            </div>

            <div className="flex justify-between items-center mb-4">
                <h4 className="font-semibold text-slate-700">{t('dashboard.dataOverview.activity')}</h4>
                <select className="border-none bg-transparent text-sm text-slate-500 focus:ring-0">
                    <option>{t('dashboard.dataOverview.monthly')}</option>
                    <option>{t('dashboard.dataOverview.weekly')}</option>
                </select>
            </div>

            <div className="flex-1 min-h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                        <XAxis
                            dataKey="name"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 10 }}
                            dy={10}
                            interval={1}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 10 }}
                            tickFormatter={(value) => formatCurrency(value)}
                        />
                        <Tooltip
                            cursor={{ fill: 'transparent' }}
                            contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                            formatter={(value: any) => formatCurrency(Number(value) || 0)}
                        />
                        <Bar dataKey="amount" fill="#6366f1" radius={[20, 20, 20, 20]} barSize={8} />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default DataOverview;
