import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link } from 'react-router-dom';

export default function CommunityScreen() {
    const { user, logout } = useAuth();
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    
    // Create Mode State
    const [isCreating, setIsCreating] = useState(false);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [tags, setTags] = useState('');
    const [mediaStr, setMediaStr] = useState('');

    useEffect(() => {
        fetchArticles();
    }, []);

    const fetchArticles = async () => {
        setLoading(true);
        try {
            // Stub: In real app, fetch from frontend API wrapper -> GET /api/community/articles
            // We use dummy state for UI demonstration unless hooked directly
            const req = await fetch('http://localhost:5000/api/community/articles', {
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
            });
            const res = await req.json();
            if (res.success) {
                setArticles(res.data);
            }
        } catch (e) {
            console.error("Failed to fetch community articles", e);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateSubmit = async () => {
        if (!title || !content) return;
        
        const mediaArr = mediaStr ? [{ url: mediaStr, type: 'image' }] : [];
        const tagsArr = tags.split(',').map(t => t.trim());

        try {
            const req = await fetch('http://localhost:5000/api/community/articles', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${sessionStorage.getItem('token')}`
                },
                body: JSON.stringify({ title, content, tags: tagsArr, media: mediaArr })
            });
            
            if (req.ok) {
                setIsCreating(false);
                setTitle(''); setContent(''); setTags(''); setMediaStr('');
                fetchArticles(); // Refresh feed
            }
        } catch (e) {
            console.error("Creation failed", e);
        }
    };

    const handleLike = async (id) => {
        try {
           await fetch(`http://localhost:5000/api/community/articles/${id}/like`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${sessionStorage.getItem('token')}` }
            });
            fetchArticles();
        } catch(e) {}
    };

    return (
        <div className="animate-in fade-in zoom-in duration-300">
            {/* Header / Nav */}
            <div className="flex justify-between items-center mb-8 max-w-2xl mx-auto border-b border-soft-violet/20 pb-4">
                <div className="flex items-center gap-4">
                    <h1 className="text-white text-3xl font-bold flex items-center gap-3">
                        <span className="text-soft-violet">👥</span> Community Forum
                    </h1>
                </div>
                <button 
                    onClick={() => setIsCreating(!isCreating)} 
                    className="bg-soft-violet rounded-full px-4 py-2 font-bold text-white hover:opacity-80 transition"
                >
                    {isCreating ? 'Cancel' : '+ New Post'}
                </button>
            </div>

            {/* Create Post Form */}
            {isCreating && (
                <div className="bg-card-bg/80 backdrop-blur-md rounded-2xl p-6 mb-8 border border-white/10 shadow-lg max-w-2xl mx-auto">
                    <h2 className="text-neon-green text-xl font-semibold mb-4">Create Article/Post</h2>
                    <input 
                        type="text" placeholder="Title" value={title} onChange={e => setTitle(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white mb-3"
                    />
                    <textarea 
                        placeholder="Write your finance tip or discussion..." value={content} onChange={e => setContent(e.target.value)} rows="4"
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white mb-3"
                    />
                    <input 
                        type="text" placeholder="Tags (comma separated, e.g. budget, tips)" value={tags} onChange={e => setTags(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white mb-3"
                    />
                    <input 
                        type="text" placeholder="Image URL (optional)" value={mediaStr} onChange={e => setMediaStr(e.target.value)}
                        className="w-full bg-black/30 border border-white/10 rounded-lg p-3 text-white mb-4"
                    />
                    <button onClick={handleCreateSubmit} className="w-full bg-neon-green text-dark-bg font-bold rounded-lg p-3 hover:bg-neon-green/80">
                        Publish Post
                    </button>
                </div>
            )}

            {/* Public Feed */}
            <div className="max-w-2xl mx-auto space-y-6">
                <h2 className="text-gray-400 text-sm font-semibold tracking-wider uppercase mb-2">Latest posts</h2>
                
                {loading ? (
                    <p className="text-neon-green/50 text-center py-10 animate-pulse">Loading feed...</p>
                ) : articles.length === 0 ? (
                    <div className="text-center py-10 bg-black/20 rounded-xl border border-white/5">
                        <p className="text-gray-500 italic">No articles found. Be the first to share your financial journey!</p>
                    </div>
                ) : (
                    articles.map(article => (
                        <div key={article.id} className="bg-card-bg rounded-xl border border-white/5 p-5 shadow-lg transition hover:border-white/20">
                            <h3 className="text-white text-lg font-bold mb-1">{article.title}</h3>
                            <p className="text-soft-violet text-xs mb-3">By {article.author_name} • {new Date(article.created_at).toLocaleDateString()}</p>
                            <p className="text-gray-300 text-sm mb-4 line-clamp-3">{article.content}</p>
                            
                            <div className="flex items-center gap-4 text-xs font-semibold">
                                <button onClick={() => handleLike(article.id)} className="flex items-center gap-1 text-neon-green hover:underline">
                                    <span>👍</span> {article.likes_count || 0} Likes
                                </button>
                                <button className="flex items-center gap-1 text-gray-400 hover:text-white transition">
                                    <span>💬</span> {article.comments_count || 0} Comments
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
