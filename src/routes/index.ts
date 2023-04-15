import { Router } from 'express';
import { main } from '../controllers';

const baseRouter = Router();

baseRouter.get('/', (req, res) => {
  res.send('Everything works fine.');
});

baseRouter.post('/', main);

export default baseRouter;
