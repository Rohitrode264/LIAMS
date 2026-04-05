import { useState } from 'react';
import { useLogin } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');

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
        <div className="min-h-screen flex items-center justify-center relative font-inter overflow-hidden bg-[var(--bg)]">
            {/* Split Screen Background Effect */}
            <div className="absolute inset-0 flex pointer-events-none z-0">
                <div className="w-1/2 bg-[var(--primary)]"></div>
                <div className="w-1/2 bg-[var(--bg)]"></div>
            </div>

            {/* Main Card */}
            <div className="relative z-10 w-full max-w-[900px] flex flex-col md:flex-row shadow-[0_20px_60px_rgba(30,50,90,0.1)] mb-8 mt-8 rounded-2xl overflow-hidden min-h-[600px] mx-4 dark:shadow-md dark:shadow-black/30">

                {/* Left Side - Blue CTA */}
                <div className="flex-1 bg-[var(--primary)] p-10 md:p-16 flex flex-col justify-center relative overflow-hidden text-center md:text-left">
                    {/* Geometric Shapes Background */}
                    <div className="absolute inset-0 pointer-events-none">
                        {/* Triangles */}
                        <div className="absolute top-[25%] left-[10%] w-0 h-0 border-l-[25px] border-r-[25px] border-b-[45px] border-l-transparent border-r-transparent border-b-black opacity-10 transform -rotate-12 dark:opacity-20"></div>
                        <div className="absolute bottom-[10%] right-[10%] w-0 h-0 border-l-[60px] border-r-[60px] border-b-[100px] border-l-transparent border-r-transparent border-b-black opacity-5 transform rotate-45 dark:opacity-10"></div>
                        <div className="absolute bottom-[25%] right-[35%] w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-black opacity-10 transform -rotate-45 dark:opacity-20"></div>

                        {/* Circles */}
                        <div className="absolute top-[10%] right-[15%] w-24 h-24 bg-black opacity-5 rounded-full dark:opacity-10"></div>
                        <div className="absolute top-[30%] right-[35%] w-10 h-10 bg-black opacity-10 rounded-full dark:opacity-20"></div>
                        <div className="absolute bottom-[25%] left-[15%] w-14 h-14 bg-black opacity-10 rounded-full dark:opacity-20"></div>
                    </div>

                    <div className="relative z-10 max-w-[280px] mx-auto md:mx-0">
                        <h2 className="text-4xl md:text-[44px] font-bold text-white mb-6 leading-[1.1] tracking-tight">
                            Research & <br />
                            Excellence
                        </h2>
                        <p className="text-blue-50 text-sm font-medium leading-relaxed opacity-90">
                            Access world-class facilities and manage your lab allocations seamlessly within the IIT Delhi MSE ecosystem.
                        </p>
                    </div>
                </div>

                {/* Right Side - Form (White) */}
                <div className="flex-1 bg-[var(--surface)] p-8 md:p-16 flex flex-col justify-center items-center">
                    <div className="w-full max-w-xs">
                        {/* Logo & Mobile Heading */}
                        <div className="flex flex-col items-center mb-6 md:mb-8">
                            <div className="w-16 h-16 bg-[var(--surface)] rounded-2xl shadow-sm border border-[var(--border)] flex items-center justify-center p-2 mb-4">
                                <img src="/Logo.png" alt="Logo" className="w-full h-full object-contain" />
                            </div>
                            <h2 className="text-xl font-bold text-[var(--text)] text-center">Welcome to LIAMS</h2>
                        </div>

                        <p className="text-[13px] text-[var(--text)] opacity-70 text-center mb-8 px-2 font-medium">
                            Sign in to access your lab infrastructure dashboard and manage system resources.
                        </p>

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <label className="text-[12px] font-semibold text-[var(--text)] opacity-70">Email</label>
                                <input
                                    type="email"
                                    required
                                    className="w-full h-12 bg-[var(--surface-2)] focus:bg-[var(--surface)] border border-transparent focus:border-[var(--primary)] rounded-xl px-4 text-sm outline-none transition-all text-[var(--text)] placeholder:text-[var(--muted)]/50"
                                    placeholder="Type your email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    disabled={loginMutation.isPending}
                                />
                            </div>

                            <div className="space-y-2">
                                <label className="text-[12px] font-semibold text-[var(--text)] opacity-70">Password</label>
                                <input
                                    type="password"
                                    required
                                    className="w-full h-12 bg-[var(--surface-2)] focus:bg-[var(--surface)] border border-transparent focus:border-[var(--primary)] rounded-xl px-4 text-sm outline-none transition-all text-[var(--text)] placeholder:text-[var(--muted)]/50"
                                    placeholder="Type your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    disabled={loginMutation.isPending}
                                />
                            </div>

                            <div className="flex items-center justify-between pt-1 pb-2">
                                <label className="flex items-center gap-2 cursor-pointer">
                                    <input type="checkbox" className="w-4 h-4 rounded border-[var(--border)] text-[var(--primary)] focus:ring-[var(--primary)]" />
                                    <span className="text-xs font-semibold text-[var(--text)] opacity-80">Remember me</span>
                                </label>
                                <Link to="/forgot-password" className="text-xs font-semibold text-[var(--primary)] hover:underline">Forgot password?</Link>
                            </div>

                            <button
                                type="submit"
                                className="w-full h-12 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl transition-all disabled:opacity-50 shadow-lg shadow-blue-500/25 active:scale-[0.98]"
                                disabled={loginMutation.isPending}
                            >
                                {loginMutation.isPending ? 'Logging in...' : 'Sign In'}
                            </button>
                        </form>

                        <div className="mt-12 text-center">
                            <p className="text-xs text-[var(--text)] opacity-70 font-medium">
                                Don’t have an account? <Link to="/signup" className="text-[var(--primary)] font-semibold hover:underline opacity-100">Sign up</Link>
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
