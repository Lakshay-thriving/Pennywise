import React, { useState } from 'react';
import { useFinance } from '../context/FinanceContext';
import {
  Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

export default function DashboardHome() {
    const { balance, owedToYou, youOwe, activityFeed, setActivityFeed } = useFinance();
    const [chartData] = useState([]);
    
    // Expense Creation Form States
    const [desc, setDesc] = useState('');
    const [amount, setAmount] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedParticipants, setSelectedParticipants] = useState([]);

    const options = {
        responsive: true,
        plugins: { legend: { display: false }, title: { display: false } },
        scales: {
            y: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: 'white' } },
            x: { grid: { color: 'rgba(255, 255, 255, 0.1)' }, ticks: { color: 'white' } }
        }
    };

    const data = {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
            label: 'Spending',
            data: chartData.length > 0 ? chartData : [0, 0, 0, 0, 0, 0],
            borderColor: '#39FF14',
            backgroundColor: 'rgba(57, 255, 20, 0.5)',
            tension: 0.4
        }],
    };

    const searchUsers = async (q) => {
        setSearchQuery(q);
        if(!q) return setSearchResults([]);
        try {
            const req = await fetch(`http://localhost:5000/api/auth/search?q=${q}`, {
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
            });
            const res = await req.json();
            if(res.success) setSearchResults(res.data);
        } catch(e) {
            console.error(e);
        }
    };

    const toggleParticipant = (u) => {
        if (selectedParticipants.find(p => p.id === u.id)) {
            setSelectedParticipants(prev => prev.filter(p => p.id !== u.id));
        } else {
            setSelectedParticipants(prev => [...prev, u]);
        }
        setSearchQuery('');
        setSearchResults([]);
    };

    const handleCreateExpense = async () => {
        if(!desc || !amount) return;
        
        const tempId = Date.now();
        setActivityFeed(prev => [
            { id: tempId, title: `Processing "${desc}"...`, time: 'Just now', amount: '⏳', icon: '⚡' },
            ...prev
        ]);
        
        try {
            const numAmount = parseFloat(amount);
            const creatorId = 1; 
            const participantIds = [creatorId, ...selectedParticipants.map(u => u.id)];
            const uniqueIds = [...new Set(participantIds)];
            
            const splits = uniqueIds.map(id => ({
                userId: id,
                amount: numAmount / uniqueIds.length
            }));

            const req = await fetch('http://localhost:5000/api/expenses', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({ description: desc, amount: numAmount, creatorId, groupId: 1, splits })
            });
            const res = await req.json();
            
            if (res.success) {
                setActivityFeed(prev => [
                    { id: Date.now(), title: `Added "${desc}" successfully!`, time: 'Just now', amount: '✓', icon: '⚡' },
                    ...prev.filter(f => f.id !== tempId)
                ]);
                setDesc('');
                setAmount('');
                setSelectedParticipants([]);
            } else {
                throw new Error(res.error);
            }
        } catch (e) {
            setActivityFeed(prev => [
                { id: Date.now(), title: `Failed: ${e.message}`, time: 'Just now', amount: '✗', icon: '⚠️' },
                ...prev.filter(f => f.id !== tempId)
            ]);
        }
    };

    const handleDownloadCSV = async () => {
        try {
            const req = await fetch('http://localhost:5000/api/expenses/export', {
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
            });
            if (!req.ok) throw new Error('Failed to fetch CSV');
            
            const blob = await req.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = 'pennywise_monthly_report.csv';
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Download failed:', e);
            alert("Failed to download monthly statement.");
        }
    };

    return (
        <div className="animate-in fade-in zoom-in duration-300">
            {/* Balance Overview */}
            <div className="bg-card-bg/80 backdrop-blur-md rounded-3xl p-6 mb-8 border border-white/10 shadow-lg shadow-neon-green/10 mx-auto max-w-2xl">
                <p className="text-gray-400 text-sm font-medium mb-1">Total Balance</p>
                <p className="text-neon-green text-4xl font-bold mb-4">₹{balance.toFixed(2)}</p>
                <div className="flex justify-between">
                    <div>
                        <p className="text-gray-400 text-xs">You are owed</p>
                        <p className="text-white text-lg font-semibold">₹{owedToYou.toFixed(2)}</p>
                    </div>
                    <div>
                        <p className="text-gray-400 text-xs">You owe</p>
                        <p className="text-red-400 text-lg font-semibold">₹{youOwe.toFixed(2)}</p>
                    </div>
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-8 max-w-6xl mx-auto">
                <div className="flex-1">
                    {/* Create Expense Form */}
                    <div className="bg-card-bg/50 rounded-3xl p-6 border border-white/10 shadow-lg relative mb-8">
                        <h2 className="text-white text-xl font-semibold mb-4 flex items-center gap-2">
                            <span className="text-soft-violet">⚡</span> Create Expense
                        </h2>
                        
                        <div className="flex gap-2 mb-3">
                            <input 
                                type="text" value={desc} onChange={e => setDesc(e.target.value)}
                                placeholder="Description (e.g. Dinner)" 
                                className="flex-1 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-soft-violet transition"
                            />
                            <input 
                                type="number" value={amount} onChange={e => setAmount(e.target.value)}
                                placeholder="Amount" 
                                className="w-32 bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-soft-violet transition"
                            />
                        </div>

                        <div className="relative mb-4">
                            <input 
                                type="text" value={searchQuery} onChange={e => searchUsers(e.target.value)}
                                placeholder="Search users to split with by name or email..." 
                                className="w-full bg-black/40 border border-white/5 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-soft-violet transition text-sm"
                            />
                            {searchResults.length > 0 && (
                                <div className="absolute top-14 left-0 right-0 bg-dark-bg border border-white/10 rounded-xl shadow-2xl p-2 z-50">
                                    {searchResults.map(u => (
                                        <div key={u.id} className="p-2 hover:bg-white/5 rounded-lg cursor-pointer flex justify-between items-center" onClick={() => toggleParticipant(u)}>
                                            <span className="text-white text-sm font-semibold">{u.name}</span>
                                            <span className="text-gray-500 text-xs">{u.email}</span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        {selectedParticipants.length > 0 && (
                            <div className="flex flex-wrap gap-2 mb-4 p-3 bg-black/20 rounded-xl border border-white/5">
                                {selectedParticipants.map(u => (
                                    <span key={u.id} className="bg-soft-violet/20 text-soft-violet font-bold text-[10px] uppercase tracking-wider px-3 py-1.5 rounded-full flex items-center gap-2 border border-soft-violet/30 shadow-inner">
                                        {u.name} <button onClick={() => toggleParticipant(u)} className="hover:text-white transition">✕</button>
                                    </span>
                                ))}
                            </div>
                        )}

                        <button 
                            onClick={handleCreateExpense}
                            className="w-full bg-soft-violet rounded-xl px-6 py-3 font-bold text-white hover:bg-opacity-80 transition-all shadow-lg shadow-soft-violet/30">
                            Add Expense
                        </button>
                    </div>

                    {/* Spending Trends */}
                    <div className="mb-8">
                        <h2 className="text-white text-xl font-semibold mb-4">Activity Trends</h2>
                        <div className="bg-card-bg rounded-2xl p-4 border border-white/5 shadow-xl">
                            <Line options={options} data={data} />
                        </div>
                    </div>
                </div>

                <div className="flex-1">
                    {/* Live Activity Feed */}
                    <div className="flex items-center justify-between mb-4">
                        <h2 className="text-white text-xl font-semibold flex items-center gap-2">
                            <span className="text-blue-400">🕒</span> Recent Feed
                        </h2>
                        <button 
                            onClick={handleDownloadCSV}
                            className="text-xs bg-white/10 hover:bg-white/20 text-white px-3 py-1.5 rounded-full font-bold flex items-center gap-1 transition-all"
                        >
                            <span className="text-soft-violet">📥</span> Export CSV
                        </button>
                    </div>
                    <div className="bg-card-bg rounded-2xl p-4 border border-white/5 space-y-4 shadow-lg backdrop-blur-sm min-h-[400px]">
                        {activityFeed.length === 0 ? (
                            <p className="text-center text-gray-500 text-sm py-4 italic">It's quiet here. Create a group expense to see the activity feed!</p>
                        ) : (
                            activityFeed.map(feed => (
                                <div key={feed.id} className="flex items-center gap-4 border-b border-white/5 pb-4 last:border-0 last:pb-0">
                                    <div className="w-12 h-12 rounded-full bg-soft-violet/10 flex items-center justify-center text-xl border border-soft-violet/20 shadow-inner">{feed.icon}</div>
                                    <div className="flex-1">
                                        <p className="text-gray-200 text-sm">{feed.title}</p>
                                        <p className="text-gray-500 text-xs mt-0.5">{feed.time}</p>
                                    </div>
                                    <p className="text-white font-bold bg-white/5 px-3 py-1 rounded-full text-sm">{feed.amount}</p>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
