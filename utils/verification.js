const jwt = require("jsonwebtoken");

// verify if JWT token is valid
const verify = async (req, res, next) => {
  // log request headers
  const token = req.headers?.authorization?.replace("Bearer ", "");
  if (!token) {
    console.log("here is not a valid JWT token");
    return res.sendStatus(401);
  }

  jwt.verify(token, process.env.ACCESS_JWT_SECRET, (err, data) => {
    if (err) {
      return res.sendStatus(403);
    }
    req.user = data;
    next();
  });

  //
};
module.exports = verify;
