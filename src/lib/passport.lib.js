// PASSPORT STRATEGYS
import bcrypt from "bcrypt";
import LocalStrategy from "passport-local";
import { User } from "../models/user.model.js";
import { Cart } from "../models/cart.model.js";
import logger from "./logger.js";

const hashPasword = (password) => {
  return bcrypt.hashSync(password, bcrypt.genSaltSync(10));
};

const validatePassword = (plainPassword, hashedPassword) => {
  return bcrypt.compareSync(plainPassword, hashedPassword);
};

const loginStrategy = new LocalStrategy(async (username, password, done) => {
  try {
    const user = await User.findOne({ username });

    if (!user || !validatePassword(password, user.password)) {
      // return done(null, false);
      return done("Invalid credentials", null);
    }

    done(null, user);
  } catch (err) {
    // done(null, false);
    return done("Error while login in", null);
  }
});

const registerStrategy = new LocalStrategy(
  { passReqToCallback: true },
  async (req, username, password, done) => {
    try {
      const existingUser = await User.findOne({ username });

      if (existingUser) {
        return done("Username already in use", null);
      }

      const newUser = {
        username,
        password: hashPasword(password),
        firstname: req.body.firstname,
        lastname: req.body.lastname,
        email: req.body.email,
        phone: req.body.phone,
        address: req.body.address,
        age: req.body.age,
        photo: req.file.filename,
      };

      const createdUser = await User.create(newUser);

      await Cart.create({ username, products: [] });

      req.user = createdUser;

      return done(null, createdUser);
    } catch (err) {
      logger.error(err);
      return done("Error while register", null);
    }
  }
);

export const passportStrategies = { loginStrategy, registerStrategy };
