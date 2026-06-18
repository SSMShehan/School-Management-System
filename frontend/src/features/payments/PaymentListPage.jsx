import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
    Plus,
    Search,
    Filter,
    Download,
    CreditCard,
    DollarSign,
    Calendar,
    FileText,
    MoreVertical
} from 'lucide-react';
import { Card, Button, StatusBadge, PageHeader, LoadingSpinner, EmptyState } from '../../components/ui';
import { paymentsApi } from '../../api/payments';
import PaymentForm from './PaymentForm';
import { format } from 'date-fns';

export default function PaymentListPage() {
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedStatus, setSelectedStatus] = useState('all');
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingPayment, setEditingPayment] = useState(null);

    const queryClient = useQueryClient();

    const { data: payments = [], isLoading } = useQuery({
        queryKey: ['payments'],
        queryFn: async () => await paymentsApi.getAll()
    });

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this payment record?')) {
            await paymentsApi.delete(id);
            queryClient.invalidateQueries(['payments']);
        }
    };

    const handleDownloadReceipt = async (id) => {
        try {
            const blob = await paymentsApi.downloadReceipt(id);
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `receipt_${id}.pdf`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } catch (error) {
            console.error('Failed to download receipt', error);
            alert('Failed to download receipt');
        }
    };

    const handleCreateNew = () => {
        setEditingPayment(null);
        setIsFormOpen(true);
    };

    const handleEdit = (payment) => {
        setEditingPayment(payment);
        setIsFormOpen(true);
    };

    // Filter payments
    const filteredPayments = payments.filter(payment => {
        const matchesSearch = payment.receipt_no?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            payment.student_id?.toLowerCase().includes(searchTerm.toLowerCase()); // Ideally join with student name
        const matchesStatus = selectedStatus === 'all' || payment.status === selectedStatus;
        return matchesSearch && matchesStatus;
    });

    if (isFormOpen) {
        return (
            <PaymentForm
                initialData={editingPayment}
                onClose={() => setIsFormOpen(false)}
                onSuccess={() => {
                    setIsFormOpen(false);
                    queryClient.invalidateQueries(['payments']);
                }}
            />
        );
    }

    return (
        <>
            <PageHeader
                title="Payment Management"
                description="Track fee payments and generate receipts"
            >
                <Button variant="secondary">
                    <Download size={16} />
                    <span>Export Report</span>
                </Button>
                <Button variant="primary" onClick={handleCreateNew}>
                    <Plus size={16} />
                    <span>Record Payment</span>
                </Button>
            </PageHeader>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                <Card className="p-4 flex items-center space-x-4">
                    <div className="p-3 bg-emerald-100 text-emerald-600 rounded-full">
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Total Collected today</p>
                        <h3 className="text-2xl font-bold text-slate-800">$12,500</h3>
                    </div>
                </Card>
                <Card className="p-4 flex items-center space-x-4">
                    <div className="p-3 bg-indigo-100 text-indigo-600 rounded-full">
                        <CreditCard size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Pending Payments</p>
                        <h3 className="text-2xl font-bold text-slate-800">45</h3>
                    </div>
                </Card>
                <Card className="p-4 flex items-center space-x-4">
                    <div className="p-3 bg-amber-100 text-amber-600 rounded-full">
                        <FileText size={24} />
                    </div>
                    <div>
                        <p className="text-sm text-slate-500">Receipts Generated</p>
                        <h3 className="text-2xl font-bold text-slate-800">128</h3>
                    </div>
                </Card>
            </div>

            <Card>
                <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row gap-4">
                    <div className="relative flex-1">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search by receipt no or student..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                    </div>
                    <div className="flex gap-3">
                        <select
                            value={selectedStatus}
                            onChange={(e) => setSelectedStatus(e.target.value)}
                            className="px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="all">All Status</option>
                            <option value="paid">Paid</option>
                            <option value="pending">Pending</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>
                </div>

                {isLoading ? (
                    <LoadingSpinner />
                ) : filteredPayments.length === 0 ? (
                    <EmptyState
                        icon={CreditCard}
                        title="No payments found"
                        description="Record a new payment to get started"
                    />
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider">
                                    <th className="px-6 py-4 font-medium">Receipt No</th>
                                    <th className="px-6 py-4 font-medium">Student (ID)</th>
                                    <th className="px-6 py-4 font-medium">Date</th>
                                    <th className="px-6 py-4 font-medium">Amount</th>
                                    <th className="px-6 py-4 font-medium">Method</th>
                                    <th className="px-6 py-4 font-medium">Status</th>
                                    <th className="px-6 py-4 font-medium text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100">
                                {filteredPayments.map((payment) => (
                                    <tr key={payment.id} className="hover:bg-slate-50 transition-colors">
                                        <td className="px-6 py-4 font-mono text-sm text-slate-600">
                                            {payment.receipt_no}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-800">
                                            {payment.student_id ? payment.student_id : 'Unknown'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600">
                                            {format(new Date(payment.payment_date), 'MMM dd, yyyy')}
                                        </td>
                                        <td className="px-6 py-4 font-medium text-slate-800">
                                            Rs. {payment.amount}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-slate-600 capitalize">
                                            {payment.payment_method}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={payment.status} />
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleDownloadReceipt(payment.id)}
                                                    className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    title="Download Receipt"
                                                >
                                                    <Download size={16} />
                                                </button>
                                                <button
                                                    onClick={() => handleEdit(payment)}
                                                    className="p-2 text-slate-400 hover:text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                                                    title="Edit"
                                                >
                                                    <FileText size={16} />
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
