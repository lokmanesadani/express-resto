const bcrypt = require("bcrypt");
const joi = require("joi");
const userModel = require("../models/User");
const JWT = require("jsonwebtoken");
const { ACCESS_EXPIRE_TIME, REFRESH_EXPIRE_TIME } = require("../utils/statics");

// generate access token
const generateToken = (username) => {
  return JWT.sign({ username: username }, process.env.ACCESS_JWT_SECRET, {
    expiresIn: ACCESS_EXPIRE_TIME,
  });
};

// generate access token
const generateRefreshToken = (username) => {
  const refreshToken = JWT.sign(
    { username: username },
    process.env.REFRESH_JWT_SECRET,
    {
      expiresIn: REFRESH_EXPIRE_TIME,
    }
  );

  return refreshToken;
};

const register = async (req, res) => {
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

    if (!!query.length)
      return res.json({ status: "error", message: "Username already exists" });

    await bcrypt.genSalt(12, function (err, salt) {
      bcrypt.hash(value.password, salt, (err, hash) => {
        value.password = hash;
        const user = userModel(value);
        user.refreshToken = [];
        user.save();
        return res.json({ status: "ok", message: "Registred seccesfully" });
      });
    });
  } catch (error) {}
};

const login = async (req, res) => {
  try {
    const schema = joi.object({
      username: joi.string().min(6).max(15).required(),
      password: joi.string().required(),
    });

    const { value, error } = schema.validate(req.body);
    if (error) {
      return res.json({ success: false, error: error });
    }
    const { username, password } = value;
    const user = await userModel.findOne({ username: username }).exec();
    if (!user) {
      return res.json({
        success: false,
        error: "Username not found",
      });
    }
    // delete the token from mongoose collection

    await bcrypt.compare(password, user.password, async function (err, hash) {
      if (hash) {
        const token = generateToken(req.body.username);
        const refreshToken = generateRefreshToken(req.body.username);
        const user = await userModel.findOne({ username: username }).exec();
        console.log(user);
        user.refreshToken = [...user.refreshToken, refreshToken];
        user.save();
        return res
          .cookie("refreshToken", refreshToken, {
            httpOlny: true,
            sameSite: "None",
            secure: true,
          })
          .json({
            success: true,
            token: token,
          });
      } else {
        res.json({ success: false, error: "password incorrect" });
      }
      if (err) {
      }
    });
  } catch (error) {}
};

const isAuthenticated = (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) {
    return res.json({
      username: "",
      isAuthenticated: false,
    });
  }
  JWT.verify(refreshToken, process.env.REFRESH_JWT_SECRET, (error, decoded) => {
    if (error) {
      return res.json({
        username: "",
        isAuthenticated: false,
      });
    }
    return res.status(200).json({
      username: decoded.username,
      isAuthenticated: true,
    });
  });
};

const logout = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;
  if (!refreshToken) return res.sendStatus(204);

  // check if user is authenticated
  const user = await userModel.findOne({ refreshToken: refreshToken });
  if (!user) {
    res.clearCookie("refreshToken", { httpOlny: true });
    return res.status(403).json({
      success: false,
      error: "User not found",
    });
  }
  user.refreshToken = user.refreshToken.filter(
    (token) => token !== refreshToken
  );
  user.save();

  res.clearCookie("refreshToken", { httpOlny: true });
  return res.status(204).json({ success: true });
};

module.exports = { register, login, logout, isAuthenticated };
