import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { colors } from '../styles/colors';

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    formContainer: {
        backgroundColor: colors.white,
        padding: '2rem',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
        width: '100%',
        maxWidth: '400px',
    },
    title: {
        color: colors.text,
        fontSize: '24px',
        fontWeight: 'bold',
        marginBottom: '1.5rem',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: '0.75rem',
        marginBottom: '1rem',
        border: `1px solid ${colors.border}`,
        borderRadius: '4px',
        fontSize: '16px',
    },
    button: {
        width: '100%',
        padding: '0.75rem',
        backgroundColor: colors.primary,
        color: colors.white,
        border: 'none',
        borderRadius: '4px',
        fontSize: '16px',
        fontWeight: 'bold',
        cursor: 'pointer',
        marginTop: '1rem',
    },
    link: {
        color: colors.primary,
        textDecoration: 'none',
        fontSize: '14px',
        display: 'block',
        textAlign: 'center',
        marginTop: '1rem',
    },
    error: {
        color: colors.error,
        fontSize: '14px',
        textAlign: 'center',
        marginBottom: '1rem',
    }
};

const Login = () => {
    const [credentials, setCredentials] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const response = await authService.login(credentials);
            console.log('Login response:', response.data); // Add this debug line
            localStorage.setItem('token', `Bearer ${response.data.access_token}`);
            navigate('/dashboard');
        } catch (err) {
            console.error('Login error:', err.response?.data); // Add this debug line
            setError(err.response?.data?.detail || 'Login failed');
        }
    };

    const handleChange = (e) => {
        setCredentials({
            ...credentials,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h1 style={styles.title}>Sign in to TrickIT</h1>
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        style={styles.input}
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={credentials.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        style={styles.input}
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={credentials.password}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" style={styles.button}>
                        Sign in
                    </button>
                </form>
                <Link to="/forgot-password" style={styles.link}>
                    Forgot password?
                </Link>
                <Link to="/register" style={styles.link}>
                    New to TrickIT? Join now
                </Link>
            </div>
        </div>
    );
};

export default Login;