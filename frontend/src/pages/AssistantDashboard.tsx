
import { useState } from 'react';
import { useBookings } from '../hooks/useBookings';
import { useCompleteBooking } from '../hooks/useBookingActions';
import { format } from 'date-fns';
import { BookingStatus } from '../types';
import type { Booking } from '../types';
import { CheckCircle2, ClipboardList, Clock, CalendarCheck, Package, History } from 'lucide-react';
import { StatCard } from '../components/StatCard';
import { PageHeader } from '../components/PageHeader';

export const AssistantDashboard = () => {
    const { data, isLoading } = useBookings(1, 100);
    const completeBooking = useCompleteBooking();
    const [filterStatus, setFilterStatus] = useState<BookingStatus | 'ALL'>(BookingStatus.PENDING);

    const bookings: Booking[] = data?.bookings || [];
    const pendingCount = bookings.filter(b => b.status === BookingStatus.PENDING).length;
    const activeCount = bookings.filter(b => b.status === BookingStatus.APPROVED).length;
    const completedCount = bookings.filter(b => b.status === BookingStatus.COMPLETED).length;

    const filteredBookings = filterStatus === 'ALL'
        ? bookings
        : bookings.filter(b => b.status === filterStatus);

    const handleComplete = (booking: Booking) => {
        if (window.confirm('Confirm equipment was returned in good condition?')) {
            completeBooking.mutate({ bookingId: booking._id });
        }
    };

    const filters: Array<{ label: string; value: BookingStatus | 'ALL'; count?: number }> = [
        { label: 'Pending Handovers', value: BookingStatus.PENDING, count: pendingCount },
        { label: 'Active Sessions', value: BookingStatus.APPROVED, count: activeCount },
        { label: 'Completed', value: BookingStatus.COMPLETED },
        { label: 'All Activity', value: 'ALL' },
    ];

    return (
        <div className="page-enter space-y-8">
            <PageHeader 
                title="Lab Operations" 
                subtitle="Manage equipment handovers and active sessions in your assigned labs." 
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <StatCard 
                    label="Pending Action" 
                    value={pendingCount} 
                    icon={<Clock size={18} />} 
                    iconColor="bg-amber-50 text-amber-600" 
                    subtitle="Handovers needed" 
                />
                <StatCard 
                    label="Active Today" 
                    value={activeCount} 
                    icon={<CalendarCheck size={18} />} 
                    iconColor="bg-green-50 text-green-600" 
                    subtitle="Currently in use" 
                />
                <StatCard 
                    label="Completed" 
                    value={completedCount} 
                    icon={<CheckCircle2 size={18} />} 
                    iconColor="bg-blue-50 text-blue-600" 
                    subtitle="Return verified" 
                />
                <StatCard 
                    label="Resource Load" 
                    value="Normal" 
                    icon={<Package size={18} />} 
                    iconColor="bg-purple-50 text-purple-600" 
                    subtitle="Lab status" 
                />
            </div>

            {/* Tasks Section */}
            <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Operation Tasks</h2>
                    
                    {/* Filter Tabs - Unified Style */}
                    <div className="flex gap-1 p-1 bg-[var(--surface-2)] rounded-lg w-fit">
                        {filters.map(f => (
                            <button
                                key={f.value}
                                onClick={() => setFilterStatus(f.value)}
                                className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase tracking-tight transition-all ${filterStatus === f.value
                                    ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                                    : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
                            >
                                {f.label}
                                {f.count !== undefined && f.count > 0 && (
                                    <span className="ml-1.5 px-1.5 py-0.5 rounded-full bg-[var(--primary)] text-white text-[10px] font-bold">{f.count}</span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {[...Array(3)].map((_, i) => <div key={i} className="h-40 rounded-xl bg-[var(--surface-2)] animate-pulse" />)}
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredBookings.map((booking: Booking) => (
                            <div key={booking._id} className="card p-4 flex flex-col gap-3 group hover:border-[var(--primary)] transition-all">
                                <div className="flex items-start justify-between gap-3">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-bold text-[var(--text)] truncate group-hover:text-[var(--primary)] transition-colors">
                                            {booking.component_id?.name || 'Lab Infra'}
                                        </p>
                                        <p className="text-[11px] font-semibold text-[var(--muted)] mt-0.5 uppercase tracking-wider">
                                            {booking.student_id?.name || 'Unknown Student'}
                                        </p>
                                    </div>
                                    {booking.unit_number && <span className="badge badge-blue transition-all group-hover:scale-105">#{booking.unit_number}</span>}
                                </div>

                                <div className="flex flex-col gap-1.5 px-3 py-2 rounded-lg bg-[var(--surface-2)] text-[11px] font-medium text-[var(--muted)]">
                                    <div className="flex items-center gap-2">
                                        <ClipboardList size={12} className="shrink-0 text-[var(--primary)]" />
                                        <span>{format(new Date(booking.start), 'EEE, MMM d, yyyy')}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Clock size={12} className="shrink-0 text-[var(--primary)]" />
                                        <span>{format(new Date(booking.start), 'HH:mm')} – {format(new Date(booking.end), 'HH:mm')}</span>
                                    </div>
                                </div>

                                {booking.status === BookingStatus.APPROVED ? (
                                    <button
                                        onClick={() => handleComplete(booking)}
                                        disabled={completeBooking.isPending}
                                        className="btn btn-primary w-full text-[12px] py-1.5 mt-auto"
                                    >
                                        <CheckCircle2 size={13} /> Complete Return
                                    </button>
                                ) : (
                                    <div className="mt-auto pt-2 flex items-center justify-between border-t border-[color:var(--border)]">
                                        <span className={`badge ${
                                            booking.status === BookingStatus.PENDING ? 'badge-amber' : 
                                            booking.status === BookingStatus.COMPLETED ? 'badge-blue' : 'badge-gray'
                                        } py-0.5 px-2`}>
                                            {booking.status}
                                        </span>
                                        <History size={14} className="text-[var(--muted)] opacity-30" />
                                    </div>
                                )}
                            </div>
                        ))}

                        {filteredBookings.length === 0 && (
                            <div className="col-span-full card py-16 flex flex-col items-center text-center">
                                <History className="w-8 h-8 text-[var(--muted)] mb-3 opacity-20" />
                                <h3 className="text-sm font-bold text-[var(--text)] mb-1">No tasks in this category</h3>
                                <p className="text-[12px] text-[var(--muted)]">Everything looks clear for now.</p>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};
