//middleware/token.js
const jwt = require("jsonwebtoken");

function tokenMiddleware(req, res, next) {
  const token = req.headers["Authorization"];

  if (!token) {
    return res.status(401).json({ message: "토큰이 없습니다." });
  }

  jwt.verify(token, process.env.SECRET, (err, decoded) => {
    if (err) {
      return res.status(401).json({ message: "토큰이 유효하지 않습니다." });
    }
    req.decoded = decoded;
    next();
  });
}

module.exports = tokenMiddleware;