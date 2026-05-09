import { IconType } from 'react-icons';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';

interface StatsCardProps {
    title: string;
    value: string | number;
    icon: IconType;
    trend?: {
        value: number;
        isPositive: boolean;
    };
    color: string;
    loading?: boolean;
}

const StatsCard = ({ title, value, icon: Icon, trend, color, loading }: StatsCardProps) => {
    const { t } = useTranslation();

    if (loading) {
        return (
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 animate-pulse h-full">
                <div className="flex justify-between items-start mb-4">
                    <div className="h-10 w-10 bg-slate-100 rounded-lg"></div>
                </div>
                <div className="space-y-3">
                    <div className="h-4 bg-slate-100 rounded w-24"></div>
                    <div className="h-8 bg-slate-100 rounded w-32"></div>
                </div>
            </div>
        );
    }

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-6 rounded-3xl shadow-lg relative overflow-hidden bg-gradient-to-br ${color} text-white h-full flex flex-col justify-between`}
        >
            <div className="absolute top-0 right-0 p-4 opacity-10">
                <Icon size={100} />
            </div>

            <div className="relative z-10">
                <div className="mb-4 bg-white/20 w-12 h-12 rounded-xl flex items-center justify-center backdrop-blur-sm">
                    <Icon size={24} className="text-white" />
                </div>

                <h3 className="text-white/80 text-sm font-medium mb-1">{title}</h3>
                <div className="text-3xl font-bold text-white mb-4">{value}</div>

                {trend && (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-white/70">
                            {trend.isPositive ? t('dashboard.stats.highest', 'Highest in 30 Days') : t('dashboard.stats.lowest', 'Lowest in 30 Days')}
                        </span>
                        <div className={`px-2 py-0.5 rounded-full text-xs font-bold bg-white text-${color.split('-')[1]}-600 flex items-center gap-1`}>
                            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
                        </div>
                    </div>
                )}
            </div>
        </motion.div>
    );
};

export default StatsCard;
