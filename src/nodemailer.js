import { config } from "dotenv";
import { createTransport } from "nodemailer";

config();

const trasporter = createTransport({
  service: "gmail",
  port: 587,
  auth: {
    user: process.env.AUTH_MAIL,
    pass: process.env.PASSWORD_MAIL,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

const sendMail = async (
  usuario,
  nombre,
  apellido,
  email,
  tel,
  direccion,
  edad
) => {
  try {
    const mailOptions = {
      from: "lucianocoscia5@gmail.com",
      to: process.env.AUTH_MAIL,
      subject: "Nuevo registro",
      html: `<h2 style="color: blue;">Usuario: ${usuario}</h2>
            <h3 style="color: blue;">Nombre: ${nombre}</h3>
            <h3 style="color: blue;">Apellido: ${apellido}</h3>
            <h3 style="color: blue;">Mail: ${email}</h3>
            <h4 style="color: green;">Telefono: ${tel}</h4>
            <h4 style="color: green;">Direccion: ${direccion}</h4>
            <h4 style="color: green;">Edad: ${edad}</h4>`,
    };
    const info = await trasporter.sendMail(mailOptions);
    console.log(info);
  } catch (err) {
    console.log(err);
  }
};

export default sendMail;
