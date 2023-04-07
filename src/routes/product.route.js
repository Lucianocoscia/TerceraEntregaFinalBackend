import { Router } from "express";
import { Product } from "../models/product.model.js";

import { authController } from "../controllers/user.controller.js";
import { cartController } from "../controllers/cart.controller.js";
import ContenedorMongo from "../classes/ContenedorMongo.js";

const router = Router();
const productApi = new ContenedorMongo(Product);

//ruta sin posibilidad de cargar productos
router.get("/productos", cartController.findCartByFilter);

// ruta con el form de productos y el chat
router.get("/admin-productos", authController.getLoginAdmin);

//ruta de faker
router.route("/api/productos-test").get(authController.faker);

//ruta api-randoms
router.route("/api-randoms").get(authController.getRandom);

export const productRouter = router;
