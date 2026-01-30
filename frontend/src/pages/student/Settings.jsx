import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { API_BASE_URL } from '../../utils/constants';
import { useAuth } from '../../context/AuthContext';
import { Lock, Mail, CheckCircle, AlertTriangle, Save, Loader2, Key } from 'lucide-react';
import Loader from '../../components/Loader';
import ErrorState from '../../components/ErrorState';

const Settings = () => {
    const { token, logout } = useAuth();
    const [loading, setLoading] = useState(true);
    const [settings, setSettings] = useState({ email: '', isEmailVerified: false });
    
    // Forms
    const [passwordForm, setPasswordForm] = useState({ current: '', new: '', confirm: '' });
    const [emailForm, setEmailForm] = useState({ email: '' });
    const [otp, setOtp] = useState('');

    // States
    const [isPasswordLoading, setIsPasswordLoading] = useState(false);
    const [isEmailLoading, setIsEmailLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    
    // Messages
    const [message, setMessage] = useState({ type: '', text: '' });

    useEffect(() => {
        fetchSettings();
    }, [token]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${API_BASE_URL}/api/student/settings`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setSettings(res.data);
            setEmailForm({ email: res.data.email || '' });
        } catch (err) {
            console.error("Failed to load settings");
        } finally {
            setLoading(false);
        }
    };

    const showMessage = (type, text) => {
        setMessage({ type, text });
        setTimeout(() => setMessage({ type: '', text: '' }), 5000);
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        setPasswordForm(prev => ({ ...prev, error: '' }));
        
        if (passwordForm.new !== passwordForm.confirm) {
            showMessage('error', "New passwords do not match");
            return;
        }

        try {
            setIsPasswordLoading(true);
            await axios.post(`${API_BASE_URL}/api/student/settings/change-password`, {
                currentPassword: passwordForm.current,
                newPassword: passwordForm.new
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showMessage('success', "Password updated successfully");
            setPasswordForm({ current: '', new: '', confirm: '' });
        } catch (err) {
            showMessage('error', err.response?.data?.message || "Failed to update password");
        } finally {
            setIsPasswordLoading(false);
        }
    };

    const handleEmailRequest = async (e) => {
        e.preventDefault();
        try {
            setIsEmailLoading(true);
            await axios.post(`${API_BASE_URL}/api/student/settings/request-email-update`, {
                newEmail: emailForm.email
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setOtpSent(true);
            showMessage('success', "OTP sent to your email. Please check your inbox (and spam).");
        } catch (err) {
            showMessage('error', err.response?.data?.message || "Failed to send OTP");
        } finally {
            setIsEmailLoading(false);
        }
    };

    const handleVerifyOtp = async (e) => {
        e.preventDefault();
        try {
            setIsEmailLoading(true);
            await axios.post(`${API_BASE_URL}/api/student/settings/verify-email-otp`, {
                otp,
                newEmail: emailForm.email
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            showMessage('success', "Email verified successfully!");
            setOtpSent(false);
            setOtp('');
            fetchSettings(); // Refresh status
        } catch (err) {
            showMessage('error', err.response?.data?.message || "Invalid OTP");
        } finally {
            setIsEmailLoading(false);
        }
    };

    if (loading) return <Loader text="Loading settings..." />;

    return (
        <div className="max-w-4xl mx-auto space-y-8">
            <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>

            {/* Alert Box */}
            {message.text && (
                <div className={`p-4 rounded-xl flex items-center gap-3 ${
                    message.type === 'success' ? 'bg-green-50 text-green-700 border border-green-200' : 'bg-red-50 text-red-700 border border-red-200'
                }`}>
                    {message.type === 'success' ? <CheckCircle size={20} /> : <AlertTriangle size={20} />}
                    <p>{message.text}</p>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* 1. Change Password */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-blue-50 text-blue-600 rounded-lg">
                            <Lock size={24} />
                        </div>
                        <div>
                             <h2 className="text-lg font-bold text-gray-900">Change Password</h2>
                             <p className="text-sm text-gray-500">Update your login password</p>
                        </div>
                    </div>

                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Current Password</label>
                            <div className="relative">
                                <Key className="absolute left-3 top-2.5 text-gray-400" size={16} />
                                <input 
                                    type="password" 
                                    className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    placeholder="Enter current password"
                                    value={passwordForm.current}
                                    onChange={e => setPasswordForm({...passwordForm, current: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">New Password</label>
                            <input 
                                type="password" 
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Min. 6 characters"
                                value={passwordForm.new}
                                onChange={e => setPasswordForm({...passwordForm, new: e.target.value})}
                                required
                                minLength={6}
                            />
                        </div>
                         <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">Confirm New Password</label>
                            <input 
                                type="password" 
                                className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
                                placeholder="Re-enter new password"
                                value={passwordForm.confirm}
                                onChange={e => setPasswordForm({...passwordForm, confirm: e.target.value})}
                                required
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isPasswordLoading}
                            className="w-full flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-xl transition-colors disabled:opacity-50"
                        >
                            {isPasswordLoading ? <Loader2 className="animate-spin" size={20} /> : <Save size={20} />}
                            Update Password
                        </button>
                    </form>
                </div>

                {/* 2. Email Settings */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 bg-purple-50 text-purple-600 rounded-lg">
                            <Mail size={24} />
                        </div>
                        <div>
                             <h2 className="text-lg font-bold text-gray-900">Email Preferences</h2>
                             <div className="flex items-center gap-2">
                                <p className="text-sm text-gray-500">Manage communication email</p>
                                {settings.isEmailVerified && (
                                    <span className="flex items-center gap-1 text-[10px] font-bold bg-green-100 text-green-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                                        <CheckCircle size={10} /> Verified
                                    </span>
                                )}
                             </div>
                        </div>
                    </div>
                    
                    {!otpSent ? (
                        <form onSubmit={handleEmailRequest} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
                                <input 
                                    type="email" 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
                                    placeholder="Enter your email"
                                    value={emailForm.email}
                                    onChange={e => setEmailForm({...emailForm, email: e.target.value})}
                                    required
                                />
                                {!settings.isEmailVerified && settings.email && (
                                    <p className="text-xs text-orange-600 mt-1 flex items-center gap-1">
                                        <AlertTriangle size={12} /> Email not verified
                                    </p>
                                )}
                            </div>
                            
                            <button 
                                type="submit" 
                                disabled={isEmailLoading}
                                className="w-full flex items-center justify-center gap-2 bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-xl transition-colors disabled:opacity-50"
                            >
                                {isEmailLoading ? <Loader2 className="animate-spin" size={20} /> : <Mail size={20} />}
                                {settings.isEmailVerified ? 'Update Email' : 'Verify Email'}
                            </button>
                        </form>
                    ) : (
                        <form onSubmit={handleVerifyOtp} className="space-y-4">
                            <div className="p-4 bg-blue-50 rounded-xl border border-blue-100 text-sm text-blue-800">
                                <p><strong>Check your email!</strong></p>
                                <p>We sent a 6-digit code to <u>{emailForm.email}</u>.</p>
                                <p className="text-xs mt-1 text-blue-500">(Check console if testing locally without SMTP)</p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Enter OTP Code</label>
                                <input 
                                    type="text" 
                                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 tracking-widest text-center text-lg font-mono"
                                    placeholder="000000"
                                    maxLength={6}
                                    value={otp}
                                    onChange={e => setOtp(e.target.value.replace(/\D/g,''))}
                                    required
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-2">
                                <button 
                                    type="button" 
                                    onClick={() => setOtpSent(false)}
                                    className="w-full py-2 text-gray-600 hover:bg-gray-100 rounded-xl font-medium transition-colors"
                                >
                                    Cancel
                                </button>
                                <button 
                                    type="submit" 
                                    disabled={isEmailLoading}
                                    className="w-full bg-purple-600 hover:bg-purple-700 text-white font-semibold py-2 rounded-xl transition-colors disabled:opacity-50"
                                >
                                    {isEmailLoading ? 'Verifying...' : 'Verify Code'}
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Settings;
