import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Card, Button } from '../../components/ui';
import { branchesApi } from '../../api/branches';

export default function BranchForm({ initialData, onClose, onSuccess }) {
    const isEditMode = !!initialData;

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: initialData || {
            name: '',
            branch_code: '',
            address: '',
            contact_phone: '',
            contact_email: ''
        }
    });

    const createMutation = useMutation({
        mutationFn: branchesApi.create,
        onSuccess: onSuccess
    });

    const updateMutation = useMutation({
        mutationFn: (data) => branchesApi.update(initialData.id, data),
        onSuccess: onSuccess
    });

    const onSubmit = async (data) => {
        try {
            if (isEditMode) {
                await updateMutation.mutateAsync(data);
            } else {
                await createMutation.mutateAsync(data);
            }
        } catch (error) {
            console.error('Failed to save branch:', error);
        }
    };

    return (
        <div className="max-w-2xl mx-auto">
            <div className="mb-6">
                <button
                    onClick={onClose}
                    className="flex items-center text-slate-500 hover:text-indigo-600 transition-colors mb-2"
                >
                    <ArrowLeft size={16} className="mr-1" />
                    Back to List
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800">
                            {isEditMode ? 'Edit Branch' : 'Add New Branch'}
                        </h1>
                    </div>
                </div>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Branch Name</label>
                        <input
                            {...register('name', { required: 'Branch name is required' })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. Main Campus"
                        />
                        {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Branch Code</label>
                        <input
                            {...register('branch_code', { required: 'Branch code is required' })}
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="e.g. BR-001"
                        />
                        {errors.branch_code && <p className="text-red-500 text-xs mt-1">{errors.branch_code.message}</p>}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                        <textarea
                            {...register('address', { required: 'Address is required' })}
                            rows="3"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="123 School Lane..."
                        />
                        {errors.address && <p className="text-red-500 text-xs mt-1">{errors.address.message}</p>}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Phone</label>
                            <input
                                {...register('contact_phone', { required: 'Phone is required' })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.contact_phone && <p className="text-red-500 text-xs mt-1">{errors.contact_phone.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Contact Email</label>
                            <input
                                {...register('contact_email', { required: 'Email is required' })}
                                type="email"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.contact_email && <p className="text-red-500 text-xs mt-1">{errors.contact_email.message}</p>}
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                    Saving...
                                </>
                            ) : (
                                <>
                                    <Save size={16} className="mr-2" />
                                    Save Branch
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
