import React, { useState, useEffect, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Menu, X, Bell, Home } from "lucide-react";

// Custom navbar icons
import ListedJobsIcon from "../../assets/icons/ListedJobs.png";
import MyBusinessIcon from "../../assets/icons/MyBusiness.png";
import MySkillsIcon from "../../assets/icons/MySkills.png";

import { useAuth } from "../../context/AuthContext";
import { useAccount } from "../../context/AccountContext";
import Button from "../ui/Buttons";
import typography, { combineTypography } from "../../styles/typography";
import WelcomePage from "../Auth/WelcomePage";
import OTPVerification from "../Auth/OTPVerification";
import LanguageSelector from "../LanguageSelector";
import ProfileSidebar from "../overlays/ProfileSideBar";
import {
  getUserById,
  getNotificationCount,
  API_BASE_URL,
} from "../../services/api.service";

const Navbar: React.FC = () => {
  const { isAuthenticated, user, logout } = useAuth();
  const { accountType, setAccountType, workerProfileId } = useAccount();

  const navigate = useNavigate();
  const location = useLocation();

  const [showWelcomeModal, setShowWelcomeModal] = useState(false);
  const [showOTPModal, setShowOTPModal] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState("");
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showProfileSidebar, setShowProfileSidebar] = useState(false);

  // ✅ Always start from API data, not stale localStorage
  const [userName, setUserName] = useState("User");
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const [unreadCount, setUnreadCount] = useState(0);

  // ── Fetch profile from API (source of truth) ─────────────────────────────
  const fetchUserProfile = useCallback(async () => {
    if (!isAuthenticated) return;

    // ✅ Prefer user._id from AuthContext (always fresh after login)
    const userId = user?._id || localStorage.getItem("userId");
    if (!userId) return;

    try {
      setIsLoadingProfile(true);
      const response = await getUserById(userId);

      if (response.success && response.data) {
        const freshName = response.data.name?.trim() || "User";

        // ✅ Update both state AND localStorage so they stay in sync
        setUserName(freshName);
        localStorage.setItem("userName", freshName);

        if (response.data.profilePic) {
          const picUrl = response.data.profilePic.startsWith("http")
            ? response.data.profilePic
            : `${API_BASE_URL}${response.data.profilePic}`;
          setProfilePic(picUrl);
        } else {
          setProfilePic(null);
        }
      }
    } catch (error) {
      console.error("Error fetching profile:", error);
      // Fallback: use AuthContext user name (set during login in OTPVerification)
      if (user?.name && user.name !== "User") {
        setUserName(user.name);
        localStorage.setItem("userName", user.name);
      }
    } finally {
      setIsLoadingProfile(false);
    }
  }, [isAuthenticated, user?._id, user?.name]);

  // ✅ Re-fetch whenever auth state OR user._id changes
  // This fires on first login, logout+re-login, and page refresh
  useEffect(() => {
    if (isAuthenticated && user?._id) {
      fetchUserProfile();
    } else if (!isAuthenticated) {
      // Clear on logout
      setUserName("User");
      setProfilePic(null);
    }
  }, [isAuthenticated, user?._id]);

  // ── Re-fetch when MyProfile dispatches "profileUpdated" ─────────────────
  useEffect(() => {
    const handleProfileUpdated = () => fetchUserProfile();
    window.addEventListener("profileUpdated", handleProfileUpdated);
    return () => window.removeEventListener("profileUpdated", handleProfileUpdated);
  }, [fetchUserProfile]);

  // ── Fetch real unread notification count ──────────────────────────────────
  useEffect(() => {
    const fetchUnreadCount = async () => {
      if (!isAuthenticated) {
        setUnreadCount(0);
        return;
      }

      try {
        const userId = user?._id || localStorage.getItem("userId") || "";
        const workerId = workerProfileId || localStorage.getItem("workerId") || "";

        const role = accountType === "worker" ? "Worker" : "User";
        const id = accountType === "worker" ? workerId : userId;

        if (!id) return;

        const res = await getNotificationCount(role as "User" | "Worker", id);
        setUnreadCount(res.count ?? 0);
      } catch (err) {
        console.error("Failed to fetch notification count:", err);
      }
    };

    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60_000);
    return () => clearInterval(interval);
  }, [isAuthenticated, accountType, workerProfileId, user?._id]);

  // Handle body overflow when modals are open
  useEffect(() => {
    if (showWelcomeModal || showOTPModal || showProfileSidebar) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [showWelcomeModal, showOTPModal, showProfileSidebar]);

  const handleNavClick = (path: string) => {
    if (!isAuthenticated) {
      setShowWelcomeModal(true);
      return;
    }
    navigate(path);
    setIsMobileMenuOpen(false);
  };

  const handleNotificationClick = () => {
    if (!isAuthenticated) {
      setShowWelcomeModal(true);
      return;
    }
    setUnreadCount(0);
    navigate("/notifications");
    setIsMobileMenuOpen(false);
  };

  const handleProfileClick = () => {
    if (!isAuthenticated) {
      setShowWelcomeModal(true);
      return;
    }
    setShowProfileSidebar(true);
    setIsMobileMenuOpen(false);
  };

  const handleLoginSuccess = () => {
    setShowOTPModal(false);
    setShowWelcomeModal(false);
    navigate("/", { replace: true });
  };

  const openOTPModal = (phone: string) => {
    setPhoneNumber(phone);
    setShowWelcomeModal(false);
    setShowOTPModal(true);
  };

  const handleSwitchAccount = (type: "user" | "worker") => {
    if (type === accountType) return;
    setAccountType(type);
    setIsMobileMenuOpen(false);
    setShowProfileSidebar(false);
    navigate("/home", { replace: true });
  };

  return (
    <>
      {/* ================= HEADER ================= */}
      <header className="bg-white shadow-sm sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">

            {/* ── Logo ── */}
            <div
              onClick={() => navigate("/")}
              className="flex items-center space-x-2 cursor-pointer transition-all duration-300 hover:scale-105 group"
            >
              <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center transition-all duration-300 group-hover:rotate-6 group-hover:shadow-lg">
                <span className="text-white text-xl">⚡</span>
              </div>
              <h1
                className={combineTypography(
                  typography.logo.title,
                  "text-primary hidden sm:block transition-colors duration-300 group-hover:text-primary/80"
                )}
              >
                ServiceHub
              </h1>
            </div>

            {/* ── Right Section ── */}
            <div className="flex items-center space-x-2 sm:space-x-3">

              <div>
                <LanguageSelector />
              </div>

              {/* ── Desktop-only nav links ── */}
              <div className="hidden lg:flex items-center space-x-1">
                {accountType === "user" ? (
                  <>
                    <NavItem icon={Home} label="Home" path="/home" onClick={() => handleNavClick("/home")} />
                    <NavItem icon={Home} imgSrc={ListedJobsIcon} label="Jobs" path="/listed-jobs" onClick={() => handleNavClick("/listed-jobs")} />
                  </>
                ) : (
                  <>
                    <NavItem icon={Home} label="Home" path="/home" onClick={() => handleNavClick("/home")} />
                    <NavItem icon={Home} imgSrc={MySkillsIcon} label="My Skills" path="/my-skills" onClick={() => handleNavClick("/my-skills")} />
                    <NavItem icon={Home} imgSrc={MyBusinessIcon} label="My Business" path="/my-business" onClick={() => handleNavClick("/my-business")} />
                  </>
                )}
              </div>

              {/* ── Notification Bell ── */}
              <button
                onClick={handleNotificationClick}
                className="relative p-1 text-gray-700 transition-all duration-300 hover:text-primary hover:scale-110 hover:drop-shadow-lg"
              >
                <Bell className="w-6 h-6 hover:animate-pulse" />
                {unreadCount > 0 && (
                  <div className="absolute top-0 right-0 transform translate-x-1/4 -translate-y-1/4">
                    <span className="relative flex h-5 w-5 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white border-2 border-white">
                      {unreadCount > 99 ? "99+" : unreadCount}
                    </span>
                  </div>
                )}
              </button>

              {/* ── Account Toggle — desktop only ── */}
              {isAuthenticated && (
                <div className="hidden lg:flex items-center">
                  <div className="relative flex items-center bg-gray-100 rounded-full p-1 h-10 w-36 transition-all duration-300 hover:shadow-lg hover:ring-2 hover:ring-primary/30">
                    <div
                      className={`absolute top-1 left-1 h-8 w-[calc(50%-0.25rem)] bg-primary rounded-full transition-transform duration-300 ${accountType === "user" ? "translate-x-0" : "translate-x-full"
                        }`}
                    />
                    <button
                      onClick={() => handleSwitchAccount("user")}
                      className={`relative z-10 w-1/2 text-xs font-semibold ${accountType === "user" ? "text-white" : "text-primary"
                        }`}
                    >
                      Customer
                    </button>
                    <button
                      onClick={() => handleSwitchAccount("worker")}
                      className="relative z-10 w-1/2 text-xs font-semibold transition-colors duration-200 hover:text-white"
                    >
                      Worker
                    </button>
                  </div>
                </div>
              )}

              {/* ── Login button (unauthenticated) ── */}
              {!isAuthenticated && (
                <Button
                  variant="gradient-blue"
                  size="md"
                  onClick={() => setShowWelcomeModal(true)}
                >
                  Login
                </Button>
              )}

              {/* ── Profile avatar — desktop only when authenticated ── */}
              {isAuthenticated && (
                <button
                  onClick={handleProfileClick}
                  className="hidden lg:flex items-center justify-center w-10 h-10 rounded-full overflow-hidden border-2 border-transparent transition-all duration-300 hover:border-primary hover:scale-110 hover:shadow-xl flex-shrink-0"
                  title={userName}
                >
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt={userName}
                      className="w-full h-full object-cover rounded-full"
                      onError={() => setProfilePic(null)}
                    />
                  ) : (
                    <div
                      className="w-full h-full rounded-full flex items-center justify-center text-white font-bold text-base select-none"
                      style={{ backgroundColor: "#00598a" }}
                    >
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </button>
              )}

              {/* ── Hamburger toggle — mobile only ── */}
              <button
                className="flex lg:hidden items-center justify-center text-gray-700 p-1"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                aria-label="Toggle menu"
              >
                {isMobileMenuOpen
                  ? <X className="w-6 h-6" />
                  : <Menu className="w-6 h-6" />
                }
              </button>

            </div>
          </div>
        </div>

        {/* ================= MOBILE MENU ================= */}
        {isMobileMenuOpen && (
          <div className="lg:hidden bg-white border-t shadow-md">

            {/* ── Account type toggle — mobile ── */}
            {isAuthenticated && (
              <div className="px-4 py-3 border-b border-gray-100">
                <div className="relative flex items-center bg-gray-100 rounded-full p-1 h-10 w-full max-w-xs mx-auto">
                  <div
                    className={`absolute top-1 left-1 h-8 w-[calc(50%-0.25rem)] bg-primary rounded-full transition-transform duration-300 ${accountType === "user" ? "translate-x-0" : "translate-x-full"
                      }`}
                  />
                  <button
                    onClick={() => handleSwitchAccount("user")}
                    className={`relative z-10 w-1/2 text-sm font-semibold ${accountType === "user" ? "text-white" : "text-primary"
                      }`}
                  >
                    Customer
                  </button>
                  <button
                    onClick={() => handleSwitchAccount("worker")}
                    className={`relative z-10 w-1/2 text-sm font-semibold ${accountType === "worker" ? "text-white" : "text-primary"
                      }`}
                  >
                    Worker
                  </button>
                </div>
              </div>
            )}

            {/* ── Nav links ── */}
            {accountType === "user" ? (
              <>
                <MobileNavItem icon={Home} label="Home" path="/home" onClick={() => handleNavClick("/home")} />
                <MobileNavItem icon={Home} imgSrc={ListedJobsIcon} label="Jobs" path="/listed-jobs" onClick={() => handleNavClick("/listed-jobs")} />
              </>
            ) : (
              <>
                <MobileNavItem icon={Home} label="Home" path="/home" onClick={() => handleNavClick("/home")} />
                <MobileNavItem icon={Home} imgSrc={MySkillsIcon} label="My Skills" path="/my-skills" onClick={() => handleNavClick("/my-skills")} />
                <MobileNavItem icon={Home} imgSrc={MyBusinessIcon} label="My Business" path="/my-business" onClick={() => handleNavClick("/my-business")} />
              </>
            )}

            {/* ── Mobile profile row (authenticated) ── */}
            {isAuthenticated && (
              <button
                onClick={handleProfileClick}
                className="group w-full text-left px-4 py-3 flex items-center gap-3 text-gray-700 hover:bg-gray-100 hover:text-primary transition-all duration-200"
              >
                <div className="w-8 h-8 rounded-full overflow-hidden border-2 border-gray-200 flex-shrink-0">
                  {profilePic ? (
                    <img
                      src={profilePic}
                      alt={userName}
                      className="w-full h-full object-cover"
                      onError={() => setProfilePic(null)}
                    />
                  ) : (
                    <div
                      className="w-full h-full flex items-center justify-center text-white font-bold text-sm"
                      style={{ backgroundColor: "#00598a" }}
                    >
                      {userName.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <span className="transition-all duration-200 group-hover:translate-x-1 font-medium">
                  {userName}
                </span>
              </button>
            )}

            {/* ── Mobile notification item with count ── */}
            <button
              onClick={handleNotificationClick}
              className={`group w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-200 ${location.pathname === "/notifications"
                ? "bg-primary/10 text-primary font-semibold"
                : "text-gray-700 hover:bg-gray-100 hover:text-primary"
                }`}
            >
              <div className="relative">
                <Bell className="w-5 h-5 transition-transform duration-200 group-hover:scale-150" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                    {unreadCount > 9 ? "9+" : unreadCount}
                  </span>
                )}
              </div>
              <span className="transition-all duration-200 group-hover:translate-x-1">
                Notifications
              </span>
              {unreadCount > 0 && (
                <span className="ml-auto text-xs font-semibold text-red-500">
                  {unreadCount} unread
                </span>
              )}
            </button>

            {/* ── Mobile login button (unauthenticated) ── */}
            {!isAuthenticated && (
              <div className="px-4 py-3 border-t border-gray-100">
                <Button
                  variant="gradient-blue"
                  size="md"
                  className="w-full"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    setShowWelcomeModal(true);
                  }}
                >
                  Login
                </Button>
              </div>
            )}

          </div>
        )}
      </header>

      {/* ================= AUTH MODALS ================= */}
      <WelcomePage
        isOpen={showWelcomeModal}
        onClose={() => setShowWelcomeModal(false)}
        onOpenOTP={openOTPModal}
      />
      {showOTPModal && (
        <div
          className="fixed top-0 left-0 right-0 bottom-0 w-screen h-screen z-[9999] flex items-center justify-center"
          style={{ backdropFilter: "blur(5px)", backgroundColor: "rgba(0, 0, 0, 0.65)" }}
        >
          <div className="absolute inset-0 w-screen h-screen" onClick={() => setShowOTPModal(false)} />
          <div className="relative z-10">
            <OTPVerification
              email={phoneNumber}
              onBack={() => setShowOTPModal(false)}
              onClose={handleLoginSuccess}
              onContinue={handleLoginSuccess}
              onResend={() => { }}
            />
          </div>
        </div>
      )}

      {/* ================= PROFILE SIDEBAR ================= */}
      {showProfileSidebar && (
        <div className="fixed inset-0 z-[9999] flex justify-end" style={{ backdropFilter: "blur(3px)" }}>
          <div
            className="fixed inset-0 bg-black/40"
            onClick={() => setShowProfileSidebar(false)}
          />
          <div className="relative w-80 h-full bg-white shadow-xl transform transition-transform duration-300 translate-x-0 z-10">
            {/* ✅ Pass the fresh userName from API, not stale localStorage */}
            <ProfileSidebar
              user={{ name: userName }}
              profilePic={profilePic}
              onNavigate={(path) => {
                navigate(path);
                setShowProfileSidebar(false);
              }}
              onLogout={() => {
                logout();
                setProfilePic(null);
                setUserName("User");
                setShowProfileSidebar(false);
                setUnreadCount(0);
              }}
            />
          </div>
        </div>
      )}
    </>
  );
};

