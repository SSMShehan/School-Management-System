import { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts';
import {
    LayoutDashboard,
    Users,
    GraduationCap,
    Wallet,
    FileText,
    Settings,
    Bell,
    Search,
    Menu,
    ChevronDown,
    LogOut,
    Building2,
    CalendarCheck,
    Sparkles,
    X
} from 'lucide-react';

const SidebarItem = ({ icon: Icon, label, to, active, onClick, isSpecial }) => {
    const content = (
        <div className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors duration-200 ${active
                ? 'bg-indigo-50 text-indigo-700 font-medium'
                : isSpecial
                    ? 'text-indigo-600 hover:bg-indigo-50 font-medium'
                    : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
            }`}>
            <Icon size={20} className={isSpecial ? "animate-pulse" : ""} />
            <span>{label}</span>
        </div>
    );

    if (onClick) {
        return <button onClick={onClick} className="w-full text-left">{content}</button>;
    }

    return <Link to={to} className="block">{content}</Link>;
};

export default function MainLayout() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const { user, logout, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path || location.pathname.startsWith(path + '/');

    return (
        <div className="flex h-screen bg-slate-50 font-sans text-slate-900">

            {/* Mobile Overlay */}
            {isMobileMenuOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-20 lg:hidden"
                    onClick={() => setIsMobileMenuOpen(false)}
                />
            )}

            {/* Sidebar */}
            <aside className={`
        fixed lg:static inset-y-0 left-0 z-30 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 ease-in-out flex flex-col
        ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
                {/* Logo */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-slate-100">
                    <div className="flex items-center">
                        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-lg flex items-center justify-center mr-3 shadow-lg shadow-indigo-200">
                            <GraduationCap className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">Scholara</span>
                    </div>
                    <button
                        onClick={() => setIsMobileMenuOpen(false)}
                        className="lg:hidden p-1 rounded text-slate-400 hover:text-slate-600"
                    >
                        <X size={20} />
                    </button>
                </div>

                {/* Navigation */}
                <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-4 mt-2">Main</div>
                    <SidebarItem icon={LayoutDashboard} label="Dashboard" to="/dashboard" active={isActive('/dashboard')} />
                    <SidebarItem icon={Users} label="Students" to="/students" active={isActive('/students')} />
                    <SidebarItem icon={GraduationCap} label="Staff" to="/staff" active={isActive('/staff')} />
                    <SidebarItem icon={CalendarCheck} label="Attendance" to="/attendance" active={isActive('/attendance')} />

                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-4 mt-6">Finance</div>
                    <SidebarItem icon={Wallet} label="Payments" to="/payments" active={isActive('/payments')} />
                    <SidebarItem icon={FileText} label="Reports" to="/reports" active={isActive('/reports')} />

                    {isAdmin && (
                        <>
                            <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-4 mt-6">Admin</div>
                            <SidebarItem icon={Building2} label="Branches" to="/branches" active={isActive('/branches')} />
                            <SidebarItem icon={Settings} label="Settings" to="/settings" active={isActive('/settings')} />
                        </>
                    )}

                    <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 px-4 mt-6">AI Features</div>
                    <SidebarItem icon={Sparkles} label="AI Assistant" to="/ai-tools" active={isActive('/ai-tools')} isSpecial />
                </nav>

                {/* User Profile */}
                <div className="p-4 border-t border-slate-100 bg-slate-50/50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold">
                                {user?.username?.charAt(0).toUpperCase() || 'U'}
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-800">{user?.username || 'User'}</p>
                                <p className="text-xs text-slate-500 capitalize">{user?.role || 'User'}</p>
                            </div>
                        </div>
                        <button
                            onClick={handleLogout}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                            title="Logout"
                        >
                            <LogOut size={18} />
                        </button>
                    </div>
                </div>
            </aside>

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                {/* Top Header */}
                <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-4 lg:px-8 shrink-0">
                    <button
                        onClick={() => setIsMobileMenuOpen(true)}
                        className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 lg:hidden"
                    >
                        <Menu size={24} />
                    </button>

                    {/* Search Bar */}
                    <div className="hidden md:flex items-center flex-1 max-w-md ml-4">
                        <div className="relative w-full">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search students, staff, or payments..."
                                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                            />
                        </div>
                    </div>

                    {/* Right Header */}
                    <div className="flex items-center space-x-4">
                        <button className="relative p-2 rounded-full text-slate-500 hover:bg-slate-100 transition-colors">
                            <Bell size={20} />
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-rose-500 rounded-full border-2 border-white"></span>
                        </button>
                        <div className="hidden md:block h-6 w-px bg-slate-200"></div>
                        <div className="flex items-center space-x-2 cursor-pointer hover:bg-slate-50 px-3 py-2 rounded-lg transition-colors">
                            <span className="text-sm font-medium text-slate-600 hidden md:block">2024-25</span>
                            <ChevronDown size={16} className="text-slate-400" />
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="flex-1 overflow-y-auto p-4 lg:p-8">
                    <div className="max-w-7xl mx-auto">
                        <Outlet />
                    </div>
                </main>
            </div>
        </div>
    );
}
