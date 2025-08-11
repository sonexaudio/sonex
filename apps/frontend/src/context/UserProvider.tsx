import type React from "react";
import { createContext } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMutation, useQuery, useQueryClient, type QueryObserverResult } from "@tanstack/react-query";
import { fetchUserInfo, updateUser } from "../hooks/query-functions/user";
import type { User } from "../types/users";

interface UserContextType {
    user: User | null;
    loading: boolean;
    updateUser: (params: { userId: string, userData: Partial<User>; }) => Promise<unknown>;
    refetchUser: () => Promise<QueryObserverResult<unknown, Error>>;
    isError: boolean;
    error: Error | null;
}

export const UserProviderContext = createContext<UserContextType | null>(null);

export const UserProvider: React.FC<{ children: React.ReactNode; }> = ({
    children
}) => {
    const queryClient = useQueryClient();
    const { user } = useAuth();

    const { isLoading, data: userData, isError: hasUserFetchError, refetch, error: userFetchError } = useQuery({
        queryKey: ["user", user?.id],
        queryFn: fetchUserInfo,
        enabled: !!user?.id
    });

    const { isPending, isError: hasUpdateError, mutateAsync, error: updateError } = useMutation({
        mutationFn: ({ userId, userData }: { userId: string, userData: Partial<User>; }) => updateUser(userId, userData),
        onSuccess: () => queryClient.invalidateQueries({ queryKey: ["user", user?.id] })
    });

    const contextValue: UserContextType = {
        user: userData,
        loading: isLoading || isPending,
        updateUser: mutateAsync,
        refetchUser: refetch,
        isError: hasUserFetchError || hasUpdateError,
        error: userFetchError || updateError
    };

    return (
        <UserProviderContext.Provider value={contextValue}>
            {children}
        </UserProviderContext.Provider>
    );
};