const express = require('express');
const cors = require('cors');
const cookieParser = require('cookie-parser');
const morgan = require('morgan');

const authRoutes = require('./routes/authRoutes');
const aiRoutes = require('./routes/ai');
const { errorHandler } = require('./middleware/errorHandler');

const app = express();

app.use(morgan('dev'));
app.use(
  cors({
    origin: process.env.CLIENT_ORIGIN?.split(',').map((s) => s.trim()) || true,
    credentials: true,
  })
);
app.use(express.json({ limit: '1mb' }));
app.use(cookieParser());

app.get('/health', (req, res) => {
  res.status(200).json({ data: { status: 'ok' } });
});

app.use('/api/auth', authRoutes);
app.use('/api/ai', aiRoutes);

app.use(errorHandler);

module.exports = { app };
