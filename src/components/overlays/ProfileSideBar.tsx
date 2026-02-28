import React, { useState } from "react";
import ReactDOM from "react-dom";
import { useNavigate, useLocation } from "react-router-dom";
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
  ChevronRight,
  Star,
} from "lucide-react";
import { typography } from "../../styles/typography";

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

const BRAND = "#00598a";

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
  const location = useLocation();

  const getInitial = (name: string) =>
    !name || name === "User" ? "U" : name.charAt(0).toUpperCase();

  const handleLogout = () => {
    setShowLogoutPopup(false);
    onLogout();
    navigate("/");
  };

  const handleViewProfile = () => {
    onNavigate("/my-profile");
  };

  // ✅ FIXED: Navigate to /reviews/:workerId using user._id or user.id
  const handleViewReviews = () => {
    const workerId = user._id || user.id;
    if (workerId) {
      onNavigate(`/reviews/${workerId}`);
    } else {
      console.warn("ProfileSidebar: No workerId found on user object");
    }
  };

  const handleChangeLanguage = () => {
    if (location.pathname === "/home" || location.pathname === "/") {
      window.dispatchEvent(new Event("openLanguageSelector"));
      return;
    }
    onNavigate("/home");
    setTimeout(() => {
      window.dispatchEvent(new Event("openLanguageSelector"));
    }, 300);
  };

  return (
    <>
      {/* ================= SIDEBAR CONTAINER ================= */}
      <div className="h-full flex flex-col bg-gray-50 overflow-y-auto">

        {/* ── HEADER CARD ── */}
        <div
          className="relative px-5 pt-10 pb-6 flex flex-col items-center text-center"
          style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #003a5c 100%)` }}
        >
          {/* Avatar */}
          <button
            onClick={handleViewProfile}
            className="w-20 h-20 sm:w-24 sm:h-24 rounded-full overflow-hidden border-4 border-white/30 shadow-xl mb-3 hover:border-white/60 transition-all duration-300 hover:scale-105 flex-shrink-0"
          >
            {profilePic ? (
              <img src={profilePic} alt={userName} className="w-full h-full object-cover" />
            ) : (
              <div
                className="w-full h-full flex items-center justify-center text-white font-bold text-3xl"
                style={{ backgroundColor: "rgba(255,255,255,0.2)" }}
              >
                {getInitial(userName)}
              </div>
            )}
          </button>

          {/* Name */}
          <h2 className="text-white font-bold text-xl sm:text-2xl leading-tight truncate max-w-[200px]">
            {userName}
          </h2>

          {/* View profile link */}
          <button
            onClick={handleViewProfile}
            className="mt-1 text-white/70 hover:text-white text-xs sm:text-sm underline underline-offset-2 transition-colors duration-200"
          >
            View Profile
          </button>

          {/* Decorative wave */}
          <div className="absolute bottom-0 left-0 right-0 overflow-hidden leading-none">
            <svg viewBox="0 0 400 20" preserveAspectRatio="none" className="w-full h-5">
              <path d="M0,10 C100,20 300,0 400,10 L400,20 L0,20 Z" fill="#f9fafb" />
            </svg>
          </div>
        </div>

        {/* ── MENU SECTIONS ── */}
        <div className="flex-1 px-3 py-4 space-y-4">

          {/* Profile Section */}
          <MenuSection title="Profile">
            <MenuItem
              icon={UserCircle}
              label="My Profile"
              onClick={handleViewProfile}
            />

            {/* ✅ Reviews item — now navigates to /reviews/:workerId */}
            <MenuItemWithBadge
              icon={Star}
              label="My Reviews"
              badge="4.8 ★"
              onClick={handleViewReviews}
            />

            <MenuItem
              icon={Globe}
              label="Change Language"
              onClick={handleChangeLanguage}
            />
            <MenuItem
              icon={Gift}
              label="Refer & Earn"
              onClick={() => onNavigate("/refer-and-earn")}
            />
          </MenuSection>

          {/* Support Section */}
          <MenuSection title="Support & Settings">
            <MenuItem
              icon={ShieldCheck}
              label="Privacy Policy"
              onClick={() => onNavigate("/policy")}
            />
            <MenuItem
              icon={Info}
              label="About Us"
              onClick={() => onNavigate("/about-us")}
            />
            <MenuItem
              icon={Ticket}
              label="Raise Ticket"
              onClick={() => onNavigate("/raise-ticket")}
            />
            <MenuItem
              icon={HelpCircle}
              label="Help"
              onClick={() => onNavigate("/help")}
            />
            <MenuItem
              icon={Phone}
              label="Contact Us"
              onClick={() => onNavigate("/contact")}
            />
          </MenuSection>

          {/* Logout — standalone */}
          <button
            onClick={() => setShowLogoutPopup(true)}
            className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl bg-red-50 border border-red-100 text-red-500 font-semibold text-sm sm:text-base transition-all duration-200 hover:bg-red-500 hover:text-white hover:shadow-lg hover:shadow-red-200 active:scale-[0.98]"
          >
            <LogOut className="w-5 h-5 flex-shrink-0" strokeWidth={1.8} />
            <span className="flex-1 text-left">Logout</span>
            <ChevronRight className="w-4 h-4 opacity-50" />
          </button>

        </div>
      </div>

      {/* ================= LOGOUT MODAL ================= */}
      {showLogoutPopup &&
        ReactDOM.createPortal(
          <div className="fixed inset-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4">
            <div
              className="absolute inset-0 bg-black/50 backdrop-blur-sm"
              onClick={() => setShowLogoutPopup(false)}
            />
            <div className="relative bg-white w-full sm:max-w-sm sm:rounded-3xl rounded-t-3xl shadow-2xl overflow-hidden z-10">
              <div
                className="px-6 py-8 text-center"
                style={{ background: `linear-gradient(135deg, ${BRAND} 0%, #003a5c 100%)` }}
              >
                <div className="mx-auto w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mb-3">
                  <LogOut className="w-8 h-8 text-white" strokeWidth={1.8} />
                </div>
                <h3 className="text-white text-xl font-bold">Sign out?</h3>
                <p className="text-white/70 text-sm mt-1">You'll need to log in again</p>
              </div>
              <div className="p-5 space-y-3">
                <button
                  onClick={handleLogout}
                  className="w-full py-3.5 rounded-2xl font-semibold text-white text-base transition-all duration-200 active:scale-[0.98]"
                  style={{ backgroundColor: BRAND }}
                  onMouseEnter={e => (e.currentTarget as HTMLElement).style.backgroundColor = "#004a73"}
                  onMouseLeave={e => (e.currentTarget as HTMLElement).style.backgroundColor = BRAND}
                >
                  Yes, Sign Out
                </button>
                <button
                  onClick={() => setShowLogoutPopup(false)}
                  className="w-full py-3.5 rounded-2xl font-semibold text-base transition-all duration-200 border-2 active:scale-[0.98]"
                  style={{ borderColor: BRAND, color: BRAND }}
                  onMouseEnter={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = BRAND;
                    (e.currentTarget as HTMLElement).style.color = "#fff";
                  }}
                  onMouseLeave={e => {
                    (e.currentTarget as HTMLElement).style.backgroundColor = "transparent";
                    (e.currentTarget as HTMLElement).style.color = BRAND;
                  }}
                >
                  Cancel
                </button>
              </div>
              <button
                onClick={() => setShowLogoutPopup(false)}
                className="absolute top-3 right-3 text-white/70 hover:text-white hover:bg-white/20 p-2 rounded-full transition-all"
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

/* ── MenuSection wrapper ─────────────────────────────────────────────────── */
const MenuSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
    <p className="px-4 pt-3 pb-1 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-gray-400">
      {title}
    </p>
    <div className="divide-y divide-gray-50">
      {children}
    </div>
  </div>
);

/* ── MenuItem ─────────────────────────────────────────────────────────────── */
interface MenuItemProps {
  icon: React.FC<any>;
  label: string;
  onClick?: () => void;
}

const MenuItem: React.FC<MenuItemProps> = ({ icon: Icon, label, onClick }) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
      className="w-full flex items-center gap-3 px-4 py-3 sm:py-3.5 text-left transition-all duration-200 active:scale-[0.98]"
      style={{ backgroundColor: hovered ? "#f0f7ff" : "transparent" }}
    >
      <div
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{ backgroundColor: hovered ? BRAND : "#e8f4fb" }}
      >
        <Icon
          className="w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200"
          strokeWidth={1.8}
          style={{ color: hovered ? "#fff" : BRAND }}
        />
      </div>
      <span
        className="flex-1 text-sm sm:text-base font-medium transition-colors duration-200"
        style={{ color: hovered ? BRAND : "#374151" }}
      >
        {label}
      </span>
      <ChevronRight
        className="w-4 h-4 transition-all duration-200"
        strokeWidth={2}
        style={{
          color: hovered ? BRAND : "#d1d5db",
          transform: hovered ? "translateX(2px)" : "translateX(0)",
        }}
      />
    </button>
  );
};

