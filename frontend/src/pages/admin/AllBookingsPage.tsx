import { useState } from 'react';
import { useBookings } from '../../hooks/useBookings';
import { useUpdateBookingStatus, useCompleteBooking } from '../../hooks/useBookingActions';
import { useUsersList } from '../../hooks/useUsers';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { format } from 'date-fns';
import { BookingStatus, UserRole } from '../../types';
import type { Booking, User } from '../../types';
import { Check, X } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';

const StatusDot = ({ status }: { status: BookingStatus }) => {
    const config = {
        [BookingStatus.APPROVED]: 'badge-green',
        [BookingStatus.PENDING]: 'badge-amber',
        [BookingStatus.REJECTED]: 'badge-red',
        [BookingStatus.COMPLETED]: 'badge-blue',
        [BookingStatus.CANCELLED]: 'badge-gray',
    };
    return <span className={`badge ${config[status] || 'badge-gray'}`}>{status}</span>;
};

export const AllBookingsPage = () => {
    const [page, setPage] = useState(1);
    const limit = 15;
    const { data: bookingsData, isLoading } = useBookings(page, limit);
    const updateStatus = useUpdateBookingStatus();
    const completeBooking = useCompleteBooking();
    const { user } = useAuthStore();
    const isIncharge = user?.roles?.includes(UserRole.LAB_INCHARGE);
    const isAssistant = user?.roles?.includes(UserRole.ASSISTANT);

    const { data: assistants = [] } = useUsersList({ role: UserRole.ASSISTANT });
    const [assigned, setAssigned] = useState<Record<string, string>>({});
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');

    const bookings: Booking[] = bookingsData?.bookings || [];
    const totalPages = bookingsData?.pagination?.pages || 0;

    const handleAction = (booking: Booking, newStatus: BookingStatus) => {
        if (newStatus === BookingStatus.REJECTED) {
            const reason = prompt('Reason for rejection:');
            if (reason === null) return;
            updateStatus.mutate({ bookingId: booking._id, status: newStatus, rejection_reason: reason });
        } else if (newStatus === BookingStatus.APPROVED) {
            const assistantId = assigned[booking._id];
            if (!assistantId && isIncharge) {
                toast.error('Select an assistant first.');
                return;
            }
            updateStatus.mutate({ bookingId: booking._id, status: newStatus, assigned_to: assistantId });
        }
    };

    const handleComplete = (bookingId: string) => {
        if (window.confirm('Return equipment in good condition?')) {
            completeBooking.mutate({ bookingId });
        }
    };

    return (
        <div className="page-enter space-y-6">
            <PageHeader
                title="All Resource Requests"
                subtitle="A centralized view of all laboratory infrastructure and equipment reservations."
            />

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-1 p-1 bg-[var(--surface-2)] rounded-lg overflow-x-auto w-full sm:w-fit">
                    {['ALL', ...Object.values(BookingStatus)].map(s => (
                        <button
                            key={s}
                            onClick={() => setStatusFilter(s as any)}
                            className={`px-3 py-1.5 rounded-md text-[11px] font-bold uppercase transition-all whitespace-nowrap ${statusFilter === s ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'
                                }`}
                        >
                            {s}
                        </button>
                    ))}
                </div>
                <div className="text-[11px] font-medium text-[var(--muted)] bg-[var(--surface-2)] px-3 py-1.5 rounded-full">
                    Total Records: {bookingsData?.pagination?.total || 0}
                </div>
            </div>

            <div className="card overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>Student</th>
                                <th>Equipment</th>
                                <th>Lab</th>
                                <th>Schedule</th>
                                <th>Status</th>
                                {(isIncharge || isAssistant) && <th>Actions</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                [...Array(5)].map((_, i) => (
                                    <tr key={i} className="animate-pulse">
                                        <td colSpan={6}><div className="h-10 bg-[var(--surface-2)] rounded mx-4 my-2" /></td>
                                    </tr>
                                ))
                            ) : bookings.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center text-[var(--muted)]">No bookings found.</td>
                                </tr>
                            ) : (
                                bookings.map((b: Booking) => (
                                    <tr key={b._id}>
                                        <td className="font-semibold text-sm">{b.student_id?.name || '—'}</td>
                                        <td>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-medium">{b.component_id?.name || 'Lab Infra'}</span>
                                                {b.unit_number && <span className="text-[10px] text-blue-500 font-bold uppercase">Unit #{b.unit_number}</span>}
                                            </div>
                                        </td>
                                        <td className="text-[var(--muted)] text-sm">
                                            {typeof b.lab_id === 'object' ? (b.lab_id as any).name : '—'}
                                        </td>
                                        <td className="text-[var(--muted)] text-xs">
                                            <div className="font-medium">{format(new Date(b.start), 'MMM d, yyyy')}</div>
                                            <div>{format(new Date(b.start), 'HH:mm')} – {format(new Date(b.end), 'HH:mm')}</div>
                                        </td>
                                        <td><StatusDot status={b.status} /></td>
                                        {(isIncharge || isAssistant) && (
                                            <td>
                                                <div className="flex items-center gap-2">
                                                    {isIncharge && b.status === BookingStatus.PENDING && (
                                                        <>
                                                            <select
                                                                className="form-input text-[11px] py-1 border-gray-200"
                                                                value={assigned[b._id] || ''}
                                                                onChange={e => setAssigned(s => ({ ...s, [b._id]: e.target.value }))}
                                                            >
                                                                <option value="">Staff…</option>
                                                                {assistants.map((aa: User) => (
                                                                    <option key={aa._id} value={aa._id}>{aa.name}</option>
                                                                ))}
                                                            </select>
                                                            <button onClick={() => handleAction(b, BookingStatus.APPROVED)} className="p-1.5 rounded-lg bg-green-50 text-green-600 hover:bg-green-100"><Check size={14} /></button>
                                                            <button onClick={() => handleAction(b, BookingStatus.REJECTED)} className="p-1.5 rounded-lg bg-red-50 text-red-600 hover:bg-red-100"><X size={14} /></button>
                                                        </>
                                                    )}
                                                    {isAssistant && b.status === BookingStatus.APPROVED && (
                                                        <button
                                                            onClick={() => handleComplete(b._id)}
                                                            className="btn btn-primary text-[11px] py-1 px-3"
                                                        >
                                                            Complete Return
                                                        </button>
                                                    )}
                                                </div>
                                            </td>
                                        )}
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            <Pagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={setPage}
                isLoading={isLoading}
            />
        </div>
    );
};
