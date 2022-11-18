const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const joi = require("joi");
const userModel = require("../models/User");

// register endpoint
var users = [];

router.post("/register", async (req, res) => {
  try {
    const schema = joi.object({
      username: joi.string().min(6).max(15).required(),
      email: joi.string().email().required(),
      password: joi.string().required(),
      phone: joi.number().required(),
    });
    const { value, error } = schema.validate(req.body);
    if (error) return res.json({ error: error });
    const query = await userModel.find({ username: value.username }).exec();
    console.log();
    if (!!query.length)
      return res.json({ status: "error", message: "Username already exists" });

    await bcrypt.genSalt(12, function (err, salt) {
      bcrypt.hash(value.password, salt, (err, hash) => {
        value.password = hash;
        const user = userModel(value);
        user.save();
        return res.json({ status: "ok", message: "Registred seccesfully" });
      });
    });
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
