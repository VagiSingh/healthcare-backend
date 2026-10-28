const express = require("express");
const router = express.Router();

const {
    createPatient,
    getPatients,
    getPatient,
    updatePatient,
    deletePatient
} = require("../controllers/patientController");

const { protect } = require("../middleware/authMiddleware");
const {
    validateBody,
    validateId
} = require("../middleware/validateMiddleware");

router.use(protect);

router.route("/")
    .post(validateBody, createPatient)
    .get(getPatients);

router.route("/:id/")
    .all(validateId)
    .get(getPatient)
    .put(validateBody, updatePatient)
    .delete(deletePatient);

module.exports = router;