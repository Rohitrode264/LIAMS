
import { useState } from 'react';
import { useBookings } from '../hooks/useBookings';
import { useUpdateBookingStatus } from '../hooks/useBookingActions';
import { useUsersList } from '../hooks/useUsers';
import { format } from 'date-fns';
import { BookingStatus, UserRole } from '../types';
import type { Booking, User } from '../types';
import { Check, X, Clock, CalendarClock, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { StatCard } from '../components/StatCard';
import { PageHeader } from '../components/PageHeader';

import { useNavigate } from 'react-router-dom';
// ... other imports ...

export const InchargeDashboard = () => {
    const navigate = useNavigate();
    const { data, isLoading } = useBookings(1, 6);
    const updateStatus = useUpdateBookingStatus();
    const [filterStatus, setFilterStatus] = useState<BookingStatus | 'ALL'>('ALL');
    const [assigned, setAssigned] = useState<Record<string, string>>({});

    const bookings: Booking[] = data?.bookings || [];
    const { data: assistants = [] } = useUsersList({ role: UserRole.ASSISTANT });

    const pendingCount = bookings.filter(b => b.status === BookingStatus.PENDING).length;
    const activeTodayCount = bookings.filter(b =>
        b.status === BookingStatus.APPROVED &&
        format(new Date(b.start), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
    ).length;
    const completedCount = bookings.filter(b => b.status === BookingStatus.COMPLETED).length;

    const filteredBookings = filterStatus === 'ALL'
        ? bookings
        : bookings.filter(b => b.status === filterStatus);

    const handleAction = (booking: Booking, newStatus: BookingStatus) => {
        let reason: string | null = null;
        if (newStatus === BookingStatus.REJECTED) {
            reason = prompt('Reason for rejection:');
            if (reason === null) return;
        }
        if (newStatus === BookingStatus.APPROVED) {
            const assistantId = assigned[booking._id];
            if (!assistantId) { toast.error('Select an assistant first.'); return; }
            updateStatus.mutate({ bookingId: booking._id, status: newStatus, assigned_to: assistantId });
            return;
        }
        updateStatus.mutate({ bookingId: booking._id, status: newStatus, rejection_reason: reason ?? undefined });
    };

    const filters: Array<BookingStatus | 'ALL'> = ['ALL', BookingStatus.PENDING, BookingStatus.APPROVED, BookingStatus.REJECTED, BookingStatus.COMPLETED];

    return (
        <div className="page-enter space-y-8">
            <PageHeader
                title="Booking Management"
                subtitle="Review, approve, or reject lab infrastructure reservation requests."
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard
                    label="Pending Review"
                    value={pendingCount}
                    icon={<Clock size={18} />}
                    iconColor="bg-amber-50 text-amber-600"
                    subtitle="Awaiting action"
                />
                <StatCard
                    label="Today's Sessions"
                    value={activeTodayCount}
                    icon={<CalendarClock size={18} />}
                    iconColor="bg-green-50 text-green-600"
                    subtitle="Active reservations"
                />
                <StatCard
                    label="Completed"
                    value={completedCount}
                    icon={<CheckCircle size={18} />}
                    iconColor="bg-blue-50 text-blue-600"
                    subtitle="Closed historical"
                />
                <StatCard
                    label="Verification"
                    value="Active"
                    icon={<Check size={18} />}
                    iconColor="bg-purple-50 text-purple-600"
                    subtitle="System status"
                />
            </div>

            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Recent Requests</h2>
                        <button
                            onClick={() => navigate('/admin/bookings')}
                            className="text-[11px] font-bold text-[var(--primary)] uppercase tracking-wider hover:opacity-80 transition-opacity"
                        >
                            View All
                        </button>
                    </div>

                    {/* Unified Filter Tabs */}
                    <div className="flex gap-1 p-1 bg-[var(--surface-2)] rounded-lg w-fit">
                        {filters.map(s => (
                            <button
                                key={s}
                                onClick={() => setFilterStatus(s)}
                                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-tight transition-all ${filterStatus === s
                                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                                    : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
                            >
                                {s}
                                {s === BookingStatus.PENDING && pendingCount > 0 && (
                                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-amber-500 text-white text-[10px] font-bold">{pendingCount}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-48 rounded-xl bg-[var(--surface-2)] animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                        {filteredBookings.map((booking: Booking) => (
                            <div key={booking._id} className="card p-5 flex flex-col gap-4 group hover:border-[var(--primary)] transition-all">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[var(--text)] truncate group-hover:text-[var(--primary)] transition-colors">
                                            {booking.component_id?.name || 'Lab Infra'}
                                        </p>
                                        <p className="text-[11px] font-semibold text-[var(--primary)] mt-0.5 uppercase tracking-wider">
                                            {booking.student_id?.name || 'Unknown Student'}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-end gap-1 shrink-0">
                                        {booking.unit_number && <span className="badge badge-blue">#{booking.unit_number}</span>}
                                        <span className={`badge ${booking.status === BookingStatus.PENDING ? 'badge-amber' :
                                            booking.status === BookingStatus.APPROVED ? 'badge-green' :
                                                booking.status === BookingStatus.REJECTED ? 'badge-red' : 'badge-blue'
                                            }`}>{booking.status}</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-2 px-3 py-2.5 rounded-lg bg-[var(--surface-2)] text-[11px] font-medium text-[var(--muted)]">
                                    <CalendarClock size={13} className="shrink-0 text-[var(--primary)]" />
                                    <span>{format(new Date(booking.start), 'MMM d, yyyy')}</span>
                                    <span className="opacity-40">·</span>
                                    <span>{format(new Date(booking.start), 'HH:mm')} – {format(new Date(booking.end), 'HH:mm')}</span>
                                </div>

                                {booking.purpose && (
                                    <p className="text-[11px] text-[var(--muted)] italic border-l-2 border-[var(--border)] pl-3 line-clamp-2 leading-relaxed">
                                        "{booking.purpose}"
                                    </p>
                                )}

                                {booking.status === BookingStatus.PENDING && (
                                    <div className="space-y-3 mt-auto pt-3 border-t border-[color:var(--border)]">
                                        <div>
                                            <label className="block text-[10px] font-bold uppercase tracking-wider text-[var(--muted)] mb-1.5 ml-1">Assign Assistant</label>
                                            <select
                                                className="form-input text-[12px] py-1.5"
                                                value={assigned[booking._id] || ''}
                                                onChange={e => setAssigned(s => ({ ...s, [booking._id]: e.target.value }))}
                                            >
                                                <option value="">Select assistant…</option>
                                                {assistants.filter((a: User) => {
                                                    const bookingLabId = typeof booking.lab_id === 'string' ? booking.lab_id : booking.lab_id?._id;
                                                    return !a.labs_assigned || a.labs_assigned.length === 0 || a.labs_assigned.includes(bookingLabId);
                                                }).map((a: User) => (
                                                    <option key={a._id} value={a._id}>{a.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="grid grid-cols-2 gap-2">
                                            <button
                                                onClick={() => handleAction(booking, BookingStatus.REJECTED)}
                                                disabled={updateStatus.isPending}
                                                className="btn-danger btn py-1.5 text-[12px]"
                                            >
                                                <X size={13} /> Reject
                                            </button>
                                            <button
                                                onClick={() => handleAction(booking, BookingStatus.APPROVED)}
                                                disabled={updateStatus.isPending}
                                                className="btn-primary btn py-1.5 text-[12px]"
                                            >
                                                <Check size={13} /> Approve
                                            </button>
                                        </div>
                                    </div>
                                )}

                                {booking.status !== BookingStatus.PENDING && (
                                    <div className="mt-auto pt-3 border-t border-[color:var(--border)] flex flex-col gap-1">
                                        {booking.rejection_reason && (
                                            <p className="text-[11px] text-red-500 font-semibold italic">Reason: {booking.rejection_reason}</p>
                                        )}
                                        {booking.status === BookingStatus.APPROVED && booking.assigned_to && (
                                            <p className="text-[11px] text-[var(--muted)] font-medium">
                                                Assigned: <span className="font-bold text-[var(--text)]">{(booking.assigned_to as any).name}</span>
                                            </p>
                                        )}
                                        {![BookingStatus.REJECTED, BookingStatus.APPROVED].includes(booking.status) && (
                                            <p className="text-[11px] text-[var(--muted)] italic opacity-60">Locked record.</p>
                                        )}
                                    </div>
                                )}
                            </div>
                        ))}

                        {filteredBookings.length === 0 && (
                            <div className="col-span-full card py-16 flex flex-col items-center text-center">
                                <CalendarClock className="w-8 h-8 text-[var(--muted)] mb-3 opacity-20" />
                                <h3 className="text-sm font-bold text-[var(--text)] mb-1">Queue Empty</h3>
                                <p className="text-[12px] text-[var(--muted)]">No bookings found for this filter.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

