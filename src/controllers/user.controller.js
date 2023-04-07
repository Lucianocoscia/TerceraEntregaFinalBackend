// import util from "util";
import { fork } from "child_process";
import args from "../yargs.js";
import logger from "../lib/logger.js";
import { SendMails } from "../services/nodemailer.js";
import generateFaker from "../services/faker.js";
import ContenedorMongo from "../classes/ContenedorMongo.js";
import { Product } from "../models/product.model.js";

const productApi = new ContenedorMongo(Product);

const getLoginMail = (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user;
    SendMails.sendMail(
      user.username,
      user.firstname,
      user.lastname,
      user.email,
      user.phone,
      user.address,
      user.age
    );
    return res.render("bienvenida", {
      usuario: user.username,
      nombre: user.firstname,
      apellido: user.lastname,
      email: user.email,
      tel: user.phone,
      direccion: user.address,
      edad: user.age,
      imagen: user.photo,
    });
  }

  res.sendFile(join(__dirname, "../views/login.html"));
};

// -----------------------------------------
const getLogin = (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.user;

    return res.render("bienvenida", {
      usuario: user.username,
      nombre: user.firstname,
      apellido: user.lastname,
      tel: user.phone,
      direccion: user.address,
      edad: user.age,
      email: user.email,
      imagen: user.photo,
    });
  }
  res.render("login");
};

const getRegister = (req, res) => {
  if (req.isAuthenticated()) {
    const user = req.session.user;
    // //imagen de registro
    const image = req.file.filename;
    res.locals.image = `${image}`;

    logger.info("Get register");
    console.log("image", image);

    return res.render("bienvenida", {
      usuario: user.username,
      nombre: user.firstname,
      apellido: user.lastname,
      tel: user.phone,
      direccion: user.address,
      edad: user.age,
      email: user.email,
      imagen: res.locals.image,
    });
  }
  res.render("register");
};

const getLoginFailiure = (req, res) => {
  res.render("login-error");
};

const getRegisterFailiure = (req, res) => {
  res.render("signup-error");
};

const logOut = (req, res) => {
  const username = req.user.username;
  req.logout(() => {
    return res.render("logout", { username });
  });
};

const getLoginAdmin = async (req, res) => {
  try {
    const { user } = req.session.passport;
    if (!user) {
      return res.redirect("/login");
    }
    res.render("form", { items: await productApi.getAll() });
  } catch (err) {
    logger.error(err);
  }
};

const faker = async (req, res) => {
  try {
    res.render("test", { items: generateFaker() });
  } catch (err) {
    logger.error(err);
  }
};

// usando objeto process y fork
const getInfo = (req, res) => {
  res.render("info", {
    entryArgs: JSON.stringify(args),
    platform: process.platform,
    versionNode: process.version,
    memory: process.memoryUsage().rss,
    path: process.execPath,
    processID: process.pid,
    dir: process.cwd(),
  });
};

const getRandom = (req, res) => {
  const { cant } = req.query;
  const childProcess = fork("./src/child.js");
  const quantity = cant ? cant : 100000000;

  childProcess.send(quantity);

  childProcess.on("message", (response) => {
    res.json(response);
  });
};

export const authController = {
  getLoginMail,
  getLoginAdmin,
  getLogin,
  getRegister,
  getLoginFailiure,
  getRegisterFailiure,
  logOut,
  getInfo,
  getRandom,
  faker,
};
