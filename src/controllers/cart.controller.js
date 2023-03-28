import { cartDao } from "../daos/cart.dao.js";
import ContenedorMongo from "../daos/ContenedorMongo.js";
import logger from "../lib/logger.js";
import { Product } from "../models/product.model.js";
import sendMessage from "../services/twilio.js";
import { SendMails } from "../services/nodemailer.js";

const productApi = new ContenedorMongo(Product);

const createCart = async (req, res, next) => {
  try {
    const response = await cartDao.createCart(req.body);

    return response;
  } catch (err) {
    next(err);
  }
};
const updateCart = async (req, res, next) => {
  try {
    const { productId } = req.params;
    const product = await productApi.getById(productId);

    const cart = await cartDao.findCartByFilter({
      username: req.session.passport.user.username,
    });

    cart.products.push(product);

    await cartDao.updateCart(
      { username: req.session.passport.user.username },
      cart
    );
    res.redirect("/productos");
  } catch (err) {
    console.log(err);
    logger.error({ error: err }, "Error adding product");

    res.sendStatus(500);
  }
};

const deleteCart = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await cartDao.deleteCart(id);

    return response;
  } catch (err) {
    next(err);
  }
};
const findAllCarts = async (req, res, next) => {
  try {
    const response = await cartDao.findAllCarts();

    return response;
  } catch (err) {
    next(err);
  }
};
const findCartById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const response = await cartDao.findCartById(id);

    return response;
  } catch (err) {
    next(err);
  }
};
const findCartByFilter = async (req, res, next) => {
  try {
    const { user } = req.session.passport;
    const userCart = await cartDao.findCartByFilter({
      username: user.username,
    });
    if (!user) {
      return res.redirect("/login");
    }
    res.render("cart", { cart: userCart, user });
  } catch (err) {
    logger.error(err);
  }
};
const finish = async (req, res, next) => {
  try {
    SendMails.sendMailCart({ cart, user });
    sendMessage();
    res.sendStatus(200);
  } catch (err) {
    logger.error({ error: err }, "Error adding product");
    res.sendStatus(500);
  }
};

export const cartController = {
  createCart,
  updateCart,
  deleteCart,
  findAllCarts,
  findCartById,
  findCartByFilter,
  finish,
};
