import React from "react";
import { Star } from "lucide-react";
import { combineTypography } from "../../styles/typography";
import typography from "../../styles/typography";
import LocationIcon from "../../assets/icons/Location.png";
import type { CustomerDetails } from "../../types/jobtypes";

interface CustomerDetailsCardProps {
    customerDetails: CustomerDetails;
}

const CustomerDetailsCard: React.FC<CustomerDetailsCardProps> = ({ 
    customerDetails 
}) => {
    return (
        <div className="bg-white rounded-2xl border shadow-sm">
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 px-6 py-4">
                <h2 className={combineTypography(typography.card.title, "text-white")}>
                    Customer Details
                </h2>
            </div>

            <div className="p-6 space-y-4">
                <p className={typography.body.base}>
                    <span className="font-semibold">Name:</span> {customerDetails.name}
                </p>

                <div className="flex items-center gap-2">
                    <img 
                        src={LocationIcon} 
                        alt="Distance" 
                        className="w-5 h-5" 
                    />
                    <span className={typography.body.base}>
                        <span className="font-semibold">Distance:</span> {customerDetails.distance}
                    </span>
                </div>

                <div className="flex items-center gap-2">
                    <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                    <span className={typography.body.base}>
                        {customerDetails.rating} ({customerDetails.reviewCount} reviews)
                    </span>
                </div>
            </div>
        </div>
    );
};

export default CustomerDetailsCard;
