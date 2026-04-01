
import { useAuthStore } from '../store/authStore';
import { useNavigate } from 'react-router-dom';
import { useBookings } from '../hooks/useBookings';
import { BookingStatus } from '../types';
import { 
    Building2, CalendarClock, ArrowRight, 
    Clock, 
    FileText, PlusCircle, History
} from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { PageHeader } from '../components/PageHeader';
import { format } from 'date-fns';

const StatusDot = ({ status }: { status: BookingStatus }) => {
    const config = {
        [BookingStatus.APPROVED]: { class: 'badge-green', icon: null },
        [BookingStatus.PENDING]: { class: 'badge-amber', icon: null },
        [BookingStatus.REJECTED]: { class: 'badge-red', icon: null },
        [BookingStatus.COMPLETED]: { class: 'badge-blue', icon: null },
        [BookingStatus.CANCELLED]: { class: 'badge-gray', icon: null },
    };

    const { class: className } = config[status] || config[BookingStatus.PENDING];

    return (
        <span className={`badge ${className}`}>
            {status}
        </span>
    );
};

export const StudentDashboard = () => {
    const { user } = useAuthStore();
    const navigate = useNavigate();
    const { data, isLoading } = useBookings(1, 10);
    
    const bookings = data?.bookings || [];
    const activeCount = bookings.filter(b => b.status === BookingStatus.APPROVED).length;
    const pendingCount = bookings.filter(b => b.status === BookingStatus.PENDING).length;
    const totalCount = data?.pagination?.total || 0;

    const firstName = user?.name?.split(' ')[0] ?? 'there';

    return (
        <div className="page-enter space-y-8">
            <PageHeader 
                title={`Welcome, ${firstName}`}
                subtitle="Manage your lab reservations and project applications."
                action={
                    <button 
                        onClick={() => navigate('/student/labs')}
                        className="btn btn-primary text-sm"
                    >
                        <PlusCircle size={14} /> New Reservation
                    </button>
                }
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    label="Upcoming Sessions" 
                    value={activeCount} 
                    icon={<CalendarClock size={18} />} 
                    iconColor="bg-blue-50 text-blue-600"
                    subtitle="Confirmed bookings"
                />
                <StatCard 
                    label="Pending Requests" 
                    value={pendingCount} 
                    icon={<Clock size={18} />} 
                    iconColor="bg-amber-50 text-amber-600"
                    subtitle="Awaiting approval"
                />
                <StatCard 
                    label="Total Bookings" 
                    value={totalCount} 
                    icon={<Building2 size={18} />} 
                    iconColor="bg-green-50 text-green-600"
                    subtitle="History"
                />
                <StatCard 
                    label="Applications" 
                    value="--" 
                    icon={<FileText size={18} />} 
                    iconColor="bg-purple-50 text-purple-600"
                    subtitle="Active projects"
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { label: 'Explore Laboratories', sub: 'Find equipment and availability', icon: <Building2 size={18} />, path: '/student/labs', color: 'text-blue-600' },
                        { label: 'My Reservations', sub: 'Manage your active bookings', icon: <CalendarClock size={18} />, path: '/student/bookings', color: 'text-green-600' },
                        { label: 'Project Applications', sub: 'Submit/Track funding requests', icon: <FileText size={18} />, path: '/applications/my', color: 'text-purple-600' },
                    ].map(item => (
                        <button
                            key={item.path}
                            onClick={() => navigate(item.path)}
                            className="card group flex items-center gap-4 p-4 text-left hover:border-[var(--primary)] transition-all duration-200 w-full"
                        >
                            <div className={`w-10 h-10 rounded-lg bg-[var(--surface-2)] flex items-center justify-center shrink-0 ${item.color}`}>
                                {item.icon}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-[var(--text)]">{item.label}</p>
                                <p className="text-[11px] text-[var(--muted)] mt-0.5">{item.sub}</p>
                            </div>
                            <ArrowRight size={14} className="text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors" />
                        </button>
                    ))}
                </div>
            </div>

            {/* Recent Activity */}
            <div>
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Recent Activity</h2>
                    <button 
                        onClick={() => navigate('/student/bookings')}
                        className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider hover:opacity-80 transition-opacity"
                    >
                        View All
                    </button>
                </div>
                
                <div className="card overflow-hidden bg-[var(--surface)]">
                    {isLoading ? (
                        <div className="p-6 space-y-3">
                            {[...Array(3)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-[var(--surface-2)] animate-pulse" />)}
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="py-16 flex flex-col items-center text-center">
                            <History className="w-8 h-8 text-[var(--muted)] mb-3 opacity-30" />
                            <p className="text-sm text-[var(--muted)] font-medium">No recent activity</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Equipment / Infrastructure</th>
                                        <th className="hidden sm:table-cell">Lab</th>
                                        <th>Schedule</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.map((booking) => (
                                        <tr key={booking._id}>
                                            <td className="font-medium text-[var(--text)]">
                                                {booking.component_id?.name || 'Lab Infra'}
                                                {booking.unit_number && <span className="ml-1.5 badge badge-blue">#{booking.unit_number}</span>}
                                            </td>
                                            <td className="hidden sm:table-cell text-[var(--muted)]">
                                                {typeof booking.lab_id === 'object' ? (booking.lab_id as any).name : '—'}
                                            </td>
                                            <td className="text-[var(--muted)] whitespace-nowrap">
                                                <div className="flex flex-col">
                                                    <span>{format(new Date(booking.start), 'MMM d, yyyy')}</span>
                                                    <span className="text-[10px] opacity-70">
                                                        {format(new Date(booking.start), 'HH:mm')} – {format(new Date(booking.end), 'HH:mm')}
                                                    </span>
                                                </div>
                                            </td>
                                            <td>
                                                <StatusDot status={booking.status} />
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
