import mongoose from "mongoose";
import { jest } from "@jest/globals";
import { User } from "../models/user.model.js";
import {
  getUsers,
  getUserById,
  getSelf,
  loginUser,
  registerUser,
  logoutUser,
  putUpdate,
  patchUpdate,
  deleteUser,
} from "../controllers/user.controllers.js";

jest.mock("../models/user.model.js");

const mockUser = {
  _id: new mongoose.Types.ObjectId(),
  email: "test@example.com",
  password: "hashedpassword",
  name: "Test User",
  age: 25,
  city: "Test City",
  zipCode: 12345,
  comparePassword: jest.fn(),
  generateToken: jest.fn(),
};

User.find = jest.fn();
User.findById = jest.fn();
User.findOne = jest.fn();
User.findByIdAndUpdate = jest.fn();
User.findByIdAndDelete = jest.fn();
User.create = jest.fn();

describe("User Controllers", () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      params: {},
      body: {},
      user: mockUser,
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
      cookie: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  describe("getUsers", () => {
    it("should fetch all users", async () => {
      User.find.mockResolvedValue([mockUser]);
      await getUsers(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "Users fetched successfully",
        data: [mockUser],
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      User.find.mockRejectedValue(error);
      await getUsers(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getUserById", () => {
    it("should fetch user by ID", async () => {
      req.params.Id = mockUser._id.toString();
      User.findById.mockResolvedValue(mockUser);
      await getUserById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User fetched successfully",
        data: mockUser,
      });
    });

    it("should handle missing ID", async () => {
      await getUserById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Missing User Id",
      });
    });

    it("should handle invalid ID format", async () => {
      req.params.Id = "invalidID";
      await getUserById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Invalid User ID format",
      });
    });

    it("should handle user not found", async () => {
      req.params.Id = mockUser._id.toString();
      User.findById.mockResolvedValue(null);
      await getUserById(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User not found",
      });
    });

    it("should handle errors", async () => {
      req.params.Id = mockUser._id.toString();
      const error = new Error("Database error");
      User.findById.mockRejectedValue(error);
      await getUserById(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("getSelf", () => {
    it("should return the authenticated user", async () => {
      await getSelf(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User fetched successfully",
        data: mockUser,
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Server error");
      req.user = null;
      await getSelf(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("loginUser", () => {
    beforeEach(() => {
      req.body = {
        email: "test@example.com",
        password: "password123",
      };
    });

    it("should log in a user", async () => {
      User.findOne.mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(true);
      mockUser.generateToken.mockResolvedValue("token");

      await loginUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).toHaveBeenCalledWith("token", "token");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User logged in successfully",
        data: mockUser,
      });
    });

    it("should handle missing fields", async () => {
      req.body.email = null;
      await loginUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Missing required fields",
      });
    });

    it("should handle incorrect password", async () => {
      User.findOne.mockResolvedValue(mockUser);
      mockUser.comparePassword.mockResolvedValue(false);

      await loginUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Incorrect password",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      User.findOne.mockRejectedValue(error);
      await loginUser(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("registerUser", () => {
    beforeEach(() => {
      req.body = {
        email: "new@example.com",
        password: "password123",
        name: "New User",
        age: 30,
        city: "New City",
        zipCode: 67890,
      };
    });

    it("should register a new user", async () => {
      User.findOne.mockResolvedValue(null);
      User.create.mockResolvedValue(mockUser);

      await registerUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User created successfully",
        data: mockUser,
      });
    });

    it("should handle missing fields", async () => {
      req.body.email = null;
      await registerUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Missing required fields",
      });
    });

    it("should handle existing user", async () => {
      User.findOne.mockResolvedValue(mockUser);

      await registerUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "User with this email already exists",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      User.create.mockRejectedValue(error);
      await registerUser(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("logoutUser", () => {
    it("should log out a user", async () => {
      await logoutUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.cookie).toHaveBeenCalledWith("token", "");
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User logged out successfully",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Server error");
      await logoutUser(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("putUpdate", () => {
    beforeEach(() => {
      req.body = {
        email: "updated@example.com",
        name: "Updated User",
        age: 26,
        city: "Updated City",
        zipCode: 54321,
      };
    });

    it("should update user details", async () => {
      User.findById.mockResolvedValue(mockUser);
      User.findByIdAndUpdate.mockResolvedValue(mockUser);

      await putUpdate(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User updated successfully",
        data: mockUser,
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      User.findByIdAndUpdate.mockRejectedValue(error);
      await putUpdate(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("patchUpdate", () => {
    beforeEach(() => {
      req.body = {
        email: "patched@example.com",
      };
    });

    it("should patch update user details", async () => {
      User.findByIdAndUpdate.mockResolvedValue(mockUser);

      await patchUpdate(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User updated successfully",
        data: mockUser,
      });
    });

    it("should handle password update attempt", async () => {
      req.body.password = "newpassword";
      await patchUpdate(req, res, next);
      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith({
        success: false,
        message: "Password cannot be updated through this route, consider PUT",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      User.findByIdAndUpdate.mockRejectedValue(error);
      await patchUpdate(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });

  describe("deleteUser", () => {
    it("should delete a user", async () => {
      User.findByIdAndDelete.mockResolvedValue(mockUser);
      await deleteUser(req, res, next);
      expect(res.status).toHaveBeenCalledWith(200);
      expect(res.json).toHaveBeenCalledWith({
        success: true,
        message: "User deleted successfully",
      });
    });

    it("should handle errors", async () => {
      const error = new Error("Database error");
      User.findByIdAndDelete.mockRejectedValue(error);
      await deleteUser(req, res, next);
      expect(next).toHaveBeenCalledWith(error);
    });
  });
});
