const prisma = require("../config/db");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");

const validatePatientData = (data, isUpdate = false) => {
    const allowedFields = ["name", "age", "gender", "address", "phone"];

    for (const key of Object.keys(data)) {
        if (!allowedFields.includes(key)) {
            throw new AppError(`Unexpected field: ${key}`, 400);
        }
    }

    if (!isUpdate && (typeof data.name !== "string" || !data.name.trim())) {
        throw new AppError("Patient name is required", 400);
    }

    if (data.name !== undefined) {
        if (typeof data.name !== "string" || !data.name.trim()) {
            throw new AppError("Patient name must be a non-empty string", 400);
        }
        if (data.name.trim().length > 100) {
            throw new AppError("Patient name cannot exceed 100 characters", 400);
        }
    }

    if (data.age !== undefined && data.age !== null) {
        if (!Number.isInteger(data.age) || data.age < 0 || data.age > 150) {
            throw new AppError("Age must be an integer between 0 and 150", 400);
        }
    }

    for (const field of ["gender", "address", "phone"]) {
        if (data[field] !== undefined && data[field] !== null) {
            if (typeof data[field] !== "string") {
                throw new AppError(`${field} must be a string`, 400);
            }
        }
    }

    if (data.gender && data.gender.length > 30) {
        throw new AppError("Gender cannot exceed 30 characters", 400);
    }

    if (data.address && data.address.length > 500) {
        throw new AppError("Address cannot exceed 500 characters", 400);
    }

    if (data.phone && data.phone.length > 30) {
        throw new AppError("Phone cannot exceed 30 characters", 400);
    }
};


const createPatient = asyncHandler(async (req, res) => {
    validatePatientData(req.body);

    const { name, age, gender, address, phone } = req.body;

    const patient = await prisma.patient.create({
        data: {
            name: name.trim(),
            age: age ?? null,
            gender: gender?.trim() || null,
            address: address?.trim() || null,
            phone: phone?.trim() || null,
            userId: req.user.id
        }
    });

    res.status(201).json({
        success: true,
        message: "Patient created successfully",
        patient
    });
});


const getPatients = asyncHandler(async (req, res) => {
    const patients = await prisma.patient.findMany({
        where: { userId: req.user.id },
        orderBy: { createdAt: "desc" }
    });

    res.status(200).json({
        success: true,
        count: patients.length,
        patients
    });
});


const getPatient = asyncHandler(async (req, res) => {
    const patient = await prisma.patient.findFirst({
        where: {
            id: req.recordId,
            userId: req.user.id
        },
        include: {
            mappings: {
                include: {
                    doctor: true
                }
            }
        }
    });

    if (!patient) {
        throw new AppError("Patient not found", 404);
    }

    res.status(200).json({
        success: true,
        patient
    });
});


const updatePatient = asyncHandler(async (req, res) => {
    validatePatientData(req.body, true);

    if (Object.keys(req.body).length === 0) {
        throw new AppError("Provide at least one field to update", 400);
    }

    const existingPatient = await prisma.patient.findFirst({
        where: {
            id: req.recordId,
            userId: req.user.id
        }
    });

    if (!existingPatient) {
        throw new AppError("Patient not found", 404);
    }

    const data = { ...req.body };

    if (data.name !== undefined) data.name = data.name.trim();

    for (const field of ["gender", "address", "phone"]) {
        if (data[field] !== undefined && data[field] !== null) {
            data[field] = data[field].trim();
            if (!data[field]) data[field] = null;
        }
    }

    const patient = await prisma.patient.update({
        where: { id: req.recordId },
        data
    });

    res.status(200).json({
        success: true,
        message: "Patient updated successfully",
        patient
    });
});


const deletePatient = asyncHandler(async (req, res) => {
    const patient = await prisma.patient.findFirst({
        where: {
            id: req.recordId,
            userId: req.user.id
        }
    });

    if (!patient) {
        throw new AppError("Patient not found", 404);
    }

    await prisma.patient.delete({
        where: { id: req.recordId }
    });

    res.status(200).json({
        success: true,
        message: "Patient deleted successfully"
    });
});

module.exports = {
    createPatient,
    getPatients,
    getPatient,
    updatePatient,
    deletePatient
};