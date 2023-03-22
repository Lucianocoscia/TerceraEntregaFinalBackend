import express, { json, urlencoded } from "express"; //importo express
//dirname
import path, { dirname, join } from "path";
import { fileURLToPath } from "url";
import { engine } from "express-handlebars"; // importo hbs
import router from "./routes/index.js"; //importo rutas
import { Server as IOServer } from "socket.io"; //importo socket
import Contenedor from "./crud/api.js"; //importo contendor con clase q maneja todo el crud

//importo configs de connections
import configSqlite3 from "./db/sqlite.js";
import configMYSQL from "./db/mysql.js";

//  COmienza config para loguear con mongo y session
import MongoStore from "connect-mongo";
import session from "express-session";
import mongoose from "mongoose";

//desafio passport
import passport from "passport";
import { passportStrategies } from "./lib/passport.lib.js";
import { User } from "./table/models/user.model.js"; // importo el modelo de mongodb
import { authMiddlewares } from "./middleware/invalidURL.middleware.js"; // importo middlewares
// import generateFaker from "./faker.js";

import dotenv from "dotenv"; //import dotenv
import args from "./yargs.js"; // importo argumentos de entrada

//Comienza desafio cluster y fork
import os from "os";
import cluster from "cluster";

//pino
import logger from "./lib/logger.js";
//contenedor mongo con product
import ContenedorMongo from "./crud/apiMongo.js";
import { Product } from "./table/models/product.model.js";

const cpus = os.cpus();

const __dirname = dirname(fileURLToPath(import.meta.url)); //dirname

const app = express(); //Inicializo la app

dotenv.config(); //Inicializo el dotenv

if (cluster.isPrimary && args.mode.toUpperCase() === "CLUSTER") {
  cpus.map(() => {
    cluster.fork();
  });
  cluster.on("exit", (worker) => {
    logger.info(`Worker ${worker.process.pid} died`);
    cluster.fork();
  });
} else {
  // middleware
  app.use(json());

  app.use(urlencoded({ extended: true }));
  app.use(express.static("src/uploads"));

  // definimos la configuracion HBS
  app.engine(
    "hbs",
    engine({
      extname: ".hbs",
      defaultLayout: "main.html",
      layoutsDir: join(__dirname, "/views/layouts"),
      partialsDir: join(__dirname, "/views/partials"),
    })
  );

  //app set hbs
  app.set("view engine", "hbs"); // se lo damos a express para q lo pueda setear
  app.set("views", join(__dirname, "/views"));

  app.use(express.static(__dirname + "/views/layouts"));

  //  Comienza config para loguear con mongo
  const mongoOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  };

  app.use(
    session({
      secret: "coderhouse",
      rolling: true, // Esto lo que hace es que reinicia el tiempo de expiracion de las sesiones con cada request
      resave: false,
      saveUninitialized: false,
      store: new MongoStore({
        mongoUrl: process.env.URL_MONGOATLAS, //conexion con mongo atlas
        // process.env.URL_MONGODB, //conexion con mongodb, tengo q crear una carpeta y hacerle el mongod --dbpath ./elnombredelacarpetaqcree para inicializar mongo
        mongoOptions,
      }),
      /*       cookie: {
        maxAge: 60000, // tiempo de expiracion de la cookie
      }, */
    })
  );

  //passport
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use("login", passportStrategies.loginStrategy);
  passport.use("register", passportStrategies.registerStrategy);

  //necesario para guardarlo
  passport.serializeUser((user, done) => {
    done(null, user);
  });

  passport.deserializeUser(async (id, done) => {
    const data = await User.findById(id);
    done(null, data);
  });

  // //Envío las rutas al logger.info
  app.use((req, res, next) => {
    logger.info(` Peticion a ${req.url}, con metodo ${req.method}}`);
    next();
  });

  app.use("/", router); //le paso las rutas

  mongoose.set("strictQuery", true); //mongoose set para sacar warning
  mongoose.connect(process.env.URL_MONGOATLAS); //mongoose conecction

  logger.info("database connected");

  const expressServer = app.listen(args.puerto || process.env.PORT, () => {
    logger.info(`Server listening on port ${args.puerto}`);
  });

  const io = new IOServer(expressServer);

  const productApi = new ContenedorMongo(Product); // product api es un contenedor para los productos

  const messageApi = new Contenedor(configSqlite3, "message"); // messageapi es un contenedor para los mensajes

  io.on("connection", async (socket) => {
    logger.info(`New connection, socket ID: ${socket.id}`);

    // Cuando se conecta un nuevo cliente le emitimos a ese cliente todos los productos que se mandaron hasta el momento
    socket.emit("server:message", await messageApi.getAll());

    // Cuando se conecta un nuevo cliente le emitimos a ese cliente todos los productos que se mandaron hasta el momento
    socket.emit("server:product", await productApi.getAll());

    // socket.emit("server:product", generateFaker());  // de esta forma renderizo los productos defaker

    //Formateo la hora
    let date = new Date();
    let dateOficial = date.toLocaleString();

    // Nos ponemos a escuchar el evento "client:message" que recibe la info de un mensaje
    socket.on("client:message", async (messageInfo) => {
      await messageApi.save({ ...messageInfo, time: dateOficial });

      io.emit("server:message", await messageApi.getAll());
    });

    // Nos ponemos a escuchar el evento "client:product" que recibe la info de un producto

    socket.on("client:product", async (product) => {
      await productApi.save({
        title: product.title,
        price: Number(product.price),
        thumbnail: product.thumbnail,
      });

      //Emitimos a TODOS los sockets conectados el arreglo de productos actualizados
      io.emit("server:product", await productApi.getAll());
    });

    // de esta forma renderizo los productos defaker
    // socket.on("client:product", () => {
    //   let products = generateFaker();
    //   io.emit("server:product", products);
    // });
  });
  app.use(authMiddlewares.invalidUrl); //le paso el middelware de invalidurl
  app.on("error", (err) => {
    logger.error(err);
  });
}
