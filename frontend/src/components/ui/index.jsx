import { TrendingUp, TrendingDown } from 'lucide-react';

export function StatCard({ label, value, change, trend, icon: Icon, color, bg }) {
    return (
        <div className="bg-white p-6 rounded-xl border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300 hover:-translate-y-0.5">
            <div className="flex justify-between items-start">
                <div className={`p-3 rounded-lg ${bg}`}>
                    <Icon className={`w-6 h-6 ${color}`} />
                </div>
                {change && (
                    <div className={`flex items-center space-x-1 text-sm font-medium ${trend === 'up' ? 'text-emerald-600' : 'text-rose-600'
                        }`}>
                        <span>{change}</span>
                        {trend === 'up' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                    </div>
                )}
            </div>
            <div className="mt-4">
                <h3 className="text-slate-500 text-sm font-medium">{label}</h3>
                <p className="text-2xl font-bold text-slate-800 mt-1">{value}</p>
            </div>
        </div>
    );
}

export function StatusBadge({ status }) {
    const styles = {
        completed: 'bg-emerald-100 text-emerald-700',
        active: 'bg-emerald-100 text-emerald-700',
        present: 'bg-emerald-100 text-emerald-700',
        paid: 'bg-emerald-100 text-emerald-700',
        pending: 'bg-amber-100 text-amber-700',
        warning: 'bg-amber-100 text-amber-700',
        late: 'bg-amber-100 text-amber-700',
        failed: 'bg-rose-100 text-rose-700',
        absent: 'bg-rose-100 text-rose-700',
        inactive: 'bg-slate-100 text-slate-700',
    };

    const normalizedStatus = status?.toLowerCase() || 'inactive';

    return (
        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${styles[normalizedStatus] || styles.inactive}`}>
            {status}
        </span>
    );
}

export function Card({ children, className = '' }) {
    return (
        <div className={`bg-white rounded-xl border border-slate-100 shadow-sm ${className}`}>
            {children}
        </div>
    );
}

export function CardHeader({ title, action, children }) {
    return (
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-800">{title}</h2>
            {action}
            {children}
        </div>
    );
}

export function Button({ children, variant = 'primary', size = 'md', className = '', ...props }) {
    const variants = {
        primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm shadow-indigo-200',
        secondary: 'bg-white border border-slate-200 text-slate-600 hover:bg-slate-50',
        danger: 'bg-rose-600 text-white hover:bg-rose-700',
        ghost: 'text-slate-600 hover:bg-slate-100',
    };

    const sizes = {
        sm: 'px-3 py-1.5 text-xs',
        md: 'px-4 py-2 text-sm',
        lg: 'px-6 py-3 text-base',
    };

    return (
        <button
            className={`inline-flex items-center justify-center space-x-2 font-medium rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${className}`}
            {...props}
        >
            {children}
        </button>
    );
}

export function Input({ label, error, className = '', ...props }) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            )}
            <input
                className={`w-full rounded-lg border ${error ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-indigo-500'} shadow-sm focus:outline-none focus:ring-2 px-3 py-2 text-sm`}
                {...props}
            />
            {error && <p className="mt-1 text-xs text-rose-600">{error}</p>}
        </div>
    );
}

export function Select({ label, options, className = '', ...props }) {
    return (
        <div className={className}>
            {label && (
                <label className="block text-sm font-medium text-slate-700 mb-1">{label}</label>
            )}
            <select
                className="w-full rounded-lg border border-slate-200 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 px-3 py-2 text-sm"
                {...props}
            >
                {options.map((opt) => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                ))}
            </select>
        </div>
    );
}

export function EmptyState({ icon: Icon, title, description, action }) {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                <Icon className="w-8 h-8 text-slate-400" />
            </div>
            <h3 className="text-lg font-medium text-slate-800">{title}</h3>
            <p className="text-slate-500 mt-1 max-w-sm">{description}</p>
            {action && <div className="mt-4">{action}</div>}
        </div>
    );
}

export function LoadingSpinner({ size = 'md' }) {
    const sizes = { sm: 'w-4 h-4', md: 'w-8 h-8', lg: 'w-12 h-12' };
    return (
        <div className="flex items-center justify-center p-8">
            <div className={`${sizes[size]} border-2 border-slate-200 border-t-indigo-600 rounded-full animate-spin`}></div>
        </div>
    );
}

export function PageHeader({ title, description, children }) {
    return (
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div>
                <h1 className="text-2xl font-bold text-slate-800">{title}</h1>
                {description && <p className="text-slate-500 mt-1">{description}</p>}
            </div>
            {children && <div className="flex items-center space-x-3">{children}</div>}
        </div>
    );
}
