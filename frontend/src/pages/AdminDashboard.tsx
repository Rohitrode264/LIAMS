
import { useBookings } from '../hooks/useBookings';
import { useLabs } from '../hooks/useInventory';
import { StatCard } from '../components/StatCard';
import { PageHeader } from '../components/PageHeader';
import { format } from 'date-fns';
import { Building2, Cpu, CalendarClock, ShieldCheck, TrendingUp, ArrowRight, ClipboardClock, Clock } from 'lucide-react';
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
            <div className="space-y-4">
                <div className="flex items-center justify-between px-1">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Recent Requests</h2>
                    <button
                        onClick={() => navigate('/admin/bookings')}
                        className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider hover:opacity-80 transition-opacity"
                    >
                        View All
                    </button>
                </div>

                {loadingBookings ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-44 rounded-2xl bg-[var(--surface-2)] animate-pulse" />)}
                    </div>
                ) : bookings.length === 0 ? (
                    <div className="card py-16 flex flex-col items-center text-center">
                        <CalendarClock className="w-8 h-8 text-[var(--muted)] mb-3 opacity-30" />
                        <p className="text-sm text-[var(--muted)]">No recent bookings found.</p>
                    </div>
                ) : (
                    <>
                        {/* Desktop Table View */}
                        <div className="hidden md:block card overflow-hidden">
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
                                        {bookings.slice(0, 8).map((b: Booking) => (
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
                        </div>

                        {/* Mobile Card View */}
                        <div className="grid grid-cols-1 gap-4 md:hidden">
                            {bookings.slice(0, 6).map((b: Booking) => (
                                <div key={b._id} className="card p-5 space-y-4 hover:border-[var(--primary)] transition-all animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-9 h-9 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center shrink-0">
                                                <CalendarClock size={16} className="text-[var(--primary)]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold uppercase tracking-wider text-[var(--primary)] truncate">
                                                    {b.student_id?.name || 'Unknown Student'}
                                                </p>
                                                <h4 className="text-sm font-bold text-[var(--text)] mt-0.5 truncate">
                                                    {b.component_id?.name}
                                                </h4>
                                            </div>
                                        </div>
                                        <StatusDot status={b.status} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-3 pt-1">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase text-[var(--muted)] tracking-widest">Laboratory</p>
                                            <p className="text-[11px] font-bold text-[var(--text)] truncate">
                                                {typeof b.lab_id === 'object' ? (b.lab_id as any).name : '—'}
                                            </p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase text-[var(--muted)] tracking-widest">Equipment ID</p>
                                            <p className="text-[11px] font-bold text-[var(--text)]">Unit #{b.unit_number || '1'}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-2 p-2.5 rounded-xl bg-[var(--surface-2)] border border-[var(--border)]">
                                        <Clock size={12} className="text-[var(--primary)]" />
                                        <span className="text-[11px] font-bold text-[var(--muted)]">
                                            {format(new Date(b.start), 'MMM d')}
                                        </span>
                                        <span className="text-[11px] font-medium text-[var(--muted)] opacity-50">·</span>
                                        <span className="text-[11px] font-bold text-[var(--text)]">
                                            {format(new Date(b.start), 'HH:mm')} – {format(new Date(b.end), 'HH:mm')}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
