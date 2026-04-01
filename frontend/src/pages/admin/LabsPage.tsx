
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useLabs } from '../../hooks/useInventory';
import { useCreateLab } from '../../hooks/useAdminActions';
import { Building2, Plus, X, MapPin, Users, Cpu, Building2Icon, MicroscopeIcon } from 'lucide-react';
import type { Lab } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { useNavigate } from 'react-router-dom';

const CreateLabModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [location, setLocation] = useState('');
    const createLab = useCreateLab();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createLab.mutate(
            { name, description, location },
            { onSuccess: () => { onClose(); setName(''); setDescription(''); setLocation(''); } }
        );
    };

    if (!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-300">
            <div 
                className="absolute inset-0 bg-slate-950/40"
                onClick={onClose}
            />
            <div className="bg-[var(--surface)] w-full max-w-md rounded-[2.5rem] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)] border border-[color:var(--border)] max-h-[min(90vh,600px)] flex flex-col overflow-hidden relative z-10 animate-in zoom-in-95 slide-in-from-bottom-5 duration-500">
                <div className="flex items-center justify-between px-8 py-7 border-b border-[color:var(--border)] shrink-0">
                    <h2 className="text-xl font-black tracking-tight">Create Laboratory</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--surface-2)] transition-colors"><X size={18} /></button>
                </div>
                <div className="overflow-y-auto custom-scrollbar p-8">
                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Laboratory Name</label>
                            <input required value={name} onChange={e => setName(e.target.value)} className="form-input rounded-xl bg-[var(--surface-2)] border-transparent focus:bg-[var(--surface)]" placeholder="e.g. Advanced AI Lab" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Location / Room No.</label>
                            <input required value={location} onChange={e => setLocation(e.target.value)} className="form-input rounded-xl bg-[var(--surface-2)] border-transparent focus:bg-[var(--surface)]" placeholder="e.g. Block IV, Room 201" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Lab Description</label>
                            <textarea required value={description} onChange={e => setDescription(e.target.value)} className="form-input rounded-xl bg-[var(--surface-2)] border-transparent focus:bg-[var(--surface)] min-h-[100px] py-3" placeholder="Briefly describe the lab's facilities..." />
                        </div>
                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={onClose} className="btn-secondary h-12 flex-1 rounded-xl font-bold">Cancel</button>
                            <button type="submit" disabled={createLab.isPending} className="btn-primary h-12 flex-1 rounded-xl font-bold shadow-lg shadow-blue-500/20">
                                {createLab.isPending ? 'Creating…' : 'Create Lab'}
                            </button>
                        </div>
                    </form>
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
                    labs.map((lab: Lab) => (
                        <div key={lab._id} className="card p-5 flex flex-col gap-4 hover:border-[var(--primary)] transition-all duration-200">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center shrink-0">
                                        <Building2 size={17} className="text-[var(--primary)]" />
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
                                <p className="text-[12px] text-[var(--muted)] line-clamp-2">{lab.description}</p>
                            )}

                            <div className="flex items-center gap-4 pt-3 border-t border-[color:var(--border)] mt-auto">
                                {lab.assistant_ids && (
                                    <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                                        <Users size={11} />
                                        <span>{lab.assistant_ids.length} staff</span>
                                    </div>
                                )}
                                <button
                                    onClick={() => navigate(`/admin/components?labId=${lab._id}`)}
                                    className="flex items-center gap-1.5 text-[11px] text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
                                >
                                    <MicroscopeIcon size={11} />
                                    <span>Equipments</span>
                                </button>
                                <button className="ml-auto text-[12px] font-semibold text-[var(--primary)] hover:underline">
                                    Edit
                                </button>
                            </div>
                        </div>
                    ))
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

            <CreateLabModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        </div>
    );
};
