
import { useState } from 'react';
import { useBookings } from '../../hooks/useBookings';
import { useCancelBooking } from '../../hooks/useBookingActions';
import { format } from 'date-fns';
import { CalendarClock, XCircle, CheckCircle, Clock, X } from 'lucide-react';
import { BookingStatus } from '../../types';
import type { Booking } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';

const statusConfig: Record<BookingStatus, { badge: string; label: string }> = {
    [BookingStatus.APPROVED]: { badge: 'badge-green', label: 'Approved' },
    [BookingStatus.PENDING]: { badge: 'badge-amber', label: 'Pending' },
    [BookingStatus.REJECTED]: { badge: 'badge-red', label: 'Rejected' },
    [BookingStatus.COMPLETED]: { badge: 'badge-blue', label: 'Completed' },
    [BookingStatus.CANCELLED]: { badge: 'badge-gray', label: 'Cancelled' },
};

export const MyBookingsPage = () => {
    const [page, setPage] = useState(1);
    const limit = 10;
    const { data, isLoading, error } = useBookings(page, limit);
    const cancelBooking = useCancelBooking();
    const [activeFilter, setActiveFilter] = useState<BookingStatus | 'ALL'>('ALL');

    const totalPages = data?.pagination?.pages || 0;
    const allBookings: Booking[] = data?.bookings || [];

    // Filtering on client side for the current page only if necessary, 
    // but ideally the API should handle filtering. For now, we'll filter client-side.
    const filteredBookings = activeFilter === 'ALL'
        ? allBookings
        : allBookings.filter(b => b.status === activeFilter);

    const filters: Array<{ label: string; value: BookingStatus | 'ALL' }> = [
        { label: 'All', value: 'ALL' },
        { label: 'Pending', value: BookingStatus.PENDING },
        { label: 'Approved', value: BookingStatus.APPROVED },
        { label: 'Completed', value: BookingStatus.COMPLETED },
        { label: 'Rejected', value: BookingStatus.REJECTED },
    ];

    return (
        <div className="page-enter space-y-6">
            <PageHeader title="My Reservations" subtitle="Track your equipment booking history and status." />

            {/* Filter Tabs */}
            <div className="flex gap-1 p-1 bg-[var(--surface-2)] rounded-lg w-fit overflow-x-auto">
                {filters.map(f => (
                    <button
                        key={f.value}
                        onClick={() => { setActiveFilter(f.value); setPage(1); }}
                        className={`px-3 py-1.5 rounded-md text-[12px] font-semibold whitespace-nowrap transition-all ${activeFilter === f.value
                            ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm'
                            : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
                    >
                        {f.label}
                    </button>
                ))}
            </div>

            {/* Bookings */}
            {isLoading ? (
                <div className="space-y-3">
                    {[...Array(4)].map((_, i) => <div key={i} className="h-20 rounded-xl animate-pulse bg-[var(--surface-2)]" />)}
                </div>
            ) : error ? (
                <div className="card p-8 text-center">
                    <XCircle className="w-8 h-8 text-red-400 mx-auto mb-2" />
                    <p className="text-sm text-[var(--muted)]">Failed to load bookings.</p>
                </div>
            ) : (
                <>
                    <div className="space-y-3">
                        {filteredBookings.length === 0 ? (
                            <div className="card py-20 flex flex-col items-center text-center border-dashed">
                                <CalendarClock className="w-8 h-8 text-[var(--muted)] mb-3 opacity-30" />
                                <h3 className="text-base font-semibold text-[var(--text)] mb-1">No Bookings</h3>
                                <p className="text-sm text-[var(--muted)]">
                                    {activeFilter === 'ALL' ? "You haven't made any reservations yet." : `No ${activeFilter.toLowerCase()} bookings here.`}
                                </p>
                            </div>
                        ) : (
                            filteredBookings.map((booking: Booking) => {
                                const cfg = statusConfig[booking.status];
                                const canCancel = booking.status === BookingStatus.PENDING || booking.status === BookingStatus.APPROVED;
                                return (
                                    <div key={booking._id} className="card p-4 flex items-center gap-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                        <div className="w-10 h-10 rounded-xl bg-[var(--surface-2)] flex items-center justify-center shrink-0 border border-[var(--border)] overflow-hidden transition-all group-hover:border-[var(--primary)]">
                                            {booking.status === BookingStatus.APPROVED && <CheckCircle size={18} className="text-green-500" />}
                                            {booking.status === BookingStatus.PENDING && <Clock size={18} className="text-amber-500" />}
                                            {booking.status === BookingStatus.COMPLETED && <CheckCircle size={18} className="text-blue-500" />}
                                            {booking.status === BookingStatus.REJECTED && <XCircle size={18} className="text-red-400" />}
                                            {booking.status === BookingStatus.CANCELLED && <X size={18} className="text-[var(--muted)]" />}
                                        </div>

                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-center gap-2 flex-wrap">
                                                <p className="text-sm font-semibold text-[var(--text)]">{booking.component_id?.name || 'Unknown Equipment'}</p>
                                                {booking.unit_number && <span className="badge badge-blue transition-all"># {booking.unit_number}</span>}
                                                <span className={`badge ${cfg.badge}`}>{cfg.label}</span>
                                            </div>
                                            <div className="flex items-center gap-3 mt-1 text-[11px] text-[var(--muted)]">
                                                <span className="flex items-center gap-1">
                                                    <CalendarClock size={10} />
                                                    {format(new Date(booking.start), 'MMM d, yyyy')}
                                                </span>
                                                <span className="opacity-50">·</span>
                                                <span>{format(new Date(booking.start), 'HH:mm')} – {format(new Date(booking.end), 'HH:mm')}</span>
                                                {booking.assigned_to && (
                                                    <>
                                                        <span className="opacity-50">·</span>
                                                        <span className="font-medium text-[var(--text)] opacity-80">
                                                            {(booking.assigned_to as any).name}
                                                        </span>
                                                    </>
                                                )}
                                            </div>
                                            {booking.rejection_reason && (
                                                <p className="text-[11px] text-red-500 mt-1 font-medium bg-red-50 w-fit px-2 py-0.5 rounded">
                                                    Reason: {booking.rejection_reason}
                                                </p>
                                            )}
                                        </div>

                                        {canCancel && (
                                            <button
                                                onClick={() => window.confirm('Cancel this booking?') && cancelBooking.mutate({ bookingId: booking._id })}
                                                disabled={cancelBooking.isPending}
                                                className="btn-secondary btn text-[12px] py-1.5 px-3 shrink-0"
                                            >
                                                Cancel
                                            </button>
                                        )}
                                    </div>
                                );
                            })
                        )}
                    </div>

                    {totalPages > 1 && (
                        <Pagination
                            currentPage={page}
                            totalPages={totalPages}
                            onPageChange={setPage}
                            isLoading={isLoading}
                        />
                    )}
                </>
            )}
        </div>
    );
};
