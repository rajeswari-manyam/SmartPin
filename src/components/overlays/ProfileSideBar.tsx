
















// Custom icon imports
import MyProfileIcon from "../../assets/icons/MyProfile.png";
import LogoutIcon from "../../assets/icons/Logout.png";
import NeedHelpIcon from "../../assets/icons/NeedHelp.png";
import ContactIcon from "../../assets/icons/Contact.png";
import PrivacyIcon from "../../assets/icons/Pravicy.png";
import RaiseIcon from "../../assets/icons/Raise.png";
import ReferIcon from "../../assets/icons/Refer.png";
import RestaurantIcon from "../../assets/icons/Restaurant.png";

import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  X,
  Info,
} from "lucide-react";
import Button from "../ui/Buttons";

type AccountType = "user" | "worker";

interface ProfileSidebarProps {
  onNavigate: (path: string) => void;
  onLogout: () => void;
  user: {
    name: string;
    id?: string;
    _id?: string;
  };
  profilePic?: string | null;
}

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  onNavigate,
  onLogout,
  user,
  profilePic: initialProfilePic,
}) => {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [userName] = useState(user.name || "User");
  const [profilePic] = useState<string | null>(initialProfilePic || null);
  const [accountType] = useState<AccountType>("user");

  const navigate = useNavigate();

  const getInitial = (name: string) =>
    !name || name === "User" ? "U" : name.charAt(0).toUpperCase();

  const handleLogout = () => {
    setShowLogoutPopup(false);
    onLogout();
    navigate("/");
  };

  return (
    <>
      {/* ================= SIDEBAR ================= */}
      <div className="h-full flex flex-col bg-[#F0F0F0]">
        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between p-6 border-b bg-white">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              {userName}
            </h2>
            <button
              onClick={() => onNavigate("/profile")}
              className="text-sm text-[#00598a] hover:underline"
            >
              Click to view profile
            </button>
          </div>

          {/* Avatar */}
          <div className="w-12 h-12 rounded-full overflow-hidden shadow-lg border-2 border-white">
            {profilePic ? (
              <img
                src={profilePic}
                alt={userName}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full bg-[#00598a] flex items-center justify-center text-white font-bold text-lg">
                {getInitial(userName)}
              </div>
            )}
          </div>
        </div>

        {/* ================= PROFILE ================= */}
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-500 mb-2 px-3">
            Profile
          </p>

          <MenuItem
            icon={<img src={MyProfileIcon} alt="My Profile" className="w-5 h-5 object-contain" />}
            label="My Profile"
            onClick={() => onNavigate("/my-profile")}
          />

          <MenuItem
            icon={<img src={RestaurantIcon} alt="Change Language" className="w-5 h-5 object-contain" />}
            label="Change Language"
          />

          <MenuItem
            icon={<img src={ReferIcon} alt="Refer & Earn" className="w-5 h-5 object-contain" />}
            label="Refer & Earn"
            onClick={() => onNavigate("/refer-and-earn")}
          />
        </div>

        {/* ================= SUPPORT ================= */}
        <div className="p-4">
          <p className="text-xs font-semibold text-gray-500 mb-2 px-3">
            Support & Settings
          </p>

          <MenuItem
            icon={<img src={PrivacyIcon} alt="Privacy Policy" className="w-5 h-5 object-contain" />}
            label="Privacy Policy"
            onClick={() => onNavigate("/policy")}
          />

          <MenuItem
            icon={<Info className="text-gray-500" size={20} />}
            label="About Us"
            onClick={() => onNavigate("/about-us")}
          />

          <MenuItem
            icon={<img src={RaiseIcon} alt="Raise Ticket" className="w-5 h-5 object-contain" />}
            label="Raise Ticket"
            onClick={() => onNavigate("/raise-ticket")}
          />

          <MenuItem
            icon={<img src={NeedHelpIcon} alt="Help" className="w-5 h-5 object-contain" />}
            label="Help"
            onClick={() => onNavigate("/help")}
          />

          <MenuItem
            icon={<img src={ContactIcon} alt="Contact" className="w-5 h-5 object-contain" />}
            label="Contact Us"
            onClick={() => onNavigate("/contact")}
          />

          <MenuItem
            icon={<img src={LogoutIcon} alt="Logout" className="w-5 h-5 object-contain" />}
            label="Logout"
            danger
            onClick={() => setShowLogoutPopup(true)}
          />
        </div>
      </div>

      {/* ================= LOGOUT MODAL ================= */}
      {showLogoutPopup &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowLogoutPopup(false)}
            />

            <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden animate-scale-in">
              {/* Header */}
              <div className="bg-[#00598a] px-6 py-8 text-center">
                <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <LogOut className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Logout?
                </h3>
              </div>

              {/* Body */}
              <div className="p-6">
                <p className="text-gray-600 text-center mb-6">
                  Are you sure you want to logout?
                </p>

                <div className="space-y-3">
                  <Button
                    onClick={handleLogout}
                    fullWidth
                    className="bg-[#00598a] text-white hover:brightness-110"
                  >
                    Yes, Logout
                  </Button>

                  <Button
                    onClick={() => setShowLogoutPopup(false)}
                    fullWidth
                    variant="secondary"
                    className="bg-white border-2 border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </Button>
                </div>
              </div>

              {/* Close */}
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="absolute top-4 right-4 text-white hover:bg-white/20 p-2 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>,
          document.body
        )}
    </>
  );
};



interface MenuItemProps {
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({
  icon,
  label,
  onClick,
  danger = false,
}) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-sm font-medium transition ${danger
      ? "text-red-600 hover:bg-red-50"
      : "text-gray-700 hover:bg-[#F0F0F0]"
      }`}
  >
    <span className="w-5 h-5 flex items-center justify-center">{icon}</span>
    <span className="flex-1 text-left">{label}</span>
    <span className="text-gray-400">›</span>
  </button>
);

export default ProfileSidebar;
