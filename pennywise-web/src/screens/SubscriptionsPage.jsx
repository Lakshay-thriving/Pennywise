import React from 'react';
import { useFinance } from '../context/FinanceContext';

export default function SubscriptionsPage() {
    const { subscriptions } = useFinance();

    return (
        <div className="animate-in fade-in zoom-in duration-300">
            <div className="mb-8">
                <h1 className="text-white text-3xl font-bold flex items-center gap-3">
                    <span className="text-blue-400">🔄</span> Smart Subscriptions
                </h1>
                <p className="text-gray-400 mt-2">Manage your recurring bills and AI-detected subscriptions.</p>
            </div>

            {subscriptions.length === 0 ? (
                <div className="text-center py-16 bg-card-bg/50 rounded-3xl border border-white/5">
                    <span className="text-5xl mb-4 block">🤖</span>
                    <p className="text-white text-lg font-bold mb-2">No active subscriptions detected</p>
                    <p className="text-gray-500 text-sm">We'll alert you if we detect recurring spending patterns in your history.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {subscriptions.map(sub => (
                        <div key={sub.id} className="bg-gradient-to-br from-card-bg to-blue-900/10 rounded-3xl p-6 border border-blue-500/20 shadow-lg relative overflow-hidden group hover:border-blue-500/50 transition-colors">
                            <div className="absolute top-0 right-0 bg-blue-500 text-white text-[10px] font-black px-3 py-1.5 rounded-bl-xl shadow-md">
                                AI DETECTED
                            </div>
                            
                            <div className="mt-2 mb-6">
                                <h3 className="text-white font-bold text-2xl mb-1">{sub.name}</h3>
                                <p className="text-blue-400 text-xs font-bold tracking-widest uppercase">{sub.freq}</p>
                            </div>
                            
                            <div className="flex bg-black/40 rounded-xl p-4 items-center justify-between mb-6">
                                <span className="text-gray-400 text-sm">Amount</span>
                                <span className="text-white font-mono text-xl">₹{sub.amount}</span>
                            </div>
                            
                            <div className="flex gap-3">
                                <button className="flex-1 bg-neon-green text-dark-bg font-bold py-2 rounded-xl hover:bg-neon-green/80 transition shadow-[0_0_10px_rgba(57,255,20,0.2)]">
                                    Confirm
                                </button>
                                <button className="flex-1 bg-white/5 text-gray-300 font-bold py-2 rounded-xl hover:bg-white/10 hover:text-white transition border border-white/10">
                                    Ignore
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
