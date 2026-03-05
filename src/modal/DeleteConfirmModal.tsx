import React from 'react';
import { Trash2, Loader2 } from 'lucide-react';
import typography from "../../src/styles/typography";

// ============================================================================
// DELETE CONFIRM MODAL
// ============================================================================
const DeleteConfirmModal: React.FC<{
    onConfirm: () => void;
    onCancel:  () => void;
    deleting:  boolean;
}> = ({ onConfirm, onCancel, deleting }) => (
    <div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onCancel}
    >
        <div
            className="bg-white rounded-2xl shadow-2xl p-6 w-80 flex flex-col items-center gap-4"
            style={{ animation: 'popIn 0.2s ease-out' }}
            onClick={e => e.stopPropagation()}
        >
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
                <Trash2 className="w-7 h-7 text-red-500" />
            </div>
            <div className="text-center">
                <h3 className={`${typography.heading.h6} text-gray-900`}>Delete Notification?</h3>
                <p className={`${typography.body.xs} text-gray-500 mt-1`}>This action cannot be undone.</p>
            </div>
            <div className="grid grid-cols-2 gap-3 w-full">
                <button
                    onClick={onCancel}
                    disabled={deleting}
                    className={`py-2.5 rounded-xl border border-gray-200 ${typography.body.xs} font-semibold text-gray-600 hover:bg-gray-50 transition-colors disabled:opacity-50`}
                >
                    Cancel
                </button>
                <button
                    onClick={onConfirm}
                    disabled={deleting}
                    className={`py-2.5 rounded-xl bg-red-500 text-white ${typography.body.xs} font-semibold hover:bg-red-600 transition-colors disabled:opacity-60 flex items-center justify-center gap-1.5`}
                >
                    {deleting
                        ? <Loader2 className="w-4 h-4 animate-spin" />
                        : <Trash2  className="w-4 h-4" />
                    }
                    Delete
                </button>
            </div>
        </div>
        <style>{`
            @keyframes popIn {
                from { opacity: 0; transform: scale(0.92); }
                to   { opacity: 1; transform: scale(1); }
            }
        `}</style>
    </div>
);

export default DeleteConfirmModal;