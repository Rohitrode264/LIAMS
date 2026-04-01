import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { PlusCircle, FileText, Clock, CheckCircle, XCircle, Loader2, ChevronRight, FilePlus } from 'lucide-react';
import { getMyApplications } from '../../api/applicationApi';
import { ApplicationStatus } from '../../types';
import type { Application } from '../../types';

const statusConfig: Record<ApplicationStatus, { label: string; cls: string }> = {
    [ApplicationStatus.PENDING_PROFESSOR]: { label: 'Awaiting Professor', cls: 'badge-amber' },
    [ApplicationStatus.PENDING_HOD]: { label: 'Awaiting HOD', cls: 'badge-blue' },
    [ApplicationStatus.PENDING_ACCOUNTS]: { label: 'Awaiting Accounts', cls: 'badge-purple' },
    [ApplicationStatus.APPROVED]: { label: 'Approved', cls: 'badge-green' },
    [ApplicationStatus.REJECTED]: { label: 'Rejected', cls: 'badge-red' },
};

const StatusIcon = ({ status }: { status: ApplicationStatus }) => {
    if (status === ApplicationStatus.APPROVED) return <CheckCircle size={14} className="text-green-600" />;
    if (status === ApplicationStatus.REJECTED) return <XCircle size={14} className="text-red-500" />;
    return <Clock size={14} className="text-amber-500" />;
};

export const MyApplicationsPage = () => {
    const navigate = useNavigate();

    const { data: applications = [], isLoading } = useQuery({
        queryKey: ['my-applications'],
        queryFn: getMyApplications,
    });

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1>My Applications</h1>
                    <p className="text-[var(--muted)] mt-0.5">Track the status of your reimbursement requests</p>
                </div>
                <button
                    className="btn-primary"
                    onClick={() => navigate('/applications/new')}
                >
                    <FilePlus size={15} />
                    New Application
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-[var(--primary)]" />
                </div>
            ) : applications.length === 0 ? (
                <div className="card p-12 text-center">
                    <FileText size={36} className="mx-auto mb-3 text-[var(--muted)] opacity-40" />
                    <h3 className="text-[var(--muted)]">No applications yet</h3>
                    <p className="text-sm text-[var(--muted)] mt-1 mb-4">Submit a reimbursement request to get started</p>
                    <button className="btn-primary mx-auto" onClick={() => navigate('/applications/new')}>
                        <PlusCircle size={14} /> New Application
                    </button>
                </div>
            ) : (
                <div className="space-y-3">
                    {applications.map((app: Application) => {
                        const sc = statusConfig[app.status];
                        return (
                            <div
                                key={app._id}
                                className="card p-4 flex items-center gap-4 cursor-pointer hover:shadow-md transition-shadow"
                                onClick={() => navigate(`/applications/${app._id}`)}
                            >
                                <div className="w-10 h-10 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center shrink-0">
                                    <FileText size={18} className="text-[var(--primary)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="font-semibold text-[var(--text)] truncate">{app.title}</p>
                                    <div className="flex items-center gap-3 mt-1 flex-wrap">
                                        <span className="text-xs text-[var(--muted)]">
                                            Prof. {app.professor_id?.name}
                                        </span>
                                        <span className="text-xs text-[var(--muted)]">
                                            ₹{app.amount_requested.toLocaleString('en-IN')}
                                        </span>
                                        <span className="text-xs text-[var(--muted)]">
                                            {new Date(app.createdAt).toLocaleDateString('en-IN')}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2 shrink-0">
                                    <StatusIcon status={app.status} />
                                    <span className={`badge ${sc.cls}`}>{sc.label}</span>
                                </div>
                                <ChevronRight size={14} className="text-[var(--muted)] shrink-0" />
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};
