import React, { useState } from 'react';
import { Navigation, ArrowRight } from 'lucide-react';

interface LoginPageProps {
  onLogin: (email: string) => void;
  onGuest: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onGuest }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate network delay for realistic feel
    setTimeout(() => {
      onLogin(email);
      setIsLoading(false);
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center items-center p-4 relative overflow-hidden font-sans">
        {/* Background Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-blue-600 to-cyan-500 rounded-b-[50px] md:rounded-b-[100px] z-0 shadow-2xl"></div>
        
        {/* Animated Card */}
        <div className="bg-white/95 backdrop-blur-sm p-8 rounded-3xl shadow-2xl w-full max-w-md z-10 border border-white/50 animate-in fade-in zoom-in duration-500 relative">
            
            <div className="flex flex-col items-center mb-8">
                <div className="bg-gradient-to-br from-blue-600 to-cyan-500 text-white p-4 rounded-2xl shadow-lg mb-4 transform -translate-y-12 border-4 border-slate-50">
                    <Navigation className="w-10 h-10" />
                </div>
                <div className="-mt-8 text-center">
                  <h1 className="text-3xl font-bold text-slate-800 tracking-tight">CityPulse</h1>
                  <p className="text-slate-500 text-sm mt-1">Real-time hyperlocal updates</p>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 ml-1">Email</label>
                    <input
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all outline-none text-slate-800 placeholder:text-slate-400"
                        placeholder="you@example.com"
                        required
                    />
                </div>
                <div>
                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wide mb-1 ml-1">Password</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:ring-2 focus:ring-blue-500 focus:bg-white focus:border-transparent transition-all outline-none text-slate-800 placeholder:text-slate-400"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-700 hover:to-cyan-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex justify-center items-center mt-2"
                >
                    {isLoading ? (
                        <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                    ) : (
                        <>
                            Sign In
                            <ArrowRight className="w-4 h-4 ml-2" />
                        </>
                    )}
                </button>
            </form>

            <div className="flex items-center gap-4 my-6">
                <div className="h-px bg-slate-200 flex-1"></div>
                <span className="text-xs font-bold text-slate-400 uppercase">Or</span>
                <div className="h-px bg-slate-200 flex-1"></div>
            </div>

            <button
                onClick={onGuest}
                className="w-full py-3 bg-white border-2 border-slate-100 text-slate-600 font-semibold rounded-xl hover:bg-slate-50 hover:border-slate-200 transition-all active:scale-[0.98]"
            >
                Continue as Guest
            </button>
            
            <p className="text-center text-[10px] text-slate-400 mt-6 max-w-xs mx-auto">
                By continuing, you agree to our Terms of Service and Privacy Policy.
            </p>
        </div>
        
        <div className="absolute bottom-4 text-slate-400 text-xs">
           © {new Date().getFullYear()} CityPulse App
        </div>
    </div>
  );
};

export default LoginPage;