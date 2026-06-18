import { useState } from 'react';
import { Card, Button, PageHeader, Input } from '../../components/ui';
import { useAuth } from '../../contexts/AuthContext';
import { User, Lock, Bell, Moon } from 'lucide-react';

export default function SettingsPage() {
    const { user } = useAuth();
    const [darkMode, setDarkMode] = useState(false);
    const [notifications, setNotifications] = useState(true);

    return (
        <div className="max-w-4xl mx-auto">
            <PageHeader
                title="Settings"
                description="Manage your account preferences and application settings"
            />

            <div className="space-y-6">
                {/* Profile Settings */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <User size={20} className="mr-2 text-indigo-500" />
                        Profile Information
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                disabled
                                value={user?.username || 'Admin User'}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                            <input
                                disabled
                                value={user?.email || 'admin@school.com'}
                                className="w-full px-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-slate-500"
                            />
                        </div>
                    </div>
                </Card>

                {/* Security */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <Lock size={20} className="mr-2 text-rose-500" />
                        Security
                    </h3>
                    <div className="space-y-4">
                        <Button variant="secondary">Change Password</Button>
                    </div>
                </Card>

                {/* Preferences */}
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <Bell size={20} className="mr-2 text-amber-500" />
                        Preferences
                    </h3>
                    <div className="space-y-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-slate-800">Email Notifications</h4>
                                <p className="text-sm text-slate-500">Receive emails about important updates</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={notifications} onChange={() => setNotifications(!notifications)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                        <div className="flex items-center justify-between">
                            <div>
                                <h4 className="font-medium text-slate-800">Dark Mode</h4>
                                <p className="text-sm text-slate-500">Enable dark theme for the interface</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" checked={darkMode} onChange={() => setDarkMode(!darkMode)} className="sr-only peer" />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                            </label>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
}
