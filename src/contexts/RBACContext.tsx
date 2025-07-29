import React, { createContext, useContext, ReactNode } from 'react';
import { usePermissions } from '@/hooks/usePermissions';

interface RBACContextType {
  hasPermission: (permission: string) => boolean;
  hasRole: (role: string) => boolean;
  hasAnyRole: (roles: string[]) => boolean;
  hasResourcePermission: (resource: string, action: string) => boolean;
  isAdmin: () => boolean;
  isSuperAdmin: () => boolean;
  userRoles: any[];
  permissions: any[];
  loading: boolean;
  refetchPermissions: () => void;
}

const RBACContext = createContext<RBACContextType | undefined>(undefined);

export const useRBAC = () => {
  const context = useContext(RBACContext);
  if (!context) {
    throw new Error('useRBAC must be used within an RBACProvider');
  }
  return context;
};

interface RBACProviderProps {
  children: ReactNode;
}

export const RBACProvider: React.FC<RBACProviderProps> = ({ children }) => {
  const permissions = usePermissions();

  return (
    <RBACContext.Provider value={permissions}>
      {children}
    </RBACContext.Provider>
  );
};