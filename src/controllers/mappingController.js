const prisma = require("../config/db");
const AppError = require("../utils/AppError");
const asyncHandler = require("../utils/asyncHandler");


const assignDoctor = asyncHandler(async (req, res) => {
    const { patientId, doctorId } = req.body;

    if (
        !Number.isInteger(patientId) ||
        patientId <= 0 ||
        !Number.isInteger(doctorId) ||
        doctorId <= 0
    ) {
        throw new AppError(
            "patientId and doctorId must be positive integers",
            400
        );
    }

    const patient = await prisma.patient.findFirst({
        where: {
            id: patientId,
            userId: req.user.id
        }
    });

    if (!patient) {
        throw new AppError("Patient not found", 404);
    }

    const doctor = await prisma.doctor.findUnique({
        where: { id: doctorId }
    });

    if (!doctor) {
        throw new AppError("Doctor not found", 404);
    }

    const existingMapping = await prisma.patientDoctorMapping.findUnique({
        where: {
            patientId_doctorId: {
                patientId,
                doctorId
            }
        }
    });

    if (existingMapping) {
        throw new AppError("This doctor is already assigned to this patient", 409);
    }

    const mapping = await prisma.patientDoctorMapping.create({
        data: {
            patientId,
            doctorId
        },
        include: {
            patient: true,
            doctor: true
        }
    });

    res.status(201).json({
        success: true,
        message: "Doctor assigned to patient successfully",
        mapping
    });
});


const getMappings = asyncHandler(async (req, res) => {
    const mappings = await prisma.patientDoctorMapping.findMany({
        where: {
            patient: {
                userId: req.user.id
            }
        },
        include: {
            patient: {
                select: {
                    id: true,
                    name: true
                }
            },
            doctor: true
        },
        orderBy: { createdAt: "desc" }
    });

    res.status(200).json({
        success: true,
        count: mappings.length,
        mappings
    });
});


const getPatientDoctors = asyncHandler(async (req, res) => {
    const patient = await prisma.patient.findFirst({
        where: {
            id: req.patientId,
            userId: req.user.id
        }
    });

    if (!patient) {
        throw new AppError("Patient not found", 404);
    }

    const mappings = await prisma.patientDoctorMapping.findMany({
        where: {
            patientId: req.patientId
        },
        include: {
            doctor: true
        },
        orderBy: { createdAt: "desc" }
    });

    res.status(200).json({
        success: true,
        patient: {
            id: patient.id,
            name: patient.name
        },
        count: mappings.length,
        doctors: mappings.map((mapping) => ({
            ...mapping.doctor,
            mappingId: mapping.id,
            assignedAt: mapping.createdAt
        }))
    });
});


const removeMapping = asyncHandler(async (req, res) => {
    const mapping = await prisma.patientDoctorMapping.findFirst({
        where: {
            id: req.recordId,
            patient: {
                userId: req.user.id
            }
        }
    });

    if (!mapping) {
        throw new AppError("Mapping not found", 404);
    }

    await prisma.patientDoctorMapping.delete({
        where: { id: req.recordId }
    });

    res.status(200).json({
        success: true,
        message: "Doctor assignment removed successfully"
    });
});

module.exports = {
    assignDoctor,
    getMappings,
    getPatientDoctors,
    removeMapping
};