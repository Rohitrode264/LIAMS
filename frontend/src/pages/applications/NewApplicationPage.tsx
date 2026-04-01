import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, DollarSign, User, AlertCircle, Loader2, Upload } from 'lucide-react';
import toast from 'react-hot-toast';
import { useAuthStore } from '../../store/authStore';
import { createApplication, getUsersByRole } from '../../api/applicationApi';

export const NewApplicationPage = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const { user } = useAuthStore();

    const [form, setForm] = useState({
        professor_id: '',
        title: '',
        description: '',
        amount_requested: '',
    });

    const { data: professors = [], isLoading: loadingProfessors } = useQuery({
        queryKey: ['users-professors'],
        queryFn: () => getUsersByRole('Professor'),
    });

    const mutation = useMutation({
        mutationFn: createApplication,
        onSuccess: () => {
            toast.success('Application submitted successfully!');
            queryClient.invalidateQueries({ queryKey: ['my-applications'] });
            navigate('/applications/my');
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || 'Failed to submit application');
        },
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.professor_id) return toast.error('Please select a professor');
        const amount = parseFloat(form.amount_requested);
        if (isNaN(amount) || amount <= 0) return toast.error('Enter a valid amount');
        mutation.mutate({
            ...form,
            amount_requested: amount,
            documents: [],
        });
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <h1 className="text-2xl font-bold text-[var(--text)]">New Reimbursement Application</h1>
                <p className="text-[var(--muted)] mt-1">Fill in the details below to submit your application for approval.</p>
            </div>

            {/* Student Info Card */}
            <div className="card p-4 mb-6 flex items-center gap-3">
                <div className="avatar w-10 h-10 text-sm">{user?.name?.slice(0, 2).toUpperCase()}</div>
                <div>
                    <p className="font-semibold text-[var(--text)]">{user?.name}</p>
                    <p className="text-xs text-[var(--muted)]">{user?.email}</p>
                </div>
                <span className="ml-auto badge badge-green">Student</span>
            </div>

            <form onSubmit={handleSubmit} className="card p-6 space-y-5">
                {/* Professor Select */}
                <div>
                    <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">
                        <User size={13} className="inline mr-1.5 opacity-60" />
                        Select Professor *
                    </label>
                    {loadingProfessors ? (
                        <div className="form-input flex items-center gap-2 text-[var(--muted)]">
                            <Loader2 size={14} className="animate-spin" /> Loading professors...
                        </div>
                    ) : professors.length === 0 ? (
                        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                            <AlertCircle size={14} />
                            No professors found. Contact Admin to set up approval hierarchies.
                        </div>
                    ) : (
                        <select
                            className="form-input"
                            value={form.professor_id}
                            onChange={(e) => setForm(f => ({ ...f, professor_id: e.target.value }))}
                            required
                        >
                            <option value="">— Select a professor —</option>
                            {professors.map((p: any) => (
                                <option key={p._id} value={p._id}>{p.name} ({p.email})</option>
                            ))}
                        </select>
                    )}
                </div>

                {/* Title */}
                <div>
                    <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">
                        <FileText size={13} className="inline mr-1.5 opacity-60" />
                        Application Title *
                    </label>
                    <input
                        type="text"
                        className="form-input"
                        placeholder="e.g. Conference Travel Reimbursement"
                        value={form.title}
                        onChange={(e) => setForm(f => ({ ...f, title: e.target.value }))}
                        required
                        minLength={3}
                    />
                </div>

                {/* Description */}
                <div>
                    <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">Description *</label>
                    <textarea
                        className="form-input min-h-[100px] resize-y"
                        placeholder="Describe the purpose of this reimbursement request..."
                        value={form.description}
                        onChange={(e) => setForm(f => ({ ...f, description: e.target.value }))}
                        required
                        minLength={10}
                    />
                </div>

                {/* Amount */}
                <div>
                    <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">
                        <DollarSign size={13} className="inline mr-1.5 opacity-60" />
                        Amount Requested (₹) *
                    </label>
                    <input
                        type="number"
                        className="form-input"
                        placeholder="0.00"
                        value={form.amount_requested}
                        onChange={(e) => setForm(f => ({ ...f, amount_requested: e.target.value }))}
                        min="1"
                        step="0.01"
                        required
                    />
                </div>

                {/* Document upload placeholder */}
                <div>
                    <label className="block text-sm font-semibold text-[var(--text)] mb-1.5">
                        <Upload size={13} className="inline mr-1.5 opacity-60" />
                        Supporting Documents
                    </label>
                    <div className="border-2 border-dashed border-[var(--border)] rounded-lg p-6 text-center text-[var(--muted)] text-sm">
                        <Upload size={20} className="mx-auto mb-2 opacity-40" />
                        Document upload integration coming soon.
                        <br />
                        <span className="text-xs opacity-60">PDF, JPG, PNG accepted</span>
                    </div>
                </div>

                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="button"
                        className="btn-secondary"
                        onClick={() => navigate(-1)}
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        className="btn-primary flex-1"
                        disabled={mutation.isPending || loadingProfessors}
                    >
                        {mutation.isPending ? (
                            <><Loader2 size={14} className="animate-spin" /> Submitting...</>
                        ) : 'Submit Application'}
                    </button>
                </div>
            </form>
        </div>
    );
};
