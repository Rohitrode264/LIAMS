
import { useState } from 'react';
import { createPortal } from 'react-dom';
import { useUsersList } from '../../hooks/useUsers';
import { useUpdateUser, useCreateUser } from '../../hooks/useAdminActions';
import { UserPlus, Eye, EyeOff, X, Search, Mail } from 'lucide-react';
import type { User, Lab } from '../../types';
import { UserRole } from '../../types';
import { useLabs } from '../../hooks/useInventory';
import { PageHeader } from '../../components/PageHeader';



const avatarColors: Record<string, string> = {
    Admin: 'bg-red-50 text-red-600',
    LabIncharge: 'bg-purple-50 text-purple-600',
    Assistant: 'bg-blue-50 text-blue-600',
    Student: 'bg-green-50 text-green-600',
    Professor: 'bg-purple-50 text-purple-600',
    HOD: 'bg-red-50 text-red-600',
    Accountant: 'bg-blue-50 text-blue-600',
};

const CreateUserModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [role, setRole] = useState<UserRole>(UserRole.STUDENT);
    const [selectedLabs, setSelectedLabs] = useState<string[]>([]);
    const [showPass, setShowPass] = useState(false);
    const createUser = useCreateUser();
    const { data: labsData } = useLabs(1, 100);

    const toggleLab = (id: string) => {
        setSelectedLabs(prev =>
            prev.includes(id) ? prev.filter(l => l !== id) : [...prev, id]
        );
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        createUser.mutate(
            { name, email, password, roles: [role], labs_assigned: selectedLabs },
            { onSuccess: () => { onClose(); setName(''); setEmail(''); setPassword(''); setRole(UserRole.STUDENT); setSelectedLabs([]); } }
        );
    };

    if (!isOpen) return null;
    return createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6 bg-slate-950/40 backdrop-blur-xl animate-in fade-in duration-300">
            <div
                className="absolute inset-0 bg-slate-950/40"
                onClick={onClose}
            />
            <div className="bg-[var(--surface)] w-full max-w-md rounded-[2rem] shadow-[0_32px_120px_-20px_rgba(0,0,0,0.8)] border border-[color:var(--border)] max-h-[min(90vh,600px)] flex flex-col overflow-hidden relative z-10 animate-in zoom-in-95 slide-in-from-bottom-5 duration-500">
                <div className="flex items-center justify-between px-8 py-6 border-b border-[color:var(--border)] shrink-0">
                    <h2 className="text-xl font-black tracking-tight">Add New User</h2>
                    <button onClick={onClose} className="p-2 rounded-xl hover:bg-[var(--surface-2)] transition-colors"><X size={18} /></button>
                </div>
                <div className="overflow-y-auto custom-scrollbar p-8">
                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Full Name</label>
                            <input required value={name} onChange={e => setName(e.target.value)} className="form-input rounded-xl bg-[var(--surface-2)] border-transparent focus:bg-[var(--surface)]" placeholder="John Doe" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Email Address</label>
                            <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="form-input rounded-xl bg-[var(--surface-2)] border-transparent focus:bg-[var(--surface)]" placeholder="john@iitd.ac.in" />
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Password</label>
                            <div className="relative">
                                <input required type={showPass ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} className="form-input rounded-xl bg-[var(--surface-2)] border-transparent focus:bg-[var(--surface)] pr-10" placeholder="••••••••" />
                                <button type="button" onClick={() => setShowPass(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted)] hover:text-[var(--text)]">
                                    {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                        <div className="space-y-1.5">
                            <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider ml-1">User Role</label>
                            <select value={role} onChange={e => setRole(e.target.value as UserRole)} className="form-input rounded-xl bg-[var(--surface-2)] border-transparent focus:bg-[var(--surface)] font-semibold">
                                <option value={UserRole.STUDENT}>Student</option>
                                <option value={UserRole.LAB_INCHARGE}>Lab In-Charge</option>
                                <option value={UserRole.ASSISTANT}>Lab Assistant</option>
                                <option value={UserRole.PROFESSOR}>Professor</option>
                                <option value={UserRole.HOD}>Head of Department</option>
                                <option value={UserRole.ACCOUNTANT}>Accountant</option>
                                <option value={UserRole.ADMIN}>Administrator</option>
                            </select>
                        </div>

                        {(role === UserRole.LAB_INCHARGE || role === UserRole.ASSISTANT) && (
                            <div className="space-y-1.5">
                                <label className="block text-xs font-bold text-[var(--muted)] uppercase tracking-wider ml-1">Assign Lab(s)</label>
                                <div className="flex flex-wrap gap-2 p-3 rounded-xl bg-[var(--surface-2)] min-h-[50px]">
                                    {labsData?.labs?.map((lab: Lab) => (
                                        <button
                                            key={lab._id}
                                            type="button"
                                            onClick={() => toggleLab(lab._id)}
                                            className={`px-3 py-1 rounded-lg text-xs font-bold border transition-all ${selectedLabs.includes(lab._id)
                                                ? 'bg-[var(--primary)] border-[var(--primary)] text-white shadow-md'
                                                : 'bg-[var(--surface)] border-[color:var(--border)] text-[var(--muted)]'
                                                }`}
                                        >
                                            {lab.name}
                                        </button>
                                    ))}
                                    {(!labsData?.labs || labsData.labs.length === 0) && (
                                        <p className="text-[11px] text-[var(--muted)] italic">No labs available to assign.</p>
                                    )}
                                </div>
                            </div>
                        )}
                        <div className="flex gap-4 pt-4">
                            <button type="button" onClick={onClose} className="btn-secondary h-12 flex-1 rounded-xl font-bold">Cancel</button>
                            <button type="submit" disabled={createUser.isPending} className="btn-primary h-12 flex-1 rounded-xl font-bold shadow-lg shadow-blue-500/20">
                                {createUser.isPending ? 'Adding…' : 'Add User'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>,
        document.body
    );
};

