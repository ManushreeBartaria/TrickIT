import React, { useState, useEffect } from 'react';
import { authService, getImageUrl, API_BASE_URL } from '../services/api';
import { useNavigate } from 'react-router-dom';

const QR_URL = `${API_BASE_URL}/uploads/qr.png`;

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
        overflowY: 'auto',
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
    joinBtn: {
        backgroundColor: '#fff',
        color: '#0a66c2',
        border: '2px solid #0a66c2',
        padding: '8px 16px',
        borderRadius: '16px',
        cursor: 'pointer',
        marginTop: '8px',
        width: '100%',
        fontWeight: '600',
        fontSize: '14px',
    },
    alreadyJoinedBtn: {
        backgroundColor: '#e8f4e8',
        color: '#2e7d32',
        border: '2px solid #2e7d32',
        padding: '8px 16px',
        borderRadius: '16px',
        cursor: 'default',
        marginTop: '8px',
        width: '100%',
        fontWeight: '600',
        fontSize: '14px',
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
        boxSizing: 'border-box',
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
    },
    subscribeBtn: {
        backgroundColor: '#0a66c2',
        color: '#fff',
        border: 'none',
        padding: '6px 16px',
        borderRadius: '16px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
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
    modalOverlay: {
        position: 'fixed',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundColor: 'rgba(0,0,0,0.5)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
    },
    modalContent: {
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '24px',
        maxWidth: '420px',
        width: '90%',
        boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
        maxHeight: '90vh',
        overflowY: 'auto',
    },
    modalHeader: {
        fontSize: '20px',
        fontWeight: 'bold',
        marginBottom: '12px',
        color: '#333',
    },
    modalBody: {
        fontSize: '15px',
        color: '#666',
        marginBottom: '16px',
        lineHeight: '1.5',
    },
    modalActions: {
        display: 'flex',
        gap: '12px',
        justifyContent: 'flex-end',
    },
    cancelBtn: {
        backgroundColor: '#f3f2ef',
        color: '#333',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
    },
    confirmBtn: {
        backgroundColor: '#cc0000',
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
    },
    submitBtn: {
        backgroundColor: '#0a66c2',
        color: '#fff',
        border: 'none',
        padding: '10px 20px',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '14px',
        fontWeight: '600',
    },
    viewCommunityBtn: {
        backgroundColor: '#fff',
        color: '#0a66c2',
        border: '2px solid #0a66c2',
        padding: '8px 16px',
        borderRadius: '16px',
        cursor: 'pointer',
        marginTop: '8px',
        width: '100%',
        fontWeight: '600',
        fontSize: '14px',
    },
    disabledBtn: {
        backgroundColor: '#f0f0f0',
        color: '#aaa',
        border: '2px solid #ddd',
        padding: '8px 16px',
        borderRadius: '16px',
        cursor: 'not-allowed',
        marginTop: '8px',
        width: '100%',
        fontWeight: '600',
        fontSize: '14px',
    },
    formInput: {
        width: '100%',
        padding: '10px 12px',
        border: '1px solid #e0e0e0',
        borderRadius: '8px',
        fontSize: '14px',
        marginBottom: '12px',
        boxSizing: 'border-box',
    },
    formLabel: {
        fontSize: '13px',
        fontWeight: '600',
        color: '#444',
        marginBottom: '4px',
        display: 'block',
    },
    // Payment box inside modals
    paymentSection: {
        border: '1.5px solid #e0e0e0',
        borderRadius: '10px',
        padding: '14px',
        backgroundColor: '#fafafa',
        textAlign: 'center',
        marginBottom: '14px',
    },
    paymentNote: {
        fontSize: '13px',
        color: '#555',
        marginBottom: '10px',
        fontWeight: '500',
    },
    qrImage: {
        width: '150px',
        height: '150px',
        objectFit: 'contain',
        border: '1px solid #ddd',
        borderRadius: '8px',
        marginBottom: '10px',
        display: 'block',
        margin: '0 auto 10px',
    },
    boostBtn: {
        backgroundColor: '#ff6600',
        color: '#fff',
        border: 'none',
        padding: '8px 16px',
        borderRadius: '16px',
        cursor: 'pointer',
        fontSize: '13px',
        fontWeight: '600',
        marginLeft: '8px',
    },
};

// Reusable QR Payment Block for modals
const QrPaymentBlock = ({ transactionId, onTransactionIdChange }) => (
    <div style={styles.paymentSection}>
        <div style={styles.paymentNote}>
            💳 Pay <strong>₹1</strong> (demo) by scanning the QR below
        </div>
        <img src={QR_URL} alt="Payment QR Code" style={styles.qrImage} />
        <input
            style={{ ...styles.formInput, marginBottom: 0 }}
            type="text"
            placeholder="Enter Transaction ID after payment"
            value={transactionId}
            onChange={(e) => onTransactionIdChange(e.target.value)}
        />
    </div>
);

