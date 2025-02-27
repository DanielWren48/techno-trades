import { authApi } from './requests';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { INITIAL_USER, useUserContext } from '@/context/AuthContext';
import {
    IUserResponse,
    AuthResponse,
    ErrorResponse,
    LoginData,
    LoginResponse,
    RegisterData,
    RegisterResponse,
    VerifyAccountData,
    EmailData,
    SetNewPasswordData,
    SignInWithOtp,
    GoogleLoginData
} from './types';
import { ACCOUNT_TYPE } from '@/types';

// React Query Hooks
export const useRegisterUser = () => {
    return useMutation<AuthResponse<RegisterResponse>, AuthResponse<ErrorResponse>, RegisterData>({
        mutationFn: authApi.register,
        onSuccess: (response) => {
            console.log({ response });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useVerifyAccountUser = () => {
    const queryClient = useQueryClient();
    const { setUser } = useUserContext();

    return useMutation<AuthResponse<IUserResponse>, AuthResponse<ErrorResponse>, VerifyAccountData>({
        mutationFn: authApi.verifyAccount,
        onSuccess: (response) => {
            console.log("success")
            if (response.status === 'success' && response.data) {
                const user = response.data
                console.log(user)
                setUser(user);
                // Invalidate and refetch user session
                queryClient.invalidateQueries({ queryKey: ['user-session'] });
            }
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useResendVerificationEmail = () => {
    return useMutation<AuthResponse<{ otp: string }>, AuthResponse<ErrorResponse>, EmailData>({
        mutationFn: authApi.resendVerificationEmail,
        onSuccess: (response) => {
            console.log({ response });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useSendPasswordResetOtp = () => {
    return useMutation<AuthResponse<{ otp: string }>, AuthResponse<ErrorResponse>, EmailData>({
        mutationFn: authApi.sendPasswordResetOtp,
        onSuccess: (response) => {
            console.log({ response });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useSetNewPassword = () => {
    return useMutation<AuthResponse<null>, AuthResponse<ErrorResponse>, SetNewPasswordData>({
        mutationFn: authApi.setNewPassword,
        onSuccess: (response) => {
            console.log({ response });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useSendLoginOtp = () => {
    return useMutation<AuthResponse<{ otp: string }>, AuthResponse<ErrorResponse>, EmailData>({
        mutationFn: authApi.sendLoginOtp,
        onSuccess: (response) => {
            console.log({ response });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useLoginUser = () => {
    const queryClient = useQueryClient();
    const { setUser, setIsAuthenticated, setIsStaff } = useUserContext();

    return useMutation<AuthResponse<LoginResponse>, AuthResponse<ErrorResponse>, LoginData>({
        mutationFn: authApi.login,
        onSuccess: (response) => {
            if (response.status === 'success' && response.data) {
                const user = response.data.user
                setUser(user);
                setIsAuthenticated(true);
                setIsStaff(user.accountType === ACCOUNT_TYPE.STAFF);

                // Invalidate and refetch user session
                queryClient.invalidateQueries({ queryKey: ['user-session'] });
            }
        },
        onError: (error) => {
            console.error('Login error:', error);
        }
    });
};

export const useGoogleLogin = () => {
    const queryClient = useQueryClient();
    const { setUser, setIsAuthenticated, setIsStaff } = useUserContext();

    return useMutation<AuthResponse<LoginResponse>, AuthResponse<ErrorResponse>, GoogleLoginData>({
        mutationFn: authApi.google,
        onSuccess: (response) => {
            if (response.status === 'success' && response.data) {
                const user = response.data.user
                setUser(user);
                setIsAuthenticated(true);
                setIsStaff(user.accountType === ACCOUNT_TYPE.STAFF);

                // Invalidate and refetch user session
                queryClient.invalidateQueries({ queryKey: ['user-session'] });
            }
        },
        onError: (error) => {
            console.error('Login error:', error);
        }
    });
};

export const useSignInWithOtp = () => {
    const queryClient = useQueryClient();
    const { setUser, setIsAuthenticated, setIsStaff } = useUserContext();

    return useMutation<AuthResponse<LoginResponse>, AuthResponse<ErrorResponse>, SignInWithOtp>({
        mutationFn: authApi.signInWithOtp,
        onSuccess: (response) => {
            if (response.status === 'success' && response.data) {
                const user = response.data.user
                setUser(user);
                setIsAuthenticated(true);
                setIsStaff(user.accountType === ACCOUNT_TYPE.STAFF);

                // Invalidate and refetch user session
                queryClient.invalidateQueries({ queryKey: ['user-session'] });
            }
        },
        onError: (error) => {
            console.error('Login error:', error);
        }
    });
};

export const useLogoutUser = () => {
    const queryClient = useQueryClient();
    const { setUser, setIsAuthenticated } = useUserContext();

    return useMutation<AuthResponse<null>, AuthResponse<ErrorResponse>>({
        mutationFn: authApi.logout,
        onSuccess: (response) => {
            if (response.status === 'success') {
                setIsAuthenticated(false);
                setUser(INITIAL_USER);
            }
        },
        onError: (error) => {
            console.error('Login error:', error);
        }
    });
};

export const useGetUserSession = () => {
    return useQuery({
        queryKey: ['user-session'],
        queryFn: authApi.validate,
    });
}