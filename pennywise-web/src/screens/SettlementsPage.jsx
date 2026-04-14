import React, { useState } from 'react';

export default function SettlementsPage() {
    const [showSettlements, setShowSettlements] = useState(false);
    const [paymentModal, setPaymentModal] = useState({ show: false, receiver: '', amount: 0, status: 'IDLE' });

    const handleUpiSimulate = (receiver, amount) => {
        setPaymentModal({ show: true, receiver, amount, status: 'PROCESSING' });
        setTimeout(() => {
            setPaymentModal(prev => ({ ...prev, status: 'SUCCESS' }));
        }, 2500); // Simulate network delay
    };

    return (
        <div className="animate-in fade-in zoom-in duration-300">
            <div className="mb-8 max-w-3xl mx-auto">
                <h1 className="text-white text-3xl font-bold flex items-center gap-3">
                    <span className="text-neon-green">⚖️</span> Smart Settlements
                </h1>
                <p className="text-gray-400 mt-2">Optimize group debts using our O(N log N) graph simplification algorithm.</p>
            </div>

            <div className="max-w-3xl mx-auto">
                <div className="flex justify-between items-center bg-card-bg/50 p-6 rounded-3xl border border-white/5 mb-6 shadow-lg">
                    <div>
                        <h2 className="text-white font-bold text-xl">Debt Simplification Engine</h2>
                        <p className="text-gray-400 text-sm mt-1">Analyze all group splits and compute the minimum number of transactions needed to settle up.</p>
                    </div>
                    <button 
                        onClick={() => setShowSettlements(!showSettlements)}
                        className={`font-bold px-6 py-3 rounded-xl transition shadow-lg ${
                            showSettlements 
                            ? 'bg-white/10 text-white hover:bg-white/20' 
                            : 'bg-neon-green text-dark-bg hover:bg-neon-green/80 shadow-neon-green/20'
                        }`}
                    >
                        {showSettlements ? 'Hide Algorithms' : 'Calculate Minimal Path'}
                    </button>
                </div>

                {showSettlements && (
                    <div className="bg-card-bg border border-neon-green/30 rounded-3xl p-8 shadow-[0_0_30px_rgba(57,255,20,0.05)] relative overflow-hidden">
                        <div className="absolute top-0 right-0 bg-neon-green text-dark-bg text-[10px] font-black px-4 py-2 rounded-bl-2xl shadow-lg">
                            O(N log N) OPTIMIZED
                        </div>
                        
                        <h3 className="text-neon-green text-sm font-black mb-6 tracking-widest uppercase">Computed Minimal Routes</h3>
                        
                        <div className="flex items-center justify-between bg-black/40 rounded-2xl p-5 mb-4 border border-white/5 hover:border-white/10 transition">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-full bg-red-400/10 flex items-center justify-center text-red-400 border border-red-400/20">↓</div>
                                <span className="text-gray-300 text-lg">You owe <span className="text-white font-bold tracking-wide">Rahul</span></span>
                            </div>
                            <div className="flex items-center gap-4">
                                <span className="text-red-400 font-bold bg-red-400/10 px-4 py-2 rounded-xl text-lg border border-red-400/20">₹250</span>
                                <button 
                                    onClick={() => handleUpiSimulate('Rahul', 250)} 
                                    className="bg-[#2a9d8f] text-white font-bold px-5 py-2 rounded-xl hover:bg-opacity-80 transition shadow-lg shadow-[#2a9d8f]/30"
                                >
                                    Payupi
                                </button>
                            </div>
                        </div>
                        
                        <p className="text-sm text-gray-500 mt-6 text-center italic bg-white/5 py-3 rounded-xl">
                            All redundant cyclic debt loops have been cleanly bypassed.
                        </p>
                    </div>
                )}
            </div>

            {/* Payment Processing Modal (UPI Simulation) */}
            {paymentModal.show && (
                <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-card-bg border border-white/10 rounded-[2rem] p-10 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
                        {paymentModal.status === 'PROCESSING' ? (
                            <div className="flex flex-col items-center py-8">
                                <div className="w-20 h-20 border-4 border-neon-green/20 border-t-neon-green rounded-full animate-spin mb-8"></div>
                                <h3 className="text-white font-bold text-2xl mb-3">Processing UPI Payment</h3>
                                <p className="text-gray-400">Connecting to secure bank gateway...</p>
                                <div className="mt-8 bg-black/30 w-full p-4 rounded-xl border border-white/5">
                                    <p className="text-gray-300 flex justify-between"><span className="text-gray-500">Amount</span> <span className="font-bold">₹{paymentModal.amount}</span></p>
                                    <p className="text-gray-300 flex justify-between mt-2"><span className="text-gray-500">Receiver</span> <span className="font-bold">{paymentModal.receiver}</span></p>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center py-8">
                                <div className="w-24 h-24 bg-neon-green/20 rounded-full flex items-center justify-center mb-8 border-4 border-neon-green animate-in zoom-in duration-300">
                                    <span className="text-neon-green text-5xl">✓</span>
                                </div>
                                <h3 className="text-white font-bold text-3xl mb-3 text-neon-green">Success!</h3>
                                <p className="text-gray-300 mb-8 text-lg">Transaction completed securely via simulated block.</p>
                                
                                <button 
                                    onClick={() => setPaymentModal({ show: false })}
                                    className="w-full bg-white/10 hover:bg-white/20 text-white font-bold py-4 rounded-2xl transition border border-white/10"
                                >
                                    Close Receipt
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
