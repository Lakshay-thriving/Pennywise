import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function MainLayout() {
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/auth');
    };

    const navItems = [
        { name: 'Dashboard', path: '/' },
        { name: 'Goals', path: '/goals' },
        { name: 'Subscriptions', path: '/subscriptions' },
        { name: 'Settlements', path: '/settlements' },
        { name: 'Community', path: '/community' },
        { name: 'Profile', path: '/profile' }
    ];

    return (
        <div className="flex flex-col min-h-screen bg-dark-bg">
            {/* Top Navigation Bar */}
            <nav className="bg-card-bg/80 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-8">
                            <h1 className="text-white text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-neon-green to-blue-500">
                                Pennywise Pro
                            </h1>
                            <div className="hidden md:flex space-x-1">
                                {navItems.map((item) => (
                                    <NavLink
                                        key={item.name}
                                        to={item.path}
                                        className={({ isActive }) =>
                                            `px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                                                isActive 
                                                ? 'bg-white/10 text-neon-green shadow-inner border border-neon-green/30' 
                                                : 'text-gray-400 hover:text-white hover:bg-white/5'
                                            }`
                                        }
                                    >
                                        {item.name}
                                    </NavLink>
                                ))}
                            </div>
                        </div>
                        <button 
                            onClick={handleLogout} 
                            className="text-red-400 text-sm font-bold hover:text-red-300 transition-colors bg-red-400/10 px-4 py-2 rounded-xl border border-red-400/20"
                        >
                            Log Out
                        </button>
                    </div>
                </div>
                {/* Mobile Nav Scroller */}
                <div className="md:hidden flex overflow-x-auto px-4 py-2 space-x-2 border-t border-white/5 no-scrollbar">
                     {navItems.map((item) => (
                        <NavLink
                            key={item.name}
                            to={item.path}
                            className={({ isActive }) =>
                                `whitespace-nowrap px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                                    isActive 
                                    ? 'bg-white/10 text-neon-green border border-neon-green/30' 
                                    : 'text-gray-400 bg-black/20'
                                }`
                            }
                        >
                            {item.name}
                        </NavLink>
                    ))}
                </div>
            </nav>

            {/* Sub-Route Render Target */}
            <main className="flex-1 overflow-y-auto px-5 py-8 w-full max-w-6xl mx-auto">
                <Outlet />
            </main>
        </div>
    );
}
