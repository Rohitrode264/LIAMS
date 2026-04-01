import { useState } from 'react';
import { useSignup, useVerifyOtp } from '../hooks/useAuth';
import { Link, useNavigate } from 'react-router-dom';
import { FlaskConical, ShieldCheck, Mail, Moon, Sun, User, Lock, ArrowRight } from 'lucide-react';
import { useThemeStore } from '../store/themeStore';

export const Signup = () => {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [pendingUserId, setPendingUserId] = useState<string | null>(null);
    const [otp, setOtp] = useState('');

    const signupMutation = useSignup();
    const verifyMutation = useVerifyOtp();
    const navigate = useNavigate();
    const { mode, toggle } = useThemeStore();

    const handleSignupSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        signupMutation.mutate(
            { name, email, password },
            {
                onSuccess: (data) => setPendingUserId(data.pendingUserId)
            }
        );
    };

    const handleVerifySubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!pendingUserId) return;
        verifyMutation.mutate(
            { pendingUserId, otp },
            {
                onSuccess: () => navigate('/dashboard')
            }
        );
    };

    const handleOtpChange = (value: string, index: number) => {
        if (!/^[0-9]?$/.test(value)) return;
        
        const newOtp = otp.split('');
        newOtp[index] = value;
        const joinedOtp = newOtp.join('');
        setOtp(joinedOtp);

        // Auto focus next
        if (value && index < 5) {
            const nextInput = document.getElementById(`otp-${index + 1}`);
            nextInput?.focus();
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            const prevInput = document.getElementById(`otp-${index - 1}`);
            prevInput?.focus();
        }
    };

    if (pendingUserId) {
        return (
            <div className="min-h-screen flex items-center justify-center p-6 bg-[var(--bg)] relative overflow-hidden selection:bg-[var(--primary-muted)]">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-[var(--primary)]/10 blur-[120px] rounded-full pointer-events-none" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-500/10 blur-[120px] rounded-full pointer-events-none" />

                <div className="w-full max-w-md space-y-8 text-center relative z-10 animate-in fade-in slide-in-from-bottom-8 duration-700">
                    <div className="mx-auto w-20 h-20 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-3xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20 border border-white/10 relative overflow-hidden group">
                        <div className="absolute inset-0 bg-white/10 blur-xl rounded-full scale-150 group-hover:scale-110 transition-transform duration-500" />
                        <ShieldCheck className="text-white w-10 h-10 relative z-10" />
                    </div>

                    <div>
                        <h1 className="text-3xl font-bold text-[var(--text)] tracking-tight">Security Verification</h1>
                        <p className="mt-3 text-[var(--muted)] font-medium text-base leading-relaxed">
                            We've sent a 6-digit verification code to<br />
                            <span className="text-[var(--text)] font-semibold">{email}</span>
                        </p>
                    </div>

                    <div className="bg-[var(--surface)]/70 backdrop-blur-xl p-8 sm:p-10 rounded-[2.5rem] shadow-[0_20px_500px_-12px_rgba(0,0,0,0.15)] border border-[color:var(--border)]/50 relative overflow-hidden">
                        <form onSubmit={handleVerifySubmit} className="space-y-8">
                            <div className="flex justify-between gap-2.5">
                                {[0, 1, 2, 3, 4, 5].map(i => (
                                    <input
                                        key={i}
                                        id={`otp-${i}`}
                                        type="text"
                                        maxLength={1}
                                        autoFocus={i === 0}
                                        value={otp[i] || ''}
                                        onChange={(e) => handleOtpChange(e.target.value, i)}
                                        onKeyDown={(e) => handleKeyDown(e, i)}
                                        disabled={verifyMutation.isPending}
                                        className={`w-full aspect-[4/5] sm:aspect-square text-center text-2xl font-bold rounded-xl border-2 transition-all duration-200 outline-none
                                            ${otp[i] 
                                                ? 'bg-[var(--primary-muted)] border-[var(--primary)] text-[var(--primary)] shadow-[0_0_0_1px_var(--primary)]' 
                                                : 'bg-[var(--surface-2)] border-transparent text-[var(--text)] focus:border-[var(--muted)] focus:bg-[var(--surface)]'
                                            }`}
                                    />
                                ))}
                            </div>

                            <div className="space-y-4">
                                <button
                                    type="submit"
                                    className="w-full h-14 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-bold rounded-2xl flex items-center justify-center gap-2 transition-all active:scale-[0.98] shadow-lg shadow-blue-500/25 disabled:opacity-50 disabled:cursor-not-allowed"
                                    disabled={verifyMutation.isPending || otp.length !== 6}
                                >
                                    {verifyMutation.isPending ? (
                                        <>
                                            <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                            <span>Verifying...</span>
                                        </>
                                    ) : (
                                        <span>Verify & Continue</span>
                                    )}
                                </button>

                                <div className="pt-2 text-center">
                                    <p className="text-xs text-[var(--muted)] font-semibold uppercase tracking-wider mb-3">Didn't receive the code?</p>
                                    <button 
                                        type="button"
                                        className="text-sm font-bold text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors inline-flex items-center gap-1.5 group"
                                    >
                                        Resend Verification Code
                                        <ArrowRight size={14} className="group-hover:translate-x-0.5 transition-transform" />
                                    </button>
                                </div>
                            </div>
                        </form>
                    </div>

                    <p className="text-xs text-[var(--muted)] px-8 leading-relaxed">
                        By proceeding, you verify that you have access to this institutional email account.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-[var(--bg)] p-4 sm:p-8 selection:bg-[var(--primary-muted)] overflow-hidden transition-colors duration-500 relative">
            {/* Ambient Background Elements */}
            <div className="absolute inset-0 pointer-events-none overflow-hidden">
                <div className="absolute top-1/4 left-1/4 w-[500px] h-[500px] bg-[var(--primary)]/10 blur-[120px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" />
                <div className="absolute bottom-1/4 right-1/4 w-[400px] h-[400px] bg-indigo-500/10 blur-[100px] rounded-full mix-blend-multiply dark:mix-blend-screen animate-pulse" style={{ animationDelay: '2s' }} />
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
                            Create your account
                        </h1>
                        <p className="text-base text-[var(--muted)] mb-12 max-w-md">
                            Join the Materials Science & Engineering Department network to access advanced research facilities.
                        </p>

                        <div className="space-y-6">
                            {[
                                { title: 'Seamless Bookings', desc: 'Reserve high-end equipment with real-time availability.' },
                                { title: 'Digital Inventory', desc: 'Keep track of all available infrastructure easily.' },
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
                    <div className="w-full max-w-[400px] bg-[var(--surface)] p-8 sm:p-10 rounded-[2rem] border border-[var(--border)] shadow-xl relative z-10 py-10">
                        
                        <div className="lg:hidden flex items-center gap-3 mb-8 justify-center">
                            <div className="w-10 h-10 bg-[var(--primary)] rounded-lg flex items-center justify-center shadow-lg">
                                <FlaskConical className="text-white w-5 h-5" />
                            </div>
                            <span className="text-xl font-bold text-[var(--text)] tracking-tight">IITD-MSE</span>
                        </div>

                        <form onSubmit={handleSignupSubmit} className="space-y-5">
                            <div className="space-y-1.5">
                                <label className="block text-[13px] font-medium text-[var(--text)]">
                                    Full Name
                                </label>
                                <div className="group relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--text)] transition-colors">
                                        <User className="w-4.5 h-4.5 box-content" />
                                    </span>
                                    <input
                                        type="text"
                                        required
                                        className="w-full pl-11 pr-4 py-2.5 bg-transparent border border-[var(--border)] focus:border-[var(--muted)] rounded-xl outline-none transition-all text-[14px] text-[var(--text)] placeholder:text-[var(--muted)]/50 box-shadow-none"
                                        placeholder="Enter your full name"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        disabled={signupMutation.isPending}
                                    />
                                </div>
                            </div>

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
                                        placeholder="name@mse.iitd.ac.in"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        disabled={signupMutation.isPending}
                                    />
                                </div>
                            </div>

                            <div className="space-y-1.5">
                                <label className="block text-[13px] font-medium text-[var(--text)]">
                                    Password
                                </label>
                                <div className="group relative">
                                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[var(--muted)] group-focus-within:text-[var(--text)] transition-colors">
                                        <Lock className="w-4.5 h-4.5 box-content" />
                                    </span>
                                    <input
                                        type="password"
                                        required
                                        className="w-full pl-11 pr-4 py-2.5 bg-transparent border border-[var(--border)] focus:border-[var(--muted)] rounded-xl outline-none transition-all text-[14px] text-[var(--text)] placeholder:text-[var(--muted)]/50"
                                        placeholder="Create a strong password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        disabled={signupMutation.isPending}
                                    />
                                </div>
                            </div>

                            <div className="pt-4">
                                <button
                                    type="submit"
                                    className="w-full h-11 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl flex items-center justify-center transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_4px_14px_0_var(--primary-muted)]"
                                    disabled={signupMutation.isPending}
                                >
                                    <span className="text-[14px]">{signupMutation.isPending ? 'Initializing...' : 'Sign Up'}</span>
                                </button>
                            </div>
                        </form>

                        <div className="mt-8 text-center border-t border-[var(--border)]/50 pt-6">
                            <p className="text-[13px] text-[var(--muted)]">
                                Already have an account?{' '}
                                <Link to="/login" className="text-[var(--primary)] font-medium hover:underline transition-all">
                                    Log In
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
