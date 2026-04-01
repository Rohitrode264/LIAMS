import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    ArrowLeft, CheckCircle, XCircle, Clock, Loader2,
    IndianRupee, ChevronRight
} from 'lucide-react';
import toast from 'react-hot-toast';
import { getApplicationById, reviewApplication } from '../../api/applicationApi';
import { useAuthStore } from '../../store/authStore';
import { ApplicationStatus, UserRole } from '../../types';
import type { Application, ApplicationLog } from '../../types';

const statusConfig: Record<ApplicationStatus, { label: string; cls: string; icon: React.ReactNode }> = {
    [ApplicationStatus.PENDING_PROFESSOR]: { label: 'Pending Professor Review', cls: 'badge-amber', icon: <Clock size={12} /> },
    [ApplicationStatus.PENDING_HOD]: { label: 'Pending HOD Review', cls: 'badge-blue', icon: <Clock size={12} /> },
    [ApplicationStatus.PENDING_ACCOUNTS]: { label: 'Pending Accounts Review', cls: 'badge-purple', icon: <Clock size={12} /> },
    [ApplicationStatus.APPROVED]: { label: 'Approved', cls: 'badge-green', icon: <CheckCircle size={12} /> },
    [ApplicationStatus.REJECTED]: { label: 'Rejected', cls: 'badge-red', icon: <XCircle size={12} /> },
};

const actionLogIcon: Record<string, React.ReactNode> = {
    Submitted: <div className="w-2 h-2 rounded-full bg-blue-500" />,
    Forwarded: <div className="w-2 h-2 rounded-full bg-amber-500" />,
    Approved: <div className="w-2 h-2 rounded-full bg-green-500" />,
    Rejected: <div className="w-2 h-2 rounded-full bg-red-500" />,
};

