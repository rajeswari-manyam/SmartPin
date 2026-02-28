import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  ReactNode,
} from "react";

interface User {
  _id: string;
  email: string;
  phone?: string;
  name?: string;
  latitude?: string;
  longitude?: string;
  isVerified: boolean;
  role?: "USER" | "WORKER" | "user" | "worker"; // ✅ support both cases
  workerId?: string;
  hasWorkerProfile?: boolean;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
  loading: boolean;
  setWorkerProfile: (workerId: string, hasProfile: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  // 🔄 Restore auth on refresh / reopen
  useEffect(() => {
    try {
      const storedUser = localStorage.getItem("user");
      if (storedUser) {
        const parsedUser: User = JSON.parse(storedUser);

        // ✅ Restore role from localStorage if missing in stored user
        if (!parsedUser.role) {
          const storedRole = localStorage.getItem("role");
          if (storedRole) {
            parsedUser.role = storedRole as User["role"];
          }
        }

        setUser(parsedUser);
        setIsAuthenticated(true);

        // ✅ Re-sync workerId from user object to localStorage on restore
        if (parsedUser.workerId) {
          localStorage.setItem("workerId", parsedUser.workerId);
          localStorage.setItem("@worker_id", parsedUser.workerId);
        }

        // ✅ Re-sync role to localStorage on restore
        if (parsedUser.role) {
          localStorage.setItem("role", parsedUser.role);
        }

        console.log("🔄 User restored:", parsedUser);
      }
    } catch (error) {
      console.error("❌ Failed to restore auth:", error);
      localStorage.removeItem("user");
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ Login
  const login = (userData: User) => {
    // ✅ Merge role from localStorage if not present in userData
    const role = userData.role || (localStorage.getItem("role") as User["role"]) || "USER";
    const userWithRole: User = { ...userData, role };

    setUser(userWithRole);
    setIsAuthenticated(true);

    // ✅ Persist full user object including role
    localStorage.setItem("user", JSON.stringify(userWithRole));
    localStorage.setItem("userId", userWithRole._id);
    localStorage.setItem("userEmail", userWithRole.email);
    localStorage.setItem("role", role); // ✅ keep role in sync separately

    // ✅ If user already has a workerId, persist it immediately
    if (userWithRole.workerId) {
      localStorage.setItem("workerId", userWithRole.workerId);
      localStorage.setItem("@worker_id", userWithRole.workerId);
    }

    console.log("✅ User logged in:", userWithRole);
  };

  // ✅ Update Worker Profile Status
  const setWorkerProfile = (workerId: string, hasProfile: boolean) => {
    if (user) {
      const updatedUser: User = {
        ...user,
        workerId,
        hasWorkerProfile: hasProfile,
      };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      localStorage.setItem("workerId", workerId);
      localStorage.setItem("@worker_id", workerId);
      console.log("✅ Worker profile updated:", workerId, hasProfile);
    }
  };

  // ❌ Logout
  const logout = () => {
    setUser(null);
    setIsAuthenticated(false);
    localStorage.removeItem("user");
    localStorage.removeItem("userEmail");
    localStorage.removeItem("userId");
    localStorage.removeItem("workerId");
    localStorage.removeItem("@worker_id");
    localStorage.removeItem("role"); // ✅ clear role on logout
    localStorage.removeItem("fcmToken");
    localStorage.removeItem("token");
    console.log("❌ User logged out");
  };

  return (
    <AuthContext.Provider
      value={{ isAuthenticated, user, login, logout, loading, setWorkerProfile }}
    >
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
};