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
        padding: '2rem',
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

const Register = () => {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }
        try {
            // Create a new object without confirmPassword
            const { confirmPassword, ...registrationData } = formData;
            const response = await authService.register(registrationData);
            if (response.data.message === "User registered successfully") {
                navigate('/login'); // Redirect to login after successful registration
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
    };

    const handleChange = (e) => {
        setFormData({
            ...formData,
            [e.target.name]: e.target.value
        });
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h1 style={styles.title}>Join TrickIT</h1>
                {error && <div style={styles.error}>{error}</div>}
                <form onSubmit={handleSubmit}>
                    <input
                        style={styles.input}
                        type="text"
                        name="fullname"
                        placeholder="Full Name"
                        value={formData.fullname}
                        onChange={handleChange}
                        required
                    />
                    <input
                        style={styles.input}
                        type="email"
                        name="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        style={styles.input}
                        type="password"
                        name="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <input
                        style={styles.input}
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm Password"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />
                    <button type="submit" style={styles.button}>
                        Join Now
                    </button>
                </form>
                <Link to="/login" style={styles.link}>
                    Already on TrickIT? Sign in
                </Link>
            </div>
        </div>
    );
};

export default Register;