export const UsersPage = () => {
    const { data: usersData, isLoading } = useUsersList();
    const { data: labsData } = useLabs(1, 50);
    const updateUser = useUpdateUser();
    const [isCreateOpen, setIsCreateOpen] = useState(false);
    const [search, setSearch] = useState('');
    const [activeTab, setActiveTab] = useState<'students' | 'faculty'>('students');

    const allUsers: User[] = usersData || [];
    const searchFiltered = allUsers.filter(u =>
        u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
    );

    const users = searchFiltered.filter(u => {
        const isStudent = u.roles?.includes(UserRole.STUDENT) && u.roles.length === 1;
        if (activeTab === 'students') return isStudent || (!u.roles?.length);
        return !isStudent && u.roles?.length > 0;
    });

    const handleAssignLab = (user: User, labId: string) => {
        const currentLabs = user.labs_assigned || [];
        const isAssigned = currentLabs.includes(labId);

        let newLabs: string[];
        if (isAssigned) {
            newLabs = currentLabs.filter(id => id !== labId);
        } else {
            newLabs = [...currentLabs, labId];
        }

        updateUser.mutate({ id: user._id, labs_assigned: newLabs });
    };

    const handleRoleChange = (user: User, role: UserRole) => {
        updateUser.mutate({ id: user._id, roles: [role] });
    };

    return (
        <div className="page-enter space-y-6">
            <PageHeader
                title="Users & Access"
                subtitle="Manage roles and lab assignments for all users."
                action={
                    <button onClick={() => setIsCreateOpen(true)} className="btn-primary btn text-[13px]">
                        <UserPlus size={14} /> Add User
                    </button>
                }
            />

            {/* Search & Tabs */}
            <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center">
                <div className="flex bg-[var(--surface-2)] p-1 rounded-xl">
                    <button
                        className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'students' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
                        onClick={() => setActiveTab('students')}
                    >
                        Students
                    </button>
                    <button
                        className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-colors ${activeTab === 'faculty' ? 'bg-[var(--surface)] text-[var(--text)] shadow-sm' : 'text-[var(--muted)] hover:text-[var(--text)]'}`}
                        onClick={() => setActiveTab('faculty')}
                    >
                        Faculty & Staff
                    </button>
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--muted)]" />
                    <input
                        type="text"
                        placeholder="Search users…"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        className="form-input pl-9 h-9 text-sm w-full"
                    />
                </div>
            </div>

            {/* Users List */}
            <div className="card overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <table className="data-table">
                        <thead>
                            <tr>
                                <th>User</th>
                                <th>Role</th>
                                <th>Assigned Lab</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            {isLoading ? (
                                Array.from({ length: 5 }).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={4}><div className="h-8 rounded-lg bg-[var(--surface-2)] animate-pulse" /></td>
                                    </tr>
                                ))
                            ) : users.map((user: User) => {
                                const primaryRole = user.roles?.[0] ?? '';
                                const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                const avatarCls = avatarColors[primaryRole] || 'bg-[var(--surface-2)] text-[var(--muted)]';
                                const showLabAssign = user.roles?.includes(UserRole.LAB_INCHARGE) || user.roles?.includes(UserRole.ASSISTANT);
                                return (
                                    <tr key={user._id}>
                                        <td>
                                            <div className="flex items-center gap-3">
                                                <div className={`avatar w-8 h-8 text-[11px] shrink-0 ${avatarCls}`}>{initials}</div>
                                                <div>
                                                    <p className="font-semibold text-[var(--text)] text-[13px]">{user.name}</p>
                                                    <p className="text-[11px] text-[var(--muted)] flex items-center gap-1 mt-0.5">
                                                        <Mail size={9} />{user.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td>
                                            <select
                                                className="form-input text-[12px] py-1.5 w-36"
                                                value={primaryRole}
                                                onChange={e => handleRoleChange(user, e.target.value as UserRole)}
                                            >
                                                <option value={UserRole.ADMIN}>Administrator</option>
                                                <option value={UserRole.LAB_INCHARGE}>Lab In-Charge</option>
                                                <option value={UserRole.ASSISTANT}>Assistant</option>
                                                <option value={UserRole.STUDENT}>Student</option>
                                                <option value={UserRole.PROFESSOR}>Professor</option>
                                                <option value={UserRole.HOD}>Head of Department</option>
                                                <option value={UserRole.ACCOUNTANT}>Accountant</option>
                                            </select>
                                        </td>
                                        <td>
                                            {showLabAssign ? (
                                                <div className="flex flex-wrap gap-1 max-w-[200px]">
                                                    {labsData?.labs?.map((lab: Lab) => {
                                                        const isAssigned = (user.labs_assigned || []).includes(lab._id);
                                                        return (
                                                            <button
                                                                key={lab._id}
                                                                onClick={() => handleAssignLab(user, lab._id)}
                                                                className={`px-2 py-0.5 rounded-full text-[10px] font-bold border transition-all ${isAssigned
                                                                    ? 'bg-[var(--primary)] border-[var(--primary)] text-white'
                                                                    : 'bg-transparent border-[color:var(--border)] text-[var(--muted)] hover:border-[var(--muted)]'
                                                                    }`}
                                                            >
                                                                {lab.name}
                                                            </button>
                                                        );
                                                    })}
                                                    {(!labsData?.labs || labsData.labs.length === 0) && (
                                                        <span className="text-[11px] text-[var(--muted)]">No labs available</span>
                                                    )}
                                                </div>
                                            ) : (
                                                <span className="text-[12px] text-[var(--muted)] italic">N/A</span>
                                            )}
                                        </td>
                                        <td>
                                            <span className={`badge ${user.status === 'Active' ? 'badge-green' : 'badge-red'}`}>{user.status}</span>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Mobile Card Grid View */}
                <div className="md:hidden">
                    {isLoading ? (
                        <div className="grid grid-cols-1 gap-4">
                            {[...Array(4)].map((_, i) => (
                                <div key={i} className="card p-5 h-40 animate-pulse bg-[var(--surface-2)]" />
                            ))}
                        </div>
                    ) : users.length === 0 ? (
                        <div className="card p-12 text-center text-[var(--muted)] text-sm border-dashed">
                            {search ? 'No users match your search.' : 'No users found.'}
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {users.map((user: User) => {
                                const primaryRole = user.roles?.[0] ?? '';
                                const initials = user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                const avatarCls = avatarColors[primaryRole] || 'bg-[var(--surface-2)] text-[var(--muted)]';
                                const showLabAssign = user.roles?.includes(UserRole.LAB_INCHARGE) || user.roles?.includes(UserRole.ASSISTANT);

                                return (
                                    <div key={user._id} className="card p-5 space-y-5 animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex items-start justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className={`avatar w-12 h-12 text-sm font-black shrink-0 shadow-sm ${avatarCls}`}>{initials}</div>
                                                <div className="min-w-0">
                                                    <h4 className="font-black text-[var(--text)] tracking-tight truncate">{user.name}</h4>
                                                    <p className="text-[11px] text-[var(--muted)] flex items-center gap-1 mt-1 font-medium truncate">
                                                        <Mail size={10} /> {user.email}
                                                    </p>
                                                </div>
                                            </div>
                                            <span className={`badge ${user.status === 'Active' ? 'badge-green' : 'badge-red'} text-[9px] font-black uppercase tracking-tighter`}>{user.status}</span>
                                        </div>

                                        <div className="space-y-4">
                                            <div className="space-y-1.5 group">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] ml-1 group-focus-within:text-[var(--primary)] transition-colors">Security Role</p>
                                                <select
                                                    className="form-input text-xs py-2.5 bg-[var(--surface-2)] border-transparent font-black focus:bg-white transition-all shadow-sm"
                                                    value={primaryRole}
                                                    onChange={e => handleRoleChange(user, e.target.value as UserRole)}
                                                >
                                                    <option value={UserRole.ADMIN}>Administrator</option>
                                                    <option value={UserRole.LAB_INCHARGE}>Lab In-Charge</option>
                                                    <option value={UserRole.ASSISTANT}>Assistant</option>
                                                    <option value={UserRole.STUDENT}>Student</option>
                                                    <option value={UserRole.PROFESSOR}>Professor</option>
                                                    <option value={UserRole.HOD}>Head of Department</option>
                                                    <option value={UserRole.ACCOUNTANT}>Accountant</option>
                                                </select>
                                            </div>

                                            {showLabAssign && (
                                                <div className="space-y-2">
                                                    <p className="text-[9px] font-black uppercase tracking-widest text-[var(--muted)] ml-1">Lab Access / Assignments</p>
                                                    <div className="flex flex-wrap gap-2 p-4 rounded-2xl bg-[var(--surface-2)] border border-[var(--border)] border-dashed">
                                                        {labsData?.labs?.map((lab: Lab) => (
                                                            <button
                                                                key={lab._id}
                                                                onClick={() => handleAssignLab(user, lab._id)}
                                                                className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-tight transition-all border ${(user.labs_assigned || []).includes(lab._id)
                                                                    ? 'bg-[var(--primary)] text-white border-transparent shadow-md shadow-blue-500/20 scale-105'
                                                                    : 'bg-white text-[var(--muted)] border-[var(--border)] hover:border-[var(--primary)]'
                                                                    }`}
                                                            >
                                                                {lab.name}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </div>

            <CreateUserModal isOpen={isCreateOpen} onClose={() => setIsCreateOpen(false)} />
        </div>
    );
};
