const express = require("express");
const router = express.Router();

const {
    registerUser,
    loginUser
} = require("../controllers/authController");

const { validateBody } = require("../middleware/validateMiddleware");

router.post("/register/", validateBody, registerUser);
router.post("/login/", validateBody, loginUser);

module.exports = router;