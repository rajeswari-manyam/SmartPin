import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";

import { createBooking, getJobById } from "../services/api.service";
import { useAuth } from "../context/AuthContext";

/* ================= TYPES ================= */

interface Job {
    _id: string;
    userId: string; // 👈 worker ID (job owner)
    description: string;
    category: string;
    subcategory: string;
}

/* ================= COMPONENT ================= */

const BookNow: React.FC = () => {
    const navigate = useNavigate();
    const { jobId } = useParams<{ jobId: string }>();
    const { user } = useAuth(); // 👈 logged-in customer

    const customerId = user?._id;

    const [job, setJob] = useState<Job | null>(null);
    const [workerId, setWorkerId] = useState<string | null>(null);

    const [bookingType, setBookingType] =
        useState<"HOURLY" | "DAILY">("HOURLY");
    const [hours, setHours] = useState(1);
    const [startDate, setStartDate] = useState("");
    const [remarks, setRemarks] = useState("");
    const [loading, setLoading] = useState(false);
    const [jobLoading, setJobLoading] = useState(true);

    const pricePerHour = 200;
    const totalPrice = bookingType === "HOURLY" ? hours * pricePerHour : pricePerHour * 8;

    /* ================= FETCH JOB ================= */

    useEffect(() => {
        if (!jobId) return;

        const fetchJob = async () => {
            try {
                setJobLoading(true);
                const res = await getJobById(jobId);

                setJob(res.data);
                setWorkerId(res.data.userId); // ✅ REAL worker ID
            } catch (error) {
                alert("Failed to load job details");
            } finally {
                setJobLoading(false);
            }
        };

        fetchJob();
    }, [jobId]);

    /* ================= BOOKING ================= */

    const handleBooking = async () => {
        if (!customerId || !workerId || !jobId) {
            alert("Missing booking data");
            return;
        }

        try {
            setLoading(true);

            await createBooking({
                customer: customerId,
                worker: workerId, // ✅ correct
                bookingType,
                hours: bookingType === "HOURLY" ? hours : 0,
                price: totalPrice,
                startDate,
                remarks,
            });

            alert("Booking created successfully ✅");
            navigate("/my-skills"); // ✅ Redirect to My Skills (services) page
        } catch (error: any) {
            alert(error.message || "Booking failed");
        } finally {
            setLoading(false);
        }
    };

    /* ================= UI ================= */

    if (jobLoading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <Loader2 className="animate-spin w-8 h-8 text-blue-600" />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="text-center mt-20 text-red-600">
                Job not found
            </div>
        );
    }

    return (
        <div className="max-w-md mx-auto p-4 bg-white rounded-xl shadow">
            <h2 className="text-xl font-semibold mb-2">Book Service</h2>
            <p className="text-sm text-slate-600 mb-4">
                {job.subcategory} • {job.category}
            </p>

            {/* Booking Type */}
            <label className="block mb-2">Booking Type</label>
            <select
                value={bookingType}
                onChange={(e) => setBookingType(e.target.value as any)}
                className="w-full border p-2 rounded mb-4"
            >
                <option value="HOURLY">Hourly</option>
                <option value="DAILY">Daily</option>
            </select>

            {/* Hours */}
            {bookingType === "HOURLY" && (
                <>
                    <label className="block mb-2">Hours</label>
                    <input
                        type="number"
                        min={1}
                        value={hours}
                        onChange={(e) => setHours(Number(e.target.value))}
                        className="w-full border p-2 rounded mb-4"
                    />
                </>
            )}

            {/* Start Date */}
            <label className="block mb-2">Start Date</label>
            <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full border p-2 rounded mb-4"
            />

            {/* Remarks */}
            <label className="block mb-2">Remarks</label>
            <textarea
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                className="w-full border p-2 rounded mb-4"
            />

            {/* Price */}
            <div className="mb-4 font-semibold">
                Total Price: ₹{totalPrice}
            </div>

            {/* Submit */}
            <button
                onClick={handleBooking}
                disabled={loading}
                className="w-full bg-blue-600 text-white py-2 rounded flex items-center justify-center"
            >
                {loading ? <Loader2 className="animate-spin" /> : "Book Now"}
            </button>
        </div>
    );
};

export default BookNow;
