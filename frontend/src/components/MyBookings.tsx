
import { useBookings } from '../hooks/useBookings';
import { useCancelBooking } from '../hooks/useBookingActions';
import { format } from 'date-fns';
import { CalendarClock, CheckCircle, XCircle, Clock } from 'lucide-react';
import { BookingStatus } from '../types';

const StatusBadge = ({ status }: { status: BookingStatus }) => {
    switch (status) {
        case BookingStatus.APPROVED:
            return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Approved</span>;
        case BookingStatus.COMPLETED:
            return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold"><CheckCircle className="w-3.5 h-3.5" /> Completed</span>;
        case BookingStatus.REJECTED:
        case BookingStatus.CANCELLED:
            return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-semibold"><XCircle className="w-3.5 h-3.5" /> {status}</span>;
        default:
            return <span className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 text-orange-700 text-xs font-semibold"><Clock className="w-3.5 h-3.5" /> Pending</span>;
    }
};

export const MyBookings = () => {
    const { data, isLoading, error } = useBookings(1, 50); // Fetching recent 50 for now
    const cancelBooking = useCancelBooking();

    if (isLoading) return <div className="p-8 text-center text-apple-text">Loading your bookings...</div>;
    if (error) return <div className="p-8 text-center text-red-500">Failed to load bookings.</div>;

    const bookings = data?.bookings || [];

    if (bookings.length === 0) {
        return (
            <div className="apple-card p-12 flex flex-col items-center justify-center text-apple-text border-dashed border-2 bg-transparent mt-6">
                <CalendarClock className="w-12 h-12 mb-4 opacity-50" />
                <p>You haven't made any booking requests yet.</p>
            </div>
        );
    }

    return (
        <div className="mt-8 space-y-4">
            <h2 className="text-2xl font-bold tracking-tight mb-6">Your 4gs</h2>

            <div className="bg-[var(--surface)] rounded-2xl shadow-sm border border-[color:var(--border)] overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-apple-gray text-apple-dark font-medium border-b border-[color:var(--border)]">
                            <tr>
                                <th className="px-6 py-4 rounded-tl-2xl">Equipment</th>
                                <th className="px-6 py-4">Date & Time</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Actions</th>
                                <th className="px-6 py-4 rounded-tr-2xl text-right">Details</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-[color:var(--border)]">
                            {bookings.map((booking: any) => (
                                <tr key={booking._id} className="hover:bg-apple-gray/60 transition-colors">
                                    <td className="px-6 py-4 font-medium">
                                        {booking.component_id?.name || 'Unknown Component'}
                                        {booking.unit_number && (
                                            <span className="block text-[11px] text-apple-blue font-bold tracking-tight mt-0.5">
                                                Unit #{booking.unit_number}
                                            </span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-apple-text">
                                        <div className="flex flex-col">
                                            <span>{format(new Date(booking.start), 'MMM d, yyyy')}</span>
                                            <span className="text-xs mt-0.5">
                                                {format(new Date(booking.start), 'h:mm a')} - {format(new Date(booking.end), 'h:mm a')}
                                            </span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <StatusBadge status={booking.status} />
                                    </td>
                                    <td className="px-6 py-4">
                                        {(booking.status === BookingStatus.PENDING || booking.status === BookingStatus.APPROVED) ? (
                                            <button
                                                type="button"
                                                className="apple-btn-secondary py-2 px-4 text-xs"
                                                disabled={cancelBooking.isPending}
                                                onClick={() => {
                                                    if (window.confirm('Cancel this booking?')) {
                                                        cancelBooking.mutate({ bookingId: booking._id });
                                                    }
                                                }}
                                            >
                                                Cancel
                                            </button>
                                        ) : (
                                            <span className="text-apple-text text-xs">--</span>
                                        )}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {booking.rejection_reason && booking.status === BookingStatus.REJECTED ? (
                                            <span className="text-xs text-red-600 block" title={booking.rejection_reason}>
                                                View Reason
                                            </span>
                                        ) : (
                                            <span className="text-apple-text text-xs">--</span>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};
