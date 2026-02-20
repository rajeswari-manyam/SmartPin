// JobCard.tsx - Job card component

import React, { useState, useCallback } from 'react';
import { Wrench, Clock, CheckCircle, Star } from 'lucide-react';
import Button from '../ui/Buttons';
import typography, { combineTypography } from '../../styles/typography';
import LocationIcon from "../../assets/icons/Location.png";
import { JobCardProps } from '../../types/Job';
import { getRelativeTime, getUrgencyColor } from './jobUtils';

const JobCard: React.FC<JobCardProps> = ({ job, index = 0, onViewDetails, onAccept }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isAccepting, setIsAccepting] = useState(false);

    const handleAccept = useCallback(async () => {
        if (onAccept && !isAccepting) {
            setIsAccepting(true);
            try {
                await onAccept(job.id);
            } finally {
                setIsAccepting(false);
            }
        }
    }, [job.id, onAccept, isAccepting]);

    const handleViewDetails = useCallback(() => {
        onViewDetails?.(job.id);
    }, [job.id, onViewDetails]);

    return (
        <article
            className="group bg-white rounded-2xl border-2 border-slate-200 hover:border-blue-400 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden"
            style={{ animationDelay: `${index * 100}ms` }}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            role="listitem"
        >
            {/* Card Header */}
            <div className="p-6 pb-4">
                <div className="flex items-start justify-between mb-3">
                    <div className="flex items-start gap-4 flex-1">
                        <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-indigo-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform duration-300 flex-shrink-0">
                            <Wrench className="w-5 h-5" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h2 className={combineTypography(typography.card.title, "text-slate-900")}>
                                {job.title}
                            </h2>

                            <div className="flex items-center gap-3 text-sm text-slate-500 mb-2">
                                <span className="flex items-center gap-1">
                                    <Clock className="w-3.5 h-3.5" />
                                    {getRelativeTime(job.postedAt)}
                                </span>
                                {job.client.verified && (
                                    <span className="flex items-center gap-1 text-blue-600">
                                        <CheckCircle className="w-3.5 h-3.5" />
                                        Verified
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                    <span className={`px-3 py-1 rounded-lg text-xs font-semibold border ${getUrgencyColor(job.urgency)}`}>
                        {job.urgency.toUpperCase()}
                    </span>
                </div>

                <p className={combineTypography(typography.card.description, "text-slate-600")}>
                    {job.description}
                </p>

                {/* Client Info */}
                <div className="flex items-center gap-2 p-3 bg-slate-50 rounded-lg">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {job.client.name.charAt(0)}
                    </div>

                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-slate-900">{job.client.name}</p>
                        <div className="flex items-center gap-1 text-xs text-slate-500">
                            <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                            <span className="font-semibold">{job.client.rating}</span>
                            <span>({job.client.reviewCount} reviews)</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Job Details Badges */}
            <div className="px-6 pb-5 flex flex-wrap gap-3">
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 rounded-lg font-semibold text-sm border border-blue-200">
                    <Clock className="w-4 h-4" />
                    {job.paymentType}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg font-semibold text-sm border border-emerald-200">
                    {job.currency === 'INR' ? '₹' : '$'}{job.rate}{job.paymentType === 'Hourly' ? '/hr' : ''}
                </span>
                <span className="inline-flex items-center gap-2 px-4 py-2 bg-slate-100 text-slate-700 rounded-lg font-semibold text-sm border border-slate-200">
                    <img src={LocationIcon} className="w-4 h-4" alt="Location" />
                    {job.distance} km
                </span>
            </div>

            {/* Action Buttons */}
            <div className="px-6 pb-6 flex gap-3">
                <Button
                    variant="gradient-blue"
                    onClick={handleViewDetails}
                    className={combineTypography(typography.nav.button, "flex-1")}
                >
                    View Details
                </Button>

                <Button
                    variant="success"
                    size="lg"
                    disabled={isAccepting}
                    onClick={handleAccept}
                    className={combineTypography(typography.nav.button, "flex-1")}
                >
                    <CheckCircle className="w-5 h-5" />
                    {isAccepting ? "Accepting..." : "Accept Job"}
                </Button>
            </div>

            {/* Hover Effect Indicator */}
            <div
                className={`h-1 bg-gradient-to-r from-blue-600 to-indigo-600 transition-all duration-500 ${isHovered ? 'w-full' : 'w-0'
                    }`}
                aria-hidden="true"
            />
        </article>
    );
};

export default JobCard;
