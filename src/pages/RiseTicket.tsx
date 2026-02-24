import React, { useState, useEffect } from 'react';
import { AlertCircle, CheckCircle, Loader2, Eye } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { createTicket, CreateTicketPayload } from '../services/api.service';

interface CreateTicketScreenProps {
    userId?: string;
    userRole?: 'User' | 'Worker';
}

const CreateTicketScreen: React.FC<CreateTicketScreenProps> = ({
    userId: propUserId,
    userRole: propUserRole
}) => {
    const navigate = useNavigate();
    const [currentUserId, setCurrentUserId] = useState<string>('');
    const [currentUserRole, setCurrentUserRole] = useState<'User' | 'Worker'>('User');

    useEffect(() => {
        if (propUserId) {
            setCurrentUserId(propUserId);
        } else {
            try {
                const storedUser = localStorage.getItem('user');
                if (storedUser) {
                    const user = JSON.parse(storedUser);
                    setCurrentUserId(user._id || user.id || user.userId);
                    setCurrentUserRole(user.role || 'User');
                }
            } catch (error) {
                console.error('Error reading user from localStorage:', error);
            }
        }
        if (propUserRole) {
            setCurrentUserRole(propUserRole);
        }
    }, [propUserId, propUserRole]);

    const [formData, setFormData] = useState<CreateTicketPayload>({
        raisedById: currentUserId,
        raisedByRole: currentUserRole,
        subject: '',
        description: '',
        priority: 'MEDIUM',
    });

    const [loading, setLoading] = useState(false);
    const [success, setSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (currentUserId) {
            setFormData((prev: CreateTicketPayload) => ({
                ...prev,
                raisedById: currentUserId,
                raisedByRole: currentUserRole,
            }));
        }
    }, [currentUserId, currentUserRole]);

    const handleInputChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev: CreateTicketPayload) => ({ ...prev, [name]: value }));
        setError(null);
        setSuccess(false);
    };

    const handleSubmit = async () => {
        if (!formData.raisedById) {
            setError('User ID is required. Please log in again.');
            return;
        }
        if (!formData.subject.trim() || !formData.description.trim()) {
            setError('Please fill in all required fields');
            return;
        }

        setLoading(true);
        setError(null);
        setSuccess(false);

        try {
            const response = await createTicket(formData);
            console.log('Ticket created:', response);
            setSuccess(true);

            // Navigate to view-tickets after successful submission
            setTimeout(() => {
                navigate('/view-tickets');
            }, 1500);
        } catch (err: any) {
            setError(err.message || 'Failed to create ticket. Please try again.');
            console.error('Error creating ticket:', err);
        } finally {
            setLoading(false);
        }
    };

    const priorityOptions = [
        { level: 'LOW' as const, activeClass: 'bg-green-50 text-green-700 border-green-400' },
        { level: 'MEDIUM' as const, activeClass: 'bg-amber-50 text-amber-700 border-amber-400' },
        { level: 'HIGH' as const, activeClass: 'bg-red-50 text-red-700 border-red-400' },
    ];

    return (
        <div className="min-h-screen bg-gray-50 py-10 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">

                {/* Top Row: Heading left, View Tickets button right */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 leading-tight">
                            Create Support Ticket
                        </h1>
                        <p className="text-gray-500 text-sm mt-1">
                            Submit your issue and we'll get back to you soon.
                        </p>
                    </div>
                    <button
                        onClick={() => navigate('/view-tickets')}
                        className="flex items-center gap-2 px-5 py-2.5 text-white rounded-lg font-semibold shadow-md hover:opacity-90 transition-opacity text-sm"
                        style={{ backgroundColor: '#00598a' }}
                    >
                        <Eye className="w-4 h-4" />
                        View Tickets
                    </button>
                </div>

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8">
                    <div className="space-y-6">

                        {/* I am a */}
                        <div>
                            <label htmlFor="raisedByRole" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                I am a <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="raisedByRole"
                                name="raisedByRole"
                                value={formData.raisedByRole}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 bg-white focus:outline-none focus:ring-2 focus:border-transparent transition"
                                style={{ '--tw-ring-color': '#00598a' } as React.CSSProperties}
                                onFocus={e => (e.target.style.boxShadow = '0 0 0 2px #00598a33')}
                                onBlur={e => (e.target.style.boxShadow = '')}
                            >
                                <option value="User">User</option>
                                <option value="Worker">Worker</option>
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                placeholder="Brief description of your issue"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition"
                                onFocus={e => (e.target.style.boxShadow = '0 0 0 2px #00598a33', e.target.style.borderColor = '#00598a')}
                                onBlur={e => (e.target.style.boxShadow = '', e.target.style.borderColor = '')}
                            />
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Priority <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {priorityOptions.map(({ level, activeClass }) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() =>
                                            setFormData((prev: CreateTicketPayload) => ({ ...prev, priority: level }))
                                        }
                                        className={`px-4 py-3 rounded-lg border-2 font-semibold text-sm transition-all ${
                                            formData.priority === level
                                                ? activeClass
                                                : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                                        }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-1.5">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={6}
                                placeholder="Please provide detailed information about your issue..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition resize-none"
                                onFocus={e => (e.target.style.boxShadow = '0 0 0 2px #00598a33', e.target.style.borderColor = '#00598a')}
                                onBlur={e => (e.target.style.boxShadow = '', e.target.style.borderColor = '')}
                            />
                            <p className="text-xs text-gray-400 mt-1 text-right">
                                {formData.description.length} characters
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                                <p className="text-sm text-red-700">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <p className="text-sm text-green-700">
                                    Ticket created successfully! Redirecting...
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !currentUserId}
                            className="w-full text-white font-semibold py-3 px-6 rounded-lg transition-opacity flex items-center justify-center gap-2 disabled:opacity-50"
                            style={{ backgroundColor: '#00598a' }}
                            onMouseEnter={e => !loading && ((e.target as HTMLElement).style.opacity = '0.9')}
                            onMouseLeave={e => ((e.target as HTMLElement).style.opacity = '1')}
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="w-5 h-5 animate-spin" />
                                    Creating Ticket...
                                </>
                            ) : (
                                'Submit Ticket'
                            )}
                        </button>
                    </div>
                </div>

                {/* Info Box */}
                <div className="mt-5 rounded-lg p-4 border" style={{ backgroundColor: '#f0f7fc', borderColor: '#bee3f8' }}>
                    <p className="text-sm" style={{ color: '#005580' }}>
                        <strong>Note:</strong> Our support team typically responds within 24–48 hours.
                        For urgent issues, please mark the priority as <strong>HIGH</strong>.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CreateTicketScreen;