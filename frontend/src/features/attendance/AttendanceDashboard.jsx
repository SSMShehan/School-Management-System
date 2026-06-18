import { useState } from 'react';
import { Calendar, Users, Briefcase } from 'lucide-react';
import { Card, PageHeader } from '../../components/ui';
import StudentAttendance from './StudentAttendance';
import StaffAttendance from './StaffAttendance';

export default function AttendanceDashboard() {
    const [activeTab, setActiveTab] = useState('students');

    return (
        <>
            <PageHeader
                title="Attendance Management"
                description="Mark and track attendance for students and staff"
            >
            </PageHeader>

            {/* Tabs */}
            <div className="flex space-x-1 bg-slate-100 p-1 rounded-xl w-fit mb-6">
                <button
                    onClick={() => setActiveTab('students')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'students'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Users size={16} className="mr-2" />
                    Student Attendance
                </button>
                <button
                    onClick={() => setActiveTab('staff')}
                    className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'staff'
                            ? 'bg-white text-indigo-600 shadow-sm'
                            : 'text-slate-500 hover:text-slate-700'
                        }`}
                >
                    <Briefcase size={16} className="mr-2" />
                    Staff Attendance
                </button>
            </div>

            <Card className="p-6">
                {activeTab === 'students' ? <StudentAttendance /> : <StaffAttendance />}
            </Card>
        </>
    );
}
