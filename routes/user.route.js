import express from "express";
import {
  getUsers,
  registerUser,
  getUserById,
  loginUser,
  logoutUser,
  putUpdate,
  getSelf,
  patchUpdate,
  deleteUser,
} from "../controllers/user.controllers.js";
import {
  loginValidator,
  registerValidator,
  validateHandler,
} from "../utils/validators.js";
import { isAuthenticated } from "../middlewares/auth.middleware.js";
import { idValidator } from "../middlewares/idValidator.js";

const router = express.Router();

router.get("/login", loginValidator(), validateHandler, loginUser);
router.post("/register", registerValidator(), validateHandler, registerUser);

router.use(isAuthenticated);

router.get("/logout", logoutUser);
router.get("/", getUsers);
router.get("/me", getSelf);
router.put("/put-update", idValidator, putUpdate);
router.patch("/patch-update", idValidator, patchUpdate);
router.delete("/delete-user", idValidator, deleteUser);
router.get("/:Id", getUserById);

export default router;
