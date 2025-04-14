import {
  Dispatch,
  ReactNode,
  SetStateAction,
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";
import { ACCOUNT_TYPE, AUTH_TYPE, IUser } from "@/types";
import { useGetUserSession } from "@/api/auth/queries";
import { authApiService } from "@/api/client";
import { useQueryClient } from "@tanstack/react-query";

export const INITIAL_USER: IUser = {
  _id: '',
  firstName: '',
  lastName: '',
  email: '',
  avatar: undefined,
  authType: AUTH_TYPE.PASSWORD,
  accountType: ACCOUNT_TYPE.BUYER,
  isActive: false,
  isEmailVerified: false
};

interface IAuthContext {
  user: IUser;
  setUser: Dispatch<SetStateAction<IUser>>;
  isLoading: boolean;
  isAuthenticated: boolean;
  isStaff: boolean;
  setIsAuthenticated: Dispatch<SetStateAction<boolean>>;
  setIsStaff: Dispatch<SetStateAction<boolean>>;
  checkAuthUser: () => Promise<boolean>;
  logout: () => void;
}

const defaultAuthContext: IAuthContext = {
  user: INITIAL_USER,
  isLoading: false,
  isAuthenticated: false,
  isStaff: false,
  setUser: () => { },
  setIsAuthenticated: () => { },
  setIsStaff: () => { },
  checkAuthUser: async () => false,
  logout: () => { }
};

const AuthContext = createContext<IAuthContext>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const queryClient = useQueryClient();

  // Get user session with react-query
  const { data, status, isLoading } = useGetUserSession();

  // Auth state change listener
  useEffect(() => {
    const unsubscribe = authApiService.onAuthStateChange((authenticated) => {
      if (!authenticated) {
        // Clear user state on auth failure
        setUser(INITIAL_USER);
        setIsAuthenticated(false);
        setIsStaff(false);

        // Invalidate the query to prevent retries
        queryClient.invalidateQueries({ queryKey: ['user-session'] });
      }
    });

    return unsubscribe;
  }, [queryClient]);

  // Check authentication status
  const checkAuthUser = async (): Promise<boolean> => {
    try {
      if (!isLoading && data?.data && status === 'success') {
        const user = data.data.user;
        setUser(user);
        setIsStaff(user.accountType === ACCOUNT_TYPE.STAFF);
        setIsAuthenticated(true);
        return true;
      }
      return false;
    } catch (error) {
      console.error("Authentication check failed", error);
      return false;
    }
  };

  // Logout function
  const logout = async () => {
    try {
      await authApiService.logout();
    } finally {
      // Clear auth state regardless of API response
      authApiService.clearAuthTokens();
      setUser(INITIAL_USER);
      setIsAuthenticated(false);
      setIsStaff(false);
      queryClient.invalidateQueries({ queryKey: ['user-session'] });
    }
  };

  useEffect(() => {
    checkAuthUser();
  }, [status, isLoading]);

  const value: IAuthContext = {
    user,
    setUser,
    isLoading,
    isAuthenticated,
    isStaff,
    setIsAuthenticated,
    setIsStaff,
    checkAuthUser,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useUserContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useUserContext must be used within an AuthProvider");
  }
  return context;
};
