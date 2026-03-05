import React from "react";
import { X, AlertTriangle, Loader2, UserMinus } from "lucide-react";
import typography from "../styles/typography";

const RemoveConfirmModal: React.FC<{
    workerName: string;
    onConfirm:  () => void;
    onCancel:   () => void;
    removing:   boolean;
}> = ({ workerName, onConfirm, onCancel, removing }) => (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
        <div className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
            <button onClick={onCancel}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
                <X size={16} className="text-gray-500" />
            </button>
            <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
                <AlertTriangle size={28} className="text-red-500" />
            </div>
            <h2 className={`${typography.heading.h5} text-gray-900 text-center mb-2`}>Remove Worker?</h2>
            <p className={`${typography.body.xs} text-gray-500 text-center mb-6`}>
                Are you sure you want to remove{" "}
                <span className="font-semibold text-gray-800">{workerName}</span> from this job?
                This action cannot be undone.
            </p>
            <div className="grid grid-cols-2 gap-3">
                <button onClick={onCancel} disabled={removing}
                    className={`py-3.5 rounded-2xl font-bold ${typography.fontSize.xs} bg-gray-100 text-gray-700 hover:bg-gray-200 transition active:scale-95 disabled:opacity-50`}>
                    Cancel
                </button>
                <button onClick={onConfirm} disabled={removing}
                    className={`py-3.5 rounded-2xl font-bold ${typography.fontSize.xs} bg-red-500 hover:bg-red-600 text-white shadow-md transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2`}>
                    {removing ? <Loader2 size={15} className="animate-spin" /> : <UserMinus size={15} />}
                    {removing ? "Removing…" : "Yes, Remove"}
                </button>
            </div>
        </div>
    </div>
);

export default RemoveConfirmModal;