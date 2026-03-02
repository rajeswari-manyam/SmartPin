// import React, { useEffect, useState } from "react";
// import { useParams, useNavigate } from "react-router-dom";
// import {
//     ChevronLeft, Phone, Loader2, Users, MapPin,
//     Tag,
//     UserMinus, X, AlertTriangle, Mail, PhoneCall, Star
// } from "lucide-react";
// import {
//     getWorkerWithSkills,
//     getWorkerById,
//     getWorkerByUserId,
//     getJobById,
//     removeEnquiry,
//     ConfirmedWorkers,
//     API_BASE_URL,
// } from "../services/api.service";
// import typography from "../styles/typography";

// // ── Helpers ───────────────────────────────────────────────────────────────────
// const resolveImageUrl = (path?: string): string | null => {
//     if (!path || typeof path !== "string") return null;
//     const cleaned = path.trim();
//     if (!cleaned) return null;
//     if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned;
//     const base = (API_BASE_URL || "").replace(/\/$/, "");
//     const rel = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
//     return `${base}${rel}`;
// };

// const formatChargeType = (ct?: string): string => {
//     const map: Record<string, string> = {
//         hour: "hour", hourly: "hour",
//         day: "day", daily: "day",
//         fixed: "fixed", monthly: "month",
//         per_project: "project",
//     };
//     return ct ? (map[ct.toLowerCase()] || ct) : "hour";
// };

// // ── Types ─────────────────────────────────────────────────────────────────────
// interface EnrichedWorker {
//     _id: string;
//     workerId: string;
//     userId?: string;
//     name: string;
//     profilePic: string | null;
//     area: string;
//     city: string;
//     state: string;
//     serviceCharge: number;
//     chargeType: string;
//     isActive: boolean;
//     categories: string[];
//     subCategories: string[];
//     skills: string[];
//     phone?: string;
//     status: "Enquired" | "Confirmed";
// }

// // ── Call Popup Modal ──────────────────────────────────────────────────────────
// const CallPopupModal: React.FC<{
//     workerName: string;
//     phone: string;
//     profilePic: string | null;
//     onClose: () => void;
// }> = ({ workerName, phone, profilePic, onClose }) => {
//     const cleanPhone = phone.replace(/\D/g, "");
//     const displayPhone = cleanPhone ? `+91 ${cleanPhone}` : phone;
//     const initials = (workerName || "?")
//         .split(" ").map((n) => n[0] || "").join("").toUpperCase().slice(0, 2);

//     return (
//         <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//             <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
//             <div className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
//                 <button
//                     onClick={onClose}
//                     className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
//                 >
//                     <X size={16} className="text-gray-500" />
//                 </button>
//                 <div className="w-20 h-20 rounded-full overflow-hidden bg-[#0f4c75] flex items-center justify-center mx-auto mb-4 shadow-md">
//                     {profilePic ? (
//                         <img
//                             src={profilePic}
//                             alt={workerName}
//                             className="w-full h-full object-cover"
//                             onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
//                         />
//                     ) : (
//                         <span className={`text-white font-bold ${typography.fontSize["2xl"]}`}>{initials || "?"}</span>
//                     )}
//                 </div>
//                 <h2 className={`${typography.heading.h5} text-gray-900 text-center mb-1`}>{workerName}</h2>
//                 <p className={`${typography.misc.caption} text-center mb-5`}>Call this worker directly</p>
//                 <div className="flex items-center justify-center gap-3 bg-[#0f4c75]/5 border border-[#0f4c75]/20 rounded-2xl px-5 py-4 mb-5">
//                     <div className="w-10 h-10 rounded-full bg-[#0f4c75] flex items-center justify-center flex-shrink-0">
//                         <Phone size={18} className="text-white" />
//                     </div>
//                     <span className={`${typography.fontSize.xl} font-bold text-[#0f4c75] tracking-wide`}>{displayPhone}</span>
//                 </div>
//                 <div className="grid grid-cols-2 gap-3">
//                     <button
//                         onClick={onClose}
//                         className={`py-3.5 rounded-2xl font-bold ${typography.fontSize.xs} bg-gray-100 text-gray-700 hover:bg-gray-200 transition active:scale-95`}
//                     >
//                         Cancel
//                     </button>
//                     <a
//                         href={`tel:${cleanPhone}`}
//                         onClick={onClose}
//                         className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold ${typography.fontSize.xs} bg-[#0f4c75] hover:bg-[#00598a] text-white shadow-md transition-all active:scale-95`}
//                     >
//                         <PhoneCall size={15} />
//                         Call Now
//                     </a>
//                 </div>
//             </div>
//         </div>
//     );
// };

// // ── Remove Confirm Modal ──────────────────────────────────────────────────────
// const RemoveConfirmModal: React.FC<{
//     workerName: string;
//     onConfirm: () => void;
//     onCancel: () => void;
//     removing: boolean;
// }> = ({ workerName, onConfirm, onCancel, removing }) => (
//     <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
//         <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onCancel} />
//         <div className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
//             <button onClick={onCancel}
//                 className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition">
//                 <X size={16} className="text-gray-500" />
//             </button>
//             <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-4">
//                 <AlertTriangle size={28} className="text-red-500" />
//             </div>
//             <h2 className={`${typography.heading.h5} text-gray-900 text-center mb-2`}>Remove Worker?</h2>
//             <p className={`${typography.body.xs} text-gray-500 text-center mb-6`}>
//                 Are you sure you want to remove{" "}
//                 <span className="font-semibold text-gray-800">{workerName}</span> from this job?
//                 This action cannot be undone.
//             </p>
//             <div className="grid grid-cols-2 gap-3">
//                 <button onClick={onCancel} disabled={removing}
//                     className={`py-3.5 rounded-2xl font-bold ${typography.fontSize.xs} bg-gray-100 text-gray-700 hover:bg-gray-200 transition active:scale-95 disabled:opacity-50`}>
//                     Cancel
//                 </button>
//                 <button onClick={onConfirm} disabled={removing}
//                     className={`py-3.5 rounded-2xl font-bold ${typography.fontSize.xs} bg-red-500 hover:bg-red-600 text-white shadow-md transition active:scale-95 disabled:opacity-60 flex items-center justify-center gap-2`}>
//                     {removing ? <Loader2 size={15} className="animate-spin" /> : <UserMinus size={15} />}
//                     {removing ? "Removing…" : "Yes, Remove"}
//                 </button>
//             </div>
//         </div>
//     </div>
// );

