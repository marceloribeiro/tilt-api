const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const indexRouter = require('./app/routes/index');
const usersRouter = require('./app/routes/users');
const authRouter = require('./app/routes/auth');

app.use('/', indexRouter);
app.use('/users', usersRouter);
app.use('/auth', authRouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});