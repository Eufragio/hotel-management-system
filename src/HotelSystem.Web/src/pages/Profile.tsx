import { useState } from 'react';
import { FaUser, FaLock, FaEnvelope, FaShieldAlt } from 'react-icons/fa';
import { authService } from '../services/api';
import toast from 'react-hot-toast';

const Profile = () => {
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: '',
        newPassword: '',
        confirmPassword: ''
    });
    const [loading, setLoading] = useState(false);

    // Get user info from localStorage
    const userEmail = localStorage.getItem('userEmail') || 'user@hotel.com';
    const userRole = localStorage.getItem('role') || 'Staff';
    const userName = localStorage.getItem('userName') || 'User';

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error('New passwords do not match');
            return;
        }

        if (passwordForm.newPassword.length < 6) {
            toast.error('Password must be at least 6 characters');
            return;
        }

        setLoading(true);
        try {
            await authService.changePassword({
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword
            });

            toast.success('Password changed successfully');
            setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
        } catch (error: any) {
            toast.error(error.response?.data?.message || 'Failed to change password');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">My Profile</h1>
                <p className="text-slate-600 dark:text-slate-400 mt-1">Manage your account settings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* User Information Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <FaUser className="text-primary-500" />
                        User Information
                    </h2>
                    <div className="space-y-4">
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                <FaUser className="text-slate-400" />
                                Name
                            </label>
                            <div className="mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-800 dark:text-white">
                                {userName}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                <FaEnvelope className="text-slate-400" />
                                Email
                            </label>
                            <div className="mt-1 px-3 py-2 bg-slate-50 dark:bg-slate-900 rounded-lg text-slate-800 dark:text-white">
                                {userEmail}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-slate-600 dark:text-slate-400 flex items-center gap-2">
                                <FaShieldAlt className="text-slate-400" />
                                Role
                            </label>
                            <div className="mt-1">
                                <span className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${userRole === 'Admin'
                                        ? 'bg-purple-100 text-purple-700 dark:bg-purple-900 dark:text-purple-300'
                                        : 'bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300'
                                    }`}>
                                    {userRole}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Change Password Card */}
                <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                    <h2 className="text-xl font-semibold text-slate-800 dark:text-white mb-4 flex items-center gap-2">
                        <FaLock className="text-primary-500" />
                        Change Password
                    </h2>
                    <form onSubmit={handlePasswordChange} className="space-y-4">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Current Password
                            </label>
                            <input
                                type="password"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                                value={passwordForm.currentPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                required
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                New Password
                            </label>
                            <input
                                type="password"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                                value={passwordForm.newPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                                Confirm New Password
                            </label>
                            <input
                                type="password"
                                className="w-full px-3 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
                                value={passwordForm.confirmPassword}
                                onChange={e => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                required
                                minLength={6}
                            />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full px-4 py-2 bg-primary-500 text-white rounded-lg hover:bg-primary-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {loading ? (
                                <>
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Updating...
                                </>
                            ) : (
                                <>
                                    <FaLock />
                                    Change Password
                                </>
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default Profile;
