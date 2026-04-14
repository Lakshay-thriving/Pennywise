import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

export default function AuthScreen() {
    const [isLogin, setIsLogin] = useState(true);
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    
    const { login, register } = useAuth();

    const validate = () => {
        if (!email.includes('@')) {
            alert("Please enter a valid email address.");
            return false;
        }
        if (password.length < 6) {
            alert("Password must be at least 6 characters long.");
            return false;
        }
        if (!isLogin && password !== confirmPassword) {
            alert("Passwords do not match.");
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validate()) return;
        setLoading(true);
        try {
            if (isLogin) {
                await login(email, password);
            } else {
                await register(name, email, password);
            }
        } catch (error) {
            alert(error.message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-dark-bg flex flex-col justify-center px-6">
            <div className="mb-10 text-center">
                <h1 className="text-neon-green text-5xl font-bold mb-2 tracking-tight">Pennywise</h1>
                <p className="text-gray-400 text-lg">Your Personal Finance Manager</p>
            </div>

            <div className="bg-card-bg p-8 rounded-3xl border border-white/10 shadow-xl shadow-neon-green/10 max-w-md w-full mx-auto">
                <h2 className="text-white text-2xl font-bold mb-6">
                    {isLogin ? "Sign In" : "Create Account"}
                </h2>

                <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                    {!isLogin && (
                        <input 
                            className="bg-dark-bg text-white px-4 py-4 rounded-xl border border-white/10 outline-none focus:border-neon-green transition"
                            placeholder="Full Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                        />
                    )}

                    <input 
                        className="bg-dark-bg text-white px-4 py-4 rounded-xl border border-white/10 outline-none focus:border-neon-green transition"
                        placeholder="Email Address"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                    />

                    <input 
                        className="bg-dark-bg text-white px-4 py-4 rounded-xl border border-white/10 outline-none focus:border-neon-green transition"
                        placeholder="Password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                    />

                    {!isLogin && (
                        <input 
                            className="bg-dark-bg text-white px-4 py-4 rounded-xl border border-white/10 outline-none focus:border-neon-green transition"
                            placeholder="Confirm Password"
                            type="password"
                            value={confirmPassword}
                            onChange={(e) => setConfirmPassword(e.target.value)}
                        />
                    )}

                    <button 
                        type="submit"
                        disabled={loading}
                        className="bg-neon-green rounded-full py-4 text-dark-bg font-bold text-lg hover:bg-neon-green/90 transition mt-2 flex justify-center items-center"
                    >
                        {loading ? "Processing..." : (isLogin ? "Login to Pennywise" : "Sign Up")}
                    </button>
                </form>

                <div className="flex justify-center flex-row gap-1 mt-6 text-sm">
                    <span className="text-gray-400">
                        {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </span>
                    <button onClick={() => setIsLogin(!isLogin)} type="button" className="text-soft-violet font-bold hover:underline">
                        {isLogin ? "Sign Up" : "Sign In"}
                    </button>
                </div>
            </div>
        </div>
    );
}
