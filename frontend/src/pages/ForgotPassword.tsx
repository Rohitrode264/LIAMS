import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForgotPassword, useResetPassword } from '../hooks/useAuth';

export const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [step, setStep] = useState<'email' | 'otp' | 'password'>('email');

    const forgotPasswordMutation = useForgotPassword();
    const resetPasswordMutation = useResetPassword();
    const navigate = useNavigate();

    const handleEmailSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        forgotPasswordMutation.mutate({ email }, {
            onSuccess: () => setStep('otp')
        });
    };

    const handleOtpChange = (value: string, index: number) => {
        if (!/^[0-9]?$/.test(value)) return;
        const newOtp = otp.split('');
        newOtp[index] = value;
        const otpString = newOtp.join('');
        setOtp(otpString);

        if (value && index < 5) {
            document.getElementById(`otp-${index + 1}`)?.focus();
        }

        if (otpString.length === 6) {
            setStep('password');
        }
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, index: number) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            document.getElementById(`otp-${index - 1}`)?.focus();
        }
    };

    const handleResetSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        resetPasswordMutation.mutate({ email, otp, newPassword }, {
            onSuccess: () => navigate('/login')
        });
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
                    <div className="absolute inset-0 pointer-events-none">
                        <div className="absolute top-[25%] left-[10%] w-0 h-0 border-l-[25px] border-r-[25px] border-b-[45px] border-l-transparent border-r-transparent border-b-black opacity-10 transform -rotate-12 dark:opacity-20"></div>
                        <div className="absolute bottom-[10%] right-[10%] w-0 h-0 border-l-[60px] border-r-[60px] border-b-[100px] border-l-transparent border-r-transparent border-b-black opacity-5 transform rotate-45 dark:opacity-10"></div>
                        <div className="absolute bottom-[25%] right-[35%] w-0 h-0 border-l-[20px] border-r-[20px] border-b-[35px] border-l-transparent border-r-transparent border-b-black opacity-10 transform -rotate-45 dark:opacity-20"></div>

                        <div className="absolute top-[10%] right-[15%] w-24 h-24 bg-black opacity-5 rounded-full dark:opacity-10"></div>
                        <div className="absolute top-[30%] right-[35%] w-10 h-10 bg-black opacity-10 rounded-full dark:opacity-20"></div>
                        <div className="absolute bottom-[25%] left-[15%] w-14 h-14 bg-black opacity-10 rounded-full dark:opacity-20"></div>
                    </div>

                    <div className="relative z-10 max-w-[280px] mx-auto md:mx-0">
                        <h2 className="text-4xl md:text-[44px] font-bold text-white mb-6 leading-[1.1] tracking-tight">
                            Portal <br />
                            Recovery
                        </h2>
                        <p className="text-blue-50 text-sm font-medium leading-relaxed opacity-90">
                            Ensure secure access to your research dashboard. Follow the steps to safely reset your student credentials.
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
                            <h2 className="text-xl font-bold text-[var(--text)] text-center">Reset Password</h2>
                        </div>

                        {step === 'email' && (
                            <>
                                <p className="text-[13px] text-[var(--text)] opacity-70 text-center mb-10 leading-relaxed px-4">
                                    Enter your institutional email address and we'll send you a link to reset your password.
                                </p>

                                <form onSubmit={handleEmailSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-semibold text-[var(--text)] opacity-70">Email</label>
                                        <input
                                            type="email"
                                            required
                                            className="w-full h-12 bg-[var(--surface-2)] focus:bg-[var(--surface)] border border-transparent focus:border-[var(--primary)] rounded-xl px-4 text-sm outline-none transition-all text-[var(--text)] placeholder:text-[var(--muted)]/50"
                                            placeholder="Type your email"
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            disabled={forgotPasswordMutation.isPending}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full h-12 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] mt-2 disabled:opacity-50"
                                        disabled={forgotPasswordMutation.isPending}
                                    >
                                        {forgotPasswordMutation.isPending ? 'Sending...' : 'Send OTP'}
                                    </button>
                                </form>
                            </>
                        )}

                        {step === 'otp' && (
                            <>
                                <p className="text-[13px] text-[var(--text)] opacity-70 text-center mb-8">Enter the 6-digit code sent to <br /><span className="font-semibold opacity-100">{email}</span></p>

                                <div className="flex justify-between gap-2.5 mb-8">
                                    {[0, 1, 2, 3, 4, 5].map(i => (
                                        <input
                                            key={i}
                                            id={`otp-${i}`}
                                            type="text"
                                            maxLength={1}
                                            className="w-full aspect-square text-center text-lg font-bold rounded-xl border border-[var(--border)] bg-[var(--surface-2)] focus:border-[var(--primary)] focus:bg-[var(--surface)] outline-none transition-all text-[var(--text)]"
                                            value={otp[i] || ''}
                                            onChange={(e) => handleOtpChange(e.target.value, i)}
                                            onKeyDown={(e) => handleKeyDown(e, i)}
                                        />
                                    ))}
                                </div>

                                <button
                                    onClick={() => setStep('email')}
                                    className="w-full text-xs font-semibold text-[var(--primary)] hover:underline text-center"
                                >
                                    Change email address
                                </button>
                            </>
                        )}

                        {step === 'password' && (
                            <>
                                <p className="text-[13px] text-[var(--text)] opacity-70 text-center mb-8 px-2 font-medium">
                                    Step verified! Now, set a new secure password for your account.
                                </p>

                                <form onSubmit={handleResetSubmit} className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-[12px] font-semibold text-[var(--text)] opacity-70">New Password</label>
                                        <input
                                            type="password"
                                            required
                                            className="w-full h-12 bg-[var(--surface-2)] focus:bg-[var(--surface)] border border-transparent focus:border-[var(--primary)] rounded-xl px-4 text-sm outline-none transition-all text-[var(--text)] placeholder:text-[var(--muted)]/50"
                                            placeholder="Min 8 characters"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            disabled={resetPasswordMutation.isPending}
                                        />
                                    </div>

                                    <button
                                        type="submit"
                                        className="w-full h-12 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white font-medium rounded-xl transition-all shadow-lg shadow-blue-500/25 active:scale-[0.98] disabled:opacity-50"
                                        disabled={resetPasswordMutation.isPending || newPassword.length < 8}
                                    >
                                        {resetPasswordMutation.isPending ? 'Updating...' : 'Reset Password'}
                                    </button>
                                </form>
                            </>
                        )}

                        <div className="mt-8 text-center">
                            <p className="text-xs text-[var(--text)] opacity-70 font-medium">
                                Remember your password? <Link to="/login" className="text-[var(--primary)] font-semibold hover:underline opacity-100">Sign in</Link>
                            </p>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};
