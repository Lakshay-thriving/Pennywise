import React from 'react';
import { useFinance } from '../context/FinanceContext';

export default function GoalsPage() {
    const { goals } = useFinance();

    return (
        <div className="animate-in fade-in zoom-in duration-300">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h1 className="text-white text-3xl font-bold flex items-center gap-3">
                        <span className="text-yellow-400">🎯</span> Savings Goals
                    </h1>
                    <p className="text-gray-400 mt-2">Track and manage your financial targets.</p>
                </div>
                <button className="bg-yellow-400 text-dark-bg font-bold px-6 py-2 rounded-xl hover:bg-yellow-300 shadow-[0_0_15px_rgba(250,204,21,0.3)] transition">
                    + Create Goal
                </button>
            </div>

            {goals.length === 0 ? (
                <div className="text-center py-16 bg-card-bg/50 rounded-3xl border border-white/5">
                    <span className="text-5xl mb-4 block">🥅</span>
                    <p className="text-white text-lg font-bold mb-2">No active goals</p>
                    <p className="text-gray-500 text-sm">You haven't set any savings targets yet. Start tracking your dreams today!</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map(goal => (
                        <div key={goal.id} className="bg-card-bg rounded-3xl p-6 border border-white/5 shadow-xl hover:scale-[1.02] hover:border-yellow-400/30 transition-all cursor-pointer group">
                            <h3 className="text-white font-bold text-xl mb-1 group-hover:text-yellow-400 transition-colors">{goal.title}</h3>
                            <p className="text-gray-400 text-sm mb-6">Est completion: <span className="text-white font-semibold">{goal.estimate}</span></p>
                            
                            <div className="flex justify-between items-end mb-2">
                                <p className="text-white font-bold tracking-tight">₹{goal.current.toLocaleString()} <span className="text-gray-500 text-xs font-normal">/ ₹{goal.target.toLocaleString()}</span></p>
                                <p className="text-yellow-400 text-sm font-black">{goal.percentage}%</p>
                            </div>
                            <div className="w-full bg-black/50 rounded-full h-3 inset-shadow-sm overflow-hidden">
                                <div className="bg-gradient-to-r from-yellow-500 to-yellow-300 h-full rounded-full relative" style={{ width: `${goal.percentage}%` }}>
                                    <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
