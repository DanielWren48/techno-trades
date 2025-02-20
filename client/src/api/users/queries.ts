import { usersApi } from './requests';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { INITIAL_USER, useUserContext } from '@/context/AuthContext';
import {
    BaseUserResponse,
    ErrorResponse,
    IUserResponse,
} from './types';
import { ACCOUNT_TYPE } from '@/types';

export enum QUERY_KEYS {
    //users keys
    GET_USER_BY_ID = "getUserById",
    GET_ALL_USER = "getAllUsers",
}


// React Query Hooks
export const useGetAllUsers = () => {
    return useQuery({
        queryKey: [QUERY_KEYS.GET_ALL_USER],
        queryFn: () => usersApi.getAllUsers(),
    });
};
