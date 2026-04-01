import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { UserRole } from '../types';
import { StudentDashboard } from './StudentDashboard';
import { InchargeDashboard } from './InchargeDashboard';
import { AssistantDashboard } from './AssistantDashboard';
import { AdminDashboard } from './AdminDashboard';
import { 
    FlaskConical, FileText, ArrowRight, ClipboardList, 
    Inbox, IndianRupee, History
} from 'lucide-react';
import { PageHeader } from '../components/PageHeader';
import { StatCard } from '../components/StatCard';
import { useQuery } from '@tanstack/react-query';
import { 
    getProfessorQueue, getHODQueue, getAccountsQueue, getReviewHistory 
} from '../api/applicationApi';

const ModuleCard = ({
    icon, title, description, color, onClick,
}: {
    icon: React.ReactNode;
    title: string;
    description: string;
    color: string;
    onClick: () => void;
}) => (
    <button
        onClick={onClick}
        className="card group flex items-start gap-4 p-5 text-left hover:border-[var(--primary)] transition-all duration-200"
    >
        <div className="w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0 shadow-sm" style={{ background: color }}>
            {icon}
        </div>
        <div className="flex-1 min-w-0">
            <h3 className="text-sm font-bold text-[var(--text)]">{title}</h3>
            <p className="text-[11px] text-[var(--muted)] mt-1 leading-relaxed line-clamp-2">{description}</p>
        </div>
        <ArrowRight size={14} className="text-[var(--muted)] group-hover:text-[var(--primary)] transition-all mt-1" />
    </button>
);

const ReviewerDashboard = ({ role }: { role: UserRole }) => {
    const navigate = useNavigate();
    const { user } = useAuthStore();
    
    // Select the appropriate queue function based on role
    const queueFn = role === UserRole.PROFESSOR ? getProfessorQueue 
                   : role === UserRole.HOD ? getHODQueue 
                   : getAccountsQueue;

    const { data: queue = [] } = useQuery({
        queryKey: ['review-queue', role, user?._id],
        queryFn: queueFn
    });

    const { data: history = [], isLoading: loadingHistory } = useQuery({
        queryKey: ['review-history', role, user?._id],
        queryFn: getReviewHistory
    });

    const roleLabel = role === UserRole.PROFESSOR ? 'Professor' 
                    : role === UserRole.HOD ? 'HOD' 
                    : 'Accounts';

    return (
        <div className="page-enter space-y-8">
            <PageHeader 
                title={`${roleLabel} Dashboard`} 
                subtitle="Overview of your review tasks and application history."
            />

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                <StatCard 
                    label="Pending Review" 
                    value={queue.length} 
                    icon={<Inbox size={18} />} 
                    iconColor="bg-amber-50 text-amber-600" 
                    subtitle="Queue size" 
                />
                <StatCard 
                    label="Reviewed Items" 
                    value={history.length} 
                    icon={<History size={18} />} 
                    iconColor="bg-blue-50 text-blue-600" 
                    subtitle="Past decisions" 
                />
                <StatCard 
                    label="Messages" 
                    value="0" 
                    icon={<ClipboardList size={18} />} 
                    iconColor="bg-purple-50 text-purple-600" 
                    subtitle="Latest alerts" 
                />
            </div>

            {/* History Table */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h2 className="text-sm font-bold uppercase tracking-widest text-[var(--muted)]">Recent Decisions</h2>
                    <button 
                        onClick={() => navigate('/applications/history')}
                        className="text-[11px] font-bold text-[var(--primary)] uppercase hover:opacity-80 transition-opacity"
                    >
                        View All History
                    </button>
                </div>

                <div className="card overflow-hidden bg-[var(--surface)]">
                    {loadingHistory ? (
                        <div className="p-8 text-center text-[var(--muted)] animate-pulse">Loading history...</div>
                    ) : history.length === 0 ? (
                        <div className="py-16 flex flex-col items-center text-center">
                            <History className="w-8 h-8 text-[var(--muted)] mb-3 opacity-20" />
                            <p className="text-sm text-[var(--muted)] font-medium">No past applications found</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="data-table">
                                <thead>
                                    <tr>
                                        <th>Applicant</th>
                                        <th className="hidden sm:table-cell">Title</th>
                                        <th>Amount</th>
                                        <th className="hidden md:table-cell">Updated</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {history.slice(0, 5).map((app: any) => (
                                        <tr key={app._id} className="group cursor-pointer" onClick={() => navigate(`/applications/${app._id}`)}>
                                            <td>
                                                <div className="flex items-center gap-2 font-medium">
                                                    {app.student_id?.name || 'Unknown'}
                                                </div>
                                            </td>
                                            <td className="hidden sm:table-cell max-w-[200px] truncate">{app.title}</td>
                                            <td>
                                                <div className="flex items-center gap-1 font-semibold">
                                                    <IndianRupee size={12} />
                                                    {app.amount_requested?.toLocaleString('en-IN')}
                                                </div>
                                            </td>
                                            <td className="hidden md:table-cell text-[var(--muted)] text-[12px]">
                                                {new Date(app.updatedAt).toLocaleDateString('en-IN')}
                                            </td>
                                            <td>
                                                <span className={`badge ${
                                                    app.status === 'Approved' ? 'badge-green' : 
                                                    app.status === 'Rejected' ? 'badge-red' : 'badge-blue'
                                                }`}>
                                                    {app.status}
                                                </span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export const Dashboard = () => {
    const userRoles = useAuthStore((state) => state.user?.roles) || [];

    if (userRoles.includes(UserRole.ADMIN)) return <AdminDashboard />;
    if (userRoles.includes(UserRole.LAB_INCHARGE)) return <InchargeDashboard />;
    if (userRoles.includes(UserRole.ASSISTANT)) return <AssistantDashboard />;
    
    if (userRoles.includes(UserRole.PROFESSOR)) return <ReviewerDashboard role={UserRole.PROFESSOR} />;
    if (userRoles.includes(UserRole.HOD)) return <ReviewerDashboard role={UserRole.HOD} />;
    if (userRoles.includes(UserRole.ACCOUNTANT)) return <ReviewerDashboard role={UserRole.ACCOUNTANT} />;

    return <StudentDashboard />;
};
