import { Router } from 'express';
import { getImage, main } from '../controllers';

const baseRouter = Router();

baseRouter.get('/', (req, res) => {
  res.send('Everything works fine.');
});

baseRouter.post('/', main);
baseRouter.get('/results/:time', getImage);

export default baseRouter;
