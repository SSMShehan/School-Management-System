import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Search,
    Filter,
    Edit,
    Trash2,
    Eye,
    Download,
    Mail,
    Phone,
    Briefcase
} from 'lucide-react';
import { Card, Button, StatusBadge, PageHeader, LoadingSpinner, EmptyState } from '../../components/ui';
import { staffApi } from '../../api/staff';
import StaffForm from './StaffForm';

export default function StaffListPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedRole, setSelectedRole] = useState('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingStaff, setEditingStaff] = useState(null);

    const queryClient = useQueryClient();

    const { data: staffList = [], isLoading } = useQuery({
        queryKey: ['staff'],
        queryFn: async () => await staffApi.getAll()
    });

    const deleteMutation = useMutation({
        mutationFn: staffApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['staff']);
        }
    });

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this staff member?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleEdit = (staff) => {
        setEditingStaff(staff);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingStaff(null);
        setIsFormOpen(true);
    };

    // Filter staff
    const filteredStaff = staffList.filter(staff => {
        const matchesSearch = staff.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            staff.email?.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesRole = selectedRole === 'all' || staff.role === selectedRole;
        return matchesSearch && matchesRole;
    });

    // Get unique roles
    const roles = [...new Set(staffList.map(s => s.role))].filter(Boolean).sort();

    if (isFormOpen) {
        return (
            <StaffForm
                initialData={editingStaff}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    setIsFormOpen(false);
                    queryClient.invalidateQueries(['staff']);
                }}
            />
        );
    }

    return (
        <>
            <PageHeader
                title="Staff Management"
                description="Manage teachers and administrative staff"
            >
                <Button variant="secondary">
                    <Download size={16} />
                    <span>Export</span>
                </Button>
                <Button variant="primary" onClick={handleAddNew}>
                    <Plus size={16} />
                    <span>Add Staff</span>
                </Button>
            </PageHeader>

            <Card>
                {/* Filters Row */}
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by name or email..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={selectedRole}
                            onChange={(e) => setSelectedRole(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Roles</option>
                            {roles.map(role => (
                                <option key={role} value={role}>{role}</option>
                            ))}
                        </select>
                    </div>
                </div>

                {/* Table */}
                {isLoading ? (
                    <LoadingSpinner />
                ) : filteredStaff.length === 0 ? (
                    <EmptyState
                        icon={Search}
                        title="No staff found"
                        description="Try adjusting your search or add a new staff member"
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">Staff Member</th>
                                    <th className="px-6 py-4 font-medium">Role</th>
                                    <th className="px-6 py-4 font-medium">Contact Info</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredStaff.map((staff) => (
                                    <tr key={staff.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-3">
                                                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white text-sm font-bold">
                                                    {staff.full_name?.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-sm font-medium text-slate-800">{staff.full_name}</p>
                                                    <p className="text-xs text-slate-500 flex items-center gap-1">
                                                        <Briefcase size={10} /> {staff.role}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-sm font-medium">
                                                {staff.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex flex-col gap-1">
                                                <span className="text-sm text-slate-600 flex items-center gap-2">
                                                    <Mail size={12} className="text-slate-400" /> {staff.email}
                                                </span>
                                                <span className="text-sm text-slate-600 flex items-center gap-2">
                                                    <Phone size={12} className="text-slate-400" /> {staff.phone_number}
                                                </span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={staff.is_active ? 'Active' : 'Inactive'} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleEdit(staff)}
                                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <Edit size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleDelete(staff.id)}
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
            </Card>
        </>
    );
}
