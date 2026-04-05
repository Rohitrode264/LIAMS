
import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { History, ChevronRight, Loader2, IndianRupee, Search, Calendar } from 'lucide-react';
import { useAuthStore } from '../../store/authStore';
import { getReviewHistory } from '../../api/applicationApi';
import { UserRole } from '../../types';
import type { Application } from '../../types';
import { PageHeader } from '../../components/PageHeader';
import { useState } from 'react';
import { Pagination } from '../../components/Pagination';

export const ReviewHistoryPage = () => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    const [searchTerm, setSearchTerm] = useState('');
    const [page, setPage] = useState(1);
    const roles = user?.roles ?? [];

    const isProfessor = roles.includes(UserRole.PROFESSOR);
    const isHOD = roles.includes(UserRole.HOD);
    const isAccountant = roles.includes(UserRole.ACCOUNTANT);

    const { data: historyData, isLoading } = useQuery({
        queryKey: ['review-history', user?._id, page],
        queryFn: () => getReviewHistory(page, 10),
        enabled: isProfessor || isHOD || isAccountant,
    });

    const history = historyData?.applications || [];
    const totalPages = historyData?.pagination?.pages || 0;

    const filteredHistory = history.filter((app: Application) =>
        app.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.student_id?.name?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="page-enter space-y-6">
            <PageHeader
                title="Review History"
                subtitle="A comprehensive record of all applications you have reviewed and authorized."
            />

            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative w-full sm:max-w-xs">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--muted)]" size={16} />
                    <input
                        type="text"
                        placeholder="Search current page..."
                        className="w-full pl-10 pr-4 py-2 bg-[var(--surface)] border border-[color:var(--border)] rounded-lg outline-none focus:border-[var(--primary)] text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-2 text-[var(--muted)] text-xs font-medium bg-[var(--surface-2)] px-3 py-1.5 rounded-full">
                    <Calendar size={14} />
                    <span>Total Review Tasks: {historyData?.pagination?.total || 0}</span>
                </div>
            </div>

            {isLoading ? (
                <div className="flex justify-center py-20">
                    <Loader2 size={24} className="animate-spin text-[var(--primary)]" />
                </div>
            ) : filteredHistory.length === 0 ? (
                <div className="card py-24 flex flex-col items-center text-center">
                    <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center text-gray-400 mb-4">
                        <History size={28} />
                    </div>
                    <h3 className="text-base font-bold text-[var(--text)]">No History Found</h3>
                    <p className="text-sm text-[var(--muted)] mt-1 max-w-[280px]">
                        {searchTerm ? "No results match your search on this page." : "You haven't authorized any applications yet."}
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    <div className="card overflow-hidden bg-[var(--surface)] shadow-sm">
                        {/* Desktop Table View */}
                        <div className="hidden md:block overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Applicant</th>
                                        <th>Title</th>
                                        <th>Amount</th>
                                        <th>Decision Date</th>
                                        <th>Final Status</th>
                                        <th></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredHistory.map((app: Application) => (
                                        <tr
                                            key={app._id}
                                            className="hover:bg-gray-50/50 cursor-pointer"
                                            onClick={() => navigate(`/applications/${app._id}`)}
                                        >
                                            <td>
                                                <div className="flex items-center gap-3">
                                                    <div className="avatar w-8 h-8 text-[11px] shadow-sm">
                                                        {app.student_id?.name?.slice(0, 2).toUpperCase()}
                                                    </div>
                                                    <span className="font-semibold text-sm">{app.student_id?.name || 'Unknown'}</span>
                                                </div>
                                            </td>
                                            <td className="max-w-[280px]">
                                                <p className="truncate font-medium text-sm">{app.title}</p>
                                                <p className="text-[11px] text-[var(--muted)] truncate mt-0.5">ID: {app._id.slice(-8).toUpperCase()}</p>
                                            </td>
                                            <td>
                                                <div className="flex items-center gap-1 font-bold text-sm text-[var(--text)]">
                                                    <IndianRupee size={12} className="text-[var(--muted)]" />
                                                    {app.amount_requested.toLocaleString('en-IN')}
                                                </div>
                                            </td>
                                            <td className="text-[var(--muted)] text-[12px]">
                                                {new Date(app.updatedAt).toLocaleDateString('en-IN', {
                                                    day: 'numeric',
                                                    month: 'short',
                                                    year: 'numeric'
                                                })}
                                            </td>
                                            <td>
                                                <span className={`badge text-[10px] font-bold ${app.status === 'Approved' ? 'badge-green' :
                                                    app.status === 'Rejected' ? 'badge-red' : 'badge-amber'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                            <td>
                                                <div className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-white hover:shadow-sm transition-all group">
                                                    <ChevronRight size={14} className="text-[var(--muted)] group-hover:text-[var(--primary)]" />
                                                </div>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>

                        {/* Mobile Card View */}
                        <div className="md:hidden divide-y divide-[var(--border)]">
                            {filteredHistory.map((app: Application) => (
                                <div
                                    key={app._id}
                                    onClick={() => navigate(`/applications/${app._id}`)}
                                    className="p-5 space-y-4 hover:bg-[var(--surface-2)] transition-colors cursor-pointer"
                                >
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-3">
                                            <div className="avatar w-9 h-9 text-[10px] font-bold shadow-sm">
                                                {app.student_id?.name?.slice(0, 2).toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-[13px] font-black text-[var(--text)] leading-none mb-1">
                                                    {app.student_id?.name || 'Unknown'}
                                                </p>
                                                <p className="text-[9px] text-[var(--muted)] font-black uppercase tracking-widest opacity-60">
                                                    Authorised: {new Date(app.updatedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`badge text-[9px] font-black uppercase tracking-tighter ${app.status === 'Approved' ? 'badge-green' :
                                            app.status === 'Rejected' ? 'badge-red' : 'badge-amber'
                                            }`}>
                                            {app.status}
                                        </span>
                                    </div>

                                    <div>
                                        <p className="text-[12px] font-bold text-[var(--text)] line-clamp-1">{app.title}</p>
                                        <p className="text-[10px] text-[var(--muted)] opacity-70 mt-0.5">ID: {app._id.slice(-8).toUpperCase()}</p>
                                    </div>

                                    <div className="flex items-center justify-between pt-1">
                                        <div className="flex items-center gap-1 text-[var(--text)] font-black">
                                            <IndianRupee size={11} className="text-[var(--muted)]" />
                                            <span className="text-[14px] tracking-tight">
                                                {app.amount_requested.toLocaleString('en-IN')}
                                            </span>
                                        </div>
                                        <div className="text-[10px] font-bold text-[var(--muted)] flex items-center gap-1">
                                            View Archive <ChevronRight size={12} />
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
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
