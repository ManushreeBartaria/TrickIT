import React, { useState, useEffect, useRef } from 'react';
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
    // Shown on creator's OWN posts — greyed out, not clickable
    ownPostSubscribeBtn: {
        backgroundColor: '#f0f0f0',
        color: '#999',
        border: '1.5px solid #ccc',
        padding: '6px 16px',
        borderRadius: '16px',
        cursor: 'default',
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
        marginBottom: '20px',
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
};

const Dashboard = () => {
    const [profile, setProfile] = useState(null);
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState({ content: '', mediaFile: null });
    const [showReportModal, setShowReportModal] = useState(false);
    const [postToReport, setPostToReport] = useState(null);

    // Community state
    const [showCommunityModal, setShowCommunityModal] = useState(false);
    const [communityStatus, setCommunityStatus] = useState('no');
    const [communityForm, setCommunityForm] = useState({ name: '', upi_id: '' });
    const [communityLoading, setCommunityLoading] = useState(false);
    const [communityError, setCommunityError] = useState('');

    // Payment / subscribe modal state
    const [showPaymentModal, setShowPaymentModal] = useState(false);
    const [pendingSubscribePostId, setPendingSubscribePostId] = useState(null);
    const [paymentStep, setPaymentStep] = useState('info'); // 'info' | 'verify' | 'done'
    const [paymentId, setPaymentId] = useState(null);
    const [upiRef, setUpiRef] = useState('');
    const [payerName, setPayerName] = useState('');
    const [payerUpi, setPayerUpi] = useState('');
    const [paymentLoading, setPaymentLoading] = useState(false);
    const [paymentError, setPaymentError] = useState('');

    // Use a ref to track if this is the initial mount so the communityStatus
    // useEffect doesn't fire an extra loadPosts on first render.
    const isFirstRender = useRef(true);

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
    }, []); // eslint-disable-line react-hooks/exhaustive-deps

    // Reload posts whenever communityStatus changes so the subscribe button
    // appears immediately on other creators' posts after joining.
    // Skip the very first render to avoid double-loading on mount.
    useEffect(() => {
        if (isFirstRender.current) {
            isFirstRender.current = false;
            return;
        }
        loadPosts();
    }, [communityStatus]); // eslint-disable-line react-hooks/exhaustive-deps

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
            await authService.uploadPost(formData);
            setNewPost({ content: '', mediaFile: null });
            loadPosts();
        } catch (error) {
            console.error('Error creating post:', error);
            if (error.response?.data?.detail) alert(error.response.data.detail);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
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

    const handleSubscribe = (postId, alreadySubscribed) => {
        // If already subscribed → do nothing (subscriptions are permanent)
        if (alreadySubscribed) {
            return;
        }
        // Always show the payment modal to collect name, UPI ID, then UTR
        setPendingSubscribePostId(postId);
        setPaymentStep('info');
        setPaymentId(null);
        setUpiRef('');
        setPayerName('');
        setPayerUpi('');
        setPaymentError('');
        setShowPaymentModal(true);
    };

    const handlePaymentInitiate = async () => {
        if (!payerName.trim()) {
            setPaymentError('Please enter your full name.');
            return;
        }
        if (!payerUpi.trim()) {
            setPaymentError('Please enter your UPI ID.');
            return;
        }
        setPaymentLoading(true);
        setPaymentError('');
        try {
            const res = await authService.initiatePayment();
            setPaymentId(res.data.payment_id);
            setPaymentStep('verify');
        } catch (error) {
            setPaymentError(error.response?.data?.detail || 'Could not initiate payment.');
        } finally {
            setPaymentLoading(false);
        }
    };

    const handlePaymentVerify = async () => {
        if (!upiRef.trim()) {
            setPaymentError('Please enter your UPI transaction reference.');
            return;
        }
        setPaymentLoading(true);
        setPaymentError('');
        try {
            await authService.verifyPayment({ payment_id: paymentId, upi_ref: upiRef.trim() });
            // Payment done — now subscribe
            const response = await authService.subscribePost(pendingSubscribePostId);
            const { is_subscribed } = response.data;
            setPosts(prev => prev.map(p =>
                p.id === pendingSubscribePostId
                    ? { ...p, is_subscribed, viewer_has_paid: true }
                    : { ...p, viewer_has_paid: true }
            ));
            setPaymentStep('done');
        } catch (error) {
            setPaymentError(error.response?.data?.detail || 'Verification failed. Please check your reference.');
        } finally {
            setPaymentLoading(false);
        }
    };

    const closePaymentModal = () => {
        setShowPaymentModal(false);
        setPendingSubscribePostId(null);
        setPaymentStep('info');
        setPaymentId(null);
        setUpiRef('');
        setPayerName('');
        setPayerUpi('');
        setPaymentError('');
    };

    // ─── Community flow ───────────────────────────────────────────────────────

    const handleJoinCommunityClick = () => {
        if (communityStatus === 'yes') return;
        setCommunityForm({ name: '', upi_id: '' });
        setCommunityError('');
        setShowCommunityModal(true);
    };

    const handleCommunitySubmit = async (e) => {
        e.preventDefault();
        if (!communityForm.name.trim() || !communityForm.upi_id.trim()) {
            setCommunityError('Please fill in all fields.');
            return;
        }
        setCommunityLoading(true);
        setCommunityError('');
        try {
            const response = await authService.joinCommunity({
                name: communityForm.name.trim(),
                upi_id: communityForm.upi_id.trim(),
            });

            // Close modal first so the UI feels snappy
            setShowCommunityModal(false);

            // Update status — this also triggers the useEffect which calls loadPosts,
            // so the subscribe button appears immediately on other creators' posts.
            setCommunityStatus(response.data.status);

        } catch (error) {
            setCommunityError(error.response?.data?.detail || 'Something went wrong. Please try again.');
        } finally {
            setCommunityLoading(false);
        }
    };

    // ─── Render helpers ───────────────────────────────────────────────────────

    // Decide what to render in the subscribe button slot for a given post.
    // - can_subscribe (from backend) = author is creator AND viewer is not the author
    //   → show active Subscribe / Subscribed button
    // - is_own_post && is_community_creator
    //   → show greyed-out disabled button so the creator can see the feature is live
    // - otherwise → nothing
    const renderSubscribeButton = (post) => {
        if (post.can_subscribe) {
            const label = post.is_subscribed ? '✓ Subscribed' : '🔒 Subscribe';
            return (
                <button
                    style={post.is_subscribed ? styles.subscribedBtn : styles.subscribeBtn}
                    onClick={() => handleSubscribe(post.id, post.is_subscribed)}
                >
                    {label}
                </button>
            );
        }

        if (post.is_own_post && post.is_community_creator) {
            return (
                <button
                    style={styles.ownPostSubscribeBtn}
                    disabled
                    title="Other users see a Subscribe button on your posts"
                >
                    + Subscribe
                </button>
            );
        }

        return null;
    };

    // ─── Render ───────────────────────────────────────────────────────────────

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
                    <div style={styles.about}>{profile?.about || 'No bio added yet'}</div>

                    {/* Edit Profile */}
                    <button style={styles.button} onClick={() => navigate('/profile')}>
                        Edit Profile
                    </button>

                    {/* Join Community */}
                    <button
                        style={communityStatus === 'yes' ? styles.alreadyJoinedBtn : styles.joinBtn}
                        onClick={handleJoinCommunityClick}
                    >
                        {communityStatus === 'yes' ? '✓ Already Joined' : '🌐 Join Community'}
                    </button>

                    {/* View Community — visible to everyone */}
                        <button
                            style={styles.viewCommunityBtn}
                            onClick={() => navigate('/community')}
                        >
                            💬 View Community
                        </button>

                    {/* My Subscribers — visible to everyone */}
                        <button
                            style={{
                                ...styles.viewCommunityBtn,
                                marginTop: '8px',
                                borderColor: '#2e7d32',
                                color: '#2e7d32',
                            }}
                            onClick={() => navigate('/my-subscribers')}
                        >
                            👥 My Subscribers
                        </button>
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
                        <button type="submit" style={styles.button}>Post</button>
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
                                <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                                    <span style={styles.userName}>{post.username}</span>
                                    {post.is_community_creator && (
                                        <span style={{
                                            fontSize: '11px',
                                            backgroundColor: '#e8f4e8',
                                            color: '#2e7d32',
                                            border: '1px solid #2e7d32',
                                            borderRadius: '8px',
                                            padding: '1px 6px',
                                            fontWeight: '600',
                                        }}>
                                            Creator
                                        </span>
                                    )}
                                </div>
                                <div style={{ fontSize: '12px', color: '#666' }}>
                                    {post.subscriber_count || 0} Subscribers
                                </div>
                            </div>

                            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                                {/* Subscribe button — active for others, greyed for own post */}
                                {renderSubscribeButton(post)}

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

            {/* ── Report Modal ──────────────────────────────────────────────── */}
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

            {/* ── Join Community Modal ──────────────────────────────────────── */}
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
                            {communityError && (
                                <div style={{ color: '#cc0000', fontSize: '13px', marginBottom: '10px' }}>
                                    {communityError}
                                </div>
                            )}
                            <div style={styles.modalActions}>
                                <button type="button" style={styles.cancelBtn} onClick={() => setShowCommunityModal(false)}>
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
            {/* ── Payment Modal ─────────────────────────────────────────────── */}
            {showPaymentModal && (
                <div style={styles.modalOverlay} onClick={paymentStep !== 'done' ? closePaymentModal : undefined}>
                    <div style={styles.modalContent} onClick={(e) => e.stopPropagation()}>
                        {paymentStep === 'info' && (
                            <>
                                <div style={styles.modalHeader}>💳 Subscribe to Creator</div>
                                <div style={styles.modalBody}>
                                    A one-time platform fee of <strong>₹99</strong> is required to subscribe and unlock direct chat with creators.<br /><br />
                                    Pay to UPI ID: <strong>trickit@upi</strong><br />
                                    Then fill in your details below and click "I have paid ₹99".
                                </div>
                                <label style={styles.formLabel}>Full Name</label>
                                <input
                                    style={styles.formInput}
                                    type="text"
                                    placeholder="Enter your full name"
                                    value={payerName}
                                    onChange={(e) => setPayerName(e.target.value)}
                                />
                                <label style={styles.formLabel}>Your UPI ID</label>
                                <input
                                    style={styles.formInput}
                                    type="text"
                                    placeholder="e.g. yourname@upi"
                                    value={payerUpi}
                                    onChange={(e) => setPayerUpi(e.target.value)}
                                />
                                {paymentError && (
                                    <div style={{ color: '#cc0000', fontSize: '13px', marginBottom: '10px' }}>{paymentError}</div>
                                )}
                                <div style={styles.modalActions}>
                                    <button style={styles.cancelBtn} onClick={closePaymentModal}>Cancel</button>
                                    <button
                                        style={{ ...styles.submitBtn, opacity: paymentLoading ? 0.7 : 1 }}
                                        onClick={handlePaymentInitiate}
                                        disabled={paymentLoading}
                                    >
                                        {paymentLoading ? 'Processing...' : 'I have paid ₹99'}
                                    </button>
                                </div>
                            </>
                        )}

                        {paymentStep === 'verify' && (
                            <>
                                <div style={styles.modalHeader}>✅ Enter Transaction Reference</div>
                                <div style={styles.modalBody}>
                                    Enter the UPI transaction reference (UTR) from your payment app to verify your payment.
                                </div>
                                <label style={styles.formLabel}>UPI Transaction Reference (UTR)</label>
                                <input
                                    style={styles.formInput}
                                    type="text"
                                    placeholder="e.g. 123456789012"
                                    value={upiRef}
                                    onChange={(e) => setUpiRef(e.target.value)}
                                />
                                {paymentError && (
                                    <div style={{ color: '#cc0000', fontSize: '13px', marginBottom: '10px' }}>{paymentError}</div>
                                )}
                                <div style={styles.modalActions}>
                                    <button style={styles.cancelBtn} onClick={closePaymentModal}>Cancel</button>
                                    <button
                                        style={{ ...styles.submitBtn, opacity: paymentLoading ? 0.7 : 1 }}
                                        onClick={handlePaymentVerify}
                                        disabled={paymentLoading}
                                    >
                                        {paymentLoading ? 'Verifying...' : 'Verify & Subscribe'}
                                    </button>
                                </div>
                            </>
                        )}

                        {paymentStep === 'done' && (
                            <>
                                <div style={styles.modalHeader}>🎉 Subscribed!</div>
                                <div style={styles.modalBody}>
                                    Payment verified. You are now subscribed to this creator and can chat with them via <strong>View Community</strong>.
                                </div>
                                <div style={styles.modalActions}>
                                    <button style={styles.submitBtn} onClick={closePaymentModal}>Done</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default Dashboard;