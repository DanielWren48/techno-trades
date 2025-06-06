import { BaseResponse, ErrorResponse, usersAiEndpoints } from '../client';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { UpdateUserEmail, UpdateUserPassword, UpdateUserProfile } from '../types/user';
import { INITIAL_USER, useUserContext } from '@/context/AuthContext';
import { IUser } from '@/types';

export enum QUERY_KEYS {
    //users keys
    GET_USER_BY_ID = "getUserById",
    GET_ALL_USER = "getAllUsers",
    SEND_EMAIL_CHNAGE_OTP = "sendEmailChangeOtp",
}


// React Query Hooks
export const useGetAllUsers = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_ALL_USER],
        queryFn: () => usersAiEndpoints.getAllUsers(),
    });
};


// React Mutation Hooks
export const useSendEmailChangeOtp = () => {
    return useMutation({
        mutationFn: usersAiEndpoints.sendEmailChangeOtp,
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
    const { setUser } = useUserContext();

    return useMutation<BaseResponse<IUser>, BaseResponse<ErrorResponse>, UpdateUserProfile>({
        mutationFn: usersAiEndpoints.updateUserDetails,
        onSuccess: (response) => {
            if (response.status === 'success' && response.data) {
                const user = response.data
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

export const useUpdateUserEmail = () => {
    const queryClient = useQueryClient();
    const { setUser } = useUserContext();

    return useMutation<BaseResponse<IUser>, BaseResponse<ErrorResponse>, UpdateUserEmail>({
        mutationFn: usersAiEndpoints.updateUserEmail,
        onSuccess: (response) => {
            if (response.status === 'success' && response.data) {
                const user = response.data
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

export const useUpdateUserPassword = () => {
    return useMutation<BaseResponse<IUser>, BaseResponse<ErrorResponse>, UpdateUserPassword>({
        mutationFn: usersAiEndpoints.updateUserPassword,
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useCloseUserAccount = () => {
    const { setUser, setIsAuthenticated } = useUserContext();

    return useMutation<BaseResponse<null>, BaseResponse<ErrorResponse>>({
        mutationFn: usersAiEndpoints.closeUserAccount,
        onSuccess: (response) => {
            if (response.status === 'success') {
                setIsAuthenticated(false);
                setUser(INITIAL_USER);
            }
        },
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
}