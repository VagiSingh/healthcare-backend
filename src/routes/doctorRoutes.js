
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
const { restrictTo } = require("../middleware/roleMiddleware");

const {
    validateBody,
    validateId
} = require("../middleware/validateMiddleware");

router.use(protect);


router.route("/")
    .post(restrictTo("ADMIN"), validateBody, createDoctor)
    .get(getDoctors);


router.route("/:id/")
    .all(validateId)
    .get(getDoctor)
    .put(restrictTo("ADMIN"), validateBody, updateDoctor)
    .delete(restrictTo("ADMIN"), deleteDoctor);

module.exports = router;
