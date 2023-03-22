import util from "util";
import { fork } from "child_process";
import args from "../yargs.js";
import logger from "../lib/logger.js";
import { SendMails } from "../nodemailer.js";
//realizar el getLoginMail usando nodemailer
//EJEMPLO
// ------------------------------------
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
    console.log("user", user);
    //imagen de registro
    const image = req.file;
    res.locals.image = `${image}`;

    logger.info("Get register");
    logger.info("image", image);

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
  getLogin,
  getRegister,
  getLoginFailiure,
  getRegisterFailiure,
  logOut,
  getInfo,
  getRandom,
};
