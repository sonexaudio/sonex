/*
    This file is used to log activities to the database.
    It is also used to log activities via logger for auditing.
*/

import { prisma } from "../lib/prisma";
import logger from "./logger";
import type { User } from "../generated/prisma";

export type ActivityType =
    | "subscription"
    | "project"
    | "user"
    | "client"
    | "file"
    | "payment"
    | "comment"
    | "folder"
    | "other";

export interface ActivityLogData {
    userId: string;
    action: string;
    targetType: ActivityType;
    targetId?: string;
    metadata?: Record<string, any>;
    user?: User | null; // Optional user object for additional context
}

/**
 * Creates an activity record in the database and logs it using Winston
 * @param data Activity log data including user, action, and metadata
 * @returns Promise<void>
 */
export async function logActivity(data: ActivityLogData): Promise<void> {
    const { userId, action, targetType, targetId, metadata, user } = data;

    try {
        // Create activity record in database
        const activity = await prisma.activity.create({
            data: {
                userId,
                action,
                targetType,
                targetId,
                metadata
            },
        });

        // Log to Winston with structured data
        logger.info(`Activity logged: ${action}`, {
            activityId: activity.id,
            userId,
            action,
            targetType,
            targetId,
            metadata,
            userEmail: user?.email, // Include user email if available
            timestamp: new Date().toISOString(),
        });
    } catch (error) {
        // Log error but don't throw to prevent disrupting the main flow
        logger.error("Failed to log activity", {
            error: error instanceof Error ? error.message : "Unknown error",
            userId,
            action,
            targetType,
            targetId,
            metadata,
        });
    }
}

/**
 * Helper function to create standardized activity messages
 */
export function createActivityMessage(action: string, details?: string): string {
    return details ? `${action}: ${details}` : action;
}