// // ── Worker Card ───────────────────────────────────────────────────────────────
// const WorkerCard: React.FC<{
//     worker: EnrichedWorker;
//     jobId: string;
//     onRemoved: (id: string) => void;
// }> = ({ worker, jobId, onRemoved }) => {
//     const navigate = useNavigate();
//     const [removing, setRemoving] = useState(false);
//     const [showRemoveModal, setShowRemoveModal] = useState(false);
//     const [showCallModal, setShowCallModal] = useState(false);
//     const [hovered, setHovered] = useState(false);

//     const cleanPhone = (worker.phone || "").replace(/\D/g, "");
//     const displayPhone = cleanPhone ? `+91 ${cleanPhone}` : null;
//     const locationStr = [worker.area, worker.city, worker.state].filter(Boolean).join(", ");
//     const initials = (worker.name || "?")
//         .split(" ").map((n) => n[0] || "").join("").toUpperCase().slice(0, 2);

//     const handleRemoveConfirm = async () => {
//         try {
//             setRemoving(true);
//             await removeEnquiry(worker.workerId || worker._id, jobId);
//             onRemoved(worker._id);
//         } catch {
//             alert("Failed to remove worker. Please try again.");
//         } finally {
//             setRemoving(false);
//             setShowRemoveModal(false);
//         }
//     };

//     return (
//         <>
//             {showCallModal && (
//                 <CallPopupModal
//                     workerName={worker.name}
//                     phone={worker.phone || ""}
//                     profilePic={worker.profilePic}
//                     onClose={() => setShowCallModal(false)}
//                 />
//             )}
//             {showRemoveModal && (
//                 <RemoveConfirmModal
//                     workerName={worker.name}
//                     onConfirm={handleRemoveConfirm}
//                     onCancel={() => setShowRemoveModal(false)}
//                     removing={removing}
//                 />
//             )}

//             {/* ── Card shell ── */}
//             <div
//                 className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col transition-all duration-200 cursor-pointer w-full"
//                 style={{
//                     borderColor: hovered ? "#00598a" : "#f3f4f6",
//                     boxShadow: hovered
//                         ? "0 6px 18px rgba(0, 89, 138, 0.15)"
//                         : "0 1px 3px rgba(0,0,0,0.06)",
//                     transform: hovered ? "translateY(-2px)" : "translateY(0)",
//                 }}
//                 onMouseEnter={() => setHovered(true)}
//                 onMouseLeave={() => setHovered(false)}
//             >

//                 {/* Top image / avatar banner — reduced height */}
//                 <div
//                     className="relative h-28 flex items-center justify-center overflow-hidden transition-all duration-200"
//                     style={{
//                         background: hovered
//                             ? "linear-gradient(135deg, #00598a, #1b6ca8)"
//                             : "linear-gradient(135deg, #0f4c75, #1b6ca8)",
//                     }}
//                 >
//                     {worker.profilePic ? (
//                         <img
//                             src={worker.profilePic}
//                             alt={worker.name}
//                             className="w-full h-full object-cover"
//                             onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
//                         />
//                     ) : (
//                         <span className="text-white font-extrabold text-4xl opacity-30 select-none">
//                             {initials || "?"}
//                         </span>
//                     )}
//                     {/* Status badge top-right */}
//                     <span className={`absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${worker.status === "Confirmed"
//                         ? "bg-green-100/90 text-green-700 border-green-200"
//                         : "bg-yellow-100/90 text-yellow-700 border-yellow-200"
//                         }`}>
//                         <Mail size={8} />
//                         {worker.status}
//                     </span>
//                     {/* Active dot bottom-left */}
//                     <span className={`absolute bottom-2 left-2 inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${worker.isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white"
//                         }`}>
//                         <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
//                         {worker.isActive ? "Active" : "Inactive"}
//                     </span>
//                 </div>

//                 {/* Body — tighter padding */}
//                 <div className="p-3 flex flex-col gap-1.5 flex-1">

//                     {/* Category + Subcategory tags */}
//                     <div className="flex flex-wrap gap-1">
//                         {worker.categories.slice(0, 1).map((cat, i) => (
//                             <span key={i} className={`${typography.misc.badge} bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200`}>
//                                 {cat}
//                             </span>
//                         ))}
//                         {worker.subCategories.slice(0, 1).map((sub, i) => (
//                             <span key={i} className={`${typography.misc.badge} bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200`}>
//                                 {sub}
//                             </span>
//                         ))}
//                     </div>

//                     {/* Name */}
//                     <h3
//                         className={`${typography.card.subtitle} leading-tight truncate transition-colors duration-200`}
//                         style={{ color: hovered ? "#00598a" : "#111827" }}
//                     >
//                         {worker.name}
//                     </h3>

//                     {/* Location */}
//                     <div className="flex items-center gap-1">
//                         <MapPin size={10} className="text-gray-400 flex-shrink-0" />
//                         <p className={`${typography.misc.caption} truncate`}>{locationStr || "Location not set"}</p>
//                     </div>

//                     {/* Phone */}
//                     {displayPhone && (
//                         <div className="flex items-center gap-1">
//                             <Phone size={10} className="text-gray-400 flex-shrink-0" />
//                             <p className={`${typography.misc.caption}`}>{displayPhone}</p>
//                         </div>
//                     )}

//                     {/* Skills */}
//                     {worker.skills.length > 0 && (
//                         <div className="flex flex-wrap gap-1 mt-0.5">
//                             {worker.skills.slice(0, 2).map((skill, i) => (
//                                 <span key={i} className={`${typography.misc.badge} bg-violet-50 text-violet-600 border border-violet-100 px-1.5 py-0.5 rounded-full`}>
//                                     {skill}
//                                 </span>
//                             ))}
//                             {worker.skills.length > 2 && (
//                                 <span className={`${typography.misc.badge} bg-gray-50 text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-full`}>
//                                     +{worker.skills.length - 2}
//                                 </span>
//                             )}
//                         </div>
//                     )}

//                     {/* Divider */}
//                     <div className="border-t border-gray-100 mt-1" />

//                     {/* Price row */}
//                     <div className="flex items-center justify-between">
//                         <div>
//                             <p className={`${typography.search.label} text-gray-400`}>Service Charge</p>
//                             <p className={`${typography.card.subtitle} text-gray-900`}>
//                                 {worker.serviceCharge > 0
//                                     ? <>₹ <span>{worker.serviceCharge.toLocaleString("en-IN")}</span></>
//                                     : <span className={`text-gray-400 ${typography.body.xs}`}>Not set</span>
//                                 }
//                             </p>
//                         </div>
//                         <span className={`${typography.misc.caption} font-medium`}>/ {formatChargeType(worker.chargeType)}</span>
//                     </div>
//                 </div>

