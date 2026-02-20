import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getWorkerWithSkills } from "../services/api.service";
import { useAuth } from "../context/AuthContext";

const WorkerDashboard: React.FC = () => {
    const { user } = useAuth();
    const navigate = useNavigate();

    const [skills, setSkills] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSkills = async () => {
            try {
                // ✅ FIX: getWorkerWithSkills expects a workerId, NOT a userId.
                // The workerId is stored in localStorage after createWorkerBase succeeds.
                // Using user._id (which is a userId) would return no results or an error.
                const workerId =
                    localStorage.getItem("workerId") ||
                    localStorage.getItem("@worker_id");

                if (!workerId) {
                    console.warn("No workerId found in localStorage — redirecting to profile setup.");
                    navigate("/worker-profile");
                    return;
                }

                console.log("Fetching worker with skills for workerId:", workerId);
                const res = await getWorkerWithSkills(workerId);
                console.log("Worker with skills response:", res);

                if (res?.workerSkills && res.workerSkills.length > 0) {
                    setSkills(res.workerSkills);
                } else {
                    navigate("/add-skills");
                }
            } catch (err) {
                console.error("Error fetching skills:", err);
                navigate("/add-skills");
            } finally {
                setLoading(false);
            }
        };

        fetchSkills();
    }, [navigate]);
    // ✅ FIX: Removed user?._id from dependency array — workerId comes from
    // localStorage, not from the user object. Adding user._id as a dep was
    // causing unnecessary re-fetches and using the wrong ID.

    if (loading) return <p>Loading your dashboard...</p>;

    return (
        <div className="min-h-screen p-4 md:p-6 bg-gray-50">
            <h1 className="text-2xl font-bold mb-4">My Skills</h1>

            {skills.length === 0 ? (
                <p>No skills added yet. Add your first skill!</p>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {skills.map(skill => (
                        <div key={skill._id} className="p-4 bg-white rounded-xl shadow">
                            <h2 className="font-semibold text-lg">{skill.skill}</h2>
                            <p className="text-gray-600">
                                {skill.category?.join(", ")} / {skill.subCategory}
                            </p>
                            <p className="text-green-600 mt-2">
                                ₹{skill.serviceCharge} / {skill.chargeType}
                            </p>
                        </div>
                    ))}
                </div>
            )}

            <button
                className="mt-6 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700"
                onClick={() => navigate("/add-skills")}
            >
                + Add New Skill
            </button>
        </div>
    );
};

export default WorkerDashboard;
