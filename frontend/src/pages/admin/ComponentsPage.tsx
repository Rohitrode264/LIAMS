
import { useState, useEffect } from 'react';
import { useLabs, useComponentsByLab } from '../../hooks/useInventory';
import { useCreateComponent, useUpdateComponent } from '../../hooks/useAdminActions';
import { Cpu, Plus, Save, AlertCircle } from 'lucide-react';
import type { Lab, Component } from '../../types';
import { useSearchParams } from 'react-router-dom';
import { PageHeader } from '../../components/PageHeader';

export const ComponentsPage = () => {
    const [searchParams, setSearchParams] = useSearchParams();
    const labIdFromUrl = searchParams.get('labId');
    const { data: labsData } = useLabs(1, 100);
    const [selectedLabId, setSelectedLabId] = useState<string | null>(labIdFromUrl);

    useEffect(() => {
        if (labIdFromUrl) setSelectedLabId(labIdFromUrl);
    }, [labIdFromUrl]);

    const { data: componentsData, isLoading: loadingComponents } = useComponentsByLab(selectedLabId, 1, 200);
    const createComponent = useCreateComponent();
    const updateComponent = useUpdateComponent();

    const [name, setName] = useState('');
    const [description, setDescription] = useState('');
    const [status, setStatus] = useState<Component['status']>('Available');
    const [edits, setEdits] = useState<Record<string, Partial<Component>>>({});

    const components = componentsData?.components || [];
    const selectedLab = labsData?.labs?.find((l: Lab) => l._id === selectedLabId);

    const onSaveRow = (c: Component) => {
        const patch = edits[c._id] || {};
        updateComponent.mutate(
            { id: c._id, name: patch.name, description: patch.description, status: patch.status },
            { onSuccess: () => setEdits(e => { const next = { ...e }; delete next[c._id]; return next; }) }
        );
    };

    const handleAdd = (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedLabId) return;
        createComponent.mutate(
            { lab_id: selectedLabId, name, description, status },
            { onSuccess: () => { setName(''); setDescription(''); setStatus('Available'); } }
        );
    };

    const handleLabChange = (id: string) => {
        setSelectedLabId(id);
        setSearchParams({ labId: id });
    };

    return (
        <div className="page-enter space-y-6">
            <PageHeader
                title="Equipment Inventory"
                subtitle="Manage hardware and infrastructure components per lab."
                action={
                    <select
                        className="form-input text-[13px] py-2 min-w-[200px]"
                        value={selectedLabId || ''}
                        onChange={e => handleLabChange(e.target.value)}
                    >
                        <option value="">Select a Laboratory…</option>
                        {labsData?.labs?.map((lab: Lab) => (
                            <option key={lab._id} value={lab._id}>{lab.name}</option>
                        ))}
                    </select>
                }
            />

            {!selectedLabId ? (
                <div className="card py-24 flex flex-col items-center text-center border-dashed">
                    <Cpu className="w-10 h-10 text-[var(--muted)] mb-3 opacity-30" />
                    <h3 className="text-base font-semibold mb-1">Select a Laboratory</h3>
                    <p className="text-sm text-[var(--muted)]">Choose a lab from the dropdown above to view and manage its equipment.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                    {/* Add Component Panel */}
                    <div className="xl:col-span-1">
                        <div className="card p-5 sticky top-[72px]">
                            <div className="flex items-center gap-3 mb-5 pb-4 border-b border-[color:var(--border)]">
                                <div className="w-9 h-9 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center">
                                    <Plus size={17} className="text-[var(--primary)]" />
                                </div>
                                <div>
                                    <p className="font-semibold text-[var(--text)] text-[13px]">Add Equipment</p>
                                    <p className="text-[11px] text-[var(--muted)]">{selectedLab?.name}</p>
                                </div>
                            </div>
                            <form onSubmit={handleAdd} className="space-y-4">
                                <div>
                                    <label className="block text-[12px] font-semibold text-[var(--muted)] mb-1.5">Component Name *</label>
                                    <input required className="form-input" placeholder="e.g. Raspberry Pi 4" value={name} onChange={e => setName(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-[var(--muted)] mb-1.5">Description</label>
                                    <textarea className="form-input min-h-[70px] resize-none" placeholder="Details about this equipment…" value={description} onChange={e => setDescription(e.target.value)} />
                                </div>
                                <div>
                                    <label className="block text-[12px] font-semibold text-[var(--muted)] mb-1.5">Initial Status</label>
                                    <select className="form-input" value={status} onChange={e => setStatus(e.target.value as Component['status'])}>
                                        <option value="Available">Available</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Inactive">Inactive</option>
                                    </select>
                                </div>
                                <button type="submit" disabled={createComponent.isPending} className="btn-primary btn w-full">
                                    {createComponent.isPending ? 'Adding…' : 'Add Equipment'}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Components Table */}
                    <div className="xl:col-span-2">
                        <div className="card overflow-hidden">
                            <div className="flex items-center justify-between px-5 py-4 border-b border-[color:var(--border)] bg-[var(--surface-2)]">
                                <p className="text-[13px] font-semibold text-[var(--text)]">Existing Equipment</p>
                                <span className="badge badge-gray">{components.length} items</span>
                            </div>
                            {loadingComponents ? (
                                <div className="p-8 space-y-3">
                                    {[...Array(4)].map((_, i) => <div key={i} className="h-10 rounded-lg bg-[var(--surface-2)] animate-pulse" />)}
                                </div>
                            ) : components.length === 0 ? (
                                <div className="py-16 flex flex-col items-center text-center">
                                    <AlertCircle className="w-7 h-7 text-[var(--muted)] mb-2 opacity-30" />
                                    <p className="text-sm text-[var(--muted)]">No equipment registered for this lab.</p>
                                </div>
                            ) : (
                                <div className="overflow-x-auto">
                                    <table className="data-table">
                                        <thead>
                                            <tr>
                                                <th>Name</th>
                                                <th className="w-40">Status</th>
                                                <th className="w-20 text-right">Save</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {components.map((c: Component) => {
                                                const draft = edits[c._id] || {};
                                                const isEdited = !!edits[c._id];
                                                return (
                                                    <tr key={c._id} className={isEdited ? 'bg-blue-50/30' : ''}>
                                                        <td>
                                                            <input
                                                                className="w-full bg-transparent outline-none font-semibold text-[var(--text)] text-[13px] py-1 border-b border-transparent focus:border-[var(--primary)] transition-all"
                                                                defaultValue={c.name}
                                                                onChange={e => setEdits(s => ({ ...s, [c._id]: { ...draft, name: e.target.value } }))}
                                                            />
                                                            <input
                                                                className="w-full bg-transparent outline-none text-[11px] text-[var(--muted)] py-0.5"
                                                                defaultValue={c.description}
                                                                placeholder="Description…"
                                                                onChange={e => setEdits(s => ({ ...s, [c._id]: { ...draft, description: e.target.value } }))}
                                                            />
                                                        </td>
                                                        <td>
                                                            <select
                                                                className="form-input text-[12px] py-1.5"
                                                                defaultValue={c.status}
                                                                onChange={e => setEdits(s => ({ ...s, [c._id]: { ...draft, status: e.target.value as Component['status'] } }))}
                                                            >
                                                                <option value="Available">Available</option>
                                                                <option value="Maintenance">Maintenance</option>
                                                                <option value="Inactive">Inactive</option>
                                                            </select>
                                                        </td>
                                                        <td className="text-right">
                                                            <button
                                                                onClick={() => onSaveRow(c)}
                                                                disabled={!isEdited || updateComponent.isPending}
                                                                title="Save changes"
                                                                className={`p-2 rounded-lg transition-all ${isEdited ? 'bg-[var(--primary)] text-white shadow-sm' : 'bg-[var(--surface-2)] text-[var(--muted)] opacity-40'}`}
                                                            >
                                                                <Save size={14} />
                                                            </button>
                                                        </td>
                                                    </tr>
                                                );
                                            })}
                                        </tbody>
                                    </table>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};
