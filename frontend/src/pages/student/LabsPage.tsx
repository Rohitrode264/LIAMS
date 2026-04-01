
import { useState } from 'react';
import { useLabs } from '../../hooks/useInventory';
import type { Lab } from '../../types';
import { Building2, ArrowRight, Search, MapPin, Users } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const LabsPage = () => {
    const { data, isLoading } = useLabs(1, 50);
    const navigate = useNavigate();
    const [search, setSearch] = useState('');

    const allLabs: Lab[] = data?.labs || [];
    const labs = allLabs.filter(l =>
        l.name.toLowerCase().includes(search.toLowerCase()) ||
        (l.location || '').toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="page-enter">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-xl font-bold text-[var(--text)]">Laboratories</h1>
                    <p className="text-sm text-[var(--muted)] mt-0.5 font-medium">Browse facilities and book equipment for your projects.</p>
                </div>
                <div className="relative w-full sm:w-64">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                    <input
                        type="text"
                        placeholder="Search laboratories..."
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="form-input pl-9 h-9 text-sm"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {isLoading ? (
                    Array.from({ length: 6 }).map((_, i) => (
                        <div key={i} className="h-44 rounded-xl animate-pulse bg-[var(--surface-2)]" />
                    ))
                ) : (
                    labs.map((lab: Lab) => (
                        <div
                            key={lab._id}
                            onClick={() => navigate(`/student/lab/${lab._id}`)}
                            className="card group cursor-pointer p-5 hover:border-[var(--primary)] transition-all duration-200"
                        >
                            {/* Accent bar */}
                            <div className="w-full h-1 rounded-full bg-[var(--primary)] mb-5 opacity-60 group-hover:opacity-100 transition-opacity" />
                            <div className="flex items-start gap-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-[var(--primary-muted)] flex items-center justify-center shrink-0">
                                    <Building2 className="text-[var(--primary)] w-5 h-5" />
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-semibold text-[var(--text)] truncate">{lab.name}</h3>
                                    {lab.location && (
                                        <div className="flex items-center gap-1 text-[11px] text-[var(--muted)] mt-0.5">
                                            <MapPin size={10} />
                                            <span>{lab.location}</span>
                                        </div>
                                    )}
                                </div>
                                <span className={`badge ${lab.status === 'Active' ? 'badge-green' : 'badge-gray'} shrink-0`}>
                                    {lab.status}
                                </span>
                            </div>

                            <p className="text-[12px] text-[var(--muted)] leading-relaxed mb-4 line-clamp-2">
                                {lab.description || 'Modern facility for advanced research and computational projects.'}
                            </p>

                            <div className="flex items-center justify-between mt-auto pt-3 border-t border-[color:var(--border)]">
                                {lab.assistant_ids && (
                                    <div className="flex items-center gap-1 text-[11px] text-[var(--muted)]">
                                        <Users size={11} />
                                        <span>{lab.assistant_ids.length} assistant{lab.assistant_ids.length !== 1 ? 's' : ''}</span>
                                    </div>
                                )}
                                <div className="flex items-center gap-1 text-[12px] font-semibold text-[var(--primary)] ml-auto">
                                    <span>View Equipment</span>
                                    <ArrowRight size={13} className="-translate-x-1 group-hover:translate-x-0 transition-transform" />
                                </div>
                            </div>
                        </div>
                    ))
                )}

                {!isLoading && labs.length === 0 && (
                    <div className="col-span-full card py-20 flex flex-col items-center justify-center text-center border-dashed">
                        <Building2 className="w-10 h-10 text-[var(--muted)] mb-4 opacity-30" />
                        <h3 className="text-base font-semibold text-[var(--text)] mb-1">No Labs Found</h3>
                        <p className="text-sm text-[var(--muted)]">{search ? 'No labs match your search.' : 'No active laboratories available.'}</p>
                    </div>
                )}
            </div>
        </div>
    );
};

// Keep backward-compat alias
export { LabsPage as StudentLabsPage };
