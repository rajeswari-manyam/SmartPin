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
}

const AccountContext = createContext<AccountContextType | undefined>(undefined);

export const AccountProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { user } = useAuth();

    // Initialize from localStorage or user role
    const [accountType, setAccountTypeState] = useState<AccountType>(() => {
        const stored = localStorage.getItem('accountType');
        if (stored === 'user' || stored === 'worker') {
            return stored;
        }
        return user?.role || 'user';
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

    // Update account type when user changes (login/logout)
    useEffect(() => {
        if (user?.role) {
            const stored = localStorage.getItem('accountType');
            // Only update if no stored preference or if user just logged in
            if (!stored) {
                setAccountType(user.role);
            }
        }
        
        // Update profile status and ID from user object
        if (user?.hasWorkerProfile) {
            setHasWorkerProfile(true);
        }
        if (user?.workerId) {
            setWorkerProfileId(user.workerId);
        }
    }, [user]);

    return (
        <AccountContext.Provider value={{ 
            accountType, 
            setAccountType, 
            hasWorkerProfile, 
            setHasWorkerProfile,
            workerProfileId,
            setWorkerProfileId 
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
