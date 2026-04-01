import type { Response, NextFunction } from "express";
import type { AuthRequest } from "./auth.middleware.js";

// Ensure req.user matches our JWT payload structure
interface JwtPayload {
    id: string;
    roles: string[];
}

export function authorizeRoles(...allowedRoles: string[]) {
    return (req: AuthRequest, res: Response, next: NextFunction) => {
        // Check if the user object exists from the auth middleware
        if (!req.user || !req.user.roles) {
            return res.status(403).json({ message: "Forbidden: No role assigned" });
        }

        // Check if the user has any of the allowed roles
        const userRoles: string[] = req.user.roles;
        const hasRole = allowedRoles.some((role) => userRoles.includes(role));

        if (!hasRole) {
            return res.status(403).json({ message: "Forbidden: Insufficient permissions" });
        }

        next();
    };
}
