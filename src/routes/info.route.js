import { Router } from "express";
import compression from "compression";
import { authController } from "../controllers/user.controller.js";

const router = Router();

//ruta info
router.route("/info-gzip").get(compression(), authController.getInfo);
router.route("/info-nogzip").get(authController.getInfo);

export const infoRouter = router;
