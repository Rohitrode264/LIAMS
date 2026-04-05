
import { useBookings } from '../hooks/useBookings';
import { useLabs } from '../hooks/useInventory';
import { StatCard } from '../components/StatCard';
import { PageHeader } from '../components/PageHeader';
import { format } from 'date-fns';
import { Building2, Cpu, CalendarClock, ShieldCheck, TrendingUp, ArrowRight, ClipboardClock } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import type { Booking } from '../types';
import { BookingStatus } from '../types';

const StatusDot = ({ status }: { status: BookingStatus }) => {
    if (status === BookingStatus.APPROVED) return <span className="badge badge-green">{status}</span>;
    if (status === BookingStatus.PENDING) return <span className="badge badge-amber">{status}</span>;
    if (status === BookingStatus.REJECTED) return <span className="badge badge-red">{status}</span>;
    if (status === BookingStatus.COMPLETED) return <span className="badge badge-blue">{status}</span>;
    return <span className="badge badge-gray">{status}</span>;
};

export const AdminDashboard = () => {
    const navigate = useNavigate();
    const { data: bookingsData, isLoading: loadingBookings } = useBookings(1, 20);
    const { data: labsData } = useLabs(1, 100);

    const bookings: Booking[] = bookingsData?.bookings || [];
    const labs = labsData?.labs || [];

    const pending = bookings.filter(b => b.status === BookingStatus.PENDING).length;
    const approved = bookings.filter(b => b.status === BookingStatus.APPROVED).length;
    const completed = bookings.filter(b => b.status === BookingStatus.COMPLETED).length;

    return (
        <div className="page-enter space-y-8">
            <PageHeader
                title="Admin Overview"
                subtitle="Monitor lab operations, bookings, and user activity."
                action={
                    <button onClick={() => navigate('/admin/labs')} className="btn btn-primary text-sm">
                        <Building2 size={14} /> Manage Labs
                    </button>
                }
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Total Labs"
                    value={labs.length}
                    icon={<Building2 size={18} />}
                    iconColor="bg-blue-50 text-blue-600"
                    subtitle="Active facilities"
                />
                <StatCard
                    label="Pending Requests"
                    value={pending}
                    icon={<ClipboardClock size={18} />}
                    iconColor="bg-amber-50 text-amber-600"
                    subtitle="Awaiting approval"
                />
                <StatCard
                    label="Active Bookings"
                    value={approved}
                    icon={<CalendarClock size={18} />}
                    iconColor="bg-green-50 text-green-600"
                    subtitle="Currently in use"
                />
                <StatCard
                    label="Completed"
                    value={completed}
                    icon={<ShieldCheck size={18} />}
                    iconColor="bg-purple-50 text-purple-600"
                    subtitle="All time"
                />
            </div>

            {/* Quick Actions */}
            <div>
                <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)] mb-3">Quick Actions</h2>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    {[
                        { label: 'Manage Laboratories', sub: 'Create, edit, assign in-charge', icon: <Building2 size={18} />, path: '/admin/labs', color: 'text-blue-600' },
                        { label: 'Manage Equipment', sub: 'Add components to labs', icon: <Cpu size={18} />, path: '/admin/components', color: 'text-purple-600' },
                        { label: 'Manage Users', sub: 'Assign roles and lab access', icon: <TrendingUp size={18} />, path: '/admin/users', color: 'text-green-600' },
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

            {/* Recent Bookings */}
            <div>
                <div className="flex items-center justify-between mb-3 px-1">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Recent Requests</h2>
                    <button
                        onClick={() => navigate('/admin/bookings')}
                        className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider hover:opacity-80 transition-opacity"
                    >
                        View All Requests
                    </button>
                </div>
                <div className="card overflow-hidden">
                    {loadingBookings ? (
                        <div className="p-6 space-y-3">
                            {[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-[var(--surface-2)] animate-pulse" />)}
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="py-16 flex flex-col items-center text-center">
                            <CalendarClock className="w-8 h-8 text-[var(--muted)] mb-3 opacity-30" />
                            <p className="text-sm text-[var(--muted)]">No bookings found.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Student</th>
                                        <th>Equipment</th>
                                        <th>Lab</th>
                                        <th>Date</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {bookings.slice(0, 5).map((b: Booking) => (
                                        <tr key={b._id}>
                                            <td className="font-medium text-[var(--text)]">{b.student_id?.name || '—'}</td>
                                            <td className="text-[var(--muted)]">
                                                {b.component_id?.name}
                                                {b.unit_number && <span className="ml-1.5 badge badge-blue">#{b.unit_number}</span>}
                                            </td>
                                            <td className="text-[var(--muted)]">
                                                {typeof b.lab_id === 'object' ? (b.lab_id as any).name : '—'}
                                            </td>
                                            <td className="text-[var(--muted)] whitespace-nowrap">
                                                {format(new Date(b.start), 'MMM d, HH:mm')}
                                            </td>
                                            <td><StatusDot status={b.status} /></td>
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
