import jwt from "jsonwebtoken";
import { User } from "../models/user.model.js";

const isAuthenticated = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  const decodedToken = jwt.verify(token, process.env.TOKEN_SECRET);
  const Id = decodedToken._id;
  const user = await User.findById(Id);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User Not Found",
    });
  }

  req.user = user;

  next();
};

export { isAuthenticated };
