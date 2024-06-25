import { body, validationResult } from "express-validator";

const validateHandler = (req, res, next) => {
  const errors = validationResult(req);

  if (errors.isEmpty()) {
    return next();
  } else {
    return res.status(400).json({
      success: false,
      message: "Validation error",
    });
  }
};

const registerValidator = () => [
  body("email").notEmpty().isEmail(),
  body("name").notEmpty(),
  body("age").notEmpty().isNumeric(),
  body("city").notEmpty(),
  body("password").notEmpty().isLength({ min: 6 }),
  body("zipCode").notEmpty().isPostalCode("any"),
];

const loginValidator = () => [
  body("email").notEmpty().isEmail(),
  body("password").notEmpty().isLength({ min: 6 }),
];

export { loginValidator, registerValidator, validateHandler };
