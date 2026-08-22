import React from 'react';
import { 
  Calendar, 
  DollarSign, 
  UserCheck, 
  CreditCard, 
  Activity, 
  TrendingUp, 
  TrendingDown,
  ArrowUpRight
} from 'lucide-react';
import { QuickStatMetric } from '../../types';

interface QuickStatsSectionProps {
  stats: QuickStatMetric[];
  onStatClick?: (statId: string) => void;
}

export const QuickStatsSection: React.FC<QuickStatsSectionProps> = ({ stats, onStatClick }) => {
  const getIcon = (name: string) => {
    switch (name) {
      case 'Calendar':
        return <Calendar className="w-4 h-4 text-[#8B9D83]" />;
      case 'DollarSign':
        return <DollarSign className="w-4 h-4 text-emerald-600" />;
      case 'UserCheck':
        return <UserCheck className="w-4 h-4 text-blue-600" />;
      case 'CreditCard':
        return <CreditCard className="w-4 h-4 text-amber-600" />;
      case 'Activity':
      default:
        return <Activity className="w-4 h-4 text-[#8B9D83]" />;
    }
  };

  return (
    <section id="crm-quick-stats" className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
      {stats.map((stat) => (
        <div
          key={stat.id}
          id={`kpi-card-${stat.id}`}
          onClick={() => onStatClick && onStatClick(stat.id)}
          className="bg-white rounded-2xl p-4 border border-[#F0EDE8] shadow-xs hover:border-[#8B9D83]/50 transition-all cursor-pointer flex flex-col justify-between group"
        >
          {/* Top Bar: Title & Icon */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold uppercase tracking-wider text-[#6B6E6B] truncate">
              {stat.title}
            </span>
            <div className="w-8 h-8 rounded-lg bg-[#F5F7F4] border border-[#F0EDE8] flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
              {getIcon(stat.iconName)}
            </div>
          </div>

          {/* Metric Value & Trend */}
          <div className="mt-3 flex items-baseline justify-between gap-2">
            <span className="text-2xl font-bold font-mono text-[#1A1C1A] tracking-tight">
              {stat.value}
            </span>
            <div className={`inline-flex items-center gap-0.5 text-[11px] font-semibold px-1.5 py-0.5 rounded ${
              stat.isPositive 
                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                : 'bg-amber-50 text-amber-700 border border-amber-200'
            }`}>
              {stat.isPositive ? (
                <TrendingUp className="w-3 h-3" />
              ) : (
                <TrendingDown className="w-3 h-3" />
              )}
              <span>{stat.change}</span>
            </div>
          </div>

          {/* Bottom Subtext */}
          <div className="mt-2.5 pt-2 border-t border-[#F9F8F6] flex items-center justify-between text-[10px] text-[#8B8D8B]">
            <span className="truncate">{stat.subtext}</span>
            <ArrowUpRight className="w-3 h-3 opacity-0 group-hover:opacity-100 text-[#8B9D83] transition-opacity shrink-0 ml-1" />
          </div>
        </div>
      ))}
    </section>
  );
};
