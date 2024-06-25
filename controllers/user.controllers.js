import mongoose from "mongoose";
import { User } from "../models/user.model.js";

const getUsers = async (req, res, next) => {
  try {
    return res.status(200).json({
      success: true,
      message: "Users fetched successfully",
      data: await User.find({}),
    });
  } catch (error) {
    return next(error);
  }
};

const getUserById = async (req, res, next) => {
  try {
    if (!req.params.Id) {
      return res.status(400).json({
        success: false,
        message: "Missing User Id",
      });
    }

    const Id = new mongoose.Types.ObjectId(req.params.Id);

    if (!mongoose.Types.ObjectId.isValid(Id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid User ID format",
      });
    }

    const user = await User.findById(Id);

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "User not found" });
    }

    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

const getSelf = async (req, res, next) => {
  try {
    if (!req.user) {
      return res.status(400).json({
        success: false,
        message: "User not found",
      });
    }
    return res.status(200).json({
      success: true,
      message: "User fetched successfully",
      data: req.user,
    });
  } catch (error) {
    return next(error);
  }
};

const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const user = await User.findOne({ email });

    const isPasswordCorrect = await user.comparePassword(password);

    if (!isPasswordCorrect) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      });
    }

    const token = await user.generateToken();

    return res.status(200).cookie("token", token).json({
      success: true,
      message: "User logged in successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

const registerUser = async (req, res, next) => {
  try {
    const { email, password, name, age, city, zipCode } = req.body;

    if (!email || !password || !name || !age || !city || !zipCode) {
      return res.status(400).json({
        success: false,
        message: "Missing required fields",
      });
    }

    const existedUser = await User.findOne({ email });

    if (existedUser)
      return res.status(400).json({
        success: false,
        message: "User with this email already exists",
      });

    const user = await User.create({
      email,
      password,
      name,
      age,
      city,
      zipCode,
    });

    if (!user) {
      return res.status(400).json({
        success: false,
        message: "User not created",
      });
    }

    return res.status(200).json({
      success: true,
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    return next(error);
  }
};

const logoutUser = async (req, res, next) => {
  try {
    return res.status(200).cookie("token", "").json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    return next(error);
  }
};

const putUpdate = async (req, res, next) => {
  try {
    const data = req.body;

    const user = await User.findById(req.user?._id);

    if (data.password) {
      user.password = data.password;
      await user.save();
    }

    const newData = {
      email: data.email || user.email,
      name: data.name || user.name,
      age: data.age || user.age,
      city: data.city || user.city,
      zipCode: data.zipCode || user.zipCode,
    };

    const updatedUser = await User.findByIdAndUpdate(req.user?._id, newData, {
      new: true,
      runValidators: true,
      overwrite: true,
    });

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
};

const patchUpdate = async (req, res, next) => {
  try {
    const data = req.body;

    if (data.password) {
      return res.status(400).json({
        success: false,
        message: "Password cannot be updated through this route, consider PUT",
      });
    }

    const updatedUser = await User.findByIdAndUpdate(
      req.user?._id,
      {
        $set: data,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    return res.status(200).json({
      success: true,
      message: "User updated successfully",
      data: updatedUser,
    });
  } catch (error) {
    return next(error);
  }
};

const deleteUser = async (req, res, next) => {
  try {
    await User.findByIdAndDelete(req.user?._id);
    return res.status(200).json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    return next(error);
  }
};

export {
  registerUser,
  getUsers,
  getUserById,
  loginUser,
  logoutUser,
  getSelf,
  putUpdate,
  patchUpdate,
  deleteUser,
};
