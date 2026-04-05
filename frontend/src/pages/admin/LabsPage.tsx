
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLabs } from '../../hooks/useInventory';
import { useCreateLab, useUpdateLab } from '../../hooks/useAdminActions';
import { useUsersList } from '../../hooks/useUsers';
import { Building2, Plus, X, MapPin, Users, Building2Icon, MicroscopeIcon, UserCircle2, ArrowRight, Pencil } from 'lucide-react';
import { UserRole, type Lab } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { useNavigate } from 'react-router-dom';

const LabFormModal = ({ isOpen, onClose, lab }: { isOpen: boolean; onClose: () => void; lab?: Lab }) => {
    const isEdit = !!lab;
    const [name, setName] = useState(lab?.name || '');
    const [description, setDescription] = useState(lab?.description || '');
    const [location, setLocation] = useState(lab?.location || '');
    const [inchargeId, setInchargeId] = useState(lab?.incharge_id?._id || '');
    const [assistantIds, setAssistantIds] = useState<string[]>(lab?.assistant_ids?.map(a => a._id) || []);

    const createLab = useCreateLab();
    const updateLab = useUpdateLab();

    // Fetch potential in-charges and assistants
    const { data: inchargeUsers } = useUsersList({ role: UserRole.LAB_INCHARGE });
    const { data: assistantUsers } = useUsersList({ role: UserRole.ASSISTANT });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const data = { name, description, location, incharge_id: inchargeId || undefined, assistant_ids: assistantIds };

        if (isEdit) {
            updateLab.mutate(
                { id: lab._id, ...data },
                { onSuccess: onClose }
            );
        } else {
            createLab.mutate(
                data,
                { onSuccess: () => { onClose(); setName(''); setDescription(''); setLocation(''); setInchargeId(''); setAssistantIds([]); } }
            );
        }
    };

    if (!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
            <div className="bg-[var(--surface)] w-full max-w-xl rounded-[2.5rem] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)] border border-[color:var(--border)] max-h-[90vh] flex flex-col overflow-hidden relative z-10 animate-in zoom-in-95 slide-in-from-bottom-5 duration-500">
                <div className="flex items-center justify-between px-8 py-7 border-b border-[color:var(--border)] shrink-0">
                    <h2 className="text-xl font-black tracking-tight">{isEdit ? 'Edit Laboratory' : 'Create Laboratory'}</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--surface-2)] transition-colors"><X size={18} /></button>
                </div>

                <div className="overflow-y-auto custom-scrollbar p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-1.5 col-span-full md:col-span-1">
                                <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Laboratory Name</label>
                                <input required value={name} onChange={e => setName(e.target.value)} className="form-input rounded-xl bg-[var(--surface-2)] border-transparent focus:bg-[var(--surface)]" placeholder="e.g. Advanced AI Lab" />
                            </div>
                            <div className="space-y-1.5 col-span-full md:col-span-1">
                                <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Location / Room No.</label>
                                <input required value={location} onChange={e => setLocation(e.target.value)} className="form-input rounded-xl bg-[var(--surface-2)] border-transparent focus:bg-[var(--surface)]" placeholder="e.g. Block IV, Room 201" />
                            </div>
                        </div>

                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Lab Description</label>
                            <textarea required value={description} onChange={e => setDescription(e.target.value)} className="form-input rounded-xl bg-[var(--surface-2)] border-transparent focus:bg-[var(--surface)] min-h-[80px] py-3" placeholder="Briefly describe the lab's facilities..." />
                        </div>

                        <div className="space-y-4 pt-2">
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Assign Lab In-Charge</label>
                                <select
                                    value={inchargeId}
                                    onChange={e => setInchargeId(e.target.value)}
                                    className="form-input rounded-xl bg-[var(--surface-2)] border-transparent focus:bg-[var(--surface)]"
                                >
                                    <option value="">Select an In-Charge</option>
                                    {(inchargeUsers || []).map(u => (
                                        <option key={u._id} value={u._id}>{u.name} ({u.email})</option>
                                    ))}
                                </select>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Assign Lab Assistants (Staff)</label>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-[150px] overflow-y-auto custom-scrollbar p-1.5 border border-[var(--border)] rounded-xl bg-[var(--surface-2)]">
                                    {(assistantUsers || []).map(u => (
                                        <label key={u._id} className="flex items-center gap-2 p-2 rounded-lg bg-[var(--surface)] hover:bg-[var(--surface-3)] transition-colors cursor-pointer border border-[var(--border)]">
                                            <input
                                                type="checkbox"
                                                className="rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]"
                                                checked={assistantIds.includes(u._id)}
                                                onChange={e => {
                                                    if (e.target.checked) setAssistantIds([...assistantIds, u._id]);
                                                    else setAssistantIds(assistantIds.filter(id => id !== u._id));
                                                }}
                                            />
                                            <div className="min-w-0">
                                                <p className="text-xs font-bold truncate text-[var(--text)]">{u.name}</p>
                                                <p className="text-[10px] text-[var(--muted)] truncate">{u.email}</p>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>

                        <div className="flex gap-4 pt-4 shrink-0">
                            <button type="button" onClick={onClose} className="btn-secondary h-12 flex-1 rounded-xl font-bold">Cancel</button>
                            <button type="submit" disabled={isEdit ? updateLab.isPending : createLab.isPending} className="btn-primary h-12 flex-1 rounded-xl font-bold shadow-lg shadow-blue-500/20">
                                {isEdit ? (updateLab.isPending ? 'Saving...' : 'Update Lab') : (createLab.isPending ? 'Creating...' : 'Create Lab')}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

const LabDetailsModal = ({ isOpen, onClose, lab }: { isOpen: boolean; onClose: () => void; lab: Lab }) => {
    if (!isOpen) return null;
    const staffCount = (lab.incharge_id ? 1 : 0) + (lab.assistant_ids?.length || 0);

    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-300">
            <div className="absolute inset-0 bg-slate-950/40" onClick={onClose} />
            <div className="bg-[var(--surface)] w-full max-w-2xl rounded-[2.5rem] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)] border border-[color:var(--border)] max-h-[90vh] flex flex-col overflow-hidden relative z-10 animate-in zoom-in-95 slide-in-from-bottom-5 duration-500">
                <div className="flex items-center justify-between px-8 py-7 border-b border-[color:var(--border)] shrink-0">
                    <div>
                        <h2 className="text-xl font-black tracking-tight">{lab.name}</h2>
                        <p className="text-[11px] text-[var(--muted)] flex items-center gap-1.5 mt-0.5">
                            <MapPin size={10} className="text-[var(--primary)]" /> {lab.location || 'No location set'}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`badge ${lab.status === 'Active' ? 'badge-green' : 'badge-gray'}`}>
                            {lab.status}
                        </span>
                        <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--surface-2)] transition-colors"><X size={18} /></button>
                    </div>
                </div>

                <div className="overflow-y-auto custom-scrollbar p-8">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        <div className="md:col-span-2 space-y-6">
                            <section>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--muted)] mb-3 flex items-center gap-2">
                                    <div className="w-1 h-3 bg-[var(--primary)] rounded-full" /> Description
                                </h3>
                                <p className="text-sm leading-relaxed text-[var(--text)] whitespace-pre-wrap px-1">
                                    {lab.description || 'No description available for this laboratory.'}
                                </p>
                            </section>

                            <section>
                                <h3 className="text-[10px] font-black uppercase tracking-[0.1em] text-[var(--muted)] mb-3 flex items-center gap-2">
                                    <div className="w-1 h-3 bg-[var(--primary)] rounded-full" /> Staff Directory
                                </h3>
                                <div className="space-y-3">
                                    {/* In Charge */}
                                    <div className="bg-[var(--surface-2)] rounded-2xl p-4 border border-[var(--border)]">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center shrink-0">
                                                <UserCircle2 size={20} className="text-blue-500" />
                                            </div>
                                            <div>
                                                <p className="text-xs font-black uppercase tracking-widest text-blue-500 opacity-60 mb-0.5">Lab In-Charge</p>
                                                {lab.incharge_id ? (
                                                    <p className="font-bold text-sm tracking-tight">{lab.incharge_id.name}</p>
                                                ) : <p className="text-sm text-[var(--muted)] italic">Not assigned</p>}
                                            </div>
                                            {lab.incharge_id && <p className="ml-auto text-[11px] text-[var(--muted)] font-medium">{lab.incharge_id.email}</p>}
                                        </div>
                                    </div>

                                    {/* Assistants */}
                                    <div className="space-y-2">
                                        {lab.assistant_ids && lab.assistant_ids.length > 0 ? (
                                            lab.assistant_ids.map(assistant => (
                                                <div key={assistant._id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] hover:bg-[var(--surface-2)] transition-colors">
                                                    <div className="w-8 h-8 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center shrink-0">
                                                        <Users size={14} className="text-[var(--primary)]" />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-xs">{assistant.name}</p>
                                                        <p className="text-[10px] text-[var(--muted)]">{assistant.email}</p>
                                                    </div>
                                                    <div className="ml-auto px-2 py-0.5 rounded-md bg-[var(--surface-2)] text-[9px] font-bold text-[var(--muted)] uppercase tracking-tighter">Lab Assistant</div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="py-4 text-center border-2 border-dashed border-[var(--border)] rounded-2xl opacity-50">
                                                <p className="text-[11px] font-medium text-[var(--muted)]">No assistant staff assigned</p>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </section>
                        </div>

                        <div className="space-y-4">
                            <div className="bg-[var(--surface-2)] rounded-2xl p-5 border border-[var(--border)] flex flex-col items-center justify-center text-center">
                                <div className="text-3xl font-black text-[var(--primary)] mb-1">{staffCount}</div>
                                <div className="text-[10px] font-bold text-[var(--muted)] uppercase tracking-widest">Total Staff</div>
                            </div>

                            <button
                                onClick={() => { }}
                                className="w-full card p-4 flex items-center justify-between hover:bg-[var(--surface-2)] transition-colors group"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center">
                                        <MicroscopeIcon size={16} className="text-[var(--primary)]" />
                                    </div>
                                    <span className="text-xs font-bold text-[var(--text)]">Equipments</span>
                                </div>
                                <ArrowRight size={14} className="text-[var(--muted)] group-hover:text-[var(--primary)] transition-colors group-hover:translate-x-0.5" />
                            </button>
                        </div>
                    </div>
                </div>

                <div className="p-4 border-t border-[color:var(--border)] bg-[var(--surface-2)]/50 shrink-0 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-black text-xs uppercase tracking-widest text-[var(--muted)] hover:bg-[var(--surface-3)] transition-colors">Close View</button>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const LabsPage = () => {
    const { data: labsData, isLoading } = useLabs(1, 50);
    const navigate = useNavigate();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [editLab, setEditLab] = useState<Lab | null>(null);
    const [viewLab, setViewLab] = useState<Lab | null>(null);

    const labs: Lab[] = labsData?.labs || [];

    return (
        <div className="page-enter space-y-6">
            <PageHeader
                title="Laboratories"
                subtitle="Manage all lab facilities, assign in-charges and staff."
                action={
                    <button onClick={() => setIsCreateOpen(true)} className="btn-primary btn text-[13px]">
                        <Building2Icon size={14} /> New Laboratory
                    </button>
                }
            />

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                {isLoading ? (
                    Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-44 rounded-xl animate-pulse bg-[var(--surface-2)]" />
                    ))
                ) : (
                    labs.map((lab: Lab) => {
                        const totalStaff = (lab.incharge_id ? 1 : 0) + (lab.assistant_ids?.length || 0);
                        return (
                            <div
                                key={lab._id}
                                onClick={() => setViewLab(lab)}
                                className="card p-5 outline-none focus:ring-2 focus:ring-[var(--primary)] flex flex-col gap-4 hover:border-[var(--primary)] transition-all duration-200 cursor-pointer group relative"
                            >
                                <div className="flex items-start justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-9 h-9 rounded-xl bg-[var(--primary-muted)] group-hover:bg-[var(--primary)] transition-colors flex items-center justify-center shrink-0">
                                            <Building2 size={17} className="text-[var(--primary)] group-hover:text-white transition-colors" />
                                        </div>
                                        <div>
                                            <p className="font-semibold text-sm text-[var(--text)]">{lab.name}</p>
                                            {lab.location && (
                                                <p className="text-[11px] text-[var(--muted)] flex items-center gap-1 mt-0.5">
                                                    <MapPin size={9} /> {lab.location}
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <span className={`badge ${lab.status === 'Active' ? 'badge-green' : 'badge-gray'} shrink-0`}>
                                        {lab.status}
                                    </span>
                                </div>

                                {lab.description && (
                                    <p className="text-[12px] text-[var(--muted)] line-clamp-2 pr-2">{lab.description}</p>
                                )}

                                <div className="flex items-center gap-4 pt-3 border-t border-[color:var(--border)] mt-auto" onClick={e => e.stopPropagation()}>
                                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                                        <Users size={11} />
                                        <span>{totalStaff} staff</span>
                                    </div>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); navigate(`/admin/components?labId=${lab._id}`); }}
                                        className="flex items-center gap-1.5 text-[11px] text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                                    >
                                        <MicroscopeIcon size={11} />
                                        <span>Equipments</span>
                                    </button>

                                    <button
                                        onClick={(e) => { e.stopPropagation(); setEditLab(lab); }}
                                        className="flex items-center gap-1 ml-auto text-[12px] cursor-pointer tracking-wider text-[var(--primary)] hover:bg-[var(--primary-muted)] px-3 py-1.5 rounded-lg transition-colors"
                                    >
                                        <Pencil size={11} className='font-bold' />
                                        Edit
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}

                {!isLoading && labs.length === 0 && (
                    <div className="col-span-full card py-20 flex flex-col items-center text-center border-dashed">
                        <Building2 className="w-8 h-8 text-[var(--muted)] mb-3 opacity-30" />
                        <h3 className="text-base font-semibold mb-1">No Labs Yet</h3>
                        <p className="text-sm text-[var(--muted)] mb-4">Create your first laboratory to get started.</p>
                        <button onClick={() => setIsCreateOpen(true)} className="btn-primary btn text-[13px]">
                            <Plus size={13} /> Create Lab
                        </button>
                    </div>
                )}
            </div>

            <LabFormModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
            {editLab && <LabFormModal isOpen={!!editLab} onClose={() => setEditLab(null)} lab={editLab} />}
            {viewLab && <LabDetailsModal isOpen={!!viewLab} onClose={() => setViewLab(null)} lab={viewLab} />}
        </div>
    );
};
