import mongoose from "mongoose";
import { Application, ApplicationStatus } from "../models/Application.js";
import { ApplicationLog, ActionType } from "../models/ApplicationLog.js";
import { findHierarchyByProfessor } from "./hierarchy.service.js";
import type { CreateApplicationDto, ReviewApplicationDto } from "../validations/application.validation.js";

export async function createApplication(studentId: string, dto: CreateApplicationDto) {
    // Resolve the full approval chain from the hierarchy
    const hierarchy = await findHierarchyByProfessor(dto.professor_id);
    if (!hierarchy) {
        throw Object.assign(
            new Error("No approval hierarchy configured for this professor. Please contact Admin."),
            { statusCode: 400 }
        );
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        const created = await Application.create(
            [
                {
                    student_id: new mongoose.Types.ObjectId(studentId),
                    professor_id: new mongoose.Types.ObjectId(dto.professor_id),
                    hod_id: hierarchy.hod_id,
                    accounts_id: hierarchy.accounts_id,
                    current_reviewer_id: new mongoose.Types.ObjectId(dto.professor_id),
                    status: ApplicationStatus.PENDING_PROFESSOR,
                    title: dto.title,
                    description: dto.description,
                    amount_requested: dto.amount_requested,
                    documents: dto.documents ?? [],
                },
            ],
            { session }
        );
        const application = created[0]!;

        await ApplicationLog.create(
            [
                {
                    application_id: application._id,
                    action_by: new mongoose.Types.ObjectId(studentId),
                    action_type: ActionType.SUBMITTED,
                    remarks: "Application submitted",
                },
            ],
            { session }
        );

        await session.commitTransaction();

        return Application.findById(application._id)
            .populate("student_id", "name email")
            .populate("professor_id", "name email")
            .populate("hod_id", "name email")
            .populate("accounts_id", "name email")
            .populate("current_reviewer_id", "name email");
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

export async function getMyApplications(studentId: string, page = 1, limit = 10) {
    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
        Application.find({ student_id: studentId })
            .populate("professor_id", "name email")
            .populate("hod_id", "name email")
            .populate("accounts_id", "name email")
            .populate("current_reviewer_id", "name email")
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit),
        Application.countDocuments({ student_id: studentId }),
    ]);

    return {
        applications,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
}

export async function getReviewQueue(reviewerId: string, status: ApplicationStatus) {
    return Application.find({ current_reviewer_id: reviewerId, status })
        .populate("student_id", "name email")
        .populate("professor_id", "name email")
        .populate("hod_id", "name email")
        .sort({ createdAt: 1 }); // oldest first
}

export async function reviewApplication(
    appId: string,
    reviewerId: string,
    dto: ReviewApplicationDto
) {
    const application = await Application.findById(appId);
    if (!application) {
        throw Object.assign(new Error("Application not found"), { statusCode: 404 });
    }

    // Verify the reviewer is the current reviewer
    if (application.current_reviewer_id.toString() !== reviewerId) {
        throw Object.assign(new Error("You are not the current reviewer for this application"), { statusCode: 403 });
    }

    // Only pending applications can be reviewed
    const reviewableStatuses = [
        ApplicationStatus.PENDING_PROFESSOR,
        ApplicationStatus.PENDING_HOD,
        ApplicationStatus.PENDING_ACCOUNTS,
    ];
    if (!reviewableStatuses.includes(application.status)) {
        throw Object.assign(new Error("Application is not in a reviewable state"), { statusCode: 400 });
    }

    let nextStatus: ApplicationStatus;
    let nextReviewerId: mongoose.Types.ObjectId;
    let actionType: ActionType;

    if (dto.action === "reject") {
        nextStatus = ApplicationStatus.REJECTED;
        nextReviewerId = application.current_reviewer_id;
        actionType = ActionType.REJECTED;
        application.rejection_reason = dto.remarks ?? "";
    } else {
        actionType = ActionType.FORWARDED;
        // Determine next stage based on current status
        if (application.status === ApplicationStatus.PENDING_PROFESSOR) {
            nextStatus = ApplicationStatus.PENDING_HOD;
            nextReviewerId = application.hod_id;
        } else if (application.status === ApplicationStatus.PENDING_HOD) {
            nextStatus = ApplicationStatus.PENDING_ACCOUNTS;
            nextReviewerId = application.accounts_id;
        } else {
            // Accounts final approval
            nextStatus = ApplicationStatus.APPROVED;
            nextReviewerId = application.current_reviewer_id;
            actionType = ActionType.APPROVED;
        }
    }

    const session = await mongoose.startSession();
    session.startTransaction();

    try {
        application.status = nextStatus;
        application.current_reviewer_id = nextReviewerId;
        await application.save({ session });

        await ApplicationLog.create(
            [
                {
                    application_id: application._id,
                    action_by: new mongoose.Types.ObjectId(reviewerId),
                    action_type: actionType,
                    remarks: dto.remarks,
                },
            ],
            { session }
        );

        await session.commitTransaction();

        return Application.findById(appId)
            .populate("student_id", "name email")
            .populate("professor_id", "name email")
            .populate("hod_id", "name email")
            .populate("accounts_id", "name email")
            .populate("current_reviewer_id", "name email");
    } catch (error) {
        await session.abortTransaction();
        throw error;
    } finally {
        session.endSession();
    }
}

export async function getApplicationById(appId: string) {
    const application = await Application.findById(appId)
        .populate("student_id", "name email")
        .populate("professor_id", "name email")
        .populate("hod_id", "name email")
        .populate("accounts_id", "name email")
        .populate("current_reviewer_id", "name email");

    if (!application) {
        throw Object.assign(new Error("Application not found"), { statusCode: 404 });
    }

    const logs = await ApplicationLog.find({ application_id: appId })
        .populate("action_by", "name email roles")
        .sort({ timestamp: 1 });

    return { application, logs };
}

export async function getAllApplications() {
    return Application.find()
        .populate("student_id", "name email")
        .populate("professor_id", "name email")
        .populate("hod_id", "name email")
        .populate("accounts_id", "name email")
        .sort({ createdAt: -1 });
}

export async function getReviewHistory(reviewerId: string, roles: string[], page = 1, limit = 10) {
    let query: any = {};

    if (roles.includes("Professor")) {
        query.professor_id = reviewerId;
        query.status = { $ne: ApplicationStatus.PENDING_PROFESSOR };
    } else if (roles.includes("HOD")) {
        query.hod_id = reviewerId;
        query.status = { $in: [ApplicationStatus.PENDING_ACCOUNTS, ApplicationStatus.APPROVED, ApplicationStatus.REJECTED] };
    } else if (roles.includes("Accountant")) {
        query.accounts_id = reviewerId;
        query.status = { $in: [ApplicationStatus.APPROVED, ApplicationStatus.REJECTED] };
    } else {
        return { applications: [], pagination: { total: 0, page, limit, pages: 0 } };
    }

    const skip = (page - 1) * limit;
    const [applications, total] = await Promise.all([
        Application.find(query)
            .populate("student_id", "name email")
            .populate("professor_id", "name email")
            .populate("hod_id", "name email")
            .populate("accounts_id", "name email")
            .sort({ updatedAt: -1 })
            .skip(skip)
            .limit(limit),
        Application.countDocuments(query),
    ]);

    return {
        applications,
        pagination: {
            total,
            page,
            limit,
            pages: Math.ceil(total / limit)
        }
    };
}
