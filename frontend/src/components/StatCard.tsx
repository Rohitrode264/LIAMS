
interface StatCardProps {
    label: string;
    value: string | number;
    icon: React.ReactNode;
    iconColor?: string;
    delta?: string;
    deltaPositive?: boolean;
    subtitle?: string;
}

export const StatCard = ({ label, value, icon, iconColor = 'bg-blue-50 text-blue-600', delta, deltaPositive, subtitle }: StatCardProps) => (
    <div className="stat-card">
        <div className="flex items-center justify-between">
            <span className="text-[12px] font-semibold uppercase tracking-widest text-[var(--muted)]">{label}</span>
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${iconColor}`}>
                {icon}
            </div>
        </div>
        <div>
            <p className="text-3xl font-bold text-[var(--text)] leading-none">{value}</p>
            {subtitle && <p className="text-xs text-[var(--muted)] mt-1 font-medium">{subtitle}</p>}
        </div>
        {delta && (
            <div className={`flex items-center gap-1 text-[11px] font-semibold ${deltaPositive ? 'text-green-600' : 'text-red-500'}`}>
                <span>{deltaPositive ? '↑' : '↓'}</span>
                <span>{delta}</span>
            </div>
        )}
    </div>
);
