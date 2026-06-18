import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Search,
    Filter,
    MoreVertical,
    Edit,
    Trash2,
    Eye,
    Download,
    Upload
} from 'lucide-react';
import { Card, CardHeader, Button, StatusBadge, PageHeader, LoadingSpinner, EmptyState } from '../../components/ui';
import { studentsApi } from '../../api';
import StudentForm from './StudentForm';

export default function StudentsListPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedGrade, setSelectedGrade] = useState('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);

    const queryClient = useQueryClient();

    // Fetch students from API
    const { data: students = [], isLoading } = useQuery({
        queryKey: ['students'],
        queryFn: async () => await studentsApi.getAll()
    });

    const deleteMutation = useMutation({
        mutationFn: studentsApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['students']);
        }
    });

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this student?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingStudent(null);
        setIsFormOpen(true);
    };

    // Filter students
    const filteredStudents = students.filter(student => {
        const matchesSearch = student.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            student.student_id?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesGrade = selectedGrade === 'all' || student.grade_level === selectedGrade;
        return matchesSearch && matchesGrade;
    });

    // Get unique grades for filter
    const grades = [...new Set(students.map(s => s.grade_level))].filter(Boolean).sort();


    // Show form if open
    if (isFormOpen) {
        return (
            <StudentForm
                initialData={editingStudent}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    setIsFormOpen(false);
                    queryClient.invalidateQueries(['students']);
                }}
            />
        );
    }

    return (
        <>
            <PageHeader
                title="Students"
                description="Manage student records and information"
            >
                <Button variant="secondary">
                    <Download size={16} />
                    <span>Export</span>
                </Button>
                <Button variant="primary" onClick={handleAddNew}>
                    <Plus size={16} />
                    <span>Add Student</span>
                </Button>
            </PageHeader>

            <Card>
                {/* Filters Row */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name or student ID..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex gap-3">
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
                        <Button variant="secondary">
                            <Filter size={16} />
                            <span>More Filters</span>
                        </Button>
                    </div>
                </div>

                {/* Table */}
                {isLoading ? (
                    <LoadingSpinner />
                ) : filteredStudents.length === 0 ? (
                    <EmptyState
                        icon={Search}
                        title="No students found"
                        description="Try adjusting your search or filter criteria"
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">Student</th>
                                    <th className="px-6 py-4 font-medium">ID</th>
                                    <th className="px-6 py-4 font-medium">Grade</th>
                                    <th className="px-6 py-4 font-medium">Guardian</th>
                                    <th className="px-6 py-4 font-medium">Contact</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStudents.map((student) => (
                                    <tr key={student.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white text-sm font-bold">
                                                    {student.full_name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">{student.full_name}</p>
                                                    <p className="text-xs text-slate-500">{student.gender}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="text-sm font-mono text-slate-600">{student.student_id}</span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                                                {student.grade_level}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{student.guardian_name}</td>
                                        <td className="px-6 py-4 text-sm text-slate-600">{student.guardian_contact}</td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={student.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEdit(student)}
                                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(student.id)}
                                                    className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                                    title="Delete"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {/* Pagination */}
                <div className="p-4 border-t border-slate-100 flex items-center justify-between">
                    <p className="text-sm text-slate-500">
                        Showing <span className="font-medium">{filteredStudents.length}</span> of <span className="font-medium">{students.length}</span> students
                    </p>
                    <div className="flex items-center space-x-2">
                        <Button variant="secondary" size="sm" disabled>Previous</Button>
                        <Button variant="secondary" size="sm">Next</Button>
                    </div>
                </div>
            </Card>
        </>
    );
}
