
const prisma = require("../config/db");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const validateDoctorData = (data, isUpdate = false) => {
    if (!data || typeof data !== "object" || Array.isArray(data)) {
        throw new AppError("Request body must be a JSON object", 400);
    }

    const allowedFields = ["name", "specialty", "email", "phone"];

    for (const key of Object.keys(data)) {
        if (!allowedFields.includes(key)) {
            throw new AppError(`Unexpected field: ${key}`, 400);
        }
    }

    for (const field of ["name", "specialty"]) {
        if (
            !isUpdate &&
            (typeof data[field] !== "string" || !data[field].trim())
        ) {
            throw new AppError(`${field} is required`, 400);
        }

        if (data[field] !== undefined) {
            if (typeof data[field] !== "string" || !data[field].trim()) {
                throw new AppError(
                    `${field} must be a non-empty string`,
                    400
                );
            }

            if (data[field].trim().length > 100) {
                throw new AppError(
                    `${field} cannot exceed 100 characters`,
                    400
                );
            }
        }
    }

    if (data.email !== undefined && data.email !== null) {
        if (typeof data.email !== "string") {
            throw new AppError("Email must be a string", 400);
        }

        const email = data.email.trim();

        if (
            email &&
            (
                email.length > 254 ||
                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
            )
        ) {
            throw new AppError("Please provide a valid doctor email", 400);
        }
    }

    if (data.phone !== undefined && data.phone !== null) {
        if (typeof data.phone !== "string") {
            throw new AppError("Phone must be a string", 400);
        }

        if (data.phone.length > 30) {
            throw new AppError("Phone cannot exceed 30 characters", 400);
        }
    }
};

const createDoctor = asyncHandler(async (req, res) => {
    validateDoctorData(req.body);

    const { name, specialty, email, phone } = req.body;

    const doctor = await prisma.doctor.create({
        data: {
            name: name.trim(),
            specialty: specialty.trim(),
            email: email?.trim().toLowerCase() || null,
            phone: phone?.trim() || null
        },
        select: {
            id: true,
            name: true,
            specialty: true,
            email: true,
            phone: true,
            createdAt: true,
            updatedAt: true
        }
    });

    res.status(201).json({
        success: true,
        message: "Doctor created successfully",
        doctor
    });
});

const getDoctors = asyncHandler(async (req, res) => {
    const doctors = await prisma.doctor.findMany({
        select: {
            id: true,
            name: true,
            specialty: true,
            email: true,
            phone: true,
            createdAt: true,
            updatedAt: true
        },
        orderBy: {
            createdAt: "desc"
        }
    });

    res.status(200).json({
        success: true,
        count: doctors.length,
        doctors
    });
});

const getDoctor = asyncHandler(async (req, res) => {
    const doctor = await prisma.doctor.findUnique({
        where: { id: req.recordId },
        select: {
            id: true,
            name: true,
            specialty: true,
            email: true,
            phone: true,
            createdAt: true,
            updatedAt: true
        }
    });

    if (!doctor) {
        throw new AppError("Doctor not found", 404);
    }

    res.status(200).json({
        success: true,
        doctor
    });
});

const updateDoctor = asyncHandler(async (req, res) => {
    validateDoctorData(req.body, true);

    if (Object.keys(req.body).length === 0) {
        throw new AppError("Provide at least one field to update", 400);
    }

    const existingDoctor = await prisma.doctor.findUnique({
        where: { id: req.recordId }
    });

    if (!existingDoctor) {
        throw new AppError("Doctor not found", 404);
    }

    const data = { ...req.body };

    for (const field of ["name", "specialty"]) {
        if (data[field] !== undefined) {
            data[field] = data[field].trim();
        }
    }

    if (data.email !== undefined) {
        data.email = data.email?.trim().toLowerCase() || null;
    }

    if (data.phone !== undefined && data.phone !== null) {
        data.phone = data.phone.trim() || null;
    }

    const doctor = await prisma.doctor.update({
        where: { id: req.recordId },
        data,
        select: {
            id: true,
            name: true,
            specialty: true,
            email: true,
            phone: true,
            createdAt: true,
            updatedAt: true
        }
    });

    res.status(200).json({
        success: true,
        message: "Doctor updated successfully",
        doctor
    });
});

const deleteDoctor = asyncHandler(async (req, res) => {
    const doctor = await prisma.doctor.findUnique({
        where: { id: req.recordId }
    });

    if (!doctor) {
        throw new AppError("Doctor not found", 404);
    }

    await prisma.doctor.delete({
        where: { id: req.recordId }
    });

    res.status(200).json({
        success: true,
        message: "Doctor deleted successfully"
    });
});

module.exports = {
    createDoctor,
    getDoctors,
    getDoctor,
    updateDoctor,
    deleteDoctor
};
