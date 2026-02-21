import React from "react";
import typography from "../../styles/typography";

interface AvailabilitySectionProps {
    availableFrom: string;
    availableTo: string;
    workingDays: string[];
    onAvailableFromChange: (value: string) => void;
    onAvailableToChange: (value: string) => void;
    onToggleWorkingDay: (day: string) => void;
}

const weekDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

const AvailabilitySection: React.FC<AvailabilitySectionProps> = ({
    availableFrom,
    availableTo,
    workingDays,
    onAvailableFromChange,
    onAvailableToChange,
    onToggleWorkingDay,
}) => {
    return (
        <div className="mb-8 p-4 bg-purple-50 rounded-xl border-2 border-purple-100">
            <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                📅 Availability
            </h3>

            {/* Date Range */}
            <div className="grid grid-cols-2 gap-4 mb-4">
                <div>
                    <label className={typography.form.label}>Available From</label>
                    <input
                        type="date"
                        value={availableFrom}
                        onChange={(e) => onAvailableFromChange(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#0B0E92] focus:outline-none"
                    />
                </div>

                <div>
                    <label className={typography.form.label}>Available Until</label>
                    <input
                        type="date"
                        value={availableTo}
                        onChange={(e) => onAvailableToChange(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:border-[#0B0E92] focus:outline-none"
                    />
                </div>
            </div>

            {/* Working Days */}
            <div>
                <label className={typography.form.label}>Working Days</label>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {weekDays.map((day) => (
                        <button
                            key={day}
                            type="button"
                            onClick={() => onToggleWorkingDay(day)}
                            className={`px-3 py-2 rounded-lg font-medium text-sm transition-all ${
                                workingDays.includes(day)
                                    ? "bg-gradient-to-r from-[#00598a] to-[#00598a] text-white"
                                    : "bg-white border-2 border-gray-300 text-gray-700 #00598a hover:bg-gray-100"
                            }`}
                        >
                            {day.slice(0, 3)}
                        </button>
                    ))}
                </div>
                <p className="text-sm text-gray-500 mt-2">
                    Select the days you're available to work
                </p>
            </div>
        </div>
    );
};

export default AvailabilitySection;