/* ── MenuItemWithBadge — Reviews item with amber rating pill ───────────── */
interface MenuItemWithBadgeProps {
  icon: React.FC<any>;
  label: string;
  badge: string;
  onClick?: () => void;
}

const AMBER = "#f97316";
const AMBER_BG = "#fff3e0";

const MenuItemWithBadge: React.FC<MenuItemWithBadgeProps> = ({
  icon: Icon,
  label,
  badge,
  onClick,
}) => {
  const [hovered, setHovered] = useState(false);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      onTouchStart={() => setHovered(true)}
      onTouchEnd={() => setHovered(false)}
      className="w-full flex items-center gap-3 px-4 py-3 sm:py-3.5 text-left transition-all duration-200 active:scale-[0.98]"
      style={{ backgroundColor: hovered ? "#fff8f0" : "transparent" }}
    >
      {/* Amber icon box */}
      <div
        className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl flex items-center justify-center flex-shrink-0 transition-all duration-200"
        style={{ backgroundColor: hovered ? AMBER : AMBER_BG }}
      >
        <Icon
          className="w-4 h-4 sm:w-5 sm:h-5 transition-colors duration-200"
          strokeWidth={1.8}
          fill={hovered ? "#fff" : AMBER}
          style={{ color: hovered ? "#fff" : AMBER }}
        />
      </div>

      {/* Label */}
      <span
        className="flex-1 text-sm sm:text-base font-medium transition-colors duration-200"
        style={{ color: hovered ? AMBER : "#374151" }}
      >
        {label}
      </span>

      {/* Rating badge pill */}
      <span
        className="text-[11px] font-bold px-2.5 py-0.5 rounded-full mr-1 transition-all duration-200 flex-shrink-0"
        style={{
          backgroundColor: hovered ? AMBER : AMBER_BG,
          color: hovered ? "#fff" : AMBER,
        }}
      >
        {badge}
      </span>

      <ChevronRight
        className="w-4 h-4 flex-shrink-0 transition-all duration-200"
        strokeWidth={2}
        style={{
          color: hovered ? AMBER : "#d1d5db",
          transform: hovered ? "translateX(2px)" : "translateX(0)",
        }}
      />
    </button>
  );
};

export default ProfileSidebar;