//                 {/* ── Action buttons — tighter padding ── */}
//                 <div className="px-3 pb-2 grid grid-cols-2 gap-2">
//                     <button
//                         onClick={() => setShowCallModal(true)}
//                         disabled={!cleanPhone}
//                         className={`flex items-center justify-center gap-1 py-2 rounded-lg font-bold ${typography.fontSize.xs} text-white shadow-sm transition-all active:scale-95 ${!cleanPhone ? "opacity-40 pointer-events-none" : ""}`}
//                         style={{ backgroundColor: "#0f4c75" }}
//                         onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#00598a")}
//                         onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0f4c75")}
//                     >
//                         <Phone size={11} />
//                         {displayPhone ? displayPhone : "Call"}
//                     </button>
//                     <button
//                         onClick={() => setShowRemoveModal(true)}
//                         disabled={removing}
//                         className={`flex items-center justify-center gap-1 py-2 rounded-lg font-bold ${typography.fontSize.xs} bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all active:scale-95 disabled:opacity-60`}
//                     >
//                         <UserMinus size={11} />
//                         Remove
//                     </button>
//                 </div>
//                 <div className="px-3 pb-3">
//                     <button
//                         onClick={() => navigate(`/reviews/${worker.workerId || worker._id}`)}
//                         className={`w-full flex items-center justify-center gap-1 py-2 rounded-lg font-bold ${typography.fontSize.xs} bg-amber-400 hover:bg-amber-500 text-white shadow-sm transition-all active:scale-95`}
//                     >
//                         <Star size={11} />
//                         Add Review
//                     </button>
//                 </div>
//             </div>
//         </>
//     );
// };

// // ── Enrich one worker ID ──────────────────────────────────────────────────────
// const enrichWorker = async (
//     cw: ConfirmedWorkers,
//     isConfirmed: boolean
// ): Promise<EnrichedWorker> => {
//     const id = cw._id;

//     let name: string = cw.name || "";
//     let phone: string = "";
//     let profilePic = resolveImageUrl(cw.profilePic);
//     let area: string = cw.area || "";
//     let city: string = cw.city || "";
//     let state: string = cw.state || "";
//     let serviceCharge = cw.serviceCharge || 0;
//     let chargeType: string = cw.chargeType || "hour";
//     let isActive = cw.isActive ?? true;
//     let categories: string[] = Array.isArray(cw.category) ? cw.category : [];
//     let subCategories = cw.subCategories || [];
//     let skills = cw.skills || [];
//     let resolvedWorkerId: string | undefined;
//     let resolvedUserId: string | undefined;

//     try {
//         const wRes = await getWorkerById(id);
//         if (wRes.success && wRes.data) {
//             const w = wRes.data;
//             resolvedWorkerId = id;
//             resolvedUserId = w.userId || undefined;
//             if (w.name) name = w.name;
//             if (w.profilePic) profilePic = resolveImageUrl(w.profilePic) || profilePic;
//             if (w.area) area = w.area;
//             if (w.city) city = w.city;
//             if (w.state) state = w.state;
//             if (w.chargeType) chargeType = w.chargeType;
//             if (w.serviceCharge != null) serviceCharge = w.serviceCharge;
//             isActive = w.isActive ?? isActive;
//             const rawCats = Array.isArray(w.category) ? w.category : w.category ? [w.category] : [];
//             if (rawCats.length) categories = rawCats as string[];
//             if (w.subCategories?.length) subCategories = w.subCategories;
//             if (w.skills?.length) skills = w.skills;
//         }
//     } catch { /* id may be a userId */ }

//     if (resolvedWorkerId) {
//         try {
//             const skillRes = await getWorkerWithSkills(resolvedWorkerId);
//             if (skillRes.success && skillRes.worker) {
//                 const w = skillRes.worker;
//                 name = name || w.name || "";
//                 profilePic = profilePic || resolveImageUrl(w.profilePic);
//                 area = area || w.area || "";
//                 city = city || w.city || "";
//                 state = state || w.state || "";
//                 serviceCharge = (serviceCharge === 0 && w.serviceCharge > 0) ? w.serviceCharge : serviceCharge;
//                 chargeType = chargeType || w.chargeType || "hour";
//                 resolvedUserId = resolvedUserId || w.userId || undefined;

//                 if (skillRes.workerSkills?.length) {
//                     categories = Array.from(new Set(skillRes.workerSkills.flatMap((s) => s.category || [])));
//                     subCategories = Array.from(new Set(skillRes.workerSkills.map((s) => s.subCategory).filter(Boolean)));
//                     skills = Array.from(new Set(skillRes.workerSkills.map((s) => s.skill).filter(Boolean)));
//                     const fs = skillRes.workerSkills[0];
//                     if (fs?.serviceCharge != null && fs.serviceCharge > 0) {
//                         serviceCharge = fs.serviceCharge;
//                         chargeType = fs.chargeType || chargeType;
//                     }
//                     if (!area && fs?.area) area = fs.area;
//                     if (!city && fs?.city) city = fs.city;
//                     if (!state && fs?.state) state = fs.state;
//                 } else if (w.categories?.length) {
//                     categories = (w.categories || []).flat();
//                     subCategories = w.subCategories?.length ? w.subCategories : subCategories;
//                     skills = w.skills?.length ? w.skills : skills;
//                 }
//             }
//         } catch { /* skip */ }
//     }

//     const userIdToTry = resolvedUserId || (!resolvedWorkerId ? id : undefined);
//     if (userIdToTry) {
//         try {
//             const workerUserRes = await getWorkerByUserId(userIdToTry);
//             if (workerUserRes) {
//                 const u = workerUserRes?.worker || workerUserRes?.data || workerUserRes;
//                 if (!name && u?.name) name = u.name;
//                 if (u?.phone) phone = u.phone;
//                 profilePic = profilePic || resolveImageUrl(u?.profilePic);
//                 if (!area && u?.area) area = u.area;
//                 if (!city && u?.city) city = u.city;
//                 if (!state && u?.state) state = u.state;
//             }
//         } catch { /* skip */ }
//     }

