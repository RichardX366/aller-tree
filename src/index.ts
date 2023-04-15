import express from 'express';
import attachMiddleware from 'rx-express-middleware';
import './types';

export const app = express();
attachMiddleware(app, { maxBodySize: '100gb' });

import baseRouter from './routes';

app.use(baseRouter);

app.listen(process.env.PORT || 3005, () =>
  console.log(
    `🚀 Server ready at: http://localhost:${process.env.PORT || 3005}`,
  ),
);
