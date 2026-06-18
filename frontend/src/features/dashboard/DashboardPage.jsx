import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import {
    GraduationCap,
    Users,
    Wallet,
    FileText,
    Plus,
    Filter,
    TrendingUp,
    TrendingDown,
    MoreVertical
} from 'lucide-react';
import { StatCard, StatusBadge, Card, CardHeader, Button, PageHeader, LoadingSpinner } from '../../components/ui';
import api from '../../api/client';

// Mock data for now - will be replaced with API calls
const STATS = [
    { label: 'Total Students', value: '1,245', change: '+12%', trend: 'up', icon: GraduationCap, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Total Staff', value: '84', change: '+2', trend: 'up', icon: Users, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Monthly Revenue', value: 'Rs.452,000', change: '+8.1%', trend: 'up', icon: Wallet, color: 'text-emerald-600', bg: 'bg-emerald-50' },
    { label: 'Pending Fees', value: 'Rs.85,000', change: '-2.5%', trend: 'down', icon: FileText, color: 'text-amber-600', bg: 'bg-amber-50' },
];

const RECENT_PAYMENTS = [
    { id: 'REC-001', student: 'Alex Johnson', grade: '10-A', amount: 5000, date: '2024-01-10', status: 'Completed' },
    { id: 'REC-002', student: 'Sarah Smith', grade: '08-B', amount: 4500, date: '2024-01-10', status: 'Completed' },
    { id: 'REC-003', student: 'Michael Brown', grade: '12-C', amount: 6000, date: '2024-01-09', status: 'Pending' },
    { id: 'REC-004', student: 'Emily Davis', grade: '05-A', amount: 3000, date: '2024-01-09', status: 'Failed' },
];

function FinancialChart() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const values = [65, 45, 75, 50, 80, 60, 90, 75, 60, 80, 95, 85];

    return (
        <Card>
            <div className="p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-lg font-bold text-slate-800">Financial Overview</h2>
                    <select className="text-sm border-slate-200 rounded-lg text-slate-600 focus:ring-indigo-500 px-3 py-1.5">
                        <option>This Year</option>
                        <option>Last Year</option>
                    </select>
                </div>

                <div className="h-64 flex items-end justify-between gap-2">
                    {values.map((h, i) => (
                        <div key={i} className="w-full bg-indigo-50 rounded-t-sm relative group cursor-pointer" style={{ height: '100%' }}>
                            <div
                                className="absolute bottom-0 w-full bg-gradient-to-t from-indigo-600 to-indigo-400 rounded-t-sm transition-all duration-500 group-hover:from-indigo-500 group-hover:to-indigo-300"
                                style={{ height: `${h}%` }}
                            ></div>
                            <div className="opacity-0 group-hover:opacity-100 absolute -top-10 left-1/2 transform -translate-x-1/2 bg-slate-800 text-white text-xs py-1.5 px-2.5 rounded-lg shadow-lg z-10 whitespace-nowrap">
                                Rs.{h}k
                                <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800"></div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-between mt-4 text-xs text-slate-400 font-medium uppercase">
                    {months.map(m => <span key={m}>{m}</span>)}
                </div>
            </div>
        </Card>
    );
}

function RecentPayments() {
    const navigate = useNavigate();

    return (
        <Card>
            <CardHeader
                title="Recent Transactions"
                action={
                    <button
                        onClick={() => navigate('/payments')}
                        className="text-indigo-600 text-sm font-medium hover:underline"
                    >
                        View All
                    </button>
                }
            />
            <div className="p-4 space-y-2">
                {RECENT_PAYMENTS.map((payment) => (
                    <div
                        key={payment.id}
                        className="flex items-center justify-between p-3 hover:bg-slate-50 rounded-lg transition-colors border border-transparent hover:border-slate-100"
                    >
                        <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center text-slate-600">
                                <span className="text-xs font-bold">{payment.grade}</span>
                            </div>
                            <div>
                                <p className="text-sm font-medium text-slate-800">{payment.student}</p>
                                <p className="text-xs text-slate-500">{payment.date}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm font-bold text-slate-800">Rs.{payment.amount.toLocaleString()}</p>
                            <StatusBadge status={payment.status} />
                        </div>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function AttendanceOverview() {
    const attendanceData = [
        { label: 'Present', value: 92, color: 'bg-emerald-500' },
        { label: 'Late', value: 5, color: 'bg-amber-500' },
        { label: 'Absent', value: 3, color: 'bg-rose-500' },
    ];

    return (
        <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Today's Attendance</h3>
            <div className="flex items-center gap-1 h-4 rounded-full overflow-hidden bg-slate-100 mb-4">
                {attendanceData.map((item) => (
                    <div
                        key={item.label}
                        className={`h-full ${item.color} transition-all duration-500`}
                        style={{ width: `${item.value}%` }}
                    />
                ))}
            </div>
            <div className="flex justify-between">
                {attendanceData.map((item) => (
                    <div key={item.label} className="text-center">
                        <div className="flex items-center gap-2">
                            <div className={`w-2 h-2 rounded-full ${item.color}`}></div>
                            <span className="text-xs text-slate-500">{item.label}</span>
                        </div>
                        <p className="text-lg font-bold text-slate-800 mt-1">{item.value}%</p>
                    </div>
                ))}
            </div>
        </Card>
    );
}

function QuickActions() {
    const navigate = useNavigate();

    const actions = [
        {
            label: 'New Student',
            icon: GraduationCap,
            color: 'from-blue-500 to-blue-600',
            onClick: () => navigate('/students')
        },
        {
            label: 'Record Payment',
            icon: Wallet,
            color: 'from-emerald-500 to-emerald-600',
            onClick: () => navigate('/payments')
        },
        {
            label: 'Mark Attendance',
            icon: Users,
            color: 'from-purple-500 to-purple-600',
            onClick: () => navigate('/attendance')
        },
    ];

    return (
        <Card className="p-6">
            <h3 className="text-lg font-bold text-slate-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-3 gap-3">
                {actions.map((action) => (
                    <button
                        key={action.label}
                        onClick={action.onClick}
                        className={`flex flex-col items-center p-4 rounded-xl bg-gradient-to-br ${action.color} text-white hover:opacity-90 transition-opacity shadow-lg`}
                    >
                        <action.icon size={24} />
                        <span className="text-xs font-medium mt-2">{action.label}</span>
                    </button>
                ))}
            </div>
        </Card>
    );
}

export default function DashboardPage() {
    const navigate = useNavigate();

    return (
        <>
            <PageHeader
                title="Dashboard"
                description="Welcome back! Here's what's happening at your school today."
            >
                <Button variant="secondary">
                    <Filter size={16} />
                    <span>Filter</span>
                </Button>
                <Button variant="primary" onClick={() => navigate('/students')}>
                    <Plus size={16} />
                    <span>New Admission</span>
                </Button>
            </PageHeader>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {STATS.map((stat, idx) => (
                    <StatCard key={idx} {...stat} />
                ))}
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
                <div className="lg:col-span-2">
                    <FinancialChart />
                </div>
                <div>
                    <RecentPayments />
                </div>
            </div>

            {/* Bottom Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <AttendanceOverview />
                <QuickActions />
            </div>
        </>
    );
}
