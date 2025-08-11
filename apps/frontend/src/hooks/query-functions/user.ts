import api from "../../lib/axios";
import { authClient } from "../../lib/client-auth";
import type { AuthUser, User } from "../../types/users";

export async function fetchUserInfo() {
    const { data } = await api.get("/users/current");
    return data.data.user;
}

export async function updateUserAuth(userData: Partial<AuthUser>) {

    const { data } = await authClient.updateUser({
        name: userData.name,
        image: userData.image ?? null
    });

    return data;
}

export async function updateUser(userId: string, userData: Partial<User>) {
    const { data } = await api.put(`/users/${userId}`, userData);
    return data.data.user;
};