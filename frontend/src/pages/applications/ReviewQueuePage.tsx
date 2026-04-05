import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { Inbox, ChevronRight, Loader2, IndianRupee, FileText } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getProfessorQueue, getHODQueue, getAccountsQueue } from '../../api/applicationApi';
import { UserRole, ApplicationStatus } from '../../types';
import type { Application } from '../../types';
import { PageHeader } from '../../components/PageHeader';

const statusLabel: Record<ApplicationStatus, string> = {
    [ApplicationStatus.PENDING_PROFESSOR]: 'Professor Review',
    [ApplicationStatus.PENDING_HOD]: 'HOD Review',
    [ApplicationStatus.PENDING_ACCOUNTS]: 'Accounts Review',
    [ApplicationStatus.APPROVED]: 'Approved',
    [ApplicationStatus.REJECTED]: 'Rejected',
};

export const ReviewQueuePage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const roles = user?.roles ?? [];

    const isProfessor = roles.includes(UserRole.PROFESSOR);
    const isHOD = roles.includes(UserRole.HOD);
    const isAccountant = roles.includes(UserRole.ACCOUNTANT);

    const queueFn = isProfessor ? getProfessorQueue
        : isHOD ? getHODQueue
            : getAccountsQueue;

    const stageLabel = isProfessor ? 'Professor Review'
        : isHOD ? 'HOD Review'
            : 'Accounts Review';

    const { data: applications = [], isLoading } = useQuery({
        queryKey: ['review-queue', user?._id],
        queryFn: queueFn,
        enabled: isProfessor || isHOD || isAccountant,
    });

    return (
        <div className="page-enter space-y-6">
            <PageHeader
                title="Review Queue"
                subtitle={`Applications pending your ${stageLabel} stage approval.`}
            />

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-[var(--primary)]" />
                </div>
            ) : applications.length === 0 ? (
                <div className="card py-24 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-green-50 rounded-full flex items-center justify-center text-green-600 mb-4">
                        <Inbox size={28} />
                    </div>
                    <h3 className="text-base font-bold text-[var(--text)]">All Caught Up!</h3>
                    <p className="text-sm text-[var(--muted)] mt-1 max-w-[280px]">No applications are currently awaiting your review in this stage.</p>
                </div>
            ) : (
                <div className="card overflow-hidden bg-[var(--surface)]">
                    <div className="p-4 border-b border-[var(--muted)] bg-gray-50/30 flex items-center gap-2">
                        <FileText size={14} className="text-[var(--primary)]" />
                        <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)]">
                            {applications.length} Pending applications
                        </span>
                    </div>

                    {/* Desktop Table View */}
                    <div className="hidden md:block overflow-x-auto">
                        <table className="data-table">
                            <thead>
                                <tr>
                                    <th>Applicant</th>
                                    <th>Title</th>
                                    <th>Amount</th>
                                    <th>Submitted</th>
                                    <th>Status</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody>
                                {applications.map((app: Application) => (
                                    <tr
                                        key={app._id}
                                        className="hover:bg-gray-50/50 cursor-pointer"
                                        onClick={() => navigate(`/applications/${app._id}`)}
                                    >
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className="avatar w-8 h-8 text-[11px] shadow-sm">
                                                    {app.student_id?.name?.slice(0, 2).toUpperCase()}
                                                </div>
                                                <span className="font-semibold text-sm">{app.student_id?.name || 'Unknown'}</span>
                                            </div>
                                        </td>
                                        <td className="max-w-[280px]">
                                            <p className="truncate font-medium text-sm">{app.title}</p>
                                            <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">{app.description}</p>
                                        </td>
                                        <td>
                                            <div className="flex items-center gap-1 font-bold text-sm text-[var(--text)]">
                                                <IndianRupee size={12} className="text-[var(--muted)]" />
                                                {app.amount_requested.toLocaleString('en-IN')}
                                            </div>
                                        </td>
                                        <td className="text-[var(--muted)] text-[12px]">
                                            {new Date(app.createdAt).toLocaleDateString('en-IN')}
                                        </td>
                                        <td>
                                            <span className="badge badge-amber text-[10px] font-bold">
                                                {statusLabel[app.status]}
                                            </span>
                                        </td>
                                        <td>
                                            <div className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all group">
                                                <ChevronRight size={14} className="text-[var(--muted)] group-hover:text-[var(--primary)]" />
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {/* Mobile Card View */}
                    <div className="md:hidden divide-y divide-[var(--border)]">
                        {applications.map((app: Application) => (
                            <div
                                key={app._id}
                                onClick={() => navigate(`/applications/${app._id}`)}
                                className="p-5 space-y-4 hover:bg-[var(--surface-2)] transition-colors cursor-pointer animate-in fade-in slide-in-from-bottom-2"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="avatar w-9 h-9 text-[10px] font-bold shadow-sm">
                                            {app.student_id?.name?.slice(0, 2).toUpperCase()}
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-[var(--text)] tracking-tight">
                                                {app.student_id?.name || 'Unknown student'}
                                            </p>
                                            <p className="text-[10px] text-[var(--muted)] font-black uppercase tracking-widest mt-0.5 opacity-60">
                                                {new Date(app.createdAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </p>
                                        </div>
                                    </div>
                                    <span className="badge badge-amber text-[9px] font-black uppercase tracking-tighter">
                                        {statusLabel[app.status]}
                                    </span>
                                </div>

                                <div className="space-y-1">
                                    <p className="text-[13px] font-bold text-[var(--text)] line-clamp-1">{app.title}</p>
                                    <p className="text-[11px] text-[var(--muted)] line-clamp-1 font-medium italic opacity-70">
                                        "{app.description}"
                                    </p>
                                </div>

                                <div className="flex items-center justify-between pt-1">
                                    <div className="flex items-center gap-1.5 text-[var(--primary)] font-black">
                                        <IndianRupee size={12} strokeWidth={3} />
                                        <span className="text-[15px] tracking-tight">
                                            {app.amount_requested.toLocaleString('en-IN')}
                                        </span>
                                    </div>
                                    <div className="flex items-center gap-1 text-[10px] font-black text-[var(--primary)] uppercase tracking-widest bg-[var(--primary-muted)] px-3 py-1.5 rounded-full shadow-sm">
                                        Review Details <ChevronRight size={12} strokeWidth={3} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};