//     if (!phone && resolvedUserId && resolvedUserId !== userIdToTry) {
//         try {
//             const workerUserRes = await getWorkerByUserId(resolvedUserId);
//             if (workerUserRes) {
//                 const u = workerUserRes?.worker || workerUserRes?.data || workerUserRes;
//                 if (u?.phone) phone = u.phone;
//             }
//         } catch { /* skip */ }
//     }

//     return {
//         _id: id,
//         workerId: resolvedWorkerId || id,
//         userId: resolvedUserId || userIdToTry,
//         name: name || "Worker",
//         phone,
//         profilePic,
//         area,
//         city,
//         state,
//         serviceCharge,
//         chargeType,
//         isActive,
//         categories,
//         subCategories,
//         skills,
//         status: isConfirmed ? "Confirmed" : "Enquired",
//     };
// };

// // ── Main Page ─────────────────────────────────────────────────────────────────
// const JobApplicantsPage: React.FC = () => {
//     const { jobId } = useParams<{ jobId: string }>();
//     const navigate = useNavigate();

//     const [workers, setWorkers] = useState<EnrichedWorker[]>([]);
//     const [loading, setLoading] = useState(true);
//     const [error, setError] = useState<string | null>(null);
//     const [jobInfo, setJobInfo] = useState<{ category: string } | null>(null);

//     const [enquiredCount, setEnquiredCount] = useState(0);
//     const [confirmedCount, setConfirmedCount] = useState(0);
//     const totalSlots = 3;

//     useEffect(() => {
//         if (!jobId) return;
//         (async () => {
//             try {
//                 setLoading(true);
//                 setError(null);

//                 try {
//                     const jobRes = await getJobById(jobId);
//                     if (jobRes.success || jobRes.data) {
//                         setJobInfo({ category: jobRes.data?.subcategory || jobRes.data?.category || "Job" });
//                     }
//                 } catch { /* non-critical */ }

//                 const rawRes = await fetch(`${API_BASE_URL}/getConfirmedWorkers/${jobId}`, {
//                     method: "GET", redirect: "follow",
//                 });
//                 const rawJson = await rawRes.json();
//                 const confirmedWorkerIds: string[] = (rawJson?.data?.confirmedWorkers || []).filter((w: any) => typeof w === "string");
//                 const confirmedWorkerObjs: any[] = (rawJson?.data?.confirmedWorkers || []).filter((w: any) => typeof w === "object");
//                 const enquiredWorkerIds: string[] = rawJson?.data?.enquiredWorkers || [];

//                 setEnquiredCount(enquiredWorkerIds.length);
//                 setConfirmedCount(confirmedWorkerIds.length + confirmedWorkerObjs.length);

//                 type RawEntry = { id: string; confirmed: boolean };
//                 const allEntries: RawEntry[] = [
//                     ...confirmedWorkerObjs.map((w) => ({ id: w._id || w, confirmed: true })),
//                     ...confirmedWorkerIds.map((id) => ({ id, confirmed: true })),
//                     ...enquiredWorkerIds.map((id) => ({ id, confirmed: false })),
//                 ];

//                 if (allEntries.length === 0) {
//                     setError("No applicants found for this job.");
//                     return;
//                 }

//                 const results = await Promise.allSettled(
//                     allEntries.map(({ id, confirmed }) => {
//                         const cw: ConfirmedWorkers = {
//                             _id: id, userId: id, name: "", category: [],
//                             subCategories: [], skills: [], serviceCharge: 0,
//                             chargeType: "hour", profilePic: "", images: [],
//                             area: "", city: "", state: "", pincode: "",
//                             latitude: 0, longitude: 0, isActive: true,
//                             createdAt: "", updatedAt: "", __v: 0,
//                         };
//                         return enrichWorker(cw, confirmed);
//                     })
//                 );

//                 const final: EnrichedWorker[] = results
//                     .filter((r): r is PromiseFulfilledResult<EnrichedWorker> => r.status === "fulfilled")
//                     .map((r) => r.value);

//                 setWorkers(final);
//             } catch (err) {
//                 console.error("JobApplicantsPage error:", err);
//                 setError("Failed to load applicants. Please try again.");
//             } finally {
//                 setLoading(false);
//             }
//         })();
//     }, [jobId]);

//     const handleWorkerRemoved = (removedId: string) =>
//         setWorkers((prev) => prev.filter((w) => w._id !== removedId));

//     const progressPct = Math.min(100, (confirmedCount / totalSlots) * 100);
//     const remaining = Math.max(0, totalSlots - confirmedCount);

//     if (loading)
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center">
//                 <div className="flex flex-col items-center gap-3">
//                     <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
//                     <p className={`${typography.body.xs} text-gray-500`}>Loading applicants…</p>
//                 </div>
//             </div>
//         );

//     if (error && workers.length === 0)
//         return (
//             <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
//                 <div className="text-center max-w-sm">
//                     <div className="text-5xl mb-4">📭</div>
//                     <h2 className={`${typography.heading.h5} text-gray-800 mb-2`}>No Applicants Yet</h2>
//                     <p className={`${typography.body.xs} text-gray-500 mb-6`}>{error}</p>
//                     <button onClick={() => navigate(-1)} className={`bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold ${typography.body.xs}`}>
//                         Go Back
//                     </button>
//                 </div>
//             </div>
//         );

//     return (
//         <div className="min-h-screen bg-gray-50">
//             {/* ── Reduced left/right padding container ── */}
//             <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

//                 {/* ── Header ── */}
//                 <div className="bg-white border border-gray-100 rounded-2xl px-4 pt-4 pb-3 mt-3 shadow-sm">
//                     <div className="flex items-center gap-3">
//                         <button onClick={() => navigate(-1)}
//                             className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition active:scale-95">
//                             <ChevronLeft size={18} className="text-gray-600" />
//                         </button>
//                         <div className="flex-1 min-w-0">
//                             <h1 className={`${typography.heading.h5} text-gray-900`}>Workers & Enquiries</h1>
//                             <p className={`${typography.misc.caption} truncate`}>
//                                 {jobInfo?.category || "Services"} · {workers.length} worker{workers.length !== 1 ? "s" : ""}
//                             </p>
//                         </div>
//                     </div>

