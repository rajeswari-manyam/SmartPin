import React from "react";
import typography from "../../styles/typography";

interface WorkImagesUploadProps {
    workImages: string[];
    onImagesUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
    onRemoveImage: (index: number) => void;
}

const WorkImagesUpload: React.FC<WorkImagesUploadProps> = ({
    workImages,
    onImagesUpload,
    onRemoveImage,
}) => {
    return (
        <div className="mb-6">
            <label className={typography.form.label}>Upload Work Images</label>
            <p className="text-sm text-gray-500 mb-3">
                Show examples of your work (up to 5 images)
            </p>

            <input
                type="file"
                id="workImages"
                accept="image/*"
                multiple
                onChange={onImagesUpload}
                className="hidden"
                disabled={workImages.length >= 5}
            />

            <label htmlFor="workImages">
                <div
                    className={`cursor-pointer border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:border-[#0B0E92] transition-colors ${
                        workImages.length >= 5 ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                >
                    <svg
                        className="w-12 h-12 mx-auto text-gray-400 mb-3"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                    </svg>
                    <p className="text-gray-600 font-medium">
                        {workImages.length >= 5
                            ? "Maximum 5 images reached"
                            : "Click to upload work images"}
                    </p>
                    <p className="text-sm text-gray-400 mt-1">PNG, JPG up to 5MB</p>
                </div>
            </label>

            {/* Display uploaded work images */}
            {workImages.length > 0 && (
                <div className="grid grid-cols-3 gap-3 mt-4">
                    {workImages.map((image, index) => (
                        <div key={index} className="relative group">
                            <img
                                src={image}
                                alt={`Work ${index + 1}`}
                                className="w-full h-24 object-cover rounded-lg border-2 border-gray-200"
                            />
                            <button
                                onClick={() => onRemoveImage(index)}
                                className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 rounded-full text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                            >
                                ×
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default WorkImagesUpload;
