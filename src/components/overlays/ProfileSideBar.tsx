import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate } from "react-router-dom";
import {
  LogOut,
  X,
  Info,
  Globe,
  UserCircle,
  Gift,
  ShieldCheck,
  Ticket,
  HelpCircle,
  Phone,
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

// ── Shared icon constants — matches Globe & Info exactly ──────────────────────
const ICON_COLOR = "#00598a";
const ICON_COLOR_HOVER = "#ffffff";
const ICON_SIZE_DEFAULT = 20;
const ICON_SIZE_HOVER = 22;
const ICON_STROKE = 1.8;

// ── Unified Lucide icon wrapper ───────────────────────────────────────────────
const SidebarIcon: React.FC<{
  icon: React.FC<any>;
  hovered?: boolean;
  danger?: boolean;
}> = ({ icon: Icon, hovered, danger }) => (
  <Icon
    strokeWidth={ICON_STROKE}
    style={{
      width: hovered ? `${ICON_SIZE_HOVER}px` : `${ICON_SIZE_DEFAULT}px`,
      height: hovered ? `${ICON_SIZE_HOVER}px` : `${ICON_SIZE_DEFAULT}px`,
      color: hovered
        ? ICON_COLOR_HOVER
        : danger
        ? "#ef4444"
        : ICON_COLOR,
      transition: "all 0.3s ease",
    }}
  />
);

const ProfileSidebar: React.FC<ProfileSidebarProps> = ({
  onNavigate,
  onLogout,
  user,
  profilePic: initialProfilePic,
}) => {
  const [showLogoutPopup, setShowLogoutPopup] = useState(false);
  const [userName] = useState(user.name || "User");
  const [profilePic] = useState<string | null>(initialProfilePic || null);

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
            <h2 className="text-lg font-semibold text-gray-900">{userName}</h2>
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
              <img src={profilePic} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#00598a] flex items-center justify-center text-white font-bold text-lg">
                {getInitial(userName)}
              </div>
            )}
          </div>
        </div>

        {/* ================= PROFILE ================= */}
        <div className="p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-500 mb-2 px-3">Profile</p>

          <MenuItem
            icon={(h) => <SidebarIcon icon={UserCircle} hovered={h} />}
            label="My Profile"
            onClick={() => onNavigate("/my-profile")}
          />

          <MenuItem
            icon={(h) => <SidebarIcon icon={Globe} hovered={h} />}
            label="Change Language"
          />

          <MenuItem
            icon={(h) => <SidebarIcon icon={Gift} hovered={h} />}
            label="Refer & Earn"
            onClick={() => onNavigate("/refer-and-earn")}
          />
        </div>

        {/* ================= SUPPORT ================= */}
        <div className="p-4 space-y-1">
          <p className="text-xs font-semibold text-gray-500 mb-2 px-3">Support & Settings</p>

          <MenuItem
            icon={(h) => <SidebarIcon icon={ShieldCheck} hovered={h} />}
            label="Privacy Policy"
            onClick={() => onNavigate("/policy")}
          />

          <MenuItem
            icon={(h) => <SidebarIcon icon={Info} hovered={h} />}
            label="About Us"
            onClick={() => onNavigate("/about-us")}
          />

          <MenuItem
            icon={(h) => <SidebarIcon icon={Ticket} hovered={h} />}
            label="Raise Ticket"
            onClick={() => onNavigate("/raise-ticket")}
          />

          <MenuItem
            icon={(h) => <SidebarIcon icon={HelpCircle} hovered={h} />}
            label="Help"
            onClick={() => onNavigate("/help")}
          />

          <MenuItem
            icon={(h) => <SidebarIcon icon={Phone} hovered={h} />}
            label="Contact Us"
            onClick={() => onNavigate("/contact")}
          />

          <MenuItem
            icon={(h) => <SidebarIcon icon={LogOut} hovered={h} danger />}
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
              <div className="bg-[#00598a] px-6 py-8 text-center">
                <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <LogOut className="w-10 h-10 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-white">Logout?</h3>
              </div>
              <div className="p-6">
                <p className="text-gray-600 text-center mb-6">Are you sure you want to logout?</p>
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

// ── MenuItem ──────────────────────────────────────────────────────────────────
interface MenuItemProps {
  icon: (hovered: boolean) => React.ReactNode;
  label: string;
  onClick?: () => void;
  danger?: boolean;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon, label, onClick, danger = false }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className="w-full flex items-center gap-3 rounded-xl font-medium transition-all duration-300 ease-in-out"
      style={{
        paddingTop: hovered ? "13px" : "10px",
        paddingBottom: hovered ? "13px" : "10px",
        paddingLeft: "12px",
        paddingRight: "12px",
        transform: hovered ? "scale(1.02)" : "scale(1)",
        transformOrigin: "center",
        backgroundColor: danger
          ? hovered ? "#ef4444" : "transparent"
          : hovered ? "#00598a" : "transparent",
        boxShadow: hovered
          ? danger
            ? "0 4px 14px rgba(239,68,68,0.35)"
            : "0 4px 14px rgba(0,89,138,0.35)"
          : "none",
        color: hovered ? "#ffffff" : danger ? "#ef4444" : "#374151",
      }}
    >
      {/* Icon */}
      <span className="flex items-center justify-center flex-shrink-0">
        {icon(hovered)}
      </span>

      {/* Label */}
      <span
        className="flex-1 text-left transition-all duration-300"
        style={{
          fontSize: hovered ? "14.5px" : "14px",
          fontWeight: hovered ? 600 : 500,
        }}
      >
        {label}
      </span>

      {/* Arrow */}
      <span
        className="text-base transition-all duration-300"
        style={{
          transform: hovered ? "translateX(4px)" : "translateX(0px)",
          fontWeight: hovered ? 700 : 400,
          color: hovered ? "#ffffff" : danger ? "#ef4444" : "#9ca3af",
        }}
      >
        ›
      </span>
    </button>
  );
};

export default ProfileSidebar;