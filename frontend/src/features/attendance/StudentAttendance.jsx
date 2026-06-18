import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Save, Settings2, Search, Check, X, Clock } from 'lucide-react';
import { Button, LoadingSpinner, EmptyState } from '../../components/ui';
import { studentsApi } from '../../api/students';
import { attendanceApi } from '../../api/attendance';
import { format } from 'date-fns';

export default function StudentAttendance() {
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [selectedGrade, setSelectedGrade] = useState('all');
    const [attendanceData, setAttendanceData] = useState({}); // { studentId: 'present' | 'absent' | 'late' }

    const queryClient = useQueryClient();

    // Fetch students
    const { data: students = [], isLoading: isLoadingStudents } = useQuery({
        queryKey: ['students'],
        queryFn: async () => await studentsApi.getAll()
    });

    // Fetch existing attendance for the date
    const { data: existingAttendance = [], isLoading: isLoadingAttendance } = useQuery({
        queryKey: ['attendance', 'student', date],
        queryFn: async () => await attendanceApi.getByDate(date)
    });

    // Initialize attendance state when data loads
    useEffect(() => {
        if (existingAttendance && students) {
            const initialData = {};
            // Default to 'present' for all students if no record exists, 
            // OR populate with existing record
            students.forEach(student => {
                const record = existingAttendance.find(r => r.student_id === student.id);
                initialData[student.id] = record ? record.status.toLowerCase() : 'present';
            });
            setAttendanceData(initialData);
        }
    }, [students, existingAttendance]);

    const markAttendanceMutation = useMutation({
        mutationFn: async (payload) => {
            // In a real app, you might send bulk updates or individual calls.
            // Here we'll just simulate marking each one that changed.
            // For simplicity, let's assume the backend has a bulk endpoint or we loop.
            // We'll loop for now as the API is simple.
            const promises = payload.map(record => attendanceApi.create(record));
            await Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['attendance', 'student', date]);
            alert('Attendance saved successfully!');
        }
    });

    const handleSave = () => {
        const payload = Object.entries(attendanceData).map(([studentId, status]) => ({
            student_id: studentId,
            date: date,
            status: status.toUpperCase(), // Backend expects uppercase enum
            remarks: ''
        }));
        markAttendanceMutation.mutate(payload);
    };

    const handleStatusChange = (studentId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [studentId]: status
        }));
    };

    // Filter students
    const filteredStudents = students.filter(student =>
        selectedGrade === 'all' || student.grade_level === selectedGrade
    );

    // Unique grades
    const grades = [...new Set(students.map(s => s.grade_level))].sort();

    if (isLoadingStudents || isLoadingAttendance) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            {/* Controls */}
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="flex gap-4 items-center w-full sm:w-auto">
                    <div className="relative">
                        <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <select
                        value={selectedGrade}
                        onChange={(e) => setSelectedGrade(e.target.value)}
                        className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                        <option value="all">All Grades</option>
                        {grades.map(grade => (
                            <option key={grade} value={grade}>{grade}</option>
                        ))}
                    </select>
                </div>

                <Button variant="primary" onClick={handleSave} disabled={markAttendanceMutation.isPending}>
                    <Save size={16} className="mr-2" />
                    {markAttendanceMutation.isPending ? 'Saving...' : 'Save Attendance'}
                </Button>
            </div>

            {/* List */}
            {filteredStudents.length === 0 ? (
                <EmptyState title="No students found" description="Adjust filters" icon={Settings2} />
            ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4">Student</th>
                                <th className="px-6 py-4">ID</th>
                                <th className="px-6 py-4">Grade</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {filteredStudents.map(student => (
                                <tr key={student.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {student.full_name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600 font-mono">
                                        {student.student_id}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className="px-2 py-1 bg-slate-100 rounded text-xs text-slate-600 font-medium">
                                            {student.grade_level}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleStatusChange(student.id, 'present')}
                                                className={`p-2 rounded-lg flex items-center gap-1 text-xs font-medium transition-all ${attendanceData[student.id] === 'present'
                                                        ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 ring-offset-1'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                            >
                                                <Check size={14} /> Present
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(student.id, 'absent')}
                                                className={`p-2 rounded-lg flex items-center gap-1 text-xs font-medium transition-all ${attendanceData[student.id] === 'absent'
                                                        ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-500 ring-offset-1'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                            >
                                                <X size={14} /> Absent
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(student.id, 'late')}
                                                className={`p-2 rounded-lg flex items-center gap-1 text-xs font-medium transition-all ${attendanceData[student.id] === 'late'
                                                        ? 'bg-amber-100 text-amber-700 ring-2 ring-amber-500 ring-offset-1'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                            >
                                                <Clock size={14} /> Late
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
