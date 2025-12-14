const express = require('express');
const router = express.Router();
const productModel = require('../data/products');
const userModel = require('../data/users');
const {
  validateRequest,
  productValidation,
  sanitizeInput,
  preventNoSQLInjection
} = require('../middleware/validationMiddleware');

const authenticateToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  const user = userModel.verifyToken(token);
  if (!user) return res.status(401).json({ success: false });
  req.user = user;
  next();
};

router.get('/', (req, res) => {
  const r = productModel.getAll(req.query);
  res.json({ success: true, ...r });
});

router.get('/:id', (req, res) => {
  const p = productModel.findById(req.params.id);
  if (!p) return res.status(404).json({ success: false });
  res.json({ success: true, data: p });
});

router.post(
    '/', 
    authenticateToken,
    sanitizeInput,
    preventNoSQLInjection,
    validateRequest(productValidation),(req, res) => {
        const p = productModel.create({
            ...req.body,
            createdBy: req.user.id,
            inStock: req.body.quantity > 0
        });
        res.status(201).json({ success: true, data: p });
});

router.put('/:id', authenticateToken, (req, res) => {
  const p = productModel.findById(req.params.id);
  if (!p) return res.status(404).json({ success: false });
  if (p.createdBy !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ success: false });

  res.json({ success: true, data: productModel.update(req.params.id, req.body) });
});

router.delete('/:id', authenticateToken, (req, res) => {
  const p = productModel.findById(req.params.id);
  if (!p) return res.status(404).json({ success: false });
  if (p.createdBy !== req.user.id && req.user.role !== 'admin')
    return res.status(403).json({ success: false });

  productModel.delete(req.params.id);
  res.json({ success: true });
});

router.get('/user/my-products', authenticateToken, (req, res) =>
  res.json({ success: true, data: productModel.getByUser(req.user.id) })
);

module.exports = router;
