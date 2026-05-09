import { XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from 'recharts';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import { useCurrency } from '../../hooks/useCurrency';
import { format } from 'date-fns';

interface RevenueChartProps {
    data: any[];
}

const RevenueChart = ({ data }: RevenueChartProps) => {
    const { t } = useTranslation();
    const { formatCurrency, currencySymbol } = useCurrency();

    // Transform data for chart
    const chartData = data && data.length > 0 ? data.map((item: any) => ({
        date: format(new Date(item.date), 'dd MMM'),
        amount: item.amount,
        expenses: 0 // Placeholder as we don't have expenses data yet
    })) : [];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white p-6 rounded-3xl shadow-sm border border-slate-100 h-full flex flex-col"
        >
            <div className="flex flex-wrap justify-between items-center mb-8 gap-4">
                <h3 className="text-slate-800 font-bold text-lg">{t('dashboard.revenueChart.title')}</h3>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-primary-600"></span>
                        <span className="text-sm text-slate-600">{t('dashboard.revenueChart.income')}</span>
                    </div>
                    {/* Expenses hidden for now as we don't have data */}
                    {/* <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-orange-400"></span>
                        <span className="text-sm text-slate-600">{t('dashboard.revenueChart.expenses')}</span>
                    </div> */}
                    <select className="bg-slate-50 border-none text-sm rounded-lg py-1 px-3 text-slate-600 focus:ring-0 cursor-pointer">
                        <option>{t('dashboard.revenueChart.last7Days')}</option>
                        <option>{t('dashboard.revenueChart.last30Days')}</option>
                    </select>
                </div>
            </div>

            <div className="flex-1 w-full min-h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart
                        data={chartData}
                        margin={{ top: 10, right: 30, left: 0, bottom: 0 }}
                    >
                        <defs>
                            <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                                <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.1} />
                                <stop offset="95%" stopColor="#4F46E5" stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                        <XAxis
                            dataKey="date"
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 12 }}
                            dy={10}
                        />
                        <YAxis
                            axisLine={false}
                            tickLine={false}
                            tick={{ fill: '#94A3B8', fontSize: 12 }}
                            tickFormatter={(value) => `${currencySymbol}${(value / 1000).toFixed(0)}k`}
                        />
                        <Tooltip
                            contentStyle={{
                                backgroundColor: '#fff',
                                border: 'none',
                                borderRadius: '12px',
                                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)'
                            }}
                            formatter={(value: any) => [formatCurrency(Number(value) || 0), t('dashboard.revenueChart.income')]}
                        />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#4F46E5"
                            strokeWidth={3}
                            fill="url(#colorIncome)"
                            name={t('dashboard.revenueChart.income')}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </motion.div>
    );
};

export default RevenueChart;
