
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import {
    Sun, Moon, LogOut, LayoutDashboard,
    Building2, Users, ClipboardList, Menu, X, Bell,
    ChevronRight, CalendarClock, FileText, GitBranch, Send, Inbox,
    Microscope,
    ClipboardClockIcon
} from 'lucide-react';
import { useState } from 'react';
import { useThemeStore } from '../store/themeStore';
import { UserRole } from '../types';

type NavItem = {
    label: string;
    icon: React.ReactNode;
    path: string;
    badge?: number;
};

type NavSection = {
    section?: string;
    items: NavItem[];
};

const roleColor: Record<string, string> = {
    Admin: 'badge badge-red',
    LabIncharge: 'badge badge-purple',
    Assistant: 'badge badge-blue',
    Student: 'badge badge-green',
    Professor: 'badge badge-purple',
    HOD: 'badge badge-blue',
    Accountant: 'badge badge-green',
};

const roleLabel: Record<string, string> = {
    Student: 'Student',
    Admin: 'Administrator',
    Assistant: 'Lab Assistant',
    LabIncharge: 'Lab In-Charge',
    Professor: 'Professor',
    HOD: 'Head of Department',
    Accountant: 'Accounts Officer',
};

export const AppLayout = () => {
    const { user, logout } = useAuthStore();
    const navigate = useNavigate();
    const location = useLocation();
    const { mode, toggle } = useThemeStore();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const initials = user?.name
        ? user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)
        : '?';

    const role = user?.roles?.[0] ?? '';

    // Build nav based on role
    const nav: NavSection[] = [];

    if (user?.roles?.includes(UserRole.ADMIN)) {
        nav.push({
            items: [
                { label: 'Overview', icon: <LayoutDashboard size={16} />, path: '/dashboard' },
            ]
        });
        nav.push({
            section: 'Lab Infrastructure',
            items: [
                { label: 'Laboratories', icon: <Building2 size={16} />, path: '/admin/labs' },
                { label: 'Equipment', icon: <Microscope size={16} />, path: '/admin/components' },
                { label: 'Users', icon: <Users size={16} />, path: '/admin/users' },
                { label: 'All Bookings', icon: <ClipboardList size={16} />, path: '/admin/bookings' },
            ]
        });
        nav.push({
            section: 'Application Management',
            items: [
                { label: 'All Applications', icon: <FileText size={16} />, path: '/applications/all' },
                { label: 'Hierarchy Config', icon: <GitBranch size={16} />, path: '/admin/hierarchy' },
            ]
        });
    }

    if (user?.roles?.includes(UserRole.LAB_INCHARGE) && !user.roles.includes(UserRole.ADMIN)) {
        nav.push({
            items: [
                { label: 'Booking Requests', icon: <LayoutDashboard size={16} />, path: '/dashboard' },
            ]
        });
    }

    if (user?.roles?.includes(UserRole.ASSISTANT) && !user.roles.includes(UserRole.ADMIN) && !user.roles.includes(UserRole.LAB_INCHARGE)) {
        nav.push({
            items: [
                { label: 'My Tasks', icon: <ClipboardList size={16} />, path: '/dashboard' },
            ]
        });
    }

    if (user?.roles?.includes(UserRole.STUDENT) && !user.roles.includes(UserRole.ADMIN)) {
        nav.push({
            section: 'Lab Infrastructure',
            items: [
                { label: 'Laboratories', icon: <Building2 size={16} />, path: '/student/labs' },
                { label: 'My Bookings', icon: <CalendarClock size={16} />, path: '/student/bookings' },
            ]
        });
        nav.push({
            section: 'Application Management',
            items: [
                { label: 'New Application', icon: <Send size={16} />, path: '/applications/new' },
                { label: 'My Applications', icon: <FileText size={16} />, path: '/applications/my' },
            ]
        });
    }

    if (user?.roles?.includes(UserRole.PROFESSOR) && !user.roles.includes(UserRole.ADMIN)) {
        nav.push({
            items: [{ label: 'Overview', icon: <LayoutDashboard size={16} />, path: '/dashboard' }]
        });
        nav.push({
            section: 'Application Management',
            items: [
                { label: 'Review Queue', icon: <Inbox size={16} />, path: '/applications/review' },
                { label: 'Review History', icon: <ClipboardClockIcon size={16} />, path: '/applications/history' },
            ]
        });
    }

    if (user?.roles?.includes(UserRole.HOD) && !user.roles.includes(UserRole.ADMIN)) {
        nav.push({
            items: [{ label: 'Overview', icon: <LayoutDashboard size={16} />, path: '/dashboard' }]
        });
        nav.push({
            section: 'Application Management',
            items: [
                { label: 'HOD Review Queue', icon: <Inbox size={16} />, path: '/applications/review' },
                { label: 'Review History', icon: <ClipboardClockIcon size={16} />, path: '/applications/history' },
            ]
        });
    }

    if (user?.roles?.includes(UserRole.ACCOUNTANT) && !user.roles.includes(UserRole.ADMIN)) {
        nav.push({
            items: [{ label: 'Overview', icon: <LayoutDashboard size={16} />, path: '/dashboard' }]
        });
        nav.push({
            section: 'Application Management',
            items: [
                { label: 'Accounts Queue', icon: <Inbox size={16} />, path: '/applications/review' },
                { label: 'Review History', icon: <ClipboardClockIcon size={16} />, path: '/applications/history' },
            ]
        });
    }

    const isActive = (path: string) => {
        if (path === '/dashboard') return location.pathname === '/dashboard';
        return location.pathname.startsWith(path);
    };

    const SidebarContent = () => (
        <div className="flex flex-col h-full">
            {/* Logo */}
            <div
                className="flex items-center gap-2.5 px-4 py-4 cursor-pointer border-b border-[color:var(--border)] shrink-0"
                onClick={() => { navigate('/dashboard'); setSidebarOpen(false); }}
            >
                <div className="w-11 h-11 bg-white rounded-xl flex items-center justify-center shadow-premium shrink-0 overflow-hidden border border-[var(--border)]">
                    <img src="/Logo.png" alt="LIAMS Logo" className="w-full h-full object-contain p-0.5" />
                </div>
                <div>
                    <p className="font-bold text-[15px] text-[var(--text)] leading-tight">LIAMS</p>
                    <p className="text-[10px] text-[var(--muted)] font-medium leading-tight">Lab Infrastructure and Application Management</p>
                    <p className="text-[9px] text-[var(--muted)] opacity-60 font-bold uppercase tracking-wider mt-0.5">IITD–MSE Department</p>
                </div>
            </div>

            {/* Nav */}
            <nav className="flex-1 py-4 px-3 space-y-5 overflow-y-auto">

                {nav.map((section, si) => (
                    <div key={si}>
                        {section.section && (
                            <p className="sidebar-section-label mb-2">{section.section}</p>
                        )}
                        <div className="space-y-0.5">
                            {section.items.map(item => (
                                <button
                                    key={item.path}
                                    onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                                    className={`sidebar-item w-full text-left ${isActive(item.path) ? 'sidebar-item-active' : ''}`}
                                >
                                    <span className="shrink-0">{item.icon}</span>
                                    <span className="flex-1">{item.label}</span>
                                    {item.badge !== undefined && item.badge > 0 && (
                                        <span className="ml-auto px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-[var(--primary)] text-white">
                                            {item.badge}
                                        </span>
                                    )}
                                    {isActive(item.path) && <ChevronRight size={12} className="ml-auto opacity-60" />}
                                </button>
                            ))}
                        </div>
                    </div>
                ))}
            </nav>

            {/* User Profile at bottom */}
            <div className="border-t border-[color:var(--border)] p-3 shrink-0">
                <div className="flex items-center gap-3 px-2 py-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors group">
                    <div className="avatar w-8 h-8 text-xs shrink-0">{initials}</div>
                    <div className="flex-1 min-w-0">
                        <p className="text-[13px] font-semibold text-[var(--text)] truncate">{user?.name}</p>
                        <span className={roleColor[role] || 'badge badge-gray'} style={{ fontSize: '9px', padding: '1px 6px' }}>
                            {roleLabel[role] ?? role}
                        </span>
                    </div>
                    <button
                        onClick={handleLogout}
                        title="Sign out"
                        className="p-1.5 rounded-lg text-[var(--muted)] hover:text-red-500 hover:bg-red-50 transition-colors"
                    >
                        <LogOut size={14} />
                    </button>
                </div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen flex" style={{ background: 'var(--bg)' }}>
            {/* ── Desktop Sidebar ── */}
            <aside className="sidebar hidden md:flex">
                <SidebarContent />
            </aside>

            {/* ── Mobile Sidebar Overlay ── */}
            {sidebarOpen && (
                <>
                    <div
                        className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-md md:hidden animate-in fade-in duration-200"
                        onClick={() => setSidebarOpen(false)}
                    />
                    <aside
                        className="sidebar flex md:hidden z-[60] animate-in slide-in-from-left duration-250 mesh-gradient"
                        style={{ position: 'fixed' }}
                    >
                        <div className="absolute top-3 right-3">
                            <button onClick={() => setSidebarOpen(false)} className="p-1.5 rounded-lg hover:bg-[var(--surface-2)]">
                                <X size={16} />
                            </button>
                        </div>
                        <SidebarContent />
                    </aside>
                </>
            )}

            {/* ── Main Area ── */}
            <div className="flex-1 flex flex-col min-h-screen md:ml-[240px] transition-[margin] duration-200">

                {/* ── Header ── */}
                <header className="top-header">
                    {/* Mobile hamburger */}
                    <button
                        className="md:hidden p-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors"
                        onClick={() => setSidebarOpen(true)}
                    >
                        <Menu size={18} />
                    </button>

                    {/* Mobile Logo Branding */}
                    <div className="md:hidden flex items-center gap-2.5 ml-1" onClick={() => navigate('/dashboard')}>
                        <div className="w-8 h-8 bg-white rounded-lg flex items-center justify-center shadow-sm shrink-0 overflow-hidden border border-[var(--border)]">
                            <img src="/Logo.png" alt="LIAMS Logo" className="w-full h-full object-contain p-0.5" />
                        </div>
                        <div className="flex flex-col">
                            <span className="font-black text-xs tracking-tighter text-[var(--primary)] uppercase leading-none">LIAMS</span>
                            <span className="text-[7px] text-[var(--muted)] font-bold uppercase tracking-widest leading-none mt-0.5">IIT Delhi</span>
                        </div>
                    </div>

                    {/* Spacer */}
                    <div className="flex-1" />

                    {/* Actions */}
                    <div className="flex items-center gap-1">
                        {/* Mobile Avatar */}
                        <div className="md:hidden mr-2">
                            <div className="avatar w-7 h-7 text-[9px] shadow-sm border border-[var(--border)]">{initials}</div>
                        </div>
                        <button
                            onClick={toggle}
                            className="p-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors"
                            title={mode === 'dark' ? 'Light mode' : 'Dark mode'}
                        >
                            {mode === 'dark'
                                ? <Sun size={16} className="text-[var(--muted)]" />
                                : <Moon size={16} className="text-[var(--muted)]" />}
                        </button>
                        <button className="p-2 rounded-lg hover:bg-[var(--surface-2)] transition-colors relative" title="Notifications">
                            <Bell size={16} className="text-[var(--muted)]" />
                        </button>
                        <button
                            onClick={handleLogout}
                            className="p-2 rounded-lg hover:bg-red-50 text-[var(--muted)] hover:text-red-600 transition-colors"
                            title="Sign out"
                        >
                            <LogOut size={16} />
                        </button>
                    </div>
                </header>

                {/* ── Page Content ── */}
                <main className="flex-1 p-4 pb-24 md:p-8 md:pb-8 page-enter">

                    <Outlet />
                </main>
            </div>

            {/* ── Mobile Bottom Navigation ── */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[var(--surface)]/80 backdrop-blur-xl border-t border-[color:var(--border)] pb-[env(safe-area-inset-bottom)] shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
                <div className="flex items-center justify-around h-16 px-1.5">
                    {nav.flatMap(s => s.items).slice(0, 5).map(item => (
                        <button
                            key={item.path}
                            onClick={() => { navigate(item.path); setSidebarOpen(false); }}
                            className={`flex flex-col items-center justify-center w-full h-full gap-1 transition-all ${isActive(item.path) ? 'text-[var(--primary)]' : 'text-[var(--muted)] opacity-60 hover:opacity-100'}`}
                        >
                            <div className={`p-1.5 rounded-xl transition-all ${isActive(item.path) ? 'bg-[var(--primary)] text-white scale-110 shadow-lg shadow-blue-500/20' : ''}`}>
                                {item.icon}
                            </div>
                            <span className={`text-[9px] font-black tracking-tighter uppercase ${isActive(item.path) ? 'opacity-100 translate-y-0' : 'opacity-80 translate-y-0.5'}`}>
                                {item.label.split(' ')[0]}
                            </span>
                        </button>
                    ))}
                </div>
            </nav>

            {/* Remove the inline style tag and use responsive classes instead */}
        </div>
    );
};