//                     {/* ── Stats row ── */}
//                     <div className="mt-3 grid grid-cols-3 divide-x divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
//                         <div className="flex flex-col items-center py-2.5 gap-0.5">
//                             <Mail size={16} className="text-orange-500 mb-0.5" />
//                             <span className={`${typography.fontSize.xl} font-extrabold text-orange-500 leading-none`}>{enquiredCount}</span>
//                             <span className={`${typography.misc.badge} text-gray-400 mt-0.5`}>Enquired</span>
//                         </div>
//                         <div className="flex flex-col items-center py-2.5 gap-0.5">
//                             <svg className="w-[16px] h-[16px] text-green-500 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
//                                 <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
//                             </svg>
//                             <span className={`${typography.fontSize.xl} font-extrabold text-green-500 leading-none`}>{confirmedCount}</span>
//                             <span className={`${typography.misc.badge} text-gray-400 mt-0.5`}>Confirmed</span>
//                         </div>
//                         <div className="flex flex-col items-center py-2.5 gap-0.5">
//                             <Users size={16} className="text-blue-500 mb-0.5" />
//                             <span className={`${typography.fontSize.xl} font-extrabold text-blue-500 leading-none`}>{totalSlots}</span>
//                             <span className={`${typography.misc.badge} text-gray-400 mt-0.5`}>Max Slots</span>
//                         </div>
//                     </div>

//                     {/* Progress bar */}
//                     <div className="mt-2.5">
//                         <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
//                             <div className="h-full bg-orange-500 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
//                         </div>
//                         <p className={`${typography.misc.caption} mt-1`}>
//                             {confirmedCount > 0
//                                 ? `${confirmedCount} confirmed · ${remaining} slot${remaining !== 1 ? "s" : ""} remaining`
//                                 : `${totalSlots} slots available`}
//                         </p>
//                     </div>
//                 </div>

//                 {/* ── Cards grid — full width matching banner ── */}
//                 <div className="py-4 pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//                     {workers.length === 0 ? (
//                         <div className="col-span-full text-center py-20">
//                             <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
//                                 <Users size={36} className="text-gray-300" />
//                             </div>
//                             <h3 className={`${typography.heading.h6} text-gray-700 mb-1`}>No Workers Yet</h3>
//                             <p className={`${typography.body.xs} text-gray-400`}>No workers have applied for this job yet.</p>
//                         </div>
//                     ) : (
//                         workers.map((worker) => (
//                             <WorkerCard
//                                 key={worker._id}
//                                 worker={worker}
//                                 jobId={jobId!}
//                                 onRemoved={handleWorkerRemoved}
//                             />
//                         ))
//                     )}
//                 </div>
//             </div>
//         </div>
//     );
// };

// export default JobApplicantsPage;



import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
    ChevronLeft, Phone, Loader2, Users, MapPin,
    Tag,
    UserMinus, X, AlertTriangle, Mail, PhoneCall, Star
} from "lucide-react";
import {
    getWorkerSkillById,
    getWorkerById,
    getJobById,
    removeEnquiry,
    ConfirmedWorkers,
    API_BASE_URL,
} from "../services/api.service";
import typography from "../styles/typography";

// ── Helpers ───────────────────────────────────────────────────────────────────
const resolveImageUrl = (path?: string): string | null => {
    if (!path || typeof path !== "string") return null;
    const cleaned = path.trim();
    if (!cleaned) return null;
    if (cleaned.startsWith("http://") || cleaned.startsWith("https://")) return cleaned;
    const base = (API_BASE_URL || "").replace(/\/$/, "");
    const rel = cleaned.startsWith("/") ? cleaned : `/${cleaned}`;
    return `${base}${rel}`;
};

const formatChargeType = (ct?: string): string => {
    const map: Record<string, string> = {
        hour: "hour", hourly: "hour",
        day: "day", daily: "day",
        fixed: "fixed", monthly: "month",
        per_project: "project",
    };
    return ct ? (map[ct.toLowerCase()] || ct) : "hour";
};

// ── Types ─────────────────────────────────────────────────────────────────────
interface EnrichedWorker {
    _id: string;
    workerId: string;
    name: string;
    profilePic: string | null;
    area: string;
    city: string;
    state: string;
    serviceCharge: number;
    chargeType: string;
    isActive: boolean;
    categories: string[];
    subCategories: string[];
    skills: string[];
    phone?: string;
    status: "Enquired" | "Confirmed";
}

// ── Call Popup Modal ──────────────────────────────────────────────────────────
const CallPopupModal: React.FC<{
    workerName: string;
    phone: string;
    profilePic: string | null;
    onClose: () => void;
}> = ({ workerName, phone, profilePic, onClose }) => {
    const cleanPhone = phone.replace(/\D/g, "");
    const displayPhone = cleanPhone ? `+91 ${cleanPhone}` : phone;
    const initials = (workerName || "?")
        .split(" ").map((n) => n[0] || "").join("").toUpperCase().slice(0, 2);

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
            <div className="relative bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full">
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center hover:bg-gray-200 transition"
                >
                    <X size={16} className="text-gray-500" />
                </button>
                <div className="w-20 h-20 rounded-full overflow-hidden bg-[#0f4c75] flex items-center justify-center mx-auto mb-4 shadow-md">
                    {profilePic ? (
                        <img
                            src={profilePic}
                            alt={workerName}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <span className={`text-white font-bold ${typography.fontSize["2xl"]}`}>{initials || "?"}</span>
                    )}
                </div>
                <h2 className={`${typography.heading.h5} text-gray-900 text-center mb-1`}>{workerName}</h2>
                <p className={`${typography.misc.caption} text-center mb-5`}>Call this worker directly</p>
                <div className="flex items-center justify-center gap-3 bg-[#0f4c75]/5 border border-[#0f4c75]/20 rounded-2xl px-5 py-4 mb-5">
                    <div className="w-10 h-10 rounded-full bg-[#0f4c75] flex items-center justify-center flex-shrink-0">
                        <Phone size={18} className="text-white" />
                    </div>
                    <span className={`${typography.fontSize.xl} font-bold text-[#0f4c75] tracking-wide`}>{displayPhone}</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                    <button
                        onClick={onClose}
                        className={`py-3.5 rounded-2xl font-bold ${typography.fontSize.xs} bg-gray-100 text-gray-700 hover:bg-gray-200 transition active:scale-95`}
                    >
                        Cancel
                    </button>
                    <a
                        href={`tel:${cleanPhone}`}
                        onClick={onClose}
                        className={`flex items-center justify-center gap-2 py-3.5 rounded-2xl font-bold ${typography.fontSize.xs} bg-[#0f4c75] hover:bg-[#00598a] text-white shadow-md transition-all active:scale-95`}
                    >
                        <PhoneCall size={15} />
                        Call Now
                    </a>
                </div>
            </div>
        </div>
    );
};

