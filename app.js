const express = require('express');
const app = express();
const port = 3000;

// Add this middleware to parse JSON bodies
app.use(express.json());

const indexRouter = require('./app/routes/index');
const usersRouter = require('./app/routes/users');

app.use('/', indexRouter);
app.use('/users', usersRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});