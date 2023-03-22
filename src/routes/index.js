import { Router } from "express";
import generateFaker from "../faker.js";
import { authController } from "../controllers/index.js";
import passport from "passport";
import compression from "compression";
import logger from "../lib/logger.js";
import { Cart } from "../table/models/cart.model.js";
import { Product } from "../table/models/product.model.js";
import sendMessage from "../twilio.js";
import upload from "../lib/multer.js";
import ContenedorMongo from "../crud/apiMongo.js";
import { SendMails } from "../nodemailer.js";
const router = Router();
const productApi = new ContenedorMongo(Product);
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

// ruta con el form de productos y el chat
router.get("/login/admin-productos", async (req, res) => {
  try {
    const { user } = req.session.passport;
    if (!user) {
      return res.redirect("/login");
    }
    res.render("form", { items: await productApi.getAll() });
  } catch (err) {
    logger.error(err);
  }
});

//ruta sin posibilidad de cargar productos
router.get("/login/productos", async (req, res) => {
  try {
    const { user } = req.session.passport;
    // logger.info(user);
    console.log(user);

    const userCart = await Cart.findOne({
      username: user.username,
    }).lean();

    if (!user) {
      return res.redirect("/login");
    }
    res.render("cart", { cart: userCart, user });
  } catch (err) {
    logger.error(err);
  }
});

//ruta de faker
router.route("/api/productos-test").get(async (req, res) => {
  try {
    res.render("test", { items: generateFaker() });
  } catch (err) {
    logger.error(err);
  }
});

router.post("/cart/:productId", async (req, res) => {
  try {
    const { productId } = req.params;
    const product = await Product.findById(productId);
    const cart = await Cart.findOne({
      username: req.session.passport.user.username,
    });

    cart.products.push(product);

    await Cart.updateOne(
      { username: req.session.passport.user.username },
      cart
    );
    res.redirect("/login/productos");
  } catch (err) {
    console.log(err);
    logger.error({ error: err }, "Error adding product");

    res.sendStatus(500);
  }
});

router.post("/cart/finish/:cartId", async (req, res) => {
  try {
    const { user } = req.session.passport;
    const cart = await Cart.findOne({
      username: req.session.passport.user.username,
    });
    // console.log(cart);

    SendMails.sendMailCart({ cart, user });
    // sendMessage();
    res.sendStatus(200);
  } catch (err) {
    console.log(err);
    logger.error({ error: err }, "Error adding product");
    res.sendStatus(500);
  }
});

//ruta info
router.route("/info-gzip").get(compression(), authController.getInfo);
router.route("/info-nogzip").get(authController.getInfo);

//ruta api-randoms
router.route("/api-randoms").get(authController.getRandom);

export default router;
