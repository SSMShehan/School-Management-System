import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Calendar as CalendarIcon, Save, Settings2, Search, Check, X, Clock } from 'lucide-react';
import { Button, LoadingSpinner, EmptyState } from '../../components/ui';
import { staffApi } from '../../api/staff';
import { staffAttendanceApi } from '../../api/attendance';
import { format } from 'date-fns';

export default function StaffAttendance() {
    const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
    const [attendanceData, setAttendanceData] = useState({});

    const queryClient = useQueryClient();

    // Fetch staff
    const { data: staffList = [], isLoading: isLoadingStaff } = useQuery({
        queryKey: ['staff'],
        queryFn: async () => await staffApi.getAll()
    });

    // Fetch existing attendance
    const { data: existingAttendance = [], isLoading: isLoadingAttendance } = useQuery({
        queryKey: ['staff-attendance', date],
        queryFn: async () => await staffAttendanceApi.getByDate(date)
    });

    // Initialize state
    useEffect(() => {
        if (existingAttendance && staffList) {
            const initialData = {};
            staffList.forEach(staff => {
                const record = existingAttendance.find(r => r.staff_id === staff.id);
                initialData[staff.id] = record ? record.status.toLowerCase() : 'present';
            });
            setAttendanceData(initialData);
        }
    }, [staffList, existingAttendance]);

    const markAttendanceMutation = useMutation({
        mutationFn: async (payload) => {
            const promises = payload.map(record => staffAttendanceApi.create(record));
            await Promise.all(promises);
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['staff-attendance', date]);
            alert('Staff attendance saved successfully!');
        }
    });

    const handleSave = () => {
        const payload = Object.entries(attendanceData).map(([staffId, status]) => ({
            staff_id: staffId,
            date: date,
            status: status.toUpperCase(),
            check_in: "08:00", // Default check-in, real app would have inputs
            check_out: "17:00" // Default check-out
        }));
        markAttendanceMutation.mutate(payload);
    };

    const handleStatusChange = (staffId, status) => {
        setAttendanceData(prev => ({
            ...prev,
            [staffId]: status
        }));
    };

    if (isLoadingStaff || isLoadingAttendance) return <LoadingSpinner />;

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
                <div className="relative">
                    <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                    <input
                        type="date"
                        value={date}
                        onChange={(e) => setDate(e.target.value)}
                        className="pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                </div>

                <Button variant="primary" onClick={handleSave} disabled={markAttendanceMutation.isPending}>
                    <Save size={16} className="mr-2" />
                    {markAttendanceMutation.isPending ? 'Saving...' : 'Save Attendance'}
                </Button>
            </div>

            {/* List */}
            {staffList.length === 0 ? (
                <EmptyState title="No staff found" description="Add staff members first" icon={Settings2} />
            ) : (
                <div className="overflow-x-auto border border-slate-200 rounded-lg">
                    <table className="w-full text-left">
                        <thead className="bg-slate-50 text-slate-500 text-xs uppercase">
                            <tr>
                                <th className="px-6 py-4">Staff Member</th>
                                <th className="px-6 py-4">Role</th>
                                <th className="px-6 py-4 text-center">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {staffList.map(staff => (
                                <tr key={staff.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-slate-800">
                                        {staff.full_name}
                                    </td>
                                    <td className="px-6 py-4 text-sm text-slate-600">
                                        {staff.role}
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center justify-center gap-2">
                                            <button
                                                onClick={() => handleStatusChange(staff.id, 'present')}
                                                className={`p-2 rounded-lg flex items-center gap-1 text-xs font-medium transition-all ${attendanceData[staff.id] === 'present'
                                                        ? 'bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500 ring-offset-1'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                            >
                                                <Check size={14} /> Present
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(staff.id, 'absent')}
                                                className={`p-2 rounded-lg flex items-center gap-1 text-xs font-medium transition-all ${attendanceData[staff.id] === 'absent'
                                                        ? 'bg-rose-100 text-rose-700 ring-2 ring-rose-500 ring-offset-1'
                                                        : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                                                    }`}
                                            >
                                                <X size={14} /> Absent
                                            </button>
                                            <button
                                                onClick={() => handleStatusChange(staff.id, 'late')}
                                                className={`p-2 rounded-lg flex items-center gap-1 text-xs font-medium transition-all ${attendanceData[staff.id] === 'late'
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
