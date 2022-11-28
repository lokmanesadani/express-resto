const JWT = require("jsonwebtoken");
const User = require("../models/User");
const { ACCESS_EXPIRE_TIME, REFRESH_EXPIRE_TIME } = require("../utils/statics");
const refreshController = async (req, res) => {
  const refreshToken = req.cookies?.refreshToken;

  if (!refreshToken) {
    console.log("here !");
    return res.sendStatus(401);
  }
  const user = await User.findOne({ refreshToken });
  if (!user) {
    return res.status(403).json({
      success: false,
      message: "User not found",
    });
  }
  await JWT.verify(
    refreshToken,
    process.env.REFRESH_JWT_SECRET,
    async (err, data) => {
      if (err || user.username !== data.username) return res.sendStatus(403);

      JWT.verify(
        refreshToken,
        process.env.REFRESH_JWT_SECRET,
        async (error, data) => {
          if (error) {
            return res.status(403).json({
              success: false,
              message: "refresh token invalid or expired",
            });
          }
          const token = JWT.sign(
            { username: data.username },
            process.env.ACCESS_JWT_SECRET,
            {
              expiresIn: ACCESS_EXPIRE_TIME,
            }
          );

          const newRefreshToken = JWT.sign(
            { username: data.username },
            process.env.REFRESH_JWT_SECRET,
            {
              expiresIn: REFRESH_EXPIRE_TIME,
            }
          );
          user.refreshToken = user.refreshToken.filter(
            (token) => token !== refreshToken
          );
          user.refreshToken = [...user.refreshToken, newRefreshToken];
          user.save();

          return res
            .cookie("refreshToken", newRefreshToken, {
              httpOnly: true,
              secure: true,
              SameSite: "None",
            })
            .json({ success: true, token: token });
        }
      );
    }
  );
};
module.exports = refreshController;
