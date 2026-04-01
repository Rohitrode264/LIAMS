import { UserRole } from "../roles.js";

declare global {
    namespace Express {
        interface Request {
            user?: {
                id: string;
                roles: UserRole[];
            };
        }
    }
}

export { };
