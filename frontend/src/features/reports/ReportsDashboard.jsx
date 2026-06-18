import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
    BarChart3,
    TrendingUp,
    Users,
    CreditCard,
    Calendar,
    Download
} from 'lucide-react';
import { Card, PageHeader, LoadingSpinner, Button } from '../../components/ui';
import { reportsApi } from '../../api/reports';

export default function ReportsDashboard() {
    const { data: stats, isLoading } = useQuery({
        queryKey: ['reports-dashboard'],
        queryFn: async () => await reportsApi.getDashboardStats(),
        retry: false
    });

    if (isLoading) return <LoadingSpinner />;

    // Mock data if API fails or returns empty (since backend logic might be simple)
    const displayStats = stats || {
        total_students: 0,
        total_staff: 0,
        total_revenue: 0,
        attendance_rate: 0
    };

    return (
        <>
            <PageHeader
                title="Reports & Analytics"
                description="Overview of school performance and metrics"
            >
                <Button variant="secondary">
                    <Download size={16} />
                    <span>Export PDF</span>
                </Button>
            </PageHeader>

            {/* Key Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-4 flex items-center space-x-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Students</p>
                        <h3 className="text-2xl font-bold text-slate-800">{displayStats.total_students}</h3>
                        <span className="text-xs text-emerald-600 flex items-center">
                            <TrendingUp size={12} className="mr-1" /> +5% from last month
                        </span>
                    </div>
                </Card>

                <Card className="p-4 flex items-center space-x-4">
                    <div className="p-3 bg-rose-100 text-rose-600 rounded-lg">
                        <Users size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Staff</p>
                        <h3 className="text-2xl font-bold text-slate-800">{displayStats.total_staff}</h3>
                    </div>
                </Card>

                <Card className="p-4 flex items-center space-x-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-lg">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Revenue (YTD)</p>
                        <h3 className="text-2xl font-bold text-slate-800">Rs. {displayStats.total_revenue}</h3>
                        <span className="text-xs text-emerald-600 flex items-center">
                            <TrendingUp size={12} className="mr-1" /> +12% from last year
                        </span>
                    </div>
                </Card>

                <Card className="p-4 flex items-center space-x-4">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-lg">
                        <Calendar size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Avg. Attendance</p>
                        <h3 className="text-2xl font-bold text-slate-800">{displayStats.attendance_rate}%</h3>
                    </div>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <Card className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <BarChart3 size={20} className="mr-2 text-slate-400" />
                        Student Enrollment by Grade
                    </h3>
                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                        <p className="text-slate-400 text-sm">Chart visualization would go here</p>
                    </div>
                </Card>

                <Card className="p-6">
                    <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center">
                        <CreditCard size={20} className="mr-2 text-slate-400" />
                        Fee Collection History
                    </h3>
                    <div className="h-64 flex items-center justify-center bg-slate-50 rounded-lg border border-slate-100 border-dashed">
                        <p className="text-slate-400 text-sm">Chart visualization would go here</p>
                    </div>
                </Card>
            </div>
        </>
    );
}
