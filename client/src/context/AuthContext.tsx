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
};

const AuthContext = createContext<IAuthContext>(defaultAuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<IUser>(INITIAL_USER);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isStaff, setIsStaff] = useState(false);
  const [_, setIsLoading] = useState(false);
  const { data, status, isLoading } = useGetUserSession();

  const checkAuthUser = async (): Promise<boolean> => {
    setIsLoading(isLoading);
    try {
      if (!isLoading && data?.data && status === 'success') {
        let user = data.data.user
        setUser(user);
        setIsStaff(user.accountType === ACCOUNT_TYPE.STAFF);
        setIsAuthenticated(true);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Authentication check failed", error);
      return false;
    } finally {
      setIsLoading(isLoading);
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
