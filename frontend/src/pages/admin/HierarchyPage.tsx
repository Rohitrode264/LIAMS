import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Plus, Trash2, Pencil, X, Check, Loader2, GitBranch, Network } from 'lucide-react';
import toast from 'react-hot-toast';
import { getAllHierarchies, createHierarchy, updateHierarchy, deleteHierarchy } from '../../api/hierarchyApi';
import { getUsersByRole } from '../../api/applicationApi';
import type { ApprovalHierarchy } from '../../types';

const Pill = ({ name, role }: { name: string; role: string }) => (
    <div className="flex items-center gap-1.5 bg-[var(--surface-2)] border border-[var(--border)] rounded-lg px-2.5 py-1.5 min-w-0">
        <div className="avatar w-6 h-6 text-[9px] shrink-0">{name.slice(0, 2).toUpperCase()}</div>
        <div className="min-w-0">
            <p className="text-xs font-semibold text-[var(--text)] truncate">{name}</p>
            <p className="text-[10px] text-[var(--muted)]">{role}</p>
        </div>
    </div>
);

export const HierarchyPage = () => {
    const qc = useQueryClient();

    const { data: hierarchies = [], isLoading } = useQuery({
        queryKey: ['hierarchies'],
        queryFn: getAllHierarchies,
    });

    const { data: professors = [] } = useQuery({ queryKey: ['users-professors'], queryFn: () => getUsersByRole('Professor') });
    const { data: hods = [] } = useQuery({ queryKey: ['users-hods'], queryFn: () => getUsersByRole('HOD') });
    const { data: accounts = [] } = useQuery({ queryKey: ['users-accounts'], queryFn: () => getUsersByRole('Accountant') });

    const [showModal, setShowModal] = useState(false);
    const [editing, setEditing] = useState<ApprovalHierarchy | null>(null);
    const [form, setForm] = useState({ professor_id: '', hod_id: '', accounts_id: '' });

    const createMut = useMutation({
        mutationFn: createHierarchy,
        onSuccess: () => { toast.success('Hierarchy created'); qc.invalidateQueries({ queryKey: ['hierarchies'] }); closeModal(); },
        onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to create'),
    });

    const updateMut = useMutation({
        mutationFn: ({ id, payload }: { id: string; payload: any }) => updateHierarchy(id, payload),
        onSuccess: () => { toast.success('Hierarchy updated'); qc.invalidateQueries({ queryKey: ['hierarchies'] }); closeModal(); },
        onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to update'),
    });

    const deleteMut = useMutation({
        mutationFn: deleteHierarchy,
        onSuccess: () => { toast.success('Hierarchy deleted'); qc.invalidateQueries({ queryKey: ['hierarchies'] }); },
        onError: (e: any) => toast.error(e?.response?.data?.message ?? 'Failed to delete'),
    });

    const openCreate = () => { setEditing(null); setForm({ professor_id: '', hod_id: '', accounts_id: '' }); setShowModal(true); };
    const openEdit = (h: ApprovalHierarchy) => {
        setEditing(h);
        setForm({ professor_id: h.professor_id._id, hod_id: h.hod_id._id, accounts_id: h.accounts_id._id });
        setShowModal(true);
    };
    const closeModal = () => { setShowModal(false); setEditing(null); };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!form.professor_id || !form.hod_id || !form.accounts_id) return toast.error('All fields are required');
        if (editing) {
            updateMut.mutate({ id: editing._id, payload: form });
        } else {
            createMut.mutate(form);
        }
    };

    const isPending = createMut.isPending || updateMut.isPending;

    return (
        <div>
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h1>Approval Hierarchy Configuration</h1>
                    <p className="text-[var(--muted)] mt-0.5">
                        Define the chain of approval: Professor → HOD → Accounts Officer
                    </p>
                </div>
                <button className="btn-primary" onClick={openCreate}>
                    <Network size={14} /> Add Hierarchy
                </button>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-[var(--primary)]" />
                </div>
            ) : hierarchies.length === 0 ? (
                <div className="card p-12 text-center">
                    <GitBranch size={36} className="mx-auto mb-3 text-[var(--muted)] opacity-40" />
                    <h3 className="text-[var(--muted)]">No hierarchies configured</h3>
                    <p className="text-sm text-[var(--muted)] mt-1 mb-4">Students won't be able to submit applications without at least one hierarchy.</p>
                    <button className="btn-primary mx-auto" onClick={openCreate}><Plus size={14} /> Add First Hierarchy</button>
                </div>
            ) : (
                <div className="space-y-3">
                    {hierarchies.map((h: ApprovalHierarchy) => (
                        <div key={h._id} className="card p-4">
                            <div className="flex items-center gap-3 flex-wrap">
                                <Pill name={h.professor_id.name} role="Professor" />
                                <span className="text-[var(--muted)] text-lg">→</span>
                                <Pill name={h.hod_id.name} role="HOD" />
                                <span className="text-[var(--muted)] text-lg">→</span>
                                <Pill name={h.accounts_id.name} role="Accounts" />
                                <div className="ml-auto flex gap-2 shrink-0">
                                    <button
                                        className="btn-secondary p-2"
                                        onClick={() => openEdit(h)}
                                        title="Edit"
                                    >
                                        <Pencil size={13} />
                                    </button>
                                    <button
                                        className="btn-danger p-2"
                                        onClick={() => deleteMut.mutate(h._id)}
                                        disabled={deleteMut.isPending}
                                        title="Delete"
                                    >
                                        <Trash2 size={13} />
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* Modal */}
            {showModal && createPortal(
                <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-300">
                    <div 
                        className="absolute inset-0 bg-slate-950/40"
                        onClick={closeModal}
                    />
                    <div className="bg-[var(--surface)] w-full max-w-md rounded-[2.5rem] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)] border border-[color:var(--border)] max-h-[min(90vh,600px)] flex flex-col overflow-hidden relative z-10 animate-in zoom-in-95 slide-in-from-bottom-5 duration-500">
                        <div className="flex items-center justify-between px-8 py-7 border-b border-[color:var(--border)] shrink-0 bg-[var(--surface)]">
                            <h3 className="text-xl font-black tracking-tight">{editing ? 'Edit Hierarchy' : 'Add Hierarchy'}</h3>
                            <button className="p-2 rounded-xl hover:bg-[var(--surface-2)] transition-colors" onClick={closeModal}><X size={18} /></button>
                        </div>
                        <div className="overflow-y-auto custom-scrollbar p-8 bg-[var(--surface)]">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Professor</label>
                                    <select className="form-input rounded-xl bg-[var(--surface-2)] border-transparent focus:bg-[var(--surface)] font-semibold" value={form.professor_id} onChange={e => setForm(f => ({ ...f, professor_id: e.target.value }))} required>
                                        <option value="">— Select Professor —</option>
                                        {professors.map((p: any) => <option key={p._id} value={p._id}>{p.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider ml-1">HOD</label>
                                    <select className="form-input rounded-xl bg-[var(--surface-2)] border-transparent focus:bg-[var(--surface)] font-semibold" value={form.hod_id} onChange={e => setForm(f => ({ ...f, hod_id: e.target.value }))} required>
                                        <option value="">— Select HOD —</option>
                                        {hods.map((h: any) => <option key={h._id} value={h._id}>{h.name}</option>)}
                                    </select>
                                </div>
                                <div className="space-y-1.5">
                                    <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Accounts Officer</label>
                                    <select className="form-input rounded-xl bg-[var(--surface-2)] border-transparent focus:bg-[var(--surface)] font-semibold" value={form.accounts_id} onChange={e => setForm(f => ({ ...f, accounts_id: e.target.value }))} required>
                                        <option value="">— Select Accounts Officer —</option>
                                        {accounts.map((a: any) => <option key={a._id} value={a._id}>{a.name}</option>)}
                                    </select>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button type="button" className="btn-secondary h-12 flex-1 rounded-xl font-bold" onClick={closeModal}>Cancel</button>
                                    <button type="submit" className="btn-primary h-12 flex-1 rounded-xl font-bold shadow-lg shadow-blue-500/20" disabled={isPending}>
                                        {isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
                                        {editing ? 'Update' : 'Create'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>,
                document.body
            )}
        </div>
    );
};