/* ================= HELPERS ================= */
interface NavItemProps {
  icon: any;
  imgSrc?: string;
  label: string;
  path: string;
  onClick?: () => void;
}

const NavItem: React.FC<NavItemProps> = ({ icon: Icon, imgSrc, label, path, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <button
      onClick={onClick}
      className={`group flex items-center gap-2 px-3 py-1.5 rounded-xl text-sm font-medium transition-all duration-300 ${isActive
        ? "bg-[#00598a]/15 text-[#00598a] shadow-sm"
        : "text-gray-700 hover:bg-[#00598a]/10"
        }`}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={label}
          className="w-5 h-5 object-contain transition-transform duration-300 group-hover:scale-110"
        />
      ) : (
        <Icon className="w-5 h-5 transition-transform duration-300 group-hover:scale-110" />
      )}
      <span className="text-gray-700 transition-colors duration-300 group-hover:text-[#00598a]">
        {label}
      </span>
    </button>
  );
};

const MobileNavItem: React.FC<NavItemProps> = ({ icon: Icon, imgSrc, label, path, onClick }) => {
  const location = useLocation();
  const isActive = location.pathname === path;

  return (
    <button
      onClick={onClick}
      className={`group w-full text-left px-4 py-3 flex items-center gap-3 transition-all duration-200 ${isActive
        ? "bg-primary/10 text-primary font-semibold"
        : "text-gray-700 hover:bg-gray-100 hover:text-primary"
        }`}
    >
      {imgSrc ? (
        <img
          src={imgSrc}
          alt={label}
          className="w-5 h-5 object-contain transition-transform duration-200 group-hover:scale-150"
        />
      ) : (
        Icon && (
          <Icon className="w-5 h-5 transition-transform duration-200 group-hover:scale-150" />
        )
      )}
      <span className="transition-all duration-200 group-hover:translate-x-1">{label}</span>
    </button>
  );
};

export default Navbar;