// ── Remove Confirm Modal ──────────────────────────────────────────────────────
const RemoveConfirmModal: React.FC<{
    workerName: string;
    onConfirm: () => void;
    onCancel: () => void;
    removing: boolean;
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

// ── Worker Card ───────────────────────────────────────────────────────────────
const WorkerCard: React.FC<{
    worker: EnrichedWorker;
    jobId: string;
    onRemoved: (id: string) => void;
}> = ({ worker, jobId, onRemoved }) => {
    const navigate = useNavigate();
    const [removing, setRemoving] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [showCallModal, setShowCallModal] = useState(false);
    const [hovered, setHovered] = useState(false);

    const cleanPhone = (worker.phone || "").replace(/\D/g, "");
    const displayPhone = cleanPhone ? `+91 ${cleanPhone}` : null;
    const locationStr = [worker.area, worker.city, worker.state].filter(Boolean).join(", ");
    const initials = (worker.name || "?")
        .split(" ").map((n) => n[0] || "").join("").toUpperCase().slice(0, 2);

    const handleRemoveConfirm = async () => {
        try {
            setRemoving(true);
            await removeEnquiry(worker.workerId || worker._id, jobId);
            onRemoved(worker._id);
        } catch {
            alert("Failed to remove worker. Please try again.");
        } finally {
            setRemoving(false);
            setShowRemoveModal(false);
        }
    };

    return (
        <>
            {showCallModal && (
                <CallPopupModal
                    workerName={worker.name}
                    phone={worker.phone || ""}
                    profilePic={worker.profilePic}
                    onClose={() => setShowCallModal(false)}
                />
            )}
            {showRemoveModal && (
                <RemoveConfirmModal
                    workerName={worker.name}
                    onConfirm={handleRemoveConfirm}
                    onCancel={() => setShowRemoveModal(false)}
                    removing={removing}
                />
            )}

            {/* ── Card shell ── */}
            <div
                className="bg-white rounded-xl shadow-sm border overflow-hidden flex flex-col transition-all duration-200 cursor-pointer w-full"
                style={{
                    borderColor: hovered ? "#00598a" : "#f3f4f6",
                    boxShadow: hovered
                        ? "0 6px 18px rgba(0, 89, 138, 0.15)"
                        : "0 1px 3px rgba(0,0,0,0.06)",
                    transform: hovered ? "translateY(-2px)" : "translateY(0)",
                }}
                onMouseEnter={() => setHovered(true)}
                onMouseLeave={() => setHovered(false)}
            >

                {/* Top image / avatar banner — reduced height */}
                <div
                    className="relative h-28 flex items-center justify-center overflow-hidden transition-all duration-200"
                    style={{
                        background: hovered
                            ? "linear-gradient(135deg, #00598a, #1b6ca8)"
                            : "linear-gradient(135deg, #0f4c75, #1b6ca8)",
                    }}
                >
                    {worker.profilePic ? (
                        <img
                            src={worker.profilePic}
                            alt={worker.name}
                            className="w-full h-full object-cover"
                            onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                        />
                    ) : (
                        <span className="text-white font-extrabold text-4xl opacity-30 select-none">
                            {initials || "?"}
                        </span>
                    )}
                    {/* Status badge top-right */}
                    <span className={`absolute top-2 right-2 inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full border backdrop-blur-sm ${worker.status === "Confirmed"
                        ? "bg-green-100/90 text-green-700 border-green-200"
                        : "bg-yellow-100/90 text-yellow-700 border-yellow-200"
                        }`}>
                        <Mail size={8} />
                        {worker.status}
                    </span>
                    {/* Active dot bottom-left */}
                    <span className={`absolute bottom-2 left-2 inline-flex items-center gap-1 text-[9px] font-bold px-1.5 py-0.5 rounded-full ${worker.isActive ? "bg-green-500 text-white" : "bg-gray-400 text-white"
                        }`}>
                        <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
                        {worker.isActive ? "Active" : "Inactive"}
                    </span>
                </div>

                {/* Body — tighter padding */}
                <div className="p-3 flex flex-col gap-1.5 flex-1">

                    {/* Category + Subcategory tags */}
                    <div className="flex flex-wrap gap-1">
                        {worker.categories.slice(0, 1).map((cat, i) => (
                            <span key={i} className={`${typography.misc.badge} bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200`}>
                                {cat}
                            </span>
                        ))}
                        {worker.subCategories.slice(0, 1).map((sub, i) => (
                            <span key={i} className={`${typography.misc.badge} bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full border border-gray-200`}>
                                {sub}
                            </span>
                        ))}
                    </div>

                    {/* Name */}
                    <h3
                        className={`${typography.card.subtitle} leading-tight truncate transition-colors duration-200`}
                        style={{ color: hovered ? "#00598a" : "#111827" }}
                    >
                        {worker.name}
                    </h3>

                    {/* Location */}
                    <div className="flex items-center gap-1">
                        <MapPin size={10} className="text-gray-400 flex-shrink-0" />
                        <p className={`${typography.misc.caption} truncate`}>{locationStr || "Location not set"}</p>
                    </div>

                    {/* Phone */}
                    {displayPhone && (
                        <div className="flex items-center gap-1">
                            <Phone size={10} className="text-gray-400 flex-shrink-0" />
                            <p className={`${typography.misc.caption}`}>{displayPhone}</p>
                        </div>
                    )}

                    {/* Skills */}
                    {worker.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-0.5">
                            {worker.skills.slice(0, 2).map((skill, i) => (
                                <span key={i} className={`${typography.misc.badge} bg-violet-50 text-violet-600 border border-violet-100 px-1.5 py-0.5 rounded-full`}>
                                    {skill}
                                </span>
                            ))}
                            {worker.skills.length > 2 && (
                                <span className={`${typography.misc.badge} bg-gray-50 text-gray-400 border border-gray-200 px-1.5 py-0.5 rounded-full`}>
                                    +{worker.skills.length - 2}
                                </span>
                            )}
                        </div>
                    )}

                    {/* Divider */}
                    <div className="border-t border-gray-100 mt-1" />

                    {/* Price row */}
                    <div className="flex items-center justify-between">
                        <div>
                            <p className={`${typography.search.label} text-gray-400`}>Service Charge</p>
                            <p className={`${typography.card.subtitle} text-gray-900`}>
                                {worker.serviceCharge > 0
                                    ? <>₹ <span>{worker.serviceCharge.toLocaleString("en-IN")}</span></>
                                    : <span className={`text-gray-400 ${typography.body.xs}`}>Not set</span>
                                }
                            </p>
                        </div>
                        <span className={`${typography.misc.caption} font-medium`}>/ {formatChargeType(worker.chargeType)}</span>
                    </div>
                </div>

                {/* ── Action buttons — tighter padding ── */}
                <div className="px-3 pb-2 grid grid-cols-2 gap-2">
                    <button
                        onClick={() => setShowCallModal(true)}
                        disabled={!cleanPhone}
                        className={`flex items-center justify-center gap-1 py-2 rounded-lg font-bold ${typography.fontSize.xs} text-white shadow-sm transition-all active:scale-95 ${!cleanPhone ? "opacity-40 pointer-events-none" : ""}`}
                        style={{ backgroundColor: "#0f4c75" }}
                        onMouseEnter={(e) => (e.currentTarget.style.backgroundColor = "#00598a")}
                        onMouseLeave={(e) => (e.currentTarget.style.backgroundColor = "#0f4c75")}
                    >
                        <Phone size={11} />
                        {displayPhone ? displayPhone : "Call"}
                    </button>
                    <button
                        onClick={() => setShowRemoveModal(true)}
                        disabled={removing}
                        className={`flex items-center justify-center gap-1 py-2 rounded-lg font-bold ${typography.fontSize.xs} bg-red-500 hover:bg-red-600 text-white shadow-sm transition-all active:scale-95 disabled:opacity-60`}
                    >
                        <UserMinus size={11} />
                        Remove
                    </button>
                </div>
                <div className="px-3 pb-3">
                    <button
                        onClick={() => navigate(`/reviews/${worker.workerId || worker._id}`)}
                        className={`w-full flex items-center justify-center gap-1 py-2 rounded-lg font-bold ${typography.fontSize.xs} bg-amber-400 hover:bg-amber-500 text-white shadow-sm transition-all active:scale-95`}
                    >
                        <Star size={11} />
                        Add Review
                    </button>
                </div>
            </div>
        </>
    );
};

