import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import { ArrowLeft, Save, Loader2, Search, CheckCircle, AlertCircle } from 'lucide-react';
import { Card, Button, Input } from '../../components/ui';
import { paymentsApi } from '../../api/payments';
import { studentsApi } from '../../api/students';

export default function PaymentForm({ initialData, onClose, onSuccess }) {
    const isEditMode = !!initialData;
    const [indexNumber, setIndexNumber] = useState('');
    const [studentInfo, setStudentInfo] = useState(null);
    const [lookupError, setLookupError] = useState('');
    const [isLookingUp, setIsLookingUp] = useState(false);

    const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm({
        defaultValues: initialData || {
            amount: '',
            payment_method: 'cash',
            status: 'paid',
            remarks: '',
            payment_date: new Date().toISOString().split('T')[0]
        }
    });

    const createMutation = useMutation({
        mutationFn: paymentsApi.create,
        onSuccess: onSuccess
    });

    const updateMutation = useMutation({
        mutationFn: (data) => paymentsApi.update(initialData.id, data),
        onSuccess: onSuccess
    });

    const handleIndexLookup = async () => {
        if (!indexNumber.trim()) {
            setLookupError('Please enter an index number');
            setStudentInfo(null);
            return;
        }

        setIsLookingUp(true);
        setLookupError('');
        setStudentInfo(null);

        try {
            const student = await studentsApi.getByStudentId(indexNumber.trim());
            setStudentInfo(student);
            setLookupError('');
        } catch (error) {
            setStudentInfo(null);
            if (error.response?.status === 404) {
                setLookupError('No student found with this index number');
            } else {
                setLookupError('Error looking up student. Please try again.');
            }
        } finally {
            setIsLookingUp(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleIndexLookup();
        }
    };

    const onSubmit = async (data) => {
        if (!studentInfo && !isEditMode) {
            alert('Please verify a student before recording payment');
            return;
        }

        const payload = {
            ...data,
            student_id: studentInfo?.id || initialData?.student_id
        };

        try {
            if (isEditMode) {
                await updateMutation.mutateAsync(payload);
            } else {
                await createMutation.mutateAsync(payload);
            }
        } catch (error) {
            console.error('Failed to save payment:', error);
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
                            {isEditMode ? 'Edit Payment Record' : 'Record New Payment'}
                        </h1>
                    </div>
                </div>
            </div>

            <Card className="p-6">
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                    {/* Student Index Lookup */}
                    {!isEditMode && (
                        <div className="space-y-3">
                            <label className="block text-sm font-medium text-slate-700">Student Index Number</label>
                            <div className="flex gap-2">
                                <div className="relative flex-1">
                                    <Search className="absolute left-3 top-2.5 text-slate-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Enter student index no. (e.g., STU-XXXXXX)"
                                        value={indexNumber}
                                        onChange={(e) => setIndexNumber(e.target.value)}
                                        onKeyPress={handleKeyPress}
                                        className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                    />
                                </div>
                                <Button
                                    type="button"
                                    variant="secondary"
                                    onClick={handleIndexLookup}
                                    disabled={isLookingUp}
                                >
                                    {isLookingUp ? <Loader2 className="animate-spin" size={16} /> : 'Verify'}
                                </Button>
                            </div>

                            {/* Student Verification Card */}
                            {studentInfo && (
                                <div className="flex items-start gap-3 p-4 bg-emerald-50 border border-emerald-200 rounded-lg">
                                    <CheckCircle className="text-emerald-600 mt-0.5" size={20} />
                                    <div>
                                        <p className="font-semibold text-emerald-800">{studentInfo.full_name}</p>
                                        <p className="text-sm text-emerald-700">
                                            <span className="font-medium">Class:</span> {studentInfo.grade_level}
                                        </p>
                                        <p className="text-xs text-emerald-600 mt-1">
                                            Index: {studentInfo.student_id}
                                        </p>
                                    </div>
                                </div>
                            )}

                            {/* Error Message */}
                            {lookupError && (
                                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <AlertCircle className="text-red-500" size={18} />
                                    <p className="text-sm text-red-700">{lookupError}</p>
                                </div>
                            )}
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Amount</label>
                            <input
                                {...register('amount', { required: 'Amount is required', min: 0 })}
                                type="number"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="0.00"
                            />
                            {errors.amount && <p className="text-red-500 text-xs mt-1">{errors.amount.message}</p>}
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Date</label>
                            <input
                                {...register('payment_date', { required: 'Date is required' })}
                                type="date"
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Payment Method</label>
                            <select
                                {...register('payment_method')}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="cash">Cash</option>
                                <option value="card">Card</option>
                                <option value="online">Online Transfer</option>
                                <option value="cheque">Cheque</option>
                            </select>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Status</label>
                            <select
                                {...register('status')}
                                className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="paid">Paid</option>
                                <option value="pending">Pending</option>
                                <option value="failed">Failed</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-700 mb-1">Remarks</label>
                        <textarea
                            {...register('remarks')}
                            rows="3"
                            className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Optional notes..."
                        />
                    </div>

                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-100">
                        <Button type="button" variant="secondary" onClick={onClose}>
                            Cancel
                        </Button>
                        <Button type="submit" variant="primary" disabled={isSubmitting}>
                            {isSubmitting ? (
                                <>
                                    <Loader2 className="animate-spin mr-2" size={16} />
                                    Recording...
                                </>
                            ) : (
                                <>
                                    <Save size={16} className="mr-2" />
                                    Record Payment
                                </>
                            )}
                        </Button>
                    </div>
                </form>
            </Card>
        </div>
    );
}
