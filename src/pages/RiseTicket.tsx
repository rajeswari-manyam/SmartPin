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

    // Get user data from props or localStorage
    useEffect(() => {
        if (propUserId) {
            setCurrentUserId(propUserId);
        } else {
            // Try to get from localStorage
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

    // Update formData when userId or userRole changes
    useEffect(() => {
        if (currentUserId) {
            setFormData((prev: CreateTicketPayload) => ({
                ...prev,
                raisedById: currentUserId,
                raisedByRole: currentUserRole
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

            // Reset form after successful submission
            setTimeout(() => {
                setFormData({
                    raisedById: currentUserId,
                    raisedByRole: currentUserRole,
                    subject: '',
                    description: '',
                    priority: 'MEDIUM',
                });
                setSuccess(false);
            }, 3000);
        } catch (err: any) {
            setError(err.message || 'Failed to create ticket. Please try again.');
            console.error('Error creating ticket:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleViewTickets = () => {
        navigate('/view-tickets');
    };

    const priorityColors = {
        LOW: 'bg-green-100 text-green-800 border-green-300',
        MEDIUM: 'bg-yellow-100 text-yellow-800 border-yellow-300',
        HIGH: 'bg-red-100 text-red-800 border-red-300',
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-2xl mx-auto">
                {/* View Tickets Button - Top Right Corner */}
                <div className="flex justify-end mb-6">
                    <button
                        onClick={handleViewTickets}
                        className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition font-semibold shadow-md hover:shadow-lg"
                    >
                        <Eye className="w-5 h-5" />
                        View Tickets
                    </button>
                </div>

                {/* Header */}
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">Create Support Ticket</h1>
                    <p className="text-gray-600">We're here to help. Submit your issue and we'll get back to you soon.</p>
                </div>

                {/* Debug Info (Remove in production) */}
                {process.env.NODE_ENV === 'development' && (
                    <div className="mb-4 p-3 bg-gray-100 rounded-lg text-xs">
                        <strong>Debug Info:</strong> User ID: {currentUserId || 'Not set'} | Role: {currentUserRole}
                    </div>
                )}

                {/* Form Card */}
                <div className="bg-white rounded-2xl shadow-xl p-8">
                    <div className="space-y-6">
                        {/* User Role Selection */}
                        <div>
                            <label htmlFor="raisedByRole" className="block text-sm font-semibold text-gray-700 mb-2">
                                I am a <span className="text-red-500">*</span>
                            </label>
                            <select
                                id="raisedByRole"
                                name="raisedByRole"
                                value={formData.raisedByRole}
                                onChange={handleInputChange}
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            >
                                <option value="User">User</option>
                                <option value="Worker">Worker</option>
                            </select>
                        </div>

                        {/* Subject */}
                        <div>
                            <label htmlFor="subject" className="block text-sm font-semibold text-gray-700 mb-2">
                                Subject <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                id="subject"
                                name="subject"
                                value={formData.subject}
                                onChange={handleInputChange}
                                placeholder="Brief description of your issue"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                            />
                        </div>

                        {/* Priority */}
                        <div>
                            <label className="block text-sm font-semibold text-gray-700 mb-2">
                                Priority <span className="text-red-500">*</span>
                            </label>
                            <div className="grid grid-cols-3 gap-3">
                                {(['LOW', 'MEDIUM', 'HIGH'] as const).map((level) => (
                                    <button
                                        key={level}
                                        type="button"
                                        onClick={() => setFormData((prev: CreateTicketPayload) => ({ ...prev, priority: level }))}
                                        className={`px-4 py-3 rounded-lg border-2 font-semibold transition ${formData.priority === level
                                                ? priorityColors[level]
                                                : 'bg-white text-gray-600 border-gray-300 hover:border-gray-400'
                                            }`}
                                    >
                                        {level}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Description */}
                        <div>
                            <label htmlFor="description" className="block text-sm font-semibold text-gray-700 mb-2">
                                Description <span className="text-red-500">*</span>
                            </label>
                            <textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                rows={6}
                                placeholder="Please provide detailed information about your issue..."
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition resize-none"
                            />
                            <p className="text-sm text-gray-500 mt-1">
                                {formData.description.length} characters
                            </p>
                        </div>

                        {/* Error Message */}
                        {error && (
                            <div className="flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-lg">
                                <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0" />
                                <p className="text-sm text-red-800">{error}</p>
                            </div>
                        )}

                        {/* Success Message */}
                        {success && (
                            <div className="flex items-center gap-2 p-4 bg-green-50 border border-green-200 rounded-lg">
                                <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0" />
                                <p className="text-sm text-green-800">
                                    Ticket created successfully! We'll get back to you soon.
                                </p>
                            </div>
                        )}

                        {/* Submit Button */}
                        <button
                            type="button"
                            onClick={handleSubmit}
                            disabled={loading || !currentUserId}
                            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold py-3 px-6 rounded-lg transition flex items-center justify-center gap-2"
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
                <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                        <strong>Note:</strong> Our support team typically responds within 24-48 hours.
                        For urgent issues, please mark the priority as HIGH.
                    </p>
                </div>
            </div>
        </div>
    );
};

export default CreateTicketScreen;
