import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2 } from 'lucide-react';
import { Card, Button } from '../../components/ui';
import { studentsApi } from '../../api/students';

export default function StudentForm({ initialData, onClose, onSuccess }) {
    const isEditMode = !!initialData;

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: initialData || {
            student_id: '',
            full_name: '',
            date_of_birth: '',
            gender: 'Male',
            grade_level: '',
            guardian_name: '',
            guardian_contact: '',
            guardian_email: '',
            address: '',
            admission_date: new Date().toISOString().split('T')[0],
            medical_info: '',
            emergency_contact: ''
        }
    });

    const createMutation = useMutation({
        mutationFn: studentsApi.create,
        onSuccess: onSuccess
    });

    const updateMutation = useMutation({
        mutationFn: (data) => studentsApi.update(initialData.id, data),
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
            console.error('Failed to save student:', error);
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
                <div>
                    <h1 className="text-2xl font-bold text-slate-800">
                        {isEditMode ? 'Edit Student' : 'Add New Student'}
                    </h1>
                    <p className="text-slate-500 mt-1">
                        {isEditMode ? 'Update student information' : 'Register a new student'}
                    </p>
                </div>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-medium text-slate-800 border-b pb-2 mb-4">Personal Details</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Student ID</label>
                            <input
                                {...register('student_id', { required: 'Student ID is required' })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="STU-001"
                            />
                            {errors.student_id && <p className="text-red-500 text-xs mt-1">{errors.student_id.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
                            <input
                                {...register('full_name', { required: 'Full name is required' })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="John Doe"
                            />
                            {errors.full_name && <p className="text-red-500 text-xs mt-1">{errors.full_name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Date of Birth</label>
                            <input
                                {...register('date_of_birth', { required: 'DOB is required' })}
                                type="date"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.date_of_birth && <p className="text-red-500 text-xs mt-1">{errors.date_of_birth.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Gender</label>
                            <select
                                {...register('gender')}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="Male">Male</option>
                                <option value="Female">Female</option>
                                <option value="Other">Other</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Grade Level</label>
                            <input
                                {...register('grade_level', { required: 'Grade is required' })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="10-A"
                            />
                            {errors.grade_level && <p className="text-red-500 text-xs mt-1">{errors.grade_level.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Admission Date</label>
                            <input
                                {...register('admission_date', { required: 'Admission date is required' })}
                                type="date"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        {/* Guardian Information */}
                        <div className="md:col-span-2">
                            <h3 className="text-lg font-medium text-slate-800 border-b pb-2 mb-4 mt-4">Guardian Information</h3>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Guardian Name</label>
                            <input
                                {...register('guardian_name', { required: 'Guardian name is required' })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {errors.guardian_name && <p className="text-red-500 text-xs mt-1">{errors.guardian_name.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Guardian Contact</label>
                            <input
                                {...register('guardian_contact', { required: 'Contact is required' })}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="+1 234 567 890"
                            />
                            {errors.guardian_contact && <p className="text-red-500 text-xs mt-1">{errors.guardian_contact.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Guardian Email</label>
                            <input
                                {...register('guardian_email')}
                                type="email"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="guardian@email.com"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Emergency Contact</label>
                            <input
                                {...register('emergency_contact')}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
                            <textarea
                                {...register('address')}
                                rows="2"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Home address..."
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium text-slate-700 mb-1">Medical Information</label>
                            <textarea
                                {...register('medical_info')}
                                rows="2"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="Any allergies or medical conditions..."
                            />
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
                                    Save Student
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
