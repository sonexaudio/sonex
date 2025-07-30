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

import { useCallback, useState } from "react";
import type { DetailedProject } from "../../types/projects";
import type { Client } from "../useClients";
import { useAuth } from "../useAuth";
import useClientAuth from "../useClientAuth";
import api from "../../lib/axios";
import type { ISonexFolder } from "../useFolders";
import type { Activity } from "../../pages/dashboard/account/AccountActivities";
import type { ISonexComment } from "../../types/comments";
import type { SonexFile } from "../../types/files";
import type { Transaction } from "../useTransactions";
import { useSubscription } from "../useSubscription";
import type { Subscription } from "../../context/SubscriptionProvider";

const LOADING_STATES = {
    IDLE: "idle",
    LOADING: "loading",
    SUCCESS: "success",
    ERROR: "error",
};

const LOADING_STATE_KEYS = {
    USER: "user",
    CLIENT: "client",
    PROJECT: "project",
    CLIENTS: "clients",
    FILES: "files",
    FOLDERS: "folders",
    COMMENTS: "comments",
    ACTIVITIES: "activities",
    TRANSACTIONS: "transactions",
    SUBSCRIPTION: "subscription",
};


export interface SingleProjectViewData {
    project: DetailedProject | null;
    clients: Client[];
    files: SonexFile[];
    folders: ISonexFolder[];
    activities: Activity[];
    comments: ISonexComment[];
    transactions: Transaction[];
    errors: Record<string, Error | null>;
    subscription?: Subscription | null; // Subscription data, if applicable

    isLoading: boolean;
    hasErrors: boolean;

    updateLoadingState: (key: keyof typeof LOADING_STATE_KEYS, state: typeof LOADING_STATES[keyof typeof LOADING_STATES]) => void;
    updateErrorState: (key: keyof typeof LOADING_STATE_KEYS, error: Error | null) => void;
    fetchAllProjectData: () => Promise<void>;
    refetchProject: () => Promise<void>;
    refetchFolders: () => Promise<void>;
    refetchActivities: () => Promise<void>;
    refetchComments: () => Promise<void>;
    refetchTransactions: () => Promise<void>;
    refetchOwnerSubscription: () => Promise<boolean | Subscription | null | undefined>;
}



