import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Search,
    Edit,
    Trash2,
    MapPin,
    Phone,
    Mail,
    Building
} from 'lucide-react';
import { Card, Button, PageHeader, LoadingSpinner, EmptyState } from '../../components/ui';
import { branchesApi } from '../../api/branches';
import BranchForm from './BranchForm';

export default function BranchList() {
    const [searchTerm, setSearchTerm] = useState('');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);

    const queryClient = useQueryClient();

    const { data: branches = [], isLoading } = useQuery({
        queryKey: ['branches'],
        queryFn: async () => await branchesApi.getAll()
    });

    const deleteMutation = useMutation({
        mutationFn: branchesApi.delete,
        onSuccess: () => {
            queryClient.invalidateQueries(['branches']);
        }
    });

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this branch?')) {
            await deleteMutation.mutateAsync(id);
        }
    };

    const handleEdit = (branch) => {
        setEditingBranch(branch);
        setIsFormOpen(true);
    };

    const handleAddNew = () => {
        setEditingBranch(null);
        setIsFormOpen(true);
    };

    const filteredBranches = branches.filter(branch =>
        branch.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        branch.branch_code?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (isFormOpen) {
        return (
            <BranchForm
                initialData={editingBranch}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    setIsFormOpen(false);
                    queryClient.invalidateQueries(['branches']);
                }}
            />
        );
    }

    return (
        <>
            <PageHeader
                title="Branch Management"
                description="Manage school branches and campus locations"
            >
                <Button variant="primary" onClick={handleAddNew}>
                    <Plus size={16} />
                    <span>Add Branch</span>
                </Button>
            </PageHeader>

            <Card>
                <div className="p-4 border-b border-slate-100">
                    <div className="relative max-w-md">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search branches..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                </div>

                {isLoading ? (
                    <LoadingSpinner />
                ) : filteredBranches.length === 0 ? (
                    <EmptyState
                        icon={Building}
                        title="No branches found"
                        description="Add your first school branch to get started"
                    />
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                        {filteredBranches.map((branch) => (
                            <div key={branch.id} className="border border-slate-200 rounded-xl p-5 hover:shadow-md transition-shadow">
                                <div className="flex justify-between items-start mb-4">
                                    <div className="p-3 bg-indigo-50 text-indigo-600 rounded-lg">
                                        <Building size={24} />
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => handleEdit(branch)}
                                            className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                        >
                                            <Edit size={16} />
                                        </button>
                                        <button
                                            onClick={() => handleDelete(branch.id)}
                                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </div>
                                </div>

                                <h3 className="text-lg font-bold text-slate-800 mb-1">{branch.name}</h3>
                                <p className="text-sm text-slate-500 font-mono mb-4">{branch.branch_code}</p>

                                <div className="space-y-2">
                                    <div className="flex items-start gap-2 text-sm text-slate-600">
                                        <MapPin size={16} className="text-slate-400 mt-0.5 shrink-0" />
                                        <span>{branch.address}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Phone size={16} className="text-slate-400 shrink-0" />
                                        <span>{branch.contact_phone}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-sm text-slate-600">
                                        <Mail size={16} className="text-slate-400 shrink-0" />
                                        <span>{branch.contact_email}</span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </Card>
        </>
    );
}
