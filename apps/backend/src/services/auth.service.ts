import bcrypt from "bcryptjs";
import { parseUserName } from "../utils";
import { createNewUser } from "./user.service";
import type { NextFunction, Response, Request } from "express";
import passport from "passport";
import "../lib/passport/local";
import "../lib/passport/google";
import type { User } from "../generated/prisma";
import { sendErrorResponse, sendSuccessResponse } from "../utils/responses";

export type SignupData = {
    email: string;
    password: string;
    name: string;
};

export function getCurrentSessionUser(req: Request) {
    if (
        !req.user ||
        typeof req.isAuthenticated !== "function" ||
        !req.isAuthenticated()
    ) {
        return null;
    }

    return req.user;
}

export async function registerNewUser({ email, password, name }: SignupData) {
    const hashedPassword = await bcrypt.hash(password, 10);
    const displayName = parseUserName(name);

    const newUser = await createNewUser({
        email,
        firstName: displayName?.firstName,
        lastName: displayName?.lastName,
        hashedPassword,
    });

    return newUser;
}

export async function loginAndAuthenticateUser(
    req: Request,
    res: Response,
    next: NextFunction,
) {
    passport.authenticate("local", (err: unknown, user: User, info: unknown) => {
        if (err) {
            next(err);
            return;
        }

        if (!user) {
            sendErrorResponse(res, 400, info as string);
            return;
        }

        req.login(user, (err) => {
            if (err) {
                next(err);
                return;
            }

            sendSuccessResponse(res, { user });
        });
    })(req, res, next);
}
