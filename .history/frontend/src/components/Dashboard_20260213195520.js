import React, { useState, useEffect } from 'react';
import { authService, getImageUrl } from '../services/api';
import { useNavigate } from 'react-router-dom';

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: '#f3f2ef',
        display: 'flex',
    },
    sidebar: {
        width: '240px',
        backgroundColor: '#fff',
        padding: '20px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
        position: 'fixed',
        height: '100vh',
    },
    mainContent: {
        marginLeft: '240px',
        flex: 1,
        padding: '20px',
    },
    profileCard: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    },
    avatar: {
        width: '120px',
        height: '120px',
        borderRadius: '60px',
        backgroundColor: '#e0e0e0',
        marginBottom: '15px',
    },
    userName: {
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '10px',
    },
    about: {
        color: '#666',
        marginBottom: '15px',
    },
    button: {
        backgroundColor: '#0a66c2',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '16px',
        cursor: 'pointer',
        marginTop: '10px',
        width: '100%',
    },
    createPost: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    },
    input: {
        width: '100%',
        padding: '12px',
        border: '1px solid #e0e0e0',
        borderRadius: '4px',
        marginBottom: '10px',
    },
    post: {
        backgroundColor: '#fff',
        borderRadius: '8px',
        padding: '20px',
        marginBottom: '20px',
        boxShadow: '0 0 10px rgba(0,0,0,0.1)',
    },
    postHeader: {
        display: 'flex',
        alignItems: 'center',
        marginBottom: '15px',
    },
    smallAvatar: {
        width: '40px',
        height: '40px',
        borderRadius: '20px',
        backgroundColor: '#e0e0e0',
        marginRight: '10px',
    },
    nav: {
        marginTop: '20px',
    },
    navItem: {
        padding: '10px',
        borderRadius: '4px',
        cursor: 'pointer',
        marginBottom: '5px',
        '&:hover': {
            backgroundColor: '#f3f2ef',
        },
    },
    // NEW STYLES
    subscribeBtn: {
        backgroundColor: '#0a66c2',
        color: '#fff',
        border: 'none',
        padding: '6px 16px',
        borderRadius: '16px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        transition: 'background-color 0.2s',
    },
    subscribedBtn: {
        backgroundColor: '#fff',
        color: '#0a66c2',
        border: '1.5px solid #0a66c2',
        padding: '6px 16px',
        borderRadius: '16px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        transition: 'background-color 0.2s',
    },
    reportBtn: {
        backgroundColor: 'transparent',
        color: '#cc0000',
        border: '1.5px solid #cc0000',
        padding: '6px 14px',
        borderRadius: '16px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        transition: 'all 0.2s',
    },
    reportedBtn: {
        backgroundColor: '#cc0000',
        color: '#fff',
        border: '1.5px solid #cc0000',
        padding: '6px 14px',
        borderRadius: '16px',
        cursor: 'not-allowed',
        fontSize: '13px',
        fontWeight: '600',
    },
    reportCount: {
        fontSize: '12px',
        color: '#888',
        marginLeft: '4px',
    },
};

