const express = require("express");
const userController = require("../controllers/userController");

const router = express.Router();

router.post("/create", userController.create);

router.post("/sendEmailToUsers", userController.sendEmailToUsers);

router.get("/get", userController.getAllUsers);

module.exports = router;
