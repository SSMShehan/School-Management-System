import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Card, Button, PageHeader, Input, Select } from '../../components/ui';
import { staffApi } from '../../api/staff';

export default function StaffForm({ initialData, onClose, onSuccess }) {
    const isEditMode = !!initialData;
    const queryClient = useQueryClient();

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: initialData || {
            full_name: '',
            email: '',
            phone_number: '',
            role: 'Teacher',
            salary: '',
            qualification: '',
            join_date: new Date().toISOString().split('T')[0],
            is_active: true
        }
    });

    const createMutation = useMutation({
        mutationFn: staffApi.create,
        onSuccess: () => {
            onSuccess();
        }
    });

    const updateMutation = useMutation({
        mutationFn: (data) => staffApi.update(initialData.id, data),
        onSuccess: () => {
            onSuccess();
        }
    });

    const onSubmit = async (data) => {
        try {
            if (isEditMode) {
                await updateMutation.mutateAsync(data);
            } else {
                await createMutation.mutateAsync(data);
            }
        } catch (error) {
            console.error('Failed to save staff:', error);
            // Handle error (show toast, etc.)
        }
    };

    return (
        <div className="max-w-4xl mx-auto">
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
                            {isEditMode ? 'Edit Staff Member' : 'Add New Staff Member'}
                        </h1>
                        <p className="text-slate-500 mt-1">
                            {isEditMode ? 'Update staff details and information' : 'Create a new staff profile'}
                        </p>
                    </div>
                </div>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-slate-800 border-b pb-2">Personal Details</h3>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                                <input
                                    {...register('full_name', { required: 'Full name is required' })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="e.g. John Doe"
                                />
                                {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
                                <input
                                    {...register('email', {
                                        required: 'Email is required',
                                        pattern: { value: /^\S+@\S+$/i, message: 'Invalid email address' }
                                    })}
                                    type="email"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="john@school.com"
                                />
                                {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Phone Number</label>
                                <input
                                    {...register('phone_number', { required: 'Phone number is required' })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    placeholder="+1 234 567 890"
                                />
                                {errors.phone_number && <p className="text-red-500 text-xs mt-1">{errors.phone_number.message}</p>}
                            </div>
                        </div>

                        {/* Employment Details */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-medium text-slate-800 border-b pb-2">Employment Details</h3>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Role</label>
                                <select
                                    {...register('role', { required: 'Role is required' })}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    <option value="Teacher">Teacher</option>
                                    <option value="Admin">Admin</option>
                                    <option value="Principal">Principal</option>
                                    <option value="Clerk">Clerk</option>
                                    <option value="Support Staff">Support Staff</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Salary</label>
                                <input
                                    {...register('salary', { required: 'Salary is required', min: 0 })}
                                    type="number"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Join Date</label>
                                <input
                                    {...register('join_date', { required: 'Join date is required' })}
                                    type="date"
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Qualifications</label>
                                <textarea
                                    {...register('qualification')}
                                    className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    rows="3"
                                    placeholder="BSc Math, MSc Education..."
                                />
                            </div>
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
                                    Save Staff Member
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
