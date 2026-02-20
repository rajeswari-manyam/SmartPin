import React, { useState } from "react";
import {
  ArrowLeft,
  User,
  ChevronDown,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import Button from "../components/ui/Buttons";
import typography, { combineTypography } from "../styles/typography";

// ✅ IMPORT SUBCATEGORIES JSON
import SubCategoriesData from "../data/subcategories.json";

/* ================= TYPES ================= */

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  serviceType: string;
  preferredDate: string;
  preferredTime: string;
  budgetRange: string;
  serviceLocation: string;
  additionalDetails: string;
}

interface SubCategoryItem {
  name: string;
  icon: string;
}

interface SubCategoryGroup {
  categoryId: number;
  items: SubCategoryItem[];
}

/* ================= COMPONENT ================= */

const ServiceEnquiryForm: React.FC = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    serviceType: "",
    preferredDate: "",
    preferredTime: "",
    budgetRange: "",
    serviceLocation: "",
    additionalDetails: "",
  });

  /* ================= HANDLERS ================= */

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Enquiry Submitted:", formData);
    navigate(-1);
  };

  /* ================= UI ================= */

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-indigo-50 flex items-center justify-center p-8">
      <div className="w-full max-w-5xl bg-white rounded-3xl shadow-2xl overflow-hidden">

        {/* ===== HEADER ===== */}
        <div className="bg-slate-50 px-8 py-5 border-b">
          <Button
            variant="outline"
            onClick={() => navigate(-1)}
            className={combineTypography(
              typography.body.base,
              "flex items-center gap-2 border-none shadow-none"
            )}
          >
            <ArrowLeft size={18} />
            Send Enquiry
          </Button>
        </div>

        {/* ===== FORM ===== */}
        <div className="p-10">
          <form onSubmit={handleSubmit} className="space-y-10">

            {/* ===== WORKER CARD ===== */}
            <div className="bg-indigo-50 rounded-2xl p-6 border">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
                  SK
                </div>
                <div>
                  <h3 className={combineTypography(typography.heading.h5)}>
                    Suresh Kumar
                  </h3>
                  <p className={combineTypography(typography.body.small, "text-slate-500")}>
                    Plumber • 8 years experience
                  </p>
                </div>
              </div>
            </div>

            {/* ===== USER DETAILS ===== */}
            <section>
              <h3 className={combineTypography(typography.heading.h5, "mb-6")}>
                Your Details
              </h3>

              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className={combineTypography(typography.form.label)}>
                    Full Name *
                  </label>
                  <div className="relative">
                    <User
                      size={18}
                      className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />
                    <input
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleInputChange}
                      required
                      className="w-full pl-12 py-3 border rounded-xl"
                    />
                  </div>
                </div>

                <div>
                  <label className={combineTypography(typography.form.label)}>
                    Email *
                  </label>
                  <input
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="w-full py-3 px-4 border rounded-xl"
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className={combineTypography(typography.form.label)}>
                  Phone *
                </label>
                <input
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  required
                  className="w-full py-3 px-4 border rounded-xl"
                />
              </div>
            </section>

            {/* ===== SERVICE DETAILS ===== */}
            <section>
              <h3 className={combineTypography(typography.heading.h5, "mb-6")}>
                Service Details
              </h3>

              {/* ✅ SERVICE TYPE DROPDOWN */}
              <div className="relative mb-6">
                <select
                  name="serviceType"
                  value={formData.serviceType}
                  onChange={handleInputChange}
                  required
                  className="w-full py-3 px-4 border rounded-xl appearance-none"
                >
                  <option value="">Select Service</option>

                  {SubCategoriesData.subcategories.map(
                    (category: SubCategoryGroup) => (
                      <optgroup
                        key={category.categoryId}
                        label={`Category ${category.categoryId}`}
                      >
                        {category.items.map((item) => (
                          <option key={item.name} value={item.name}>
                            {item.icon} {item.name}
                          </option>
                        ))}
                      </optgroup>
                    )
                  )}
                </select>

                <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400" />
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <input
                  type="date"
                  name="preferredDate"
                  value={formData.preferredDate}
                  onChange={handleInputChange}
                  className="w-full py-3 px-4 border rounded-xl"
                />
                <input
                  type="time"
                  name="preferredTime"
                  value={formData.preferredTime}
                  onChange={handleInputChange}
                  className="w-full py-3 px-4 border rounded-xl"
                />
              </div>

              <div className="grid grid-cols-2 gap-6 mb-6">
                <input
                  name="budgetRange"
                  placeholder="Budget (₹)"
                  value={formData.budgetRange}
                  onChange={handleInputChange}
                  className="w-full py-3 px-4 border rounded-xl"
                />
                <input
                  name="serviceLocation"
                  placeholder="Location"
                  value={formData.serviceLocation}
                  onChange={handleInputChange}
                  className="w-full py-3 px-4 border rounded-xl"
                />
              </div>

              <textarea
                name="additionalDetails"
                placeholder="Additional details"
                value={formData.additionalDetails}
                onChange={handleInputChange}
                rows={4}
                required
                className="w-full py-3 px-4 border rounded-xl"
              />
            </section>

            {/* ===== SUBMIT ===== */}
            <Button
              type="submit"
              variant="gradient-blue"
              size="xl"
              fullWidth
            >
              ➤ Send Enquiry
            </Button>

            <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
              <p className={combineTypography(typography.body.small, "text-blue-700")}>
                The worker will receive your enquiry and contact you directly.
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default ServiceEnquiryForm;
