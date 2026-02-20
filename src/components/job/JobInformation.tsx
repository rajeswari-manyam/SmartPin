import React from "react";
import { Clock, IndianRupee } from "lucide-react";
import { combineTypography } from "../../styles/typography";
import typography from "../../styles/typography";
import type { JobInformation } from "../../types/jobtypes";

interface JobInformationCardProps {
    jobInformation: JobInformation;
}

const JobInformationCard: React.FC<JobInformationCardProps> = ({
    jobInformation
}) => {
    return (
        <div className="bg-white rounded-2xl border shadow-sm">
            <div className="bg-gradient-to-r from-indigo-600 to-purple-600 px-6 py-4">
                <h2 className={combineTypography(typography.card.title, "text-white")}>
                    Job Information
                </h2>
            </div>

            <div className="p-6 space-y-4">
                <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-indigo-600" />
                    <p className={typography.body.base}>
                        {jobInformation.type}
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <IndianRupee className="w-5 h-5 text-emerald-600" />
                    <p className={combineTypography(
                        typography.body.base,
                        "text-emerald-600 font-semibold"
                    )}>
                        ₹{jobInformation.budget}/{jobInformation.budgetType}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default JobInformationCard;
