const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const indexRouter = require('./app/routes/index');
const authRouter = require('./app/routes/auth');
const adminRoutes = require('./app/routes/admin');


app.use('/', indexRouter);
app.use('/auth', authRouter);
app.use('/admin', adminRoutes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});