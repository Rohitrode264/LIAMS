import { useState } from 'react';
import { useBookings } from '../../hooks/useBookings';
import { useUpdateBookingStatus, useCompleteBooking } from '../../hooks/useBookingActions';
import { useUsersList } from '../../hooks/useUsers';
import { PageHeader } from '../../components/PageHeader';
import { Pagination } from '../../components/Pagination';
import { format } from 'date-fns';
import { BookingStatus, UserRole } from '../../types';
import type { Booking, User } from '../../types';
import { Check, X, CalendarClock } from 'lucide-react';
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
    const { data: assistants = [] } = useUsersList({ role: UserRole.ASSISTANT });
    const [assigned, setAssigned] = useState<Record<string, string>>({});
    const [statusFilter, setStatusFilter] = useState<BookingStatus | 'ALL'>('ALL');

    const { data: bookingsData, isLoading } = useBookings(page, limit, statusFilter);
    const updateStatus = useUpdateBookingStatus();
    const completeBooking = useCompleteBooking();
    const { user } = useAuthStore();
    const isIncharge = user?.roles?.includes(UserRole.LAB_INCHARGE);
    const isAssistant = user?.roles?.includes(UserRole.ASSISTANT);

    const handleFilterChange = (s: BookingStatus | 'ALL') => {
        setStatusFilter(s);
        setPage(1);
    };

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
                            onClick={() => handleFilterChange(s as any)}
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

            {/* Bookings Display */}
            <div className="">
                {/* Desktop Table View */}
                <div className="hidden md:block card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Student</th>
                                    <th>Equipment</th>
                                    <th>Laboratory</th>
                                    <th>Schedule</th>
                                    <th>Status</th>
                                    {(isIncharge || isAssistant) && <th className="text-right">Actions</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading ? (
                                    [...Array(limit)].map((_, i) => (
                                        <tr key={i}>
                                            <td colSpan={6}><div className="h-10 animate-pulse bg-[var(--surface-2)] rounded" /></td>
                                        </tr>
                                    ))
                                ) : bookings.length === 0 ? (
                                    <tr><td colSpan={6} className="py-12 text-center text-[var(--muted)] text-sm">No bookings found.</td></tr>
                                ) : (
                                    bookings.map((b: Booking) => (
                                        <tr key={b._id}>
                                            <td>
                                                <div className="flex flex-col">
                                                    <span className="font-semibold text-[var(--text)]">{b.student_id?.name || 'Unknown'}</span>
                                                    <span className="text-[10px] text-[var(--muted)]">{b.student_id?.email}</span>
                                                </div>
                                            </td>
                                            <td className="font-medium">{b.component_id?.name}</td>
                                            <td>{typeof b.lab_id === 'object' ? (b.lab_id as any).name : '—'}</td>
                                            <td className="text-xs">
                                                {format(new Date(b.start), 'MMM d, HH:mm')} – {format(new Date(b.end), 'HH:mm')}
                                            </td>
                                            <td><StatusDot status={b.status} /></td>
                                            {(isIncharge || isAssistant) && (
                                                <td className="text-right">
                                                    <div className="flex items-center justify-end gap-2">
                                                        {isIncharge && b.status === BookingStatus.PENDING && (
                                                            <>
                                                                <select
                                                                    className="form-input text-[11px] py-1 max-w-[120px]"
                                                                    value={assigned[b._id] || ''}
                                                                    onChange={e => setAssigned(s => ({ ...s, [b._id]: e.target.value }))}
                                                                >
                                                                    <option value="">Personnel…</option>
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

                {/* Mobile Card Grid View */}
                <div className="md:hidden">
                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="card p-5 h-44 animate-pulse bg-[var(--surface-2)]" />
                            ))}
                        </div>
                    ) : bookings.length === 0 ? (
                        <div className="card p-12 text-center text-[var(--muted)] text-sm border-dashed">
                            <CalendarClock size={40} className="mx-auto mb-4 opacity-20" />
                            No bookings matching current filters.
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {bookings.map((b: Booking) => (
                                <div key={b._id} className="card p-5 space-y-4 animate-in fade-in slide-in-from-bottom-2">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center shrink-0">
                                                <CalendarClock size={19} className="text-[var(--primary)]" />
                                            </div>
                                            <div className="min-w-0">
                                                <p className="text-[10px] font-black uppercase text-[var(--muted)] tracking-widest leading-none mb-1">
                                                    {b.student_id?.name || 'Unknown Student'}
                                                </p>
                                                <h4 className="text-[15px] font-black text-[var(--text)] truncate">{b.component_id?.name}</h4>
                                            </div>
                                        </div>
                                        <StatusDot status={b.status} />
                                    </div>

                                    <div className="grid grid-cols-2 gap-4 py-2 border-y border-[var(--border)] border-dashed">
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase text-[var(--muted)] tracking-widest">Laboratory Location</p>
                                            <p className="text-[12px] font-bold text-[var(--text)] truncate">{typeof b.lab_id === 'object' ? (b.lab_id as any).name : '—'}</p>
                                        </div>
                                        <div className="space-y-1">
                                            <p className="text-[9px] font-black uppercase text-[var(--muted)] tracking-widest">Booking Schedule</p>
                                            <p className="text-[12px] font-bold text-[var(--text)]">
                                                {format(new Date(b.start), 'MMM d')} at {format(new Date(b.start), 'HH:mm')}
                                            </p>
                                        </div>
                                    </div>

                                    {(isIncharge || isAssistant) && (
                                        <div className="pt-2">
                                            {isIncharge && b.status === BookingStatus.PENDING && (
                                                <div className="space-y-3">
                                                    <div className="space-y-1.5 group">
                                                        <p className="text-[9px] font-black uppercase text-[var(--muted)] tracking-widest ml-1 group-focus-within:text-[var(--primary)] transition-colors">Assign Service Assistant</p>
                                                        <select
                                                            className="form-input text-xs py-2.5 bg-[var(--surface-2)] border-transparent font-bold focus:bg-white"
                                                            value={assigned[b._id] || ''}
                                                            onChange={e => setAssigned(s => ({ ...s, [b._id]: e.target.value }))}
                                                        >
                                                            <option value="">Select Personnel…</option>
                                                            {assistants.map((aa: User) => (
                                                                <option key={aa._id} value={aa._id}>{aa.name}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="flex gap-2">
                                                        <button onClick={() => handleAction(b, BookingStatus.REJECTED)} className="btn btn-secondary flex-1 py-2.5 text-xs font-black uppercase tracking-widest"><X size={14} /> Reject</button>
                                                        <button onClick={() => handleAction(b, BookingStatus.APPROVED)} className="btn btn-primary flex-1 py-2.5 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20"><Check size={14} /> Approve</button>
                                                    </div>
                                                </div>
                                            )}
                                            {isAssistant && b.status === BookingStatus.APPROVED && (
                                                <button
                                                    onClick={() => handleComplete(b._id)}
                                                    className="btn btn-primary w-full py-3 text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20"
                                                >
                                                    <Check size={14} className="mr-1" /> Mark Equipment as Returned
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
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
