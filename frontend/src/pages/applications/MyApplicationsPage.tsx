
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, FileText, ChevronRight, FilePlus } from 'lucide-react';
import { getMyApplications } from '../../api/applicationApi';
import { ApplicationStatus } from '../../types';
import type { Application } from '../../types';
import { Pagination } from '../../components/Pagination';

const statusConfig: Record<ApplicationStatus, { label: string; cls: string }> = {
    [ApplicationStatus.PENDING_PROFESSOR]: { label: 'Awaiting Professor', cls: 'badge-amber' },
    [ApplicationStatus.PENDING_HOD]: { label: 'Awaiting HOD', cls: 'badge-blue' },
    [ApplicationStatus.PENDING_ACCOUNTS]: { label: 'Awaiting Accounts', cls: 'badge-purple' },
    [ApplicationStatus.APPROVED]: { label: 'Approved', cls: 'badge-green' },
    [ApplicationStatus.REJECTED]: { label: 'Rejected', cls: 'badge-red' },
};

export const MyApplicationsPage = () => {
    const navigate = useNavigate();
    const [page, setPage] = useState(1);
    const limit = 10;

    const { data: appData, isLoading } = useQuery({
        queryKey: ['my-applications', page],
        queryFn: () => getMyApplications(page, limit),
    });

    const applications = appData?.applications || [];
    const totalPages = appData?.pagination?.pages || 0;

    return (
        <div className="page-enter space-y-6">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1 className="text-2xl font-black tracking-tight">My Applications</h1>
                    <p className="text-[var(--muted)] text-sm mt-0.5 font-medium">Track your reimbursement and project funding requests</p>
                </div>
                <button
                    className="btn btn-primary shadow-lg shadow-blue-500/20"
                    onClick={() => navigate('/applications/new')}
                >
                    <FilePlus size={15} /> New Application
                </button>
            </div>

            {isLoading ? (
                <div className="grid grid-cols-1 gap-3">
                    {[...Array(3)].map((_, i) => <div key={i} className="h-20 rounded-xl animate-pulse bg-[var(--surface-2)]" />)}
                </div>
            ) : applications.length === 0 ? (
                <div className="card py-20 flex flex-col items-center text-center border-dashed">
                    <FileText size={40} className="mx-auto mb-4 text-[var(--muted)] opacity-20" />
                    <h3 className="text-base font-bold text-[var(--text)]">No Applications Found</h3>
                    <p className="text-sm text-[var(--muted)] mt-1 mb-6 max-w-xs">You haven't submitted any funding or reimbursement requests yet.</p>
                    <button className="btn btn-primary" onClick={() => navigate('/applications/new')}>
                        <PlusCircle size={14} /> Start New Application
                    </button>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="space-y-3">
                        {applications.map((app: Application) => {
                            const sc = statusConfig[app.status];
                            return (
                                <div
                                    key={app._id}
                                    className="card group p-5 flex items-center gap-5 cursor-pointer hover:border-[var(--primary)] transition-all animate-in fade-in slide-in-from-bottom-2 duration-300"
                                    onClick={() => navigate(`/applications/${app._id}`)}
                                >
                                    <div className="w-12 h-12 rounded-2xl bg-[var(--primary-muted)] group-hover:bg-[var(--primary)] transition-colors flex items-center justify-center shrink-0 shadow-sm">
                                        <FileText size={22} className="text-[var(--primary)] group-hover:text-white transition-all" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-[var(--text)] group-hover:text-[var(--primary)] transition-colors truncate">{app.title}</p>
                                        <div className="flex items-center gap-4 mt-1.5 flex-wrap">
                                            <span className="text-[11px] font-bold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                                                <div className="w-1 h-1 rounded-full bg-[var(--border)]" />
                                                Prof. {app.professor_id?.name || 'Assigned Professor'}
                                            </span>
                                            <span className="text-[11px] font-black text-[var(--primary)]">
                                                ₹{app.amount_requested.toLocaleString('en-IN')}
                                            </span>
                                            <span className="text-[11px] font-medium text-[var(--muted)]">
                                                {new Date(app.createdAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-3 shrink-0">
                                        <div className="flex flex-col items-end gap-1">
                                            <span className={`badge ${sc.cls} text-[10px] font-bold`}>{sc.label}</span>
                                            <span className="text-[9px] text-[var(--muted)] uppercase tracking-tighter opacity-60">Application Status</span>
                                        </div>
                                        <div className="w-8 h-8 rounded-full flex items-center justify-center bg-[var(--surface-2)] group-hover:bg-[var(--primary-muted)] transition-colors">
                                            <ChevronRight size={14} className="text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>

                    <Pagination
                        currentPage={page}
                        totalPages={totalPages}
                        onPageChange={setPage}
                        isLoading={isLoading}
                    />
                </div>
            )}
        </div>
    );
};
