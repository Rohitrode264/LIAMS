import type { Response, NextFunction } from "express";
import type { AuthRequest } from "../middleware/auth.middleware.js";
import * as applicationService from "../services/application.service.js";
import { ApplicationStatus } from "../models/Application.js";
import { createApplicationSchema, reviewApplicationSchema } from "../validations/application.validation.js";

export async function createApplication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const dto = createApplicationSchema.parse(req.body);
        const application = await applicationService.createApplication(req.user.id, dto);
        res.status(201).json({ success: true, data: application });
    } catch (error) {
        next(error);
    }
}

export async function getMyApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const applications = await applicationService.getMyApplications(req.user.id);
        res.json({ success: true, data: applications });
    } catch (error) {
        next(error);
    }
}

export async function getProfessorQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const applications = await applicationService.getReviewQueue(
            req.user.id,
            ApplicationStatus.PENDING_PROFESSOR
        );
        res.json({ success: true, data: applications });
    } catch (error) {
        next(error);
    }
}

export async function getHODQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const applications = await applicationService.getReviewQueue(
            req.user.id,
            ApplicationStatus.PENDING_HOD
        );
        res.json({ success: true, data: applications });
    } catch (error) {
        next(error);
    }
}

export async function getAccountsQueue(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const applications = await applicationService.getReviewQueue(
            req.user.id,
            ApplicationStatus.PENDING_ACCOUNTS
        );
        res.json({ success: true, data: applications });
    } catch (error) {
        next(error);
    }
}

export async function reviewApplication(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const dto = reviewApplicationSchema.parse(req.body);
        const application = await applicationService.reviewApplication(
            req.params.id as string,
            req.user.id,
            dto
        );
        res.json({ success: true, data: application });
    } catch (error) {
        next(error);
    }
}

export async function getApplicationById(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const result = await applicationService.getApplicationById(req.params.id as string);
        res.json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

export async function getAllApplications(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const applications = await applicationService.getAllApplications();
        res.json({ success: true, data: applications });
    } catch (error) {
        next(error);
    }
}

export async function getReviewHistory(req: AuthRequest, res: Response, next: NextFunction) {
    try {
        const applications = await applicationService.getReviewHistory(
            req.user.id,
            req.user.roles
        );
        res.json({ success: true, data: applications });
    } catch (error) {
        next(error);
    }
}
