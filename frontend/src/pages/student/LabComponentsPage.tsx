
import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useLabs, useComponentsByLab } from '../../hooks/useInventory';
import type { Component, Lab } from '../../types';
import { Cpu, ChevronLeft, MapPin, Users, Microscope } from 'lucide-react';
import { BookingModal } from '../../components/BookingModal';

const statusConfig = {
    Available: { badge: 'badge-green', dot: 'bg-green-400' },
    Maintenance: { badge: 'badge-amber', dot: 'bg-amber-400' },
    Inactive: { badge: 'badge-gray', dot: 'bg-gray-400' },
};

export const LabComponentsPage = () => {
    const { labId } = useParams();
    const navigate = useNavigate();
    const { data: labsData } = useLabs(1, 100);
    const { data: componentsData, isLoading } = useComponentsByLab(labId || null, 1, 100);
    const [selectedComponent, setSelectedComponent] = useState<Component | null>(null);

    const lab = labsData?.labs?.find((l: Lab) => l._id === labId);
    const components: Component[] = componentsData?.components || [];
    const available = components.filter(c => c.status === 'Available').length;

    return (
        <div className="page-enter space-y-6">
            {/* Breadcrumb */}
            <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-1.5 text-sm font-medium text-[var(--muted)] hover:text-[var(--primary)] transition-colors"
            >
                <ChevronLeft size={16} /> Back to Labs
            </button>

            {/* Lab Header */}
            <div className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <div className="w-11 h-11 rounded-xl bg-[var(--primary-muted)] flex items-center justify-center shrink-0">
                            <Cpu size={20} className="text-[var(--primary)]" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-[var(--text)]">{lab?.name || 'Laboratory'}</h1>
                            <div className="flex items-center gap-3 mt-0.5">
                                {lab?.location && (
                                    <span className="flex items-center gap-1 text-[11px] text-[var(--muted)]">
                                        <MapPin size={10} /> {lab.location}
                                    </span>
                                )}
                                {lab?.assistant_ids && (
                                    <span className="flex items-center gap-1 text-[11px] text-[var(--muted)]">
                                        <Users size={10} /> {lab.assistant_ids.length} staff
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="px-3 py-1.5 rounded-lg bg-[var(--surface-2)] text-[12px] font-medium text-[var(--muted)]">
                            {available} / {components.length} available
                        </div>
                    </div>
                </div>
                {lab?.description && (
                    <p className="text-[13px] text-[var(--muted)] mt-3 pt-3 border-t border-[color:var(--border)]">{lab.description}</p>
                )}
            </div>

            {/* Utilization Bar */}
            {/* {!isLoading && components.length > 0 && (
                <div className="card p-4">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-[11px] font-bold uppercase tracking-widest text-[var(--muted)]">Overall Availability</span>
                        <span className="text-[11px] font-semibold text-[var(--muted)]">{Math.round((available / components.length) * 100)}% available</span>
                    </div>
                    <div className="util-bar">
                        <div
                            className="util-bar-fill bg-green-400"
                            style={{ width: `${(available / components.length) * 100}%` }}
                        />
                    </div>
                    <div className="flex items-center gap-4 mt-2">
                        {(['Available', 'Maintenance', 'Inactive'] as const).map(s => {
                            const count = components.filter(c => c.status === s).length;
                            if (count === 0) return null;
                            return (
                                <div key={s} className="flex items-center gap-1.5">
                                    <Circle size={6} className={`fill-current ${statusConfig[s].dot.replace('bg-', 'text-')}`} />
                                    <span className="text-[11px] font-medium text-[var(--muted)]">{count} {s}</span>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )} */}

            {/* Components Grid */}
            <div className="space-y-2">
                {isLoading ? (
                    Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-20 rounded-xl animate-pulse bg-[var(--surface-2)]" />
                    ))
                ) : (
                    components.map((comp: Component) => {
                        const cfg = statusConfig[comp.status] || statusConfig.Inactive;
                        return (
                            <div key={comp._id} className="card p-4 flex flex-col sm:flex-row sm:items-center gap-4 hover:border-[var(--primary)] transition-all duration-200">
                                {/* <div className={`w-2.5 h-2.5 rounded-full shrink-0 ${cfg.dot}`} /> */}
                                <div className="w-10 h-10 rounded-lg bg-[var(--surface-2)] flex items-center justify-center shrink-0">
                                    <Microscope size={16} className="text-[var(--muted)]" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold text-[var(--text)] truncate">{comp.name}</p>
                                    {comp.description && (
                                        <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">{comp.description}</p>
                                    )}
                                </div>
                                <div className="flex items-center gap-3 shrink-0">
                                    <span className={`badge ${cfg.badge}`}>{comp.status}</span>
                                    <button
                                        onClick={() => setSelectedComponent(comp)}
                                        disabled={comp.status !== 'Available'}
                                        className="btn-primary btn text-[12px] py-1.5 px-4 disabled:opacity-30"
                                    >
                                        Book
                                    </button>
                                </div>
                            </div>
                        );
                    })
                )}

                {!isLoading && components.length === 0 && (
                    <div className="card py-20 flex flex-col items-center text-center border-dashed">
                        <Cpu className="w-8 h-8 text-[var(--muted)] mb-3 opacity-30" />
                        <h3 className="text-base font-semibold text-[var(--text)] mb-1">No Equipment Registered</h3>
                        <p className="text-sm text-[var(--muted)]">This lab has no components yet.</p>
                    </div>
                )}
            </div>

            {selectedComponent && (
                <BookingModal
                    isOpen={!!selectedComponent}
                    onClose={() => setSelectedComponent(null)}
                    component={selectedComponent}
                    labId={labId!}
                />
            )}
        </div>
    );
};
