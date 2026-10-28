const express = require("express");
const router = express.Router();

const {
    createDoctor,
    getDoctors,
    getDoctor,
    updateDoctor,
    deleteDoctor
} = require("../controllers/doctorController");

const { protect } = require("../middleware/authMiddleware");
const {
    validateBody,
    validateId
} = require("../middleware/validateMiddleware");

router.use(protect);

router.route("/")
    .post(validateBody, createDoctor)
    .get(getDoctors);

router.route("/:id/")
    .all(validateId)
    .get(getDoctor)
    .put(validateBody, updateDoctor)
    .delete(deleteDoctor);

module.exports = router;