const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ content: '', mediaFile: null });
    const [showReportModal, setShowReportModal] = useState(false);
    const [postToReport, setPostToReport] = useState(null);

    // Community state
    const [showCommunityModal, setShowCommunityModal] = useState(false);
    const [communityStatus, setCommunityStatus] = useState('no');
    const [communityForm, setCommunityForm] = useState({ name: '', upi_id: '', transaction_id: '' });
    const [communityLoading, setCommunityLoading] = useState(false);
    const [communityError, setCommunityError] = useState('');
    const [hasSubscriptions, setHasSubscriptions] = useState(false);

    // Subscribe payment modal
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [subscribePostId, setSubscribePostId] = useState(null);
    const [subscribeTxnId, setSubscribeTxnId] = useState('');
    const [subscribeLoading, setSubscribeLoading] = useState(false);

    // Boost post modal (company only)
    const [showBoostModal, setShowBoostModal] = useState(false);
    const [boostPostId, setBoostPostId] = useState(null);
    const [boostTxnId, setBoostTxnId] = useState('');
    const [lastCreatedPostId, setLastCreatedPostId] = useState(null);
    const [boostLoading, setBoostLoading] = useState(false);

    const isCompany = localStorage.getItem('user_type') === 'company';
    const navigate = useNavigate();

    useEffect(() => {
        loadProfile();
        loadPosts();
        loadCommunityStatus();
        const interval = setInterval(() => {
            loadProfile();
            loadPosts();
        }, 5000);
        return () => clearInterval(interval);
    }, []);

    const loadCommunityStatus = async () => {
        try {
            const response = await authService.communityStatus();
            setCommunityStatus(response.data.status);
        } catch (error) {
            console.error('Error loading community status:', error);
        }
    };

    const loadPosts = async () => {
        try {
            const response = await authService.getPosts();
            setPosts(response.data);
            const anySubscribed = response.data.some(p => p.is_subscribed);
            setHasSubscriptions(anySubscribed);
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
            if (error.response?.status === 401) navigate('/login');
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        try {
            const formData = new FormData();
            formData.append('content', newPost.content);
            if (newPost.mediaFile) formData.append('media', newPost.mediaFile);
            const res = await authService.uploadPost(formData);
            // Track last post ID so company can optionally boost it
            if (res.data?.id) setLastCreatedPostId(res.data.id);
            setNewPost({ content: '', mediaFile: null });
            loadPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            if (error.response?.data?.detail) alert(error.response.data.detail);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user_type');
        navigate('/login');
    };

    const handleReportClick = (postId) => {
        setPostToReport(postId);
        setShowReportModal(true);
    };

    const confirmReport = async () => {
        try {
            const response = await authService.reportPost(postToReport);
            const { report_count, post_removed } = response.data;
            if (post_removed) {
                setPosts(prev => prev.filter(p => p.id !== postToReport));
            } else {
                setPosts(prev => prev.map(p =>
                    p.id === postToReport ? { ...p, report_count, is_reported: true } : p
                ));
            }
            setShowReportModal(false);
            setPostToReport(null);
        } catch (error) {
            if (error.response?.data?.detail) alert(error.response.data.detail);
            setShowReportModal(false);
            setPostToReport(null);
        }
    };

    const cancelReport = () => {
        setShowReportModal(false);
        setPostToReport(null);
    };

    // --- Subscribe: open payment modal ---
    const handleSubscribeClick = (postId) => {
        setSubscribePostId(postId);
        setSubscribeTxnId('');
        setShowSubscribeModal(true);
    };

    const confirmSubscribe = async () => {
        if (!subscribeTxnId.trim()) {
            alert('Please enter the Transaction ID after making the ₹1 payment.');
            return;
        }
        setSubscribeLoading(true);
        try {
            // First verify payment with Macrodroid
            await authService.verifyPayment({
                transaction_id: subscribeTxnId.trim(),
                source_type: 'subscribe',
                source_id: subscribePostId,
            });
            // Then subscribe
            const response = await authService.subscribePost(subscribePostId);
            const { is_subscribed } = response.data;
            setPosts(prev => {
                const updated = prev.map(p =>
                    p.id === subscribePostId ? { ...p, is_subscribed } : p
                );
                setHasSubscriptions(updated.some(p => p.is_subscribed));
                return updated;
            });
            setShowSubscribeModal(false);
        } catch (error) {
            alert(error.response?.data?.detail || 'Subscription failed. Please try again.');
        } finally {
            setSubscribeLoading(false);
        }
    };

    // --- Join Community ---
    const handleJoinCommunityClick = () => {
        if (communityStatus === 'yes') return;
        if (!hasSubscriptions) {
            alert('You must subscribe to at least one creator before joining the community.');
            return;
        }
        setCommunityForm({ name: '', upi_id: '', transaction_id: '' });
        setCommunityError('');
        setShowCommunityModal(true);
    };

    const handleCommunitySubmit = async (e) => {
        e.preventDefault();
        if (!communityForm.name.trim() || !communityForm.upi_id.trim()) {
            setCommunityError('Please fill in all fields.');
            return;
        }
        if (!communityForm.transaction_id.trim()) {
            setCommunityError('Please enter the Transaction ID after making the ₹1 payment.');
            return;
        }
        setCommunityLoading(true);
        setCommunityError('');
        try {
            const response = await authService.joinCommunity({
                name: communityForm.name.trim(),
                upi_id: communityForm.upi_id.trim(),
                transaction_id: communityForm.transaction_id.trim(),
            });
            setCommunityStatus(response.data.status);
            setShowCommunityModal(false);
        } catch (error) {
            setCommunityError(error.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setCommunityLoading(false);
        }
    };

    // --- Boost Post (company only) ---
    const handleBoostClick = (postId = lastCreatedPostId) => {
        if (!postId) {
            alert('Please create a post first before boosting.');
            return;
        }
        setBoostPostId(postId);
        setBoostTxnId('');
        setShowBoostModal(true);
    };

    const confirmBoost = async () => {
        if (!boostTxnId.trim()) {
            alert('Please enter the Transaction ID after making the ₹1 payment.');
            return;
        }
        setBoostLoading(true);
        try {
            const response = await authService.boostPost({
                post_id: boostPostId,
                transaction_id: boostTxnId.trim(),
            });
            alert(response.data.message || 'Post boosted successfully!');
            setShowBoostModal(false);
            setLastCreatedPostId(null);
            loadPosts();
        } catch (error) {
            alert(error.response?.data?.detail || 'Boost failed. Please try again.');
        } finally {
            setBoostLoading(false);
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
                                style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '60px' }}
                            />
                        )}
                    </div>
                    <div style={styles.userName}>{profile?.username}</div>
                    {isCompany && (
                        <div style={{ fontSize: '11px', color: '#0a66c2', fontWeight: '600', marginBottom: '4px' }}>
                            🏢 Company / Startup
                        </div>
                    )}
                    <div style={styles.about}>{profile?.about || 'No bio added yet'}</div>

                    {/* Edit Profile Button */}
                    <button style={styles.button} onClick={() => navigate('/profile')}>
                        Edit Profile
                    </button>

                    {/* Join Community Button */}
                    <button
                        style={
                            communityStatus === 'yes'
                                ? styles.alreadyJoinedBtn
                                : !hasSubscriptions
                                ? styles.disabledBtn
                                : styles.joinBtn
                        }
                        onClick={handleJoinCommunityClick}
                        title={!hasSubscriptions && communityStatus !== 'yes' ? 'Subscribe to a creator first to join the community' : ''}
                    >
                        {communityStatus === 'yes' ? '✓ Already Joined' : '🌐 Join Community'}
                    </button>

                    {/* View Community Button - only for community members */}
                    {communityStatus === 'yes' && (
                        <button
                            style={styles.viewCommunityBtn}
                            onClick={() => navigate('/community')}
                        >
                            💬 View Community
                        </button>
                    )}
                </div>

                <div style={styles.nav}>
                    <button
                        style={{ ...styles.navItem, border: 'none', backgroundColor: 'transparent', width: '100%', textAlign: 'left' }}
                        onClick={handleLogout}
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
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
                            <button type="submit" style={styles.button}>Post</button>
                            {/* Boost Post button — company only, shown after a post is created */}
                            {isCompany && (
                                <button
                                    type="button"
                                    style={{
                                        ...styles.boostBtn,
                                        opacity: lastCreatedPostId ? 1 : 0.45,
                                        cursor: lastCreatedPostId ? 'pointer' : 'not-allowed',
                                    }}
                                    onClick={() => handleBoostClick()}
                                    title={lastCreatedPostId ? 'Boost your last post' : 'Post something first to boost it'}
                                >
                                    🚀 Boost Post
                                </button>
                            )}
                        </div>
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
                                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '20px' }}
                                    />
                                )}
                            </div>
                            <div style={{ flex: 1 }}>
                                <div style={styles.userName}>{post.username}</div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    {post.subscriber_count || 0} Subscribers
                                </div>
                            </div>
                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap' }}>
                                <button
                                    style={post.is_subscribed ? styles.subscribedBtn : styles.subscribeBtn}
                                    onClick={() => !post.is_subscribed && handleSubscribeClick(post.id)}
                                >
                                    {post.is_subscribed ? '✓ Subscribed' : '+ Subscribe'}
                                </button>
                                <button
                                    style={post.is_reported ? styles.reportedBtn : styles.reportBtn}
                                    onClick={() => !post.is_reported && handleReportClick(post.id)}
                                    disabled={post.is_reported}
                                >
                                    🚩 Report
                                    {post.report_count > 0 && (
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
                                style={{ maxWidth: '100%', marginTop: '10px', borderRadius: '8px' }}
                            />
                        )}
                    </div>
                ))}
            </div>

            {/* Report Modal */}
            {showReportModal && (
                <div style={styles.modalOverlay} onClick={cancelReport}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>Report Post?</div>
                        <div style={styles.modalBody}>
                            Are you sure you want to report this post? If this post receives 3 reports, it will be automatically removed.
                        </div>
                        <div style={styles.modalActions}>
                            <button style={styles.cancelBtn} onClick={cancelReport}>Cancel</button>
                            <button style={styles.confirmBtn} onClick={confirmReport}>Report</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Subscribe Payment Modal */}
            {showSubscribeModal && (
                <div style={styles.modalOverlay} onClick={() => setShowSubscribeModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>💳 Subscribe to Creator</div>
                        <div style={styles.modalBody}>
                            A one-time <strong>₹1 demo payment</strong> is required to subscribe.
                        </div>
                        <QrPaymentBlock
                            transactionId={subscribeTxnId}
                            onTransactionIdChange={setSubscribeTxnId}
                        />
                        <div style={styles.modalActions}>
                            <button style={styles.cancelBtn} onClick={() => setShowSubscribeModal(false)}>
                                Cancel
                            </button>
                            <button
                                style={{ ...styles.submitBtn, opacity: subscribeLoading ? 0.7 : 1 }}
                                disabled={subscribeLoading}
                                onClick={confirmSubscribe}
                            >
                                {subscribeLoading ? 'Processing...' : 'Subscribe'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Join Community Modal */}
            {showCommunityModal && (
                <div style={styles.modalOverlay} onClick={() => setShowCommunityModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>🌐 Join Community</div>
                        <div style={styles.modalBody}>
                            Fill in your details to become a community creator and enable monetisation.
                        </div>
                        <form onSubmit={handleCommunitySubmit}>
                            <label style={styles.formLabel}>Full Name</label>
                            <input
                                style={styles.formInput}
                                type="text"
                                placeholder="Enter your full name"
                                value={communityForm.name}
                                onChange={(e) => setCommunityForm({ ...communityForm, name: e.target.value })}
                            />
                            <label style={styles.formLabel}>UPI ID</label>
                            <input
                                style={styles.formInput}
                                type="text"
                                placeholder="e.g. yourname@upi"
                                value={communityForm.upi_id}
                                onChange={(e) => setCommunityForm({ ...communityForm, upi_id: e.target.value })}
                            />
                            {/* QR Payment block */}
                            <QrPaymentBlock
                                transactionId={communityForm.transaction_id}
                                onTransactionIdChange={(val) => setCommunityForm({ ...communityForm, transaction_id: val })}
                            />
                            {communityError && (
                                <div style={{ color: '#cc0000', fontSize: '13px', marginBottom: '10px' }}>
                                    {communityError}
                                </div>
                            )}
                            <div style={styles.modalActions}>
                                <button
                                    type="button"
                                    style={styles.cancelBtn}
                                    onClick={() => setShowCommunityModal(false)}
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    style={{ ...styles.submitBtn, opacity: communityLoading ? 0.7 : 1 }}
                                    disabled={communityLoading}
                                >
                                    {communityLoading ? 'Submitting...' : 'Submit'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Boost Post Modal (Company Only) */}
            {showBoostModal && (
                <div style={styles.modalOverlay} onClick={() => setShowBoostModal(false)}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        <div style={styles.modalHeader}>🚀 Boost Post</div>
                        <div style={styles.modalBody}>
                            Boosting a post requires a <strong>₹1 demo payment</strong>. Your post will be highlighted for more visibility.
                        </div>
                        <QrPaymentBlock
                            transactionId={boostTxnId}
                            onTransactionIdChange={setBoostTxnId}
                        />
                        <div style={styles.modalActions}>
                            <button style={styles.cancelBtn} onClick={() => setShowBoostModal(false)}>
                                Cancel
                            </button>
                            <button
                                style={{ ...styles.boostBtn, padding: '10px 20px', marginLeft: 0, opacity: boostLoading ? 0.7 : 1 }}
                                disabled={boostLoading}
                                onClick={confirmBoost}
                            >
                                {boostLoading ? 'Boosting...' : '🚀 Confirm Boost'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;