const { body, validationResult } = require('express-validator');
const validator = require('validator');

/**
 * Загальна обгортка для перевірки
 */
const validateRequest = (validations) => {
  return async (req, res, next) => {
    await Promise.all(validations.map(v => v.run(req)));

    const errors = validationResult(req);
    if (errors.isEmpty()) return next();

    return res.status(400).json({
      success: false,
      message: 'Помилка валідації',
      errors: errors.array().map(err => ({
        field: err.param,
        message: err.msg,
        location: err.location
      }))
    });
  };
};

/**
 * Валідація реєстрації
 */
const registerValidation = [
  body('username')
    .trim().escape()
    .notEmpty().withMessage("Ім'я обовʼязкове")
    .isLength({ min: 3, max: 30 })
    .matches(/^[a-zA-Z0-9_]+$/),

  body('email')
    .trim()
    .normalizeEmail()
    .isEmail()
    .customSanitizer(e => e.toLowerCase()),

  body('password')
    .isLength({ min: 8 })
    .matches(/[A-Z]/)
    .matches(/[a-z]/)
    .matches(/[0-9]/)
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
];

/**
 * Валідація продукту
 */
const productValidation = [
  body('name')
    .trim().escape()
    .notEmpty()
    .isLength({ max: 100 }),

  body('description')
    .trim().escape()
    .notEmpty()
    .isLength({ max: 500 }),

  body('price')
    .isFloat({ min: 0 })
    .toFloat(),

  body('category')
    .isIn(['electronics', 'clothing', 'books', 'food', 'other']),

  body('quantity')
    .optional()
    .isInt({ min: 0 })
    .toInt()
];

const sanitizeInput = (req, res, next) => {
  const sanitize = obj => {
    if (!obj || typeof obj !== 'object') return;
    for (const k in obj) {
      if (typeof obj[k] === 'string') {
        obj[k] = validator.escape(obj[k]);
      } else {
        sanitize(obj[k]);
      }
    }
  };
  sanitize(req.body);
  sanitize(req.query);
  sanitize(req.params);
  next();
};

/**
 * Захист від NoSQL інʼєкцій
 */
const preventNoSQLInjection = (req, res, next) => {
  const bad = /\$|\{|\}|\[|\]/;
  const scan = obj => {
    if (!obj || typeof obj !== 'object') return false;
    for (const k in obj) {
      if (typeof obj[k] === 'string' && bad.test(obj[k])) return true;
      if (typeof obj[k] === 'object' && scan(obj[k])) return true;
    }
    return false;
  };
  if (scan(req.body) || scan(req.query)) {
    return res.status(400).json({
      success: false,
      message: 'Потенційно небезпечний запит'
    });
  }
  next();
};

module.exports = {
  validateRequest,
  registerValidation,
  productValidation,
  sanitizeInput,
  preventNoSQLInjection
};
