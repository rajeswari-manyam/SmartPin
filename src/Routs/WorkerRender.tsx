import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useAccount } from "../context/AccountContext";
import { getWorkerWithSkills } from "../services/api.service";

interface Props {
  children: React.ReactNode;
}

const WorkerRedirectHandler: React.FC<Props> = ({ children }) => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const { accountType } = useAccount();
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    const runCheck = async () => {
      if (!isAuthenticated || accountType !== "worker") {
        setChecking(false);
        return;
      }

      const workerId =
        localStorage.getItem("workerId") ||
        localStorage.getItem("@worker_id");

      if (!workerId) {
        navigate("/worker-profile");
        return;
      }

      try {
        const res = await getWorkerWithSkills(workerId);
        if (!res?.worker) {
          navigate("/worker-profile");
        }
      } catch {
        navigate("/worker-profile");
      } finally {
        setChecking(false);
      }
    };

    runCheck();
  }, [isAuthenticated, accountType, navigate]);

  if (checking && isAuthenticated && accountType === "worker") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin h-10 w-10 border-b-2 border-blue-600 rounded-full" />
      </div>
    );
  }

  return <>{children}</>;
};

export default WorkerRedirectHandler;
