import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { deleteHospital, Hospital } from "../services/HospitalService.service";
import { ServiceItem } from "../services/api.service";
import { typography } from "../styles/typography";
import Button from "../components/ui/Buttons";
import ActionDropdown from "../components/ActionDropDown";

const ensureArray = (input: any): string[] => {
    if (!input) return [];
    if (Array.isArray(input)) return input;
    if (typeof input === "string") return input.split(",").map(s => s.trim()).filter(Boolean);
    return [];
};

interface HospitalUserServiceProps {
    userId: string;
    data?: ServiceItem[];
    selectedSubcategory?: string | null;
    hideHeader?: boolean;
    hideEmptyState?: boolean;
}

const HospitalUserService: React.FC<HospitalUserServiceProps> = ({
    userId,
    data = [],
    selectedSubcategory,
    hideHeader = false,
    hideEmptyState = false,
}) => {
    const navigate = useNavigate();
    const [hospitals, setHospitals] = useState<Hospital[]>(data as Hospital[]);
    const [deleteLoading, setDeleteLoading] = useState<string | null>(null);

    const filteredHospitals = selectedSubcategory
        ? hospitals.filter(h =>
            h.hospitalType &&
            h.hospitalType.toLowerCase().includes(selectedSubcategory.toLowerCase())
        )
        : hospitals;

    const handleEdit = (id: string) => navigate(`/add-hospital-service-form?id=${id}`);

    const handleDelete = async (id: string) => {
        if (!window.confirm("Are you sure you want to delete this hospital?")) return;
        setDeleteLoading(id);
        try {
            const response = await deleteHospital(id);
            if (response.success) {
                setHospitals(prev => prev.filter(h => (h.id || h._id) !== id));
            } else {
                alert(response.message || "Failed to delete hospital");
            }
        } catch (error) {
            console.error("Error deleting hospital:", error);
            alert("Failed to delete hospital");
        } finally {
            setDeleteLoading(null);
        }
    };

    const openDirections = (hospital: Hospital) => {
        if (hospital.latitude && hospital.longitude) {
            window.open(
                `https://www.google.com/maps/dir/?api=1&destination=${hospital.latitude},${hospital.longitude}`,
                "_blank"
            );
        } else if (hospital.area || hospital.city) {
            const addr = encodeURIComponent(
                [hospital.area, hospital.city, hospital.state].filter(Boolean).join(", ")
            );
            window.open(`https://www.google.com/maps/dir/?api=1&destination=${addr}`, "_blank");
        }
    };

    const openCall = (phone: string) => { window.location.href = `tel:${phone}`; };

    const renderCard = (hospital: Hospital) => {
        const id = hospital.id || hospital._id || "";
        const imageUrls = (hospital.images || []).filter(Boolean) as string[];
        const location = [hospital.area, hospital.city, hospital.state]
            .filter(Boolean).join(", ") || "Location not specified";
        const departments = ensureArray(hospital.departments);
        const displayName = hospital.hospitalName || hospital.name || "Unnamed Hospital";
        const phone = hospital.phone || (hospital as any).contactNumber || (hospital as any).phoneNumber;
        const description = (hospital as any).description || hospital.bio || "";
        const isActive = hospital.status !== false;

        return (
            <div
                key={id}
                className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100"
            >
                {/* ── Image ── */}
                <div className="relative h-52 bg-gray-100">
                    {imageUrls.length > 0 ? (
                        <img
                            src={imageUrls[0]}
                            alt={displayName}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <div className="w-full h-full flex items-center justify-center bg-[#1A5F9E]/5">
                            <span className="text-6xl">🏥</span>
                        </div>
                    )}

                    {/* Type badge — bottom left over image */}
                    <div className="absolute bottom-3 left-3">
                        <span className="bg-black/60 text-white text-xs font-semibold px-3 py-1.5 rounded-lg backdrop-blur-sm">
                            {hospital.hospitalType || "Hospital"}
                        </span>
                    </div>

                    {/* Action menu — top right */}
                    <div className="absolute top-3 right-3">
                        {deleteLoading === id ? (
                            <div className="bg-white rounded-lg p-2 shadow-lg">
                                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-red-600" />
                            </div>
                        ) : (
                            <ActionDropdown
                                onEdit={() => handleEdit(id)}
                                onDelete={() => handleDelete(id)}
                            />
                        )}
                    </div>
                </div>

                {/* ── Body ── */}
                <div className="p-4">

                    {/* Name */}
                    <h3 className="text-lg font-bold text-gray-900 mb-1 truncate">
                        {displayName}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1.5 mb-3">
                        <span className="text-red-500 text-sm">📍</span>
                        <p className="text-sm text-gray-500 line-clamp-1">{location}</p>
                    </div>

                    {/* Category pill + Active status — side by side like screenshot */}
                    <div className="flex items-center gap-2 mb-3">
                        <span className="flex-1 text-center text-sm font-medium text-[#1A5F9E] bg-[#1A5F9E]/8 border border-[#1A5F9E]/20 px-3 py-1.5 rounded-full truncate">
                            {hospital.hospitalType || "Hospital & Medical"}
                        </span>
                        <span className={`flex items-center gap-1.5 text-sm font-semibold px-3 py-1.5 rounded-full border ${
                            isActive
                                ? "text-green-600 bg-green-50 border-green-200"
                                : "text-red-500 bg-red-50 border-red-200"
                        }`}>
                            <span className={`w-2 h-2 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
                            {isActive ? "Active" : "Inactive"}
                        </span>
                    </div>

                    {/* Description */}
                    {description && (
                        <p className="text-sm text-gray-500 line-clamp-2 mb-3">{description}</p>
                    )}

                    {/* Departments chips (if no description, show these) */}
                    {!description && departments.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                            {departments.slice(0, 3).map((dept, idx) => (
                                <span key={idx} className="text-xs bg-[#1A5F9E]/5 text-[#1A5F9E] px-2 py-0.5 rounded-full">
                                    {dept}
                                </span>
                            ))}
                            {departments.length > 3 && (
                                <span className="text-xs text-gray-400">+{departments.length - 3} more</span>
                            )}
                        </div>
                    )}

                    {/* Star rating — like screenshot */}
                    <div className="flex items-center gap-2 mb-4">
                        <span className="inline-flex items-center gap-1.5 bg-yellow-50 border border-yellow-200 text-yellow-700 text-sm font-semibold px-3 py-1 rounded-full">
                            ⭐ {hospital.rating ? hospital.rating.toFixed(1) : "4.5"}
                        </span>
                        {phone && (
                            <span className="text-sm text-gray-500 flex items-center gap-1">
                                <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                </svg>
                                {phone}
                            </span>
                        )}
                    </div>

           
                     
                    </div>
                </div>
         
        );
    };

    if (filteredHospitals.length === 0) {
        if (hideEmptyState) return null;
        return (
            <div>
                {!hideHeader && (
                    <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                        <span>🏥</span> Hospital & Medical Services (0)
                    </h2>
                )}
                <div className="bg-white rounded-2xl border border-gray-100 p-8 text-center">
                    <div className="text-6xl mb-4">🏥</div>
                    <h3 className={`${typography.heading.h6} text-gray-700 mb-2`}>No Hospital Services Yet</h3>
                    <p className={`${typography.body.small} text-gray-500 mb-4`}>
                        Start adding your hospital and medical services to showcase them here.
                    </p>
                    <Button
                        variant="primary"
                        size="md"
                        onClick={() => navigate("/add-hospital-service-form")}
                        className="gap-1.5 bg-[#1A5F9E] hover:bg-[#154a7e]"
                    >
                        + Add Hospital Service
                    </Button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {!hideHeader && (
                <h2 className={`${typography.heading.h5} text-gray-800 mb-3 flex items-center gap-2`}>
                    <span>🏥</span> Hospital & Medical Services ({filteredHospitals.length})
                </h2>
            )}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                {filteredHospitals.map(renderCard)}
            </div>
        </div>
    );
};

export default HospitalUserService;