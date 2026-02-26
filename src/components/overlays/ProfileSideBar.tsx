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
import { typography } from "../../styles/typography";

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

// ── Brand colors ──────────────────────────────────────────────────────────────
const ICON_COLOR = "#00598a";
const ICON_COLOR_HOVER = "#ffffff";
const ICON_SIZE_DEFAULT = 22;
const ICON_SIZE_HOVER = 24;
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
      color: hovered ? ICON_COLOR_HOVER : danger ? "#ef4444" : ICON_COLOR,
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

  // ── Navigate to My Profile ─────────────────────────────────────────────────
  const handleViewProfile = () => {
    onNavigate("/my-profile");
    navigate("/my-profile");
  };

  return (
    <>
      {/* ================= SIDEBAR ================= */}
      <div className="h-full flex flex-col bg-[#F0F0F0]">

        {/* ================= HEADER ================= */}
        <div className="flex items-center justify-between p-6 border-b bg-white">
          <div>
            <h2 className={`${typography.heading.h5} text-gray-900 text-2xl font-bold`}>{userName}</h2>
            <button
              onClick={handleViewProfile}
              className={`${typography.body.small} text-[#00598a] hover:underline text-sm`}
            >
              Click to view profile
            </button>
          </div>

          {/* Avatar */}
          <div
            onClick={handleViewProfile}
            className="w-14 h-14 rounded-full overflow-hidden shadow-lg border-2 border-white flex-shrink-0 cursor-pointer hover:ring-2 hover:ring-[#00598a] transition-all"
          >
            {profilePic ? (
              <img src={profilePic} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full bg-[#00598a] flex items-center justify-center text-white font-bold text-xl">
                {getInitial(userName)}
              </div>
            )}
          </div>
        </div>

        {/* ================= PROFILE ================= */}
        <div className="p-4 space-y-1">
          <p className={`${typography.misc.caption} font-semibold mb-2 px-3 uppercase tracking-wide text-sm`}>
            Profile
          </p>

          <MenuItem
            icon={h => <SidebarIcon icon={UserCircle} hovered={h} />}
            label="My Profile"
            onClick={handleViewProfile}
          />
          <MenuItem
            icon={h => <SidebarIcon icon={Globe} hovered={h} />}
            label="Change Language"
          />
          <MenuItem
            icon={h => <SidebarIcon icon={Gift} hovered={h} />}
            label="Refer & Earn"
            onClick={() => onNavigate("/refer-and-earn")}
          />
        </div>

        {/* ================= SUPPORT ================= */}
        <div className="p-4 space-y-1">
          <p className={`${typography.misc.caption} font-semibold mb-2 px-3 uppercase tracking-wide text-sm`}>
            Support & Settings
          </p>

          <MenuItem
            icon={h => <SidebarIcon icon={ShieldCheck} hovered={h} />}
            label="Privacy Policy"
            onClick={() => onNavigate("/policy")}
          />
          <MenuItem
            icon={h => <SidebarIcon icon={Info} hovered={h} />}
            label="About Us"
            onClick={() => onNavigate("/about-us")}
          />
          <MenuItem
            icon={h => <SidebarIcon icon={Ticket} hovered={h} />}
            label="Raise Ticket"
            onClick={() => onNavigate("/raise-ticket")}
          />
          <MenuItem
            icon={h => <SidebarIcon icon={HelpCircle} hovered={h} />}
            label="Help"
            onClick={() => onNavigate("/help")}
          />
          <MenuItem
            icon={h => <SidebarIcon icon={Phone} hovered={h} />}
            label="Contact Us"
            onClick={() => onNavigate("/contact")}
          />
          <MenuItem
            icon={h => <SidebarIcon icon={LogOut} hovered={h} danger />}
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
            <div className="relative bg-white rounded-3xl shadow-2xl max-w-sm w-full overflow-hidden">
              {/* Modal header */}
              <div className="bg-[#00598a] px-6 py-8 text-center">
                <div className="mx-auto w-20 h-20 bg-white/20 rounded-full flex items-center justify-center mb-4">
                  <LogOut className="w-10 h-10 text-white" />
                </div>
                <h3 className={`${typography.heading.h4} text-white text-2xl font-bold`}>Logout?</h3>
              </div>

              {/* Modal body */}
              <div className="p-6">
                <p className={`${typography.body.base} text-gray-600 text-center mb-6 text-base`}>
                  Are you sure you want to logout?
                </p>
                <div className="space-y-3">
                  <button
                    onClick={handleLogout}
                    className="w-full py-3 rounded-xl font-semibold text-white transition-all duration-200 text-lg"
                    style={{ backgroundColor: "#00598a" }}
                    onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#004a73"}
                    onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#00598a"}
                  >
                    Yes, Logout
                  </button>

                  <button
                    onClick={() => setShowLogoutPopup(false)}
                    className="w-full py-3 rounded-xl font-semibold transition-all duration-200 text-lg"
                    style={{
                      border: "2px solid #00598a",
                      color: "#00598a",
                      backgroundColor: "transparent",
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "#00598a";
                      (e.currentTarget as HTMLElement).style.color = "#fff";
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                      (e.currentTarget as HTMLElement).style.color = "#00598a";
                    }}
                  >
                    Cancel
                  </button>
                </div>
              </div>

              {/* Close X */}
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
      <span className="flex items-center justify-center flex-shrink-0">
        {icon(hovered)}
      </span>
      <span
        className="flex-1 text-left transition-all duration-300 text-base"
        style={{ fontWeight: hovered ? 600 : 500 }}
      >
        {label}
      </span>
      <span
        className="text-lg transition-all duration-300"
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