const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const { securityHeaders } = require('./middleware/securityMiddleware');
const { xssFilterOutput, validateContentType } = require('./middleware/xssFilter');

const authRoutes = require('./routes/auth');
const productRoutes = require('./routes/products');

const app = express();

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(securityHeaders);
app.use(validateContentType);
app.use(express.json({ limit: '5mb' }));
app.use(xssFilterOutput);

app.get('/', (req, res) => {
  res.json({
    message: 'Простий REST API на Express.js',
    version: '1.0.0'
  });
});

app.get('/api/status', (req, res) => {
  res.json({ status: 'online', uptime: process.uptime() });
});

app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: 'Маршрут не знайдено'
  });
});

app.use((err, req, res, next) => {
  console.error(err.message);
  res.status(500).json({ success: false });
});

app.listen(5000, () =>
  console.log('Server running on http://localhost:5000')
);
