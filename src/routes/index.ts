import { Router } from 'express';
import { getImage, getTree, main } from '../controllers';

const baseRouter = Router();

baseRouter.get('/', (req, res) => {
  res.send('Everything works fine.');
});

baseRouter.post('/', main);
baseRouter.get('/results/:time', getImage);
baseRouter.get('/tree/:tree', getTree);

export default baseRouter;
