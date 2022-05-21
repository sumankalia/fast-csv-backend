const User = require("../models/User");
// const sendUserCreationEmail = require("../mail/sendAccountCreationMail");
const Queue = require("bull");
const { REDIS_URI, REDIS_PORT } = require("../config/constants");
const csv = require("fast-csv");
const fs = require("fs");

const emailQueue = new Queue("emailQueue", {
  redis: { port: REDIS_PORT, host: REDIS_URI },
});

const HOSTNAME = "http://localhost:4000";

exports.create = async (req, res) => {
  const { name, email, age, phone } = req.body;

  try {
    const user = await User.create({
      name,
      email,
      age,
      phone,
    });

    //send confirmation email
    // sendUserCreationEmail({
    //   name,
    //   email,
    // });

    res.json(user);
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

exports.sendEmailToUsers = async (req, res) => {
  try {
    const users = await User.find();

    // default fifo: true
    users.forEach((user, index) => {
      console.log(user);
      emailQueue
        .add({ user }, { lifo: true, attempts: 1, delay: 4000 })
        .then(() => {
          if (index + 1 === users.length) {
            res.json({ message: "All users added in the queue" });
          }
        });
    });
  } catch (error) {
    console.log(error);
    res.status(400).json(error);
  }
};

exports.getAllUsers = async (req, res) => {
  try {
    const users = await User.find();

    const csvStream = csv.format({ headers: true });

    if (!fs.existsSync("public/files/export/")) {
      if (!fs.existsSync("public/files")) {
        fs.mkdirSync("public/files/");
      }
      if (!fs.existsSync("public/files/export/")) {
        fs.mkdirSync("./public/files/export/");
      }
    }

    const writableStream = fs.createWriteStream(
      "public/files/export/users.csv"
    );

    csvStream.pipe(writableStream);

    writableStream.on("finish", function () {
      res.json({
        downloadUrl: `${HOSTNAME}/files/export/users.csv`,
      });
    });

    if (users.length > 0) {
      users.map((user) => {
        csvStream.write({
          Name: user.name ? user.name : "-",
          Age: user.age ? user.age : "-",
          Email: user.email ? user.email : "-",
          Phone: user.phone ? user.phone : "-",
        });
      });
    }
    csvStream.end();
    writableStream.end();
  } catch (error) {
    res.status(400).json(error);
  }
};
