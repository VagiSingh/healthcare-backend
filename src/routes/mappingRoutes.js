const express = require("express");
const router = express.Router();

const {
    assignDoctor,
    getMappings,
    getPatientDoctors,
    removeMapping
} = require("../controllers/mappingController");

const { protect } = require("../middleware/authMiddleware");
const {
    validateBody,
    validateId,
    validatePatientId
} = require("../middleware/validateMiddleware");

router.use(protect);

router.post("/", validateBody, assignDoctor);
router.get("/", getMappings);

router.get("/:patientId/", validatePatientId, getPatientDoctors);
router.delete("/:id/", validateId, removeMapping);

module.exports = router;