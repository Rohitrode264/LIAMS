import type { Request, Response, NextFunction } from "express";

export interface CustomError extends Error {
    statusCode?: number;
    errorCode?: string;
}

export function errorHandler(
    err: CustomError,
    req: Request,
    res: Response,
    next: NextFunction
) {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    if (statusCode === 500) {
        console.error(`[Error Handler] ${err.message}`, err.stack);
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(err.errorCode && { errorCode: err.errorCode }),
    });
}
