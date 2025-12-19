require('dotenv').config();

const { app } = require('./app');
const { connectDb } = require('./config/db');

const port = process.env.PORT || 4000;

const start = async () => {
  await connectDb();

  app.listen(port, () => {
    console.log(`Server listening on :${port}`);
  });
};

start().catch((err) => {
  console.error(err);
  process.exit(1);
});
