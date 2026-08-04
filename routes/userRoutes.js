const express = require("express");
const router = express.Router();
const { protect, restrictTo } = require("../middlewares/authMiddleware");
const { getAllUsers, deleteUser, updateUserRole } = require("../controllers/userController");

router.get("/", protect, restrictTo("admin"), getAllUsers);
router.delete("/:id", protect, restrictTo("admin"), deleteUser);
router.patch("/:id/role", protect, restrictTo("admin"), updateUserRole);

module.exports = router;