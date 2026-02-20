import React from "react";

interface ProfilePhotoUploadProps {
    profilePhoto: string | null;
    onPhotoUpload: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

const ProfilePhotoUpload: React.FC<ProfilePhotoUploadProps> = ({
    profilePhoto,
    onPhotoUpload,
}) => {
    return (
        <div className="flex flex-col items-center mb-8">
            <div className="relative mb-4">
                <div className="w-32 h-32 rounded-full bg-gradient-to-r from-[#f09b13] to-[#f0c413] flex items-center justify-center shadow-lg">
                    {profilePhoto ? (
                        <img
                            src={profilePhoto}
                            alt="Profile"
                            className="w-full h-full rounded-full object-cover"
                        />
                    ) : (
                        <svg
                            className="w-16 h-16 text-white"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={1.5}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    )}
                </div>
                {profilePhoto && (
                    <div className="absolute top-0 right-0 w-8 h-8 bg-green-500 rounded-full flex items-center justify-center shadow-md">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                )}
            </div>

            <input
                type="file"
                id="photoUpload"
                accept="image/*"
                onChange={onPhotoUpload}
                className="hidden"
            />

            <label htmlFor="photoUpload">
                <div className="cursor-pointer px-8 py-3 rounded-full border-2 border-[#0B0E92] text-[#0B0E92] font-semibold hover:bg-blue-50 transition-colors">
                    {profilePhoto ? "Change Photo" : "Upload Photo"}
                </div>
            </label>
        </div>
    );
};

export default ProfilePhotoUpload;
