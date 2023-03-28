import { Router } from "express";
import passport from "passport";
import { authController } from "../controllers/user.controller.js";
import upload from "../lib/multer.js";

const router = Router();

// ruta de login
router
  .route("/login")
  .get(authController.getLogin)
  .post(
    passport.authenticate("login", { failureRedirect: "/fail-login" }),
    authController.getLogin
  );

// ruta de register
router
  .route("/register")
  .get(authController.getRegister)
  .post(
    upload.single("photo"),
    passport.authenticate("register", { failureRedirect: "/fail-register" }),
    authController.getLoginMail
  );

//fails
router.get("/fail-login", authController.getLoginFailiure);
router.get("/fail-register", authController.getRegisterFailiure);

// ruta de logout
router.get("/logout", authController.logOut);

export const userRouter = router;
