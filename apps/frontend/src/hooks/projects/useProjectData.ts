/* 
    This hook handles fetching the project info (files, folders, comments, etc.). Also manages loading, error, and refresh logic.
    
    Since this hook will be managed by the ProjectProvider, it will be provided with the following parameters:
    - Access Level (from useProjectAccess)
    - Project ID (from useParams)

    This hook only works when these two parameters are provided. If not, it will simply return undefined until the data is available or provided.

    Here's a breakdown of the data as it comes from the backend:

    PROJECT DATA:
    - Project details (title, description, due date, etc.)
    - Associated Clients and their complete data
    - Associated Files and their complete data (name, size, type, etc.)
    - The project owner's email, first name, and last name (probably should include the user's ID as well for easier access)

    FOLDER DATA:
    - Folders associated with the project (if any) and their details
    - All folders functions, including creating, updating, deleting, and fetching folders. this comes from the useFolders hook I built earlier.

    ACTIVITY DATA:
    - All activity related to the project, including comments, file uploads, folder updates, etc.
    - The functions to manage activity data, which come from the useActivity hook I built earlier.

    COMMENT DATA:
    - All comments related to the project, including replies and likes
    - The functions to manage comments, which come from the useComments hook I built earlier.

    TRANSACTION DATA:
    - All transactions related to the project, including payments, invoices, etc.
    - The functions to manage transactions, which come from the useTransactions hook I built earlier.

    SUBSCRIPTION DATA:
    - Since Sonex relies on a user's active subscription or free account, Neither the client nor the user can access the project if the user's account is over storage, in grace period, or has an expired subscription.
    
*/
import { useAuth } from "../useAuth";
import useClientAuth from "../useClientAuth";
import { useFolders } from "../useFolders";
import { useTransactions } from "../useTransactions";
import { useSubscription } from "../useSubscription";
import { useQuery } from "@tanstack/react-query";
import { fetchProjectById } from "../query-functions/projects";
import useFiles from "../useFiles";
import { useComments } from "../useComments";
import { useActivities } from "../useActivities";
import type { DetailedProject } from "../../types/projects";
import type { User } from "../../types/users";
import type { Client } from "../useClients";
import type { Subscription } from "../../context/SubscriptionProvider";

export interface SingleProjectViewData {
    project: DetailedProject | null;
    clients: Client[];
    files: ReturnType<typeof useFiles>;
    folders: ReturnType<typeof useFolders>;
    activities: ReturnType<typeof useActivities>;
    comments: ReturnType<typeof useComments>;
    transactions: ReturnType<typeof useTransactions>;
    user: User | null;
    client: Client | null;
    subscription: Subscription | null;
    isLoading: boolean;
    error: string | Error | null;
}

export function useProjectData(projectId: string | undefined) {
    const files = useFiles();
    const folders = useFolders();
    const activities = useActivities(projectId!);
    const comments = useComments();
    const transactions = useTransactions();
    const { user, loading: userLoading } = useAuth();
    const { client, loading: clientLoading } = useClientAuth();
    const { subscription, loading: subscriptionLoading } = useSubscription()

    // get project details
    /* 
        Includes:
        files
        clients
        partial user details
    */
    const projectQuery = useQuery({
        queryKey: ["project", projectId],
        queryFn: () => fetchProjectById(projectId as string),
        enabled: !!projectId
    });

    const isLoading =
        projectQuery.isLoading ||
        files.isLoading ||
        folders.isLoading ||
        comments.loading ||
        transactions.isLoading ||
        userLoading ||
        clientLoading ||
        subscriptionLoading

    console.log("Project is loading", projectQuery.isLoading);
    console.log("Files are loading", files.isLoading);
    console.log("Folders are loading", folders.isLoading);
    console.log("Comments are loading", comments.loading);
    console.log("Transactions are loading", transactions.isLoading);
    console.log("User is loading", userLoading);
    console.log("Client is loading", clientLoading);
    console.log("Subscription is loading", subscriptionLoading)

    const error =
        projectQuery.error ||
        files.error ||
        folders.error ||
        comments.error ||
        transactions.error


    // Single object for ProjectProvider
    return {
        // Project details
        project: projectQuery.data,

        // Project resources (state + functions for project provider)
        clients: projectQuery.data?.clients || [],
        files,
        folders,
        comments,
        transactions,

        // Activities
        activities,

        // current auth/subscription
        user,
        client,
        subscription,

        // loading/error states
        isLoading,
        error

    };
}