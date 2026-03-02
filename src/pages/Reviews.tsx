import React, { useState } from "react";
import { useParams } from "react-router-dom";
import { useAuth } from "../context/AuthContext"; // make sure this exists

interface ReviewData {
    _id: string;
    user?: { _id: string; name: string };
    rating: number;
    review: string;
    jobType?: string;
    createdAt: string;
}

const DUMMY_REVIEWS: ReviewData[] = [
    { _id: "1", user: { _id: "u1", name: "Alice" }, rating: 5, review: "Excellent work!", jobType: "Plumbers", createdAt: new Date().toISOString() },
    { _id: "2", user: { _id: "u2", name: "Bob" }, rating: 4, review: "Good service.", jobType: "Electricians", createdAt: new Date().toISOString() },
    { _id: "3", user: { _id: "u3", name: "Charlie" }, rating: 3, review: "Average experience.", jobType: "Carpenters", createdAt: new Date().toISOString() },
];

const Reviews: React.FC = () => {
    const { workerId } = useParams<{ workerId: string }>();
    const { user } = useAuth();
    const userId = user?._id ?? "";

    const [reviews] = useState<ReviewData[]>(DUMMY_REVIEWS);

    return (
        <div className="p-4">
            <h1 className="text-2xl font-bold mb-4">Reviews for Worker: {workerId}</h1>
            <p>User ID: {userId}</p>
            <div className="space-y-4">
                {reviews.map((r) => (
                    <div key={r._id} className="border p-3 rounded shadow">
                        <p><strong>{r.user?.name}</strong> ({r.rating}★)</p>
                        <p>{r.review}</p>
                        {r.jobType && <p className="text-sm text-gray-500">{r.jobType}</p>}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Reviews;