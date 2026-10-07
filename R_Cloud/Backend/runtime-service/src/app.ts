import express from 'express';
import routes from './http/routes.js';

export const app = express();

app.use(express.json());

// Mount runtime endpoints
app.use(routes);

export default app;
