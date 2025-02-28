const express = require('express');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routes = require('./app/routes');
app.use('/', routes);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});