const Workflow = ({ status }: { status: ApplicationStatus }) => {
    const stages = [
        { key: ApplicationStatus.PENDING_PROFESSOR, label: 'Professor' },
        { key: ApplicationStatus.PENDING_HOD, label: 'HOD' },
        { key: ApplicationStatus.PENDING_ACCOUNTS, label: 'Accounts' },
        { key: ApplicationStatus.APPROVED, label: 'Approved' },
    ];
    const isRejected = status === ApplicationStatus.REJECTED;
    const currentIdx = stages.findIndex(s => s.key === status);

    return (
        <div className="flex items-center gap-1 flex-wrap">
            {stages.map((stage, i) => {
                const isDone = !isRejected && i < currentIdx;
                const isCurrent = !isRejected && stage.key === status;
                return (
                    <div key={stage.key} className="flex items-center gap-1">
                        <div className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                            isDone ? 'bg-green-100 text-green-700' :
                            isCurrent ? 'bg-[var(--primary)] text-white' :
                            'bg-[var(--surface-2)] text-[var(--muted)]'
                        }`}>
                            {isDone ? '✓ ' : ''}{stage.label}
                        </div>
                        {i < stages.length - 1 && (
                            <ChevronRight size={12} className="text-[var(--muted)]" />
                        )}
                    </div>
                );
            })}
            {isRejected && (
                <span className="badge badge-red">✕ Rejected</span>
            )}
        </div>
    );
};

export const ApplicationDetailPage = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();
    const roles = user?.roles ?? [];

    const [remarks, setRemarks] = useState('');
    const [showRejectForm, setShowRejectForm] = useState(false);

    const { data, isLoading } = useQuery({
        queryKey: ['application', id],
        queryFn: () => getApplicationById(id!),
        enabled: !!id,
    });

    const mutation = useMutation({
        mutationFn: (payload: { action: 'approve' | 'reject'; remarks?: string }) =>
            reviewApplication(id!, payload),
        onSuccess: (_, vars) => {
            toast.success(vars.action === 'approve' ? 'Application approved!' : 'Application rejected.');
            queryClient.invalidateQueries({ queryKey: ['review-queue'] });
            queryClient.invalidateQueries({ queryKey: ['application', id] });
            setShowRejectForm(false);
            setRemarks('');
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Action failed');
        },
    });

    if (isLoading) {
        return (
            <div className="flex justify-center py-20">
                <Loader2 size={24} className="animate-spin text-[var(--primary)]" />
            </div>
        );
    }

    if (!data) return null;

    const { application, logs } = data as { application: Application; logs: ApplicationLog[] };
    const sc = statusConfig[application.status];
    const isCurrentReviewer = application.current_reviewer_id?._id === user?._id
        || application.current_reviewer_id?.toString() === user?._id;
    const isReviewable = [
        ApplicationStatus.PENDING_PROFESSOR,
        ApplicationStatus.PENDING_HOD,
        ApplicationStatus.PENDING_ACCOUNTS,
    ].includes(application.status);
    const isReviewer = roles.some(r => [UserRole.PROFESSOR, UserRole.HOD, UserRole.ACCOUNTANT].includes(r as UserRole));
    const canReview = isReviewer && isCurrentReviewer && isReviewable;

    return (
        <div className="max-w-3xl mx-auto">
            {/* Back */}
            <button
                className="flex items-center gap-1.5 text-[var(--muted)] hover:text-[var(--text)] text-sm mb-5 transition-colors"
                onClick={() => navigate(-1)}
            >
                <ArrowLeft size={14} /> Back
            </button>

            {/* Header */}
            <div className="card p-5 mb-4">
                <div className="flex items-start justify-between gap-4 flex-wrap">
                    <div>
                        <h1 className="text-xl font-bold text-[var(--text)]">{application.title}</h1>
                        <p className="text-sm text-[var(--muted)] mt-1">
                            Submitted by <span className="font-medium text-[var(--text)]">{application.student_id?.name}</span>
                            {' '}· {new Date(application.createdAt).toLocaleDateString('en-IN', { dateStyle: 'long' })}
                        </p>
                    </div>
                    <span className={`badge ${sc.cls} flex items-center gap-1`}>
                        {sc.icon} {sc.label}
                    </span>
                </div>

                {/* Workflow Progress */}
                <div className="mt-4 pt-4 border-t border-[var(--border)]">
                    <Workflow status={application.status} />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Amount */}
                <div className="card p-4">
                    <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-widest mb-1">Amount</p>
                    <div className="flex items-center gap-1 text-2xl font-bold text-[var(--text)]">
                        <IndianRupee size={18} />
                        {application.amount_requested.toLocaleString('en-IN')}
                    </div>
                </div>

                {/* Current Reviewer */}
                <div className="card p-4">
                    <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-widest mb-1">Current Reviewer</p>
                    <p className="font-semibold text-[var(--text)] truncate">
                        {isReviewable ? application.current_reviewer_id?.name : '—'}
                    </p>
                </div>

                {/* Department / Email */}
                <div className="card p-4">
                    <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-widest mb-1">Student Email</p>
                    <p className="font-medium text-[var(--text)] truncate text-sm">{application.student_id?.email}</p>
                </div>
            </div>

            {/* Description */}
            <div className="card p-5 mb-4">
                <h3 className="mb-3">Description</h3>
                <p className="text-sm text-[var(--muted)] leading-relaxed whitespace-pre-wrap">{application.description}</p>

                {application.rejection_reason && (
                    <div className="mt-4 p-3 rounded-lg bg-red-50 border border-red-200 text-sm text-red-700">
                        <p className="font-semibold mb-1">Rejection Reason:</p>
                        {application.rejection_reason}
                    </div>
                )}
            </div>

            {/* Audit Log Timeline */}
            <div className="card p-5 mb-4">
                <h3 className="mb-4">Activity Timeline</h3>
                {logs.length === 0 ? (
                    <p className="text-sm text-[var(--muted)]">No activity yet.</p>
                ) : (
                    <div className="space-y-4">
                        {logs.map((log: ApplicationLog, i: number) => (
                            <div key={log._id ?? i} className="flex gap-3">
                                <div className="flex flex-col items-center">
                                    <div className="mt-1.5">{actionLogIcon[log.action_type] ?? <div className="w-2 h-2 rounded-full bg-[var(--muted)]" />}</div>
                                    {i < logs.length - 1 && <div className="w-px flex-1 bg-[var(--border)] mt-1.5" />}
                                </div>
                                <div className="pb-4">
                                    <p className="text-sm font-semibold text-[var(--text)]">
                                        {log.action_type}
                                        {' '}<span className="font-normal text-[var(--muted)]">by {log.action_by?.name}</span>
                                    </p>
                                    {log.remarks && (
                                        <p className="text-sm text-[var(--muted)] mt-0.5 italic">"{log.remarks}"</p>
                                    )}
                                    <p className="text-xs text-[var(--muted)] mt-1">
                                        {new Date(log.timestamp).toLocaleString('en-IN')}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Review Action Panel */}
            {canReview && (
                <div className="card p-5 border-2 border-[var(--primary)] border-opacity-30">
                    <h3 className="mb-1 text-[var(--primary)]">Your Review</h3>
                    <p className="text-sm text-[var(--muted)] mb-4">You are the current reviewer. Please approve or reject this application.</p>

                    {showRejectForm ? (
                        <div className="space-y-3">
                            <textarea
                                className="form-input min-h-[80px] resize-y"
                                placeholder="Provide a reason for rejection (required)..."
                                value={remarks}
                                onChange={e => setRemarks(e.target.value)}
                            />
                            <div className="flex gap-2">
                                <button
                                    className="btn-ghost"
                                    onClick={() => { setShowRejectForm(false); setRemarks(''); }}
                                >
                                    Cancel
                                </button>
                                <button
                                    className="btn-danger flex-1"
                                    disabled={!remarks.trim() || mutation.isPending}
                                    onClick={() => mutation.mutate({ action: 'reject', remarks })}
                                >
                                    {mutation.isPending ? <Loader2 size={14} className="animate-spin" /> : <XCircle size={14} />}
                                    Confirm Rejection
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex gap-3">
                            <button
                                className="btn-danger"
                                onClick={() => setShowRejectForm(true)}
                                disabled={mutation.isPending}
                            >
                                <XCircle size={14} /> Reject
                            </button>
                            <button
                                className="btn-primary flex-1"
                                onClick={() => mutation.mutate({ action: 'approve', remarks: 'Approved' })}
                                disabled={mutation.isPending}
                            >
                                {mutation.isPending
                                    ? <Loader2 size={14} className="animate-spin" />
                                    : <CheckCircle size={14} />}
                                Approve & Forward
                            </button>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};
