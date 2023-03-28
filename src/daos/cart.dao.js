import { Cart } from "../models/cart.model.js";

const createCart = async (createCartRequest) => {
  try {
    const createdCart = await Cart.create(createCartRequest);

    return createdCart;
  } catch (err) {
    console.log(err);
  }
};

const updateCart = async (id, updateCartRequest) => {
  try {
    const updatedCart = await Cart.updateOne({ _id: id }, updateCartRequest);

    return updatedCart;
  } catch (err) {
    console.log(err);
  }
};

const deleteCart = async (id) => {
  try {
    const deletedCart = await Cart.deleteOne({ _id: id });

    return deletedCart;
  } catch (err) {
    console.log(err);
  }
};

const findAllCarts = async () => {
  try {
    const carts = await Cart.find();

    return carts;
  } catch (err) {
    console.log(err);
  }
};

const findCartById = async (id) => {
  try {
    const cart = await Cart.findById(id);

    return cart;
  } catch (err) {
    console.log(err);
  }
};

const findCartByFilter = async (filters) => {
  try {
    const cart = await Cart.findOne(filters);

    return cart;
  } catch (err) {
    console.log(err);
  }
};

export const cartDao = {
  createCart,
  updateCart,
  deleteCart,
  findAllCarts,
  findCartById,
  findCartByFilter,
};
