import { usersApi } from './requests';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
    BaseUserResponse,
    ErrorResponse,
    UpdateUserEmail,
    UpdateUserProfile,
} from './types';
import { useUserContext } from '@/context/AuthContext';
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
        queryFn: () => usersApi.getAllUsers(),
    });
};


// React Mutation Hooks
export const useSendEmailChangeOtp = () => {
    return useMutation({
        mutationFn: usersApi.sendEmailChangeOtp,
        onError: (error) => {
            console.error('Validation error:', error);
        }
    });
};

export const useUpdateUserProfile = () => {
    const queryClient = useQueryClient();
    const { setUser } = useUserContext();

    return useMutation<BaseUserResponse<IUser>, BaseUserResponse<ErrorResponse>, UpdateUserProfile>({
        mutationFn: usersApi.updateUserDetails,
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

    return useMutation<BaseUserResponse<IUser>, BaseUserResponse<ErrorResponse>, UpdateUserEmail>({
        mutationFn: usersApi.updateUserEmail,
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