import { useState } from 'react';
import { useLogin } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { FlaskConical, Moon, Sun, Mail, Lock } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { mode, toggle } = useThemeStore();

    const loginMutation = useLogin();
    const navigate = useNavigate();

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        loginMutation.mutate(
            { email, password },
            { onSuccess: () => navigate('/dashboard') }
        );
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4 sm:p-8 selection:bg-[var(--primary-muted)] overflow-hidden transition-colors duration-500 relative">
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--primary)]/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-purple-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
            </div>

            <button
                type="button"
                onClick={toggle}
                className="absolute top-6 right-6 p-2.5 rounded-full bg-[var(--surface)] hover:bg-[var(--surface-2)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)] transition-all shadow-sm z-50 active:scale-90"
            >
                {mode === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>

            {/* Main Window */}
            <div className="relative z-10 w-full max-w-5xl flex flex-col lg:flex-row bg-[var(--surface)] border border-[var(--border)] rounded-[2rem] sm:rounded-[2.5rem] shadow-2xl overflow-hidden min-h-[600px]">
                
                {/* Left Branding */}
                <div className="hidden lg:flex flex-col justify-center flex-1 p-16 relative overflow-hidden bg-[var(--surface)]">
                    <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]" style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, currentColor 1px, transparent 0)', backgroundSize: '24px 24px' }} />
                    
                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-12">
                            <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center shadow-lg">
                                <FlaskConical className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold text-[var(--text)] tracking-tight">IITD-MSE</span>
                        </div>
                        
                        <h1 className="text-4xl font-bold text-[var(--text)] tracking-tight leading-tight mb-5">
                            Log in to your account
                        </h1>
                        <p className="text-base text-[var(--muted)] mb-12 max-w-md">
                            Access the Materials Science & Engineering Department laboratory infrastructure and resource management system.
                        </p>

                        <div className="space-y-6">
                            {[
                                { title: 'Centralized Bookings', desc: 'Reserve high-end equipment with real-time availability.' },
                                { title: 'Ensure Compliance', desc: 'Secure institutional access with role-based approvals.' },
                            ].map((feature, i) => (
                                <div key={i} className="flex gap-4">
                                    <div className="mt-1 w-6 h-6 rounded-full bg-[var(--primary)]/10 flex items-center justify-center shrink-0 border border-[var(--primary)]/20">
                                        <div className="w-2 h-2 rounded-full bg-[var(--primary)]" />
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-[var(--text)] text-sm">{feature.title}</h3>
                                        <p className="text-[13px] text-[var(--muted)] mt-1 max-w-[280px] leading-relaxed">{feature.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                    
                    <div className="absolute bottom-10 left-16 text-[var(--muted)]/40 text-[11px] font-bold tracking-widest uppercase">
                        IIT Delhi • Materials Science & Engg
                    </div>
                </div>

                {/* Right Form Card */}
                <div className="flex-1 p-6 sm:p-12 flex items-center justify-center lg:bg-[var(--surface-2)]/40 relative">
                    <div className="w-full max-w-[400px] bg-[var(--surface)] p-8 sm:p-10 rounded-[2rem] border border-[var(--border)] shadow-xl relative z-10">
                        
                        <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                            <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center shadow-lg">
                                <FlaskConical className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold text-[var(--text)] tracking-tight">IITD-MSE</span>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-[13px] font-medium text-[var(--text)]">
                                    Institutional Email
                                </label>
                                <div className="group relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--text)] transition-colors">
                                        <Mail className="w-4.5 h-4.5 box-content" />
                                    </span>
                                    <input
                                        type="email"
                                        required
                                        className="w-full pl-11 pr-4 py-2.5 bg-transparent border border-[var(--border)] focus:border-[var(--muted)] rounded-xl outline-none transition-all text-[14px] text-[var(--text)] placeholder:text-[var(--muted)]/50 box-shadow-none"
                                        placeholder="user@mse.iitd.ac.in"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={loginMutation.isPending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <div className="flex justify-between items-center">
                                    <label className="block text-[13px] font-medium text-[var(--text)]">
                                        Password
                                    </label>
                                    <button type="button" className="text-[12px] font-medium text-[var(--primary)] hover:underline">Forgot Password?</button>
                                </div>
                                <div className="group relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--text)] transition-colors">
                                        <Lock className="w-4.5 h-4.5 box-content" />
                                    </span>
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-11 pr-4 py-2.5 bg-transparent border border-[var(--border)] focus:border-[var(--muted)] rounded-xl outline-none transition-all text-[14px] text-[var(--text)] placeholder:text-[var(--muted)]/50"
                                        placeholder="••••••••"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={loginMutation.isPending}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_var(--primary-muted)]"
                                    disabled={loginMutation.isPending}
                                >
                                    <span className="text-[14px]">{loginMutation.isPending ? 'Logging in...' : 'Login'}</span>
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 text-center border-t border-[var(--border)]/50 pt-6">
                            <p className="text-[13px] text-[var(--muted)]">
                                Do not have an account?{' '}
                                <Link to="/signup" className="text-[var(--primary)] font-medium hover:underline transition-all">
                                    Sign Up
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
