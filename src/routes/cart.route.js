import { Router } from "express";

import { cartController } from "../controllers/cart.controller.js";

const router = Router();

router.post("/cart/:productId", cartController.updateCart);

router.post("/cart/finish/:cartId", cartController.finish);

export const cartRouter = router;
