import { Router } from "express";

import { userRouter } from "./user.route.js";
import { cartRouter } from "./cart.route.js";
import { productRouter } from "./product.route.js";
import { infoRouter } from "./info.route.js";

const router = Router();

router.use("/user", userRouter);
router.use("/cart", cartRouter);
router.use("/product", productRouter);
router.use("/info", infoRouter);

export default router;