const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ content: '', mediaFile: null });
    const navigate = useNavigate();

    useEffect(() => {
        loadProfile();
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            const response = await authService.getPosts();
            setPosts(response.data);
        } catch (error) {
            console.error('Error loading posts:', error);
        }
    };

    const loadProfile = async () => {
        try {
            const response = await authService.loadProfile();
            setProfile(response.data);
        } catch (error) {
            console.error('Error loading profile:', error);
            if (error.response?.status === 401) {
                navigate('/login');
            }
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('content', newPost.content);
            if (newPost.mediaFile) {
                formData.append('media', newPost.mediaFile);
            }
            await authService.uploadPost(formData);
            setNewPost({ content: '', mediaFile: null });
            loadPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            if (error.response?.data?.detail) {
                alert(error.response.data.detail);
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        navigate('/login');
    };

    // NEW: Report handler
    const handleReport = async (postId) => {
        try {
            const response = await authService.reportPost(postId);
            const { report_count, post_removed } = response.data;
            if (post_removed) {
                // Remove post instantly from UI when it hits 3 reports
                setPosts(prev => prev.filter(p => p.id !== postId));
            } else {
                // Update count and lock the button for this user
                setPosts(prev => prev.map(p =>
                    p.id === postId
                        ? { ...p, report_count, is_reported: true }
                        : p
                ));
            }
        } catch (error) {
            if (error.response?.data?.detail) {
                alert(error.response.data.detail);
            } else {
                console.error('Error reporting post:', error);
            }
        }
    };

    // NEW: Subscribe toggle handler
    const handleSubscribe = async (postId) => {
        try {
            const response = await authService.subscribePost(postId);
            const { is_subscribed } = response.data;
            setPosts(prev => prev.map(p =>
                p.id === postId
                    ? { ...p, is_subscribed }
                    : p
            ));
        } catch (error) {
            if (error.response?.data?.detail) {
                alert(error.response.data.detail);
            } else {
                console.error('Error subscribing:', error);
            }
        }
    };

    return (
        <div style={styles.container}>
            {/* Sidebar */}
            <div style={styles.sidebar}>
                <div style={styles.profileCard}>
                    <div style={styles.avatar}>
                        {profile?.profile_picture && (
                            <img
                                src={getImageUrl(profile.profile_picture)}
                                alt="Profile"
                                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                            />
                        )}
                    </div>
                    <div style={styles.userName}>{profile?.username}</div>
                    <div style={styles.about}>{profile?.about || 'No bio added yet'}</div>
                    <button style={styles.button} onClick={() => navigate('/profile')}>
                        Edit Profile
                    </button>
                </div>
                <div style={styles.nav}>
                    <button
                        style={{ ...styles.navItem, border: 'none', backgroundColor: 'transparent', width: '100%', textAlign: 'left' }}
                        onClick={handleLogout}
                        onKeyDown={(e) => e.key === 'Enter' && handleLogout()}
                    >
                        Logout
                    </button>
                </div>
            </div>

            {/* Main Content */}
            <div style={styles.mainContent}>
                {/* Create Post */}
                <div style={styles.createPost}>
                    <form onSubmit={handleCreatePost}>
                        <textarea
                            style={styles.input}
                            placeholder="Share something..."
                            value={newPost.content}
                            onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                        />
                        <input
                            type="file"
                            onChange={(e) => setNewPost({ ...newPost, mediaFile: e.target.files[0] })}
                            accept="image/*,video/*"
                        />
                        <button type="submit" style={styles.button}>
                            Post
                        </button>
                    </form>
                </div>

                {/* Posts Feed */}
                {posts.map((post) => (
                    <div key={post.id} style={styles.post}>
                        <div style={styles.postHeader}>
                            <div style={styles.smallAvatar}>
                                {post.profile_picture && (
                                    <img
                                        src={getImageUrl(post.profile_picture)}
                                        alt=""
                                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                                    />
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={styles.userName}>{post.username}</div>
                            </div>
                            {/* NEW: Subscribe & Report buttons in post header top-right */}
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                <button
                                    style={post.is_subscribed ? styles.subscribedBtn : styles.subscribeBtn}
                                    onClick={() => handleSubscribe(post.id)}
                                    title={post.is_subscribed ? 'Unsubscribe' : 'Subscribe'}
                                >
                                    {post.is_subscribed ? '✓ Subscribed' : '+ Subscribe'}
                                </button>
                                <button
                                    style={post.is_reported ? styles.reportedBtn : styles.reportBtn}
                                    onClick={() => !post.is_reported && handleReport(post.id)}
                                    disabled={post.is_reported}
                                    title={post.is_reported ? 'Already reported' : 'Report post'}
                                >
                                    Report {post.report_count > 0 && (
                                        <span style={styles.reportCount}>({post.report_count}/3)</span>
                                    )}
                                </button>
                            </div>
                        </div>
                        <div>{post.content}</div>
                        {post.media_url && (
                            <img
                                src={getImageUrl(post.media_url)}
                                alt=""
                                style={{ maxWidth: '100%', marginTop: '10px' }}
                            />
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Dashboard;