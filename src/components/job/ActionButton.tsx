import React from "react";
import { Phone } from "lucide-react";
import Button from "../ui/Buttons";
import { CustomerDetails } from "../../types/job.types";

interface ActionButtonsProps {
    customerDetails: CustomerDetails;
    onCall?: (phone: string) => void;
    onMessage?: () => void;
    onAcceptJob?: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
    customerDetails,
    onCall,
    onMessage,
    onAcceptJob,
}) => {
    const handleCall = () => {
        if (onCall) {
            onCall(customerDetails.phone);
        } else {
            window.location.href = `tel:${customerDetails.phone}`;
        }
    };

    const handleMessage = () => {
        if (onMessage) {
            onMessage();
        } else {
            alert("Opening chat...");
        }
    };

    const handleAcceptJob = () => {
        if (onAcceptJob) {
            onAcceptJob();
        } else {
            alert("Job accepted!");
        }
    };

    return (
        <>
            <div className="grid grid-cols-2 gap-3">
                <Button
                    variant="gradient-blue"
                    size="lg"
                    onClick={handleCall}
                >
                    <Phone className="w-5 h-5 mr-2" />
                    Call Customer
                </Button>

                <Button
                    variant="secondary"
                    size="lg"
                    onClick={handleMessage}
                >
                    Send Message
                </Button>
            </div>

            <Button
                variant="success"
                size="xl"
                fullWidth
                onClick={handleAcceptJob}
            >
                Accept This Job
            </Button>
        </>
    );
};

export default ActionButtons;
