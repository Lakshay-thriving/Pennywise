import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';

export default function ProfilePage() {
    const { user: authUser } = useAuth();
    
    // Core User Data
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [profileImage, setProfileImage] = useState('');
    const [previewImage, setPreviewImage] = useState('');
    const [selectedFile, setSelectedFile] = useState(null);
    const [stats, setStats] = useState({ totalExpensesCreated: 0, totalAmountSpent: 0, groupsJoined: 0 });
    const [loading, setLoading] = useState(true);
    const fileInputRef = useRef(null);

    // Password Update States
    const [currentPassword, setCurrentPassword] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [passMsg, setPassMsg] = useState({ text: '', type: '' });

    // Profile Feedback State
    const [profileMsg, setProfileMsg] = useState({ text: '', type: '' });

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const req = await fetch('http://localhost:5000/api/users/profile', {
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
            });
            const res = await req.json();
            if (res.success) {
                setName(res.data.user.name);
                setEmail(res.data.user.email);
                setProfileImage(res.data.user.profile_image_url || '');
                setPreviewImage(res.data.user.profile_image_url || '');
                setStats(res.data.stats);
            }
        } catch (e) {
            console.error('Failed to load profile');
        } finally {
            setLoading(false);
        }
    };

    const handleProfileUpdate = async (e) => {
        e.preventDefault();
        setProfileMsg({ text: 'Saving...', type: 'info' });
        
        try {
            const formData = new FormData();
            formData.append('name', name);
            if (selectedFile) {
                formData.append('profileImage', selectedFile);
            } else {
                formData.append('profile_image_url', previewImage);
            }

            const req = await fetch('http://localhost:5000/api/users/profile', {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: formData
            });
            const res = await req.json();
            
            if (res.success) {
                setProfileImage(res.data.profile_image_url);
                setProfileMsg({ text: 'Profile updated successfully!', type: 'success' });
                setTimeout(() => setProfileMsg({ text: '', type: '' }), 3000);
            } else {
                setProfileMsg({ text: res.error || 'Failed to update', type: 'error' });
            }
        } catch (err) {
            setProfileMsg({ text: 'Network error.', type: 'error' });
        }
    };

    const handlePasswordUpdate = async (e) => {
        e.preventDefault();
        setPassMsg({ text: '', type: '' });

        if (newPassword !== confirmPassword) {
            return setPassMsg({ text: 'New passwords do not match!', type: 'error' });
        }
        if (newPassword.length < 6) {
            return setPassMsg({ text: 'Password must be at least 6 characters.', type: 'error' });
        }

        setPassMsg({ text: 'Updating securely...', type: 'info' });
        
        try {
            const req = await fetch('http://localhost:5000/api/users/password', {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({ currentPassword, newPassword })
            });
            const res = await req.json();

            if (res.success) {
                setPassMsg({ text: 'Password updated securely!', type: 'success' });
                setCurrentPassword(''); setNewPassword(''); setConfirmPassword('');
                setTimeout(() => setPassMsg({ text: '', type: '' }), 3000);
            } else {
                setPassMsg({ text: res.error || 'Failed to update', type: 'error' });
            }
        } catch (err) {
            setPassMsg({ text: 'Network error.', type: 'error' });
        }
    };

    if (loading) return <div className="text-neon-green p-10 animate-pulse">Loading Profile...</div>;

    const defaultAvatarUrl = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=39FF14&color=000&size=150`;

    return (
        <div className="animate-in fade-in zoom-in duration-300 max-w-4xl mx-auto">
            <h1 className="text-white text-3xl font-bold mb-8 flex items-center gap-3">
                <span className="text-soft-violet">👤</span> Account Profile
            </h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left Column: Avatar & Options */}
                <div className="md:col-span-1 space-y-6">
                    <div className="bg-card-bg/50 rounded-3xl p-6 border border-white/5 shadow-lg text-center flex flex-col items-center">
                        <div 
                            className="w-32 h-32 rounded-full overflow-hidden border-4 border-neon-green/30 shadow-lg shadow-neon-green/20 mb-4 group relative cursor-pointer"
                            onClick={() => fileInputRef.current.click()}
                        >
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                accept="image/png, image/jpeg" 
                                onChange={(e) => {
                                    if(e.target.files && e.target.files[0]){
                                        const file = e.target.files[0];
                                        setSelectedFile(file);
                                        setPreviewImage(URL.createObjectURL(file));
                                    }
                                }}
                            />
                            <img 
                                src={previewImage || defaultAvatarUrl} 
                                alt="Profile Avatar" 
                                className="w-full h-full object-cover transition duration-300 group-hover:opacity-40"
                                onError={(e) => { e.target.src = defaultAvatarUrl; }} 
                            />
                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-black/40">
                                <span className="text-white text-3xl drop-shadow-md">✏️</span>
                            </div>
                        </div>
                        <h2 className="text-xl font-bold text-white mb-1">{name}</h2>
                        <p className="text-gray-400 text-sm">{email}</p>
                        
                        <div className="w-full h-px bg-white/10 my-6"></div>
                        
                        <p className="text-xs text-gray-500 uppercase tracking-widest font-black text-left w-full mb-3">Account Summary</p>
                        <div className="w-full space-y-3">
                            <div className="flex justify-between bg-black/30 px-3 py-2 rounded-lg border border-white/5">
                                <span className="text-gray-400 text-sm">Expenses</span>
                                <span className="text-white font-bold">{stats.totalExpensesCreated}</span>
                            </div>
                            <div className="flex justify-between bg-black/30 px-3 py-2 rounded-lg border border-white/5">
                                <span className="text-gray-400 text-sm">Spent</span>
                                <span className="text-red-400 font-bold">₹{stats.totalAmountSpent.toLocaleString()}</span>
                            </div>
                            <div className="flex justify-between bg-black/30 px-3 py-2 rounded-lg border border-white/5">
                                <span className="text-gray-400 text-sm">Groups</span>
                                <span className="text-neon-green font-bold">{stats.groupsJoined}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column: Editing Forms */}
                <div className="md:col-span-2 space-y-8">
                    {/* Personal Information Card */}
                    <div className="bg-card-bg rounded-3xl p-8 border border-white/5 relative shadow-xl">
                        <h2 className="text-white text-xl font-semibold mb-6 flex items-center gap-2">Personal Details</h2>
                        <form onSubmit={handleProfileUpdate} className="space-y-4">
                            <div>
                                <label className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1 block">Full Name</label>
                                <input 
                                    type="text" value={name} onChange={e => setName(e.target.value)} required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green transition"
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1 block">Email (Read Only)</label>
                                <input 
                                    type="email" value={email} readOnly 
                                    className="w-full bg-black/20 border border-white/5 rounded-xl px-4 py-3 text-gray-500 cursor-not-allowed"
                                />
                            </div>
                            <div>
                                <label className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1 block">Image URL (Optional)</label>
                                <div className="flex gap-2">
                                    <input 
                                        type="url" value={previewImage} onChange={e => setPreviewImage(e.target.value)} placeholder="https://example.com/avatar.png"
                                        className="flex-1 bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-neon-green transition text-sm"
                                    />
                                    {previewImage !== profileImage && (
                                        <button type="button" onClick={() => setPreviewImage(profileImage)} className="bg-white/5 px-4 rounded-xl text-gray-400 hover:text-white transition text-sm font-bold">Revert</button>
                                    )}
                                </div>
                            </div>
                            
                            <div className="flex items-center justify-between pt-4">
                                <div>
                                    {profileMsg.text && (
                                        <p className={`text-sm font-bold ${profileMsg.type === 'error' ? 'text-red-400' : profileMsg.type === 'success' ? 'text-neon-green' : 'text-blue-400'}`}>
                                            {profileMsg.text}
                                        </p>
                                    )}
                                </div>
                                <button type="submit" className="bg-neon-green text-dark-bg font-bold px-8 py-3 rounded-xl hover:bg-neon-green/80 transition-all shadow-lg shadow-neon-green/20">
                                    Save Changes
                                </button>
                            </div>
                        </form>
                    </div>

                    {/* Change Password Card */}
                    <div className="bg-gradient-to-br from-card-bg to-red-900/10 rounded-3xl p-8 border border-white/5 shadow-xl">
                        <h2 className="text-white text-xl font-semibold mb-6 flex items-center gap-2">Security Data</h2>
                        <form onSubmit={handlePasswordUpdate} className="space-y-4">
                            <div>
                                <label className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1 block">Current Password</label>
                                <input 
                                    type="password" value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} required
                                    className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-400/50 transition mb-4"
                                />
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1 block">New Password</label>
                                    <input 
                                        type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-400/50 transition"
                                    />
                                </div>
                                <div>
                                    <label className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1 block">Confirm New Password</label>
                                    <input 
                                        type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} required
                                        className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-red-400/50 transition"
                                    />
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <div>
                                    {passMsg.text && (
                                        <p className={`text-sm font-bold ${passMsg.type === 'error' ? 'text-red-400' : passMsg.type === 'success' ? 'text-neon-green' : 'text-blue-400'}`}>
                                            {passMsg.text}
                                        </p>
                                    )}
                                </div>
                                <button type="submit" className="bg-red-400/20 text-red-400 border border-red-400/30 font-bold px-8 py-3 rounded-xl hover:bg-red-400 hover:text-dark-bg transition-all">
                                    Update Password
                                </button>
                            </div>
                        </form>
                    </div>

                </div>
            </div>
        </div>
    );
}
