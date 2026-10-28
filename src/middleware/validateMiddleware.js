const AppError = require("../utils/AppError");

const validateBody = (req, res, next) => {
    if (
        !req.body ||
        typeof req.body !== "object" ||
        Array.isArray(req.body)
    ) {
        return next(new AppError("Request body must be a JSON object", 400));
    }

    next();
};

const validateId = (req, res, next) => {
    const id = Number(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
        return next(new AppError("ID must be a positive integer", 400));
    }

    req.recordId = id;
    next();
};

const validatePatientId = (req, res, next) => {
    const id = Number(req.params.patientId);

    if (!Number.isInteger(id) || id <= 0) {
        return next(new AppError("Patient ID must be a positive integer", 400));
    }

    req.patientId = id;
    next();
};

module.exports = {
    validateBody,
    validateId,
    validatePatientId
};