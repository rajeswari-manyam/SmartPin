import React, { createContext, useContext, useState, useEffect } from 'react';
import { useAuth } from './AuthContext';

type AccountType = 'user' | 'worker';

interface AccountContextType {
    accountType: AccountType;
    setAccountType: (type: AccountType) => void;
    hasWorkerProfile: boolean;
    setHasWorkerProfile: (has: boolean) => void;
    workerProfileId: string | null;
    setWorkerProfileId: (id: string) => void;
    role: string; // ✅ expose role directly
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    // ✅ Normalize role helper (handles both "USER"/"user" and "WORKER"/"worker")
    const normalizeRole = (role?: string): AccountType => {
        if (!role) return 'user';
        return role.toLowerCase() === 'worker' ? 'worker' : 'user';
    };

    // Initialize accountType from localStorage or user role
    const [accountType, setAccountTypeState] = useState<AccountType>(() => {
        const stored = localStorage.getItem('accountType');
        if (stored === 'user' || stored === 'worker') {
            return stored;
        }
        // ✅ Fallback: check role from localStorage directly
        const storedRole = localStorage.getItem('role');
        if (storedRole) return normalizeRole(storedRole);
        return normalizeRole(user?.role);
    });

    // Track worker profile status
    const [hasWorkerProfile, setHasWorkerProfileState] = useState<boolean>(() => {
        const stored = localStorage.getItem('hasWorkerProfile');
        if (stored === 'true' || stored === 'false') {
            return stored === 'true';
        }
        return !!user?.hasWorkerProfile || !!localStorage.getItem('workerId');
    });

    // Track worker profile ID
    const [workerProfileId, setWorkerProfileIdState] = useState<string | null>(() => {
        return localStorage.getItem('workerId') || localStorage.getItem('@worker_id') || null;
    });

    // ✅ Expose current role (always in sync with accountType + user)
    const role = user?.role || localStorage.getItem('role') || accountType.toUpperCase();

    // Sync account type with localStorage
    const setAccountType = (type: AccountType) => {
        setAccountTypeState(type);
        localStorage.setItem('accountType', type);
    };

    // Sync worker profile status with localStorage
    const setHasWorkerProfile = (has: boolean) => {
        setHasWorkerProfileState(has);
        localStorage.setItem('hasWorkerProfile', String(has));
    };

    // Sync worker profile ID with localStorage
    const setWorkerProfileId = (id: string) => {
        setWorkerProfileIdState(id);
        localStorage.setItem('workerId', id);
        localStorage.setItem('@worker_id', id);
        setHasWorkerProfile(true);
    };

    // ✅ Update accountType and profile info when user changes (login/logout)
    useEffect(() => {
        if (user?.role) {
            const normalized = normalizeRole(user.role);
            const stored = localStorage.getItem('accountType');

            // Only update if no stored preference exists
            if (!stored) {
                setAccountType(normalized);
            }

            // ✅ Always sync role to localStorage from user
            localStorage.setItem('role', user.role);
        }

        // Update profile status and ID from user object
        if (user?.hasWorkerProfile) {
            setHasWorkerProfile(true);
        }
        if (user?.workerId) {
            setWorkerProfileId(user.workerId);
        }

        // ✅ On logout (user becomes null), reset to defaults
        if (!user) {
            setAccountTypeState('user');
            setHasWorkerProfileState(false);
            setWorkerProfileIdState(null);
        }
    }, [user]);

    return (
        <AccountContext.Provider value={{
            accountType,
            setAccountType,
            hasWorkerProfile,
            setHasWorkerProfile,
            workerProfileId,
            setWorkerProfileId,
            role, // ✅ expose role
        }}>
            {children}
        </AccountContext.Provider>
    );
};

export const useAccount = () => {
    const context = useContext(AccountContext);
    if (!context) {
        throw new Error('useAccount must be used within AccountProvider');
    }
    return context;
};