export function useProjectData(projectId: string | undefined): SingleProjectViewData | undefined {
    const { user, loading: userLoading } = useAuth();
    const { client, loading: clientLoading } = useClientAuth();
    const { subscription, loading: subscriptionLoading, getProjectOwnerSubscription } = useSubscription();

    // Core project data state
    const [project, setProject] = useState<DetailedProject | null>(null);
    const [clients, setClients] = useState<Client[]>([]); //only owners can view all clients
    const [files, setFiles] = useState<SonexFile[]>([]); // Files associated with the project
    const [folders, setFolders] = useState<ISonexFolder[]>([]); // Folders associated with the project
    const [activities, setActivities] = useState<Activity[]>([]); // Activities related to the project
    const [comments, setComments] = useState<ISonexComment[]>([]); // Comments related to the project,
    const [transactions, setTransactions] = useState<Transaction[]>([]); // Transactions related to the project


    // Store a map of any errors that occur during data fetching
    const [errors, setErrors] = useState<Record<string, Error | null>>({});

    // Loading state for any data fetching operations
    const [loadingStates, setLoadingStates] = useState({
        [LOADING_STATE_KEYS.USER]: userLoading,
        [LOADING_STATE_KEYS.CLIENT]: clientLoading,
        [LOADING_STATE_KEYS.PROJECT]: LOADING_STATES.IDLE,
        [LOADING_STATE_KEYS.CLIENTS]: LOADING_STATES.IDLE,
        [LOADING_STATE_KEYS.FILES]: LOADING_STATES.IDLE,
        [LOADING_STATE_KEYS.FOLDERS]: LOADING_STATES.IDLE,
        [LOADING_STATE_KEYS.COMMENTS]: LOADING_STATES.IDLE,
        [LOADING_STATE_KEYS.ACTIVITIES]: LOADING_STATES.IDLE,
        [LOADING_STATE_KEYS.TRANSACTIONS]: LOADING_STATES.IDLE,
        [LOADING_STATE_KEYS.SUBSCRIPTION]: LOADING_STATES.IDLE,
    });

    // Utility function to set loading state and error handling
    const updateLoadingState = useCallback((key: keyof typeof loadingStates, state: typeof LOADING_STATES[keyof typeof LOADING_STATES]): void => {
        setLoadingStates((prev) => ({
            ...prev,
            [key]: state
        }));
    }, []);

    const updateErrorState = useCallback((key: keyof typeof errors, error: Error | null): void => {
        setErrors((prev) => ({
            ...prev,
            [key]: error
        }));
    }, []);

    // API Call functions
    const fetchProjectData = useCallback(async () => {
        if (!projectId) return;

        updateLoadingState("project", LOADING_STATES.LOADING);
        updateLoadingState("clients", LOADING_STATES.LOADING);
        updateLoadingState("files", LOADING_STATES.LOADING);

        try {
            const { data: { data } } = await api.get(`/projects/${projectId}`);

            if (!data.project) {
                setProject(null);
                return;
            }

            // Set the state of all that comes back from the API
            setProject(data.project);

            const projectClients = data.project.clients?.map((client) => ({
                ...client,
                ...client.client, // Assuming client data is nested under client
            })) || [];

            setClients(projectClients);
            setFiles(data.project.files || []);

            console.log("Got the project details!");
            updateLoadingState("project", LOADING_STATES.SUCCESS);
            updateLoadingState("clients", LOADING_STATES.SUCCESS);
            updateLoadingState("files", LOADING_STATES.SUCCESS);

            return data.project;
        } catch (error) {
            updateErrorState("project", error as Error);
            updateLoadingState("project", LOADING_STATES.ERROR);
            console.error("Error fetching project data:", error);
            throw error;
        } finally {
            console.error("Finished fetching project data");
        }
    },
        [
            projectId,
            user,
            client,
            updateLoadingState,
            updateErrorState
        ]);

    const fetchFolderData = useCallback(async () => {
        if (!projectId) return;

        updateLoadingState("folders", LOADING_STATES.LOADING);

        try {
            const { data: { data } } = await api.get(`/projects/${projectId}/folders`);

            if (!data.folders) {
                setFolders([]);
                return;
            }

            setFolders(data.folders);
            updateLoadingState("folders", LOADING_STATES.SUCCESS);
            return data.folders;
        } catch (error) {
            updateErrorState("folders", error as Error);
            updateLoadingState("folders", LOADING_STATES.ERROR);
            console.error("Error fetching folder data:", error);
            throw error;
        }

    }, [
        projectId,
        updateLoadingState,
        updateErrorState
    ]);

    const fetchActivities = useCallback(async () => {
        if (!projectId) return;
        updateLoadingState("activities", LOADING_STATES.LOADING);
        try {
            const {
                data: { data },
            } = await api.get(`/projects/${projectId}/activities`);
            setActivities(data.activities);
            updateLoadingState("activities", LOADING_STATES.SUCCESS);
            return data.activities;
        } catch (error) {
            updateErrorState("activities", error as Error);
            updateLoadingState("activities", LOADING_STATES.ERROR);
            throw error;
        }
    }, [projectId, updateLoadingState, updateErrorState]);

    const fetchComments = useCallback(async () => {
        if (!projectId) return;
        updateLoadingState("comments", LOADING_STATES.LOADING);
        try {
            const {
                data: { data },
            } = await api.get(`/projects/${projectId}/comments`);
            setComments(data.comments);
            updateLoadingState("comments", LOADING_STATES.SUCCESS);
            return data.comments;
        } catch (error) {
            updateErrorState("comments", error as Error);
            updateLoadingState("comments", LOADING_STATES.ERROR);
            throw error;
        }
    }, [projectId, updateLoadingState, updateErrorState]);

    const fetchTransactions = useCallback(async () => {
        if (!projectId) return;
        updateLoadingState("transactions", LOADING_STATES.LOADING);
        try {
            const {
                data: { data },
            } = await api.get(`/projects/${projectId}/transactions`);
            setTransactions(data.transactions);
            updateLoadingState("transactions", LOADING_STATES.SUCCESS);
            return data.transactions;
        } catch (error) {
            updateErrorState("transactions", error as Error);
            updateLoadingState("transactions", LOADING_STATES.ERROR);
            throw error;
        }
    }, [projectId, updateLoadingState, updateErrorState]);

    const fetchOwnerSubscription = useCallback(async () => {
        if (userLoading || clientLoading || subscriptionLoading) return;
        if (!user?.id && !client?.id && !project?.userId) return;
        if (user?.id) return subscription;

        if (client?.id) {
            updateLoadingState("subscription", LOADING_STATES.LOADING);
            try {
                await getProjectOwnerSubscription(project?.userId as string);
                updateLoadingState("subscription", LOADING_STATES.SUCCESS);
                return true;
            } catch (error) {
                updateErrorState("subscription", error as Error);
                updateLoadingState("subscription", LOADING_STATES.ERROR);
                console.error("Error fetching owner's subscription:", error);
                return false;
            }
        }
    }, []);

    // Function to fetch all project data
    const fetchAllProjectData = useCallback(async () => {
        if (!projectId) return;

        const promises = [
            fetchProjectData(),
            fetchFolderData(),
            fetchActivities(),
            fetchComments(),
            fetchTransactions(),
            fetchOwnerSubscription()
        ];

        await Promise.allSettled(promises).then((results) => {
            results.forEach((result) => {
                if (result.status === "rejected") {
                    console.error("Error in fetching project data:", result.reason);
                }
            });
        });
    }, [
        project,
        fetchProjectData,
        fetchFolderData,
        fetchActivities,
        fetchComments,
        fetchTransactions,
        fetchOwnerSubscription
    ]);

    // Functions to refetch data
    const refetchProject = useCallback(() => fetchProjectData(), [fetchProjectData]);
    const refetchFolders = useCallback(() => fetchFolderData(), [fetchFolderData]);
    const refetchActivities = useCallback(
        () => fetchActivities(),
        [fetchActivities],
    );
    const refetchComments = useCallback(() => fetchComments(), [fetchComments]);
    const refetchTransactions = useCallback(
        () => fetchTransactions(),
        [fetchTransactions],
    );
    const refetchOwnerSubscription = useCallback(
        () => fetchOwnerSubscription(),
        [fetchOwnerSubscription],
    );

    const isLoading = Object.values(loadingStates).some((state) => state === LOADING_STATES.LOADING);
    const hasErrors = Object.values(errors).length > 0;


    // Context values
    const contextValues: SingleProjectViewData = {
        // Core Project data
        project,
        clients,
        files,
        folders,
        comments,
        activities,
        transactions,
        subscription,
        errors,

        // computed values
        isLoading,
        hasErrors,

        // Functions
        fetchAllProjectData,
        refetchProject,
        refetchFolders,
        refetchActivities,
        refetchComments,
        refetchTransactions,
        refetchOwnerSubscription,

        // utilities
        updateLoadingState,
        updateErrorState
    };


    return contextValues;

}