// ── Enrich one worker ID ──────────────────────────────────────────────────────
const enrichWorker = async (
    cw: ConfirmedWorkers,
    isConfirmed: boolean
): Promise<EnrichedWorker> => {
    const id = cw._id;

    let name: string = "";
    let phone: string = "";
    let profilePic: string | null = null;
    let area: string = "";
    let city: string = "";
    let state: string = "";
    let serviceCharge = 0;
    let chargeType: string = "hour";
    let isActive = true;
    let categories: string[] = [];
    let subCategories: string[] = [];
    let skills: string[] = [];

    try {
        // Step 1: Get skills list for this worker ID
        const skillsListRes = await fetch(
            `${API_BASE_URL}/getWorkerWithSkills?workerId=${id}`,
            { method: "GET", headers: { "Content-Type": "application/json" } }
        );

        if (skillsListRes.ok) {
            const skillsListJson = await skillsListRes.json();
            const skillsList: any[] = skillsListJson?.workerSkills || [];

            // Grab worker-level data (name, location, isActive)
            const workerObj = skillsListJson?.worker;
            if (workerObj) {
                name = workerObj.name || "";
                area = workerObj.area || "";
                city = workerObj.city || "";
                state = workerObj.state || "";
                isActive = workerObj.isActive ?? true;
            }

            // Collect categories, subCategories, skills from the full list
            if (skillsList.length > 0) {
                categories = Array.from(new Set(skillsList.flatMap((sk: any) => sk.category || [])));
                subCategories = Array.from(new Set(skillsList.map((sk: any) => sk.subCategory).filter(Boolean)));
                skills = Array.from(new Set(skillsList.map((sk: any) => sk.skill).filter(Boolean)));

                // Step 2: Call getWorkerSkillById with first skill's _id for full details
                const skillId = skillsList[0]._id;
                const skillRes = await getWorkerSkillById(skillId);

                if (skillRes.success && skillRes.workerSkill) {
                    const s = skillRes.workerSkill;

                    // ── Use images[0] as profile pic (not profilePic field) ──
                    const firstImage = (s.images && s.images.length > 0)
                        ? resolveImageUrl(s.images[0])
                        : resolveImageUrl(s.profilePic);
                    profilePic = firstImage;

                    // Fallback name/location from skill if not in worker obj
                    name = name || s.name || "";
                    area = area || s.area || "";
                    city = city || s.city || "";
                    state = state || s.state || "";

                    // ── Service charge & type ──
                    if (s.serviceCharge != null && s.serviceCharge > 0) {
                        serviceCharge = s.serviceCharge;
                        chargeType = s.chargeType || "hour";
                    }
                }
            }
        }
    } catch { /* skip */ }

    // Step 3: Fetch phone number via getWorkerById using the worker id directly
    try {
        const workerRes = await getWorkerById(id);
        if (workerRes.success && workerRes.data) {
            const w = workerRes.data as any;
            if (w.phone) phone = w.phone;
            if (!name && w.name) name = w.name;
            if (!profilePic && w.profilePic) profilePic = resolveImageUrl(w.profilePic);
            if (!area && w.area) area = w.area;
            if (!city && w.city) city = w.city;
            if (!state && w.state) state = w.state;
        }
    } catch { /* skip */ }

    return {
        _id: id,
        workerId: id,
        name: name || "Worker",
        phone,
        profilePic,
        area,
        city,
        state,
        serviceCharge,
        chargeType,
        isActive,
        categories,
        subCategories,
        skills,
        status: isConfirmed ? "Confirmed" : "Enquired",
    };
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const JobApplicantsPage: React.FC = () => {
    const { jobId } = useParams<{ jobId: string }>();
    const navigate = useNavigate();

    const [workers, setWorkers] = useState<EnrichedWorker[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [jobInfo, setJobInfo] = useState<{ category: string } | null>(null);

    const [enquiredCount, setEnquiredCount] = useState(0);
    const [confirmedCount, setConfirmedCount] = useState(0);
    const totalSlots = 3;

    useEffect(() => {
        if (!jobId) return;
        (async () => {
            try {
                setLoading(true);
                setError(null);

                try {
                    const jobRes = await getJobById(jobId);
                    if (jobRes.success || jobRes.data) {
                        setJobInfo({ category: jobRes.data?.subcategory || jobRes.data?.category || "Job" });
                    }
                } catch { /* non-critical */ }

                const rawRes = await fetch(`${API_BASE_URL}/getConfirmedWorkers/${jobId}`, {
                    method: "GET", redirect: "follow",
                });
                const rawJson = await rawRes.json();
                const confirmedWorkerIds: string[] = (rawJson?.data?.confirmedWorkers || []).filter((w: any) => typeof w === "string");
                const confirmedWorkerObjs: any[] = (rawJson?.data?.confirmedWorkers || []).filter((w: any) => typeof w === "object");
                const enquiredWorkerIds: string[] = rawJson?.data?.enquiredWorkers || [];

                setEnquiredCount(enquiredWorkerIds.length);
                setConfirmedCount(confirmedWorkerIds.length + confirmedWorkerObjs.length);

                type RawEntry = { id: string; confirmed: boolean };
                const allEntries: RawEntry[] = [
                    ...confirmedWorkerObjs.map((w) => ({ id: w._id || w, confirmed: true })),
                    ...confirmedWorkerIds.map((id) => ({ id, confirmed: true })),
                    ...enquiredWorkerIds.map((id) => ({ id, confirmed: false })),
                ];

                if (allEntries.length === 0) {
                    setError("No applicants found for this job.");
                    return;
                }

                const results = await Promise.allSettled(
                    allEntries.map(({ id, confirmed }) => {
                        const cw: ConfirmedWorkers = {
                            _id: id, userId: id, name: "", category: [],
                            subCategories: [], skills: [], serviceCharge: 0,
                            chargeType: "hour", profilePic: "", images: [],
                            area: "", city: "", state: "", pincode: "",
                            latitude: 0, longitude: 0, isActive: true,
                            createdAt: "", updatedAt: "", __v: 0,
                        };
                        return enrichWorker(cw, confirmed);
                    })
                );

                const final: EnrichedWorker[] = results
                    .filter((r): r is PromiseFulfilledResult<EnrichedWorker> => r.status === "fulfilled")
                    .map((r) => r.value);

                setWorkers(final);
            } catch (err) {
                console.error("JobApplicantsPage error:", err);
                setError("Failed to load applicants. Please try again.");
            } finally {
                setLoading(false);
            }
        })();
    }, [jobId]);

    const handleWorkerRemoved = (removedId: string) =>
        setWorkers((prev) => prev.filter((w) => w._id !== removedId));

    const progressPct = Math.min(100, (confirmedCount / totalSlots) * 100);
    const remaining = Math.max(0, totalSlots - confirmedCount);

    if (loading)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                    <p className={`${typography.body.xs} text-gray-500`}>Loading applicants…</p>
                </div>
            </div>
        );

    if (error && workers.length === 0)
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center p-6">
                <div className="text-center max-w-sm">
                    <div className="text-5xl mb-4">📭</div>
                    <h2 className={`${typography.heading.h5} text-gray-800 mb-2`}>No Applicants Yet</h2>
                    <p className={`${typography.body.xs} text-gray-500 mb-6`}>{error}</p>
                    <button onClick={() => navigate(-1)} className={`bg-orange-500 text-white px-6 py-3 rounded-xl font-semibold ${typography.body.xs}`}>
                        Go Back
                    </button>
                </div>
            </div>
        );

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ── Reduced left/right padding container ── */}
            <div className="w-full max-w-7xl mx-auto px-6 sm:px-10 lg:px-16">

                {/* ── Header ── */}
                <div className="bg-white border border-gray-100 rounded-2xl px-4 pt-4 pb-3 mt-3 shadow-sm">
                    <div className="flex items-center gap-3">
                        <button onClick={() => navigate(-1)}
                            className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 hover:bg-gray-200 transition active:scale-95">
                            <ChevronLeft size={18} className="text-gray-600" />
                        </button>
                        <div className="flex-1 min-w-0">
                            <h1 className={`${typography.heading.h5} text-gray-900`}>Workers & Enquiries</h1>
                            <p className={`${typography.misc.caption} truncate`}>
                                {jobInfo?.category || "Services"} · {workers.length} worker{workers.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    </div>

                    {/* ── Stats row ── */}
                    <div className="mt-3 grid grid-cols-3 divide-x divide-gray-100 border border-gray-100 rounded-2xl overflow-hidden">
                        <div className="flex flex-col items-center py-2.5 gap-0.5">
                            <Mail size={16} className="text-orange-500 mb-0.5" />
                            <span className={`${typography.fontSize.xl} font-extrabold text-orange-500 leading-none`}>{enquiredCount}</span>
                            <span className={`${typography.misc.badge} text-gray-400 mt-0.5`}>Enquired</span>
                        </div>
                        <div className="flex flex-col items-center py-2.5 gap-0.5">
                            <svg className="w-[16px] h-[16px] text-green-500 mb-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                                <circle cx="12" cy="12" r="10" /><polyline points="9 12 11 14 15 10" />
                            </svg>
                            <span className={`${typography.fontSize.xl} font-extrabold text-green-500 leading-none`}>{confirmedCount}</span>
                            <span className={`${typography.misc.badge} text-gray-400 mt-0.5`}>Confirmed</span>
                        </div>
                        <div className="flex flex-col items-center py-2.5 gap-0.5">
                            <Users size={16} className="text-blue-500 mb-0.5" />
                            <span className={`${typography.fontSize.xl} font-extrabold text-blue-500 leading-none`}>{totalSlots}</span>
                            <span className={`${typography.misc.badge} text-gray-400 mt-0.5`}>Max Slots</span>
                        </div>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-2.5">
                        <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-orange-500 rounded-full transition-all duration-700" style={{ width: `${progressPct}%` }} />
                        </div>
                        <p className={`${typography.misc.caption} mt-1`}>
                            {confirmedCount > 0
                                ? `${confirmedCount} confirmed · ${remaining} slot${remaining !== 1 ? "s" : ""} remaining`
                                : `${totalSlots} slots available`}
                        </p>
                    </div>
                </div>

                {/* ── Cards grid — full width matching banner ── */}
                <div className="py-4 pb-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {workers.length === 0 ? (
                        <div className="col-span-full text-center py-20">
                            <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Users size={36} className="text-gray-300" />
                            </div>
                            <h3 className={`${typography.heading.h6} text-gray-700 mb-1`}>No Workers Yet</h3>
                            <p className={`${typography.body.xs} text-gray-400`}>No workers have applied for this job yet.</p>
                        </div>
                    ) : (
                        workers.map((worker) => (
                            <WorkerCard
                                key={worker._id}
                                worker={worker}
                                jobId={jobId!}
                                onRemoved={handleWorkerRemoved}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default JobApplicantsPage;