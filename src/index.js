"use strict";
const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const routerConfig = require("./modules/route");
const config = require("./config/config");
const { logger } = require("./helpers/logger");
const nodemailer = require("nodemailer");

const init = () => {
  // *** express instance *** //
  const app = express();
  // Configuraing the standard middlewares.
  setupStandardMiddlewares(app);
  configureApiEndpoints(app);
  app.listen(config.SERVER_PORT);
  console.log(
    `Listening on port ${config.SERVER_PORT} in ${config.NODE_ENV} mode`
  );
  logger.info(
    `Listening on port ${config.SERVER_PORT} in ${config.NODE_ENV} mode`
  );
};

const setupStandardMiddlewares = (app) => {
  // parse requests of content-type - application/json
  app.use(bodyParser.json());
  // parse requests of content-type - application/x-www-form-urlencoded
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(cors());
};

const configureApiEndpoints = (app) => {
  app.use("/api/v1/", routerConfig.init());
  // routerConfig.init(app);
  // define a route handler for the default home page
  app.get("/", (req, res) => {
    res.send("Welcome to express-create application! ");
  });

  app.post("/mail", (req, res) => {
    const { email, phone, name } = req.body;
    const text =
      (process.env.MAIL_TITLE || "Сообщение с формы") +
      "\n" +
      `Имя: ${name}\n` +
      `Почта: ${email}\n` +
      `Телефон: ${phone}`;

    const transporter = nodemailer.createTransport({
      host: "smtp.gmail.com",
      port: 465,
      service: "gmail",
      auth: {
        user: process.env.EMAIL || "",
        pass: process.env.PASS || "",
      },
      secure: true,
    });

    const mailOptions = {
      from: process.env.USER || "",
      to: process.env.TO || "",
      subject: process.env.SUBJECT || "",
      text,
    };

    console.log("Старт отправки");

    transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.warn("ERROR", error);
        return res.send(error);
      }
      console.log("Сообщение было успешно отправлено");
      res.send(
        `Сообщение на почту ${info.accepted[0]} было успешно отправлено`
      );
    });
  });
};

init();
