// import { authApi } from './requests';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { INITIAL_USER, useUserContext } from '@/context/AuthContext';
import {
    IUserResponse,
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
} from '../types/auth';
import { ACCOUNT_TYPE } from '@/types';
import { authApiService, BaseResponse } from '../client';

// React Query Hooks
export const useRegisterUser = () => {
    return useMutation<BaseResponse<RegisterResponse>, BaseResponse<ErrorResponse>, RegisterData>({
        mutationFn: authApiService.register,
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

    return useMutation<BaseResponse<IUserResponse>, BaseResponse<ErrorResponse>, VerifyAccountData>({
        mutationFn: authApiService.verifyAccount,
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
    return useMutation<BaseResponse<{ otp: string }>, BaseResponse<ErrorResponse>, EmailData>({
        mutationFn: authApiService.resendVerificationEmail,
        onSuccess: (response) => {
            console.log({ response });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useSendPasswordResetOtp = () => {
    return useMutation<BaseResponse<{ otp: string }>, BaseResponse<ErrorResponse>, EmailData>({
        mutationFn: authApiService.sendPasswordResetOtp,
        onSuccess: (response) => {
            console.log({ response });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useSetNewPassword = () => {
    return useMutation<BaseResponse<null>, BaseResponse<ErrorResponse>, SetNewPasswordData>({
        mutationFn: authApiService.setNewPassword,
        onSuccess: (response) => {
            console.log({ response });
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useSendLoginOtp = () => {
    return useMutation<BaseResponse<{ otp: string }>, BaseResponse<ErrorResponse>, EmailData>({
        mutationFn: authApiService.sendLoginOtp,
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

    return useMutation<BaseResponse<LoginResponse>, BaseResponse<ErrorResponse>, LoginData>({
        mutationFn: authApiService.login,
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

    return useMutation<BaseResponse<LoginResponse>, BaseResponse<ErrorResponse>, GoogleLoginData>({
        mutationFn: authApiService.google,
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

    return useMutation<BaseResponse<LoginResponse>, BaseResponse<ErrorResponse>, SignInWithOtp>({
        mutationFn: authApiService.signInWithOtp,
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

    return useMutation<BaseResponse<null>, BaseResponse<ErrorResponse>>({
        mutationFn: authApiService.logout,
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
        queryFn: authApiService.validateUser,
        retry: false,
        refetchOnWindowFocus: false,
    });
};