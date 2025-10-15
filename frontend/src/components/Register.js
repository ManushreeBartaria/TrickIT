import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { authService } from '../services/api';
import { colors } from '../styles/colors';
import { isValidEmail, isValidPassword, getEmailValidationMessage, getPasswordValidationMessage } from '../utils/validation';

const styles = {
    container: {
        minHeight: '100vh',
        backgroundColor: colors.background,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
    },
    inputGroup: {
        marginBottom: '1.5rem',
        position: 'relative',
    },
    inputLabel: {
        display: 'block',
        marginBottom: '0.5rem',
        color: colors.text,
        fontSize: '0.9rem',
        fontWeight: '500',
    },
    passwordContainer: {
        position: 'relative',
        width: '100%',
    },
    passwordToggle: {
        position: 'absolute',
        right: '12px',
        top: '50%',
        transform: 'translateY(-50%)',
        cursor: 'pointer',
        border: 'none',
        background: 'none',
        color: colors.primary,
        padding: '8px',
        borderRadius: '4px',
        fontSize: '0.9rem',
        fontWeight: '500',
        display: 'flex',
        alignItems: 'center',
        '&:hover': {
            backgroundColor: 'rgba(0, 0, 0, 0.05)',
        },
    },
    validationMessage: {
        fontSize: '0.8rem',
        marginTop: '0.25rem',
        color: colors.text,
    },
    strengthIndicator: {
        height: '4px',
        marginTop: '0.5rem',
        backgroundColor: '#e0e0e0',
        borderRadius: '2px',
        overflow: 'hidden',
    },
    strengthProgress: {
        height: '100%',
        transition: 'width 0.3s ease, background-color 0.3s ease',
    },
    formContainer: {
        backgroundColor: colors.white,
        padding: '2.5rem',
        borderRadius: '12px',
        boxShadow: '0 4px 20px rgba(0, 0, 0, 0.08)',
        width: '100%',
        maxWidth: '440px',
    },
    title: {
        color: colors.text,
        fontSize: '28px',
        fontWeight: 'bold',
        marginBottom: '2rem',
        textAlign: 'center',
    },
    input: {
        width: '100%',
        padding: '0.875rem 1rem',
        border: `2px solid ${colors.border}`,
        borderRadius: '8px',
        fontSize: '1rem',
        transition: 'border-color 0.2s ease',
        outline: 'none',
        '&:focus': {
            borderColor: colors.primary,
        },
        '&:hover': {
            borderColor: colors.primary + '80',
        },
    },
    button: {
        width: '100%',
        padding: '1rem',
        backgroundColor: colors.primary,
        color: colors.white,
        border: 'none',
        borderRadius: '8px',
        fontSize: '1rem',
        fontWeight: '600',
        cursor: 'pointer',
        marginTop: '1.5rem',
        transition: 'background-color 0.2s ease, transform 0.1s ease',
        '&:hover': {
            backgroundColor: colors.primary + 'e6',
            transform: 'translateY(-1px)',
        },
        '&:active': {
            transform: 'translateY(0)',
        },
    },
    link: {
        color: colors.primary,
        textDecoration: 'none',
        fontSize: '0.9rem',
        display: 'block',
        textAlign: 'center',
        marginTop: '1.5rem',
        fontWeight: '500',
        transition: 'color 0.2s ease',
        '&:hover': {
            color: colors.primary + 'cc',
        },
    },
    error: {
        color: colors.error,
        fontSize: '0.9rem',
        textAlign: 'center',
        marginBottom: '1.5rem',
        padding: '0.75rem',
        backgroundColor: colors.error + '10',
        borderRadius: '6px',
        border: `1px solid ${colors.error}20`,
    }
};

const getPasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 9) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[a-z]/)) strength += 25;
    if (password.match(/[0-9]/) || password.match(/[^A-Za-z0-9]/)) strength += 25;
    return strength;
};

const getStrengthColor = (strength) => {
    if (strength <= 25) return '#ff4d4d';
    if (strength <= 50) return '#ffd700';
    if (strength <= 75) return '#2ecc71';
    return '#27ae60';
};

const getStrengthText = (strength) => {
    if (strength <= 25) return 'Weak';
    if (strength <= 50) return 'Fair';
    if (strength <= 75) return 'Good';
    return 'Strong';
};

const Register = () => {
    const [formData, setFormData] = useState({
        fullname: '',
        email: '',
        password: '',
        confirmPassword: '',
    });
    const [error, setError] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);
    const [passwordStrength, setPasswordStrength] = useState(0);
    const navigate = useNavigate();

    // Remove warning about unused variables
    const togglePassword = () => setShowPassword(!showPassword);
    const toggleConfirmPassword = () => setShowConfirmPassword(!showConfirmPassword);

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Validate email
        if (!isValidEmail(formData.email)) {
            setError(getEmailValidationMessage());
            return;
        }

        
        if (!isValidPassword(formData.password)) {
            setError(getPasswordValidationMessage());
            return;
        }

        
        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        try {
            
            const { confirmPassword, ...registrationData } = formData;
            const response = await authService.register(registrationData);
            if (response.data.message === "User registered successfully") {
                navigate('/login'); 
            }
        } catch (err) {
            setError(err.response?.data?.detail || 'Registration failed');
        }
    };

    const handleChange = (e) => {
        const value = e.target.name === 'email' ? e.target.value.toLowerCase() : e.target.value;
        setFormData({
            ...formData,
            [e.target.name]: value
        });
        if (e.target.name === 'password') {
            setPasswordStrength(getPasswordStrength(value));
        }
    };

    return (
        <div style={styles.container}>
            <div style={styles.formContainer}>
                <h1 style={styles.title}>Join TrickIT</h1>
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
                        pattern="^[a-zA-Z][a-zA-Z0-9._%+-]*@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
                        title={getEmailValidationMessage()}
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <div style={styles.passwordContainer}>
                        <input
                            style={styles.input}
                            type={showPassword ? "text" : "password"}
                            name="password"
                            placeholder="Password"
                            title={getPasswordValidationMessage()}
                            minLength={9}
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            style={styles.passwordToggle}
                            onClick={togglePassword}
                            tabIndex="-1"
                            aria-label={showPassword ? "Hide password" : "Show password"}
                        >
                            {showPassword ? "Hide" : "Show"}
                        </button>
                        <div style={styles.strengthIndicator}>
                            <div 
                                style={{
                                    ...styles.strengthProgress,
                                    width: `${passwordStrength}%`,
                                    backgroundColor: getStrengthColor(passwordStrength)
                                }}
                            />
                        </div>
                        <div style={styles.validationMessage}>
                            Password strength: {getStrengthText(passwordStrength)}
                        </div>
                    </div>
                    <div style={styles.passwordContainer}>
                        <input
                            style={styles.input}
                            type={showConfirmPassword ? "text" : "password"}
                            name="confirmPassword"
                            placeholder="Confirm Password"
                            title="Must match the password above"
                            minLength={9}
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                        <button
                            type="button"
                            style={styles.passwordToggle}
                            onClick={toggleConfirmPassword}
                            tabIndex="-1"
                            aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                        >
                            {showConfirmPassword ? "Hide" : "Show"}
                        </button>
                    </div>
                    {error && <div style={styles.error}>{error}</div>}
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