const express = require('express');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./app/config/swagger');
const app = express();
const port = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const routes = require('./app/routes');
app.use('/', routes);

// Serve Swagger documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});