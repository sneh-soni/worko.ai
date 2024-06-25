import mongoose from "mongoose";

const idValidator = (req, res, next) => {
  if (
    req.user &&
    req.user._id &&
    mongoose.Types.ObjectId.isValid(req.user._id)
  ) {
    return next();
  } else {
    return res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
  }
};

export { idValidator };
