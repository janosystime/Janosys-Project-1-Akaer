import { Router } from 'express';
import { NormasController } from '../controllers/NormasController';

const normasRoutes = Router();
const controller = new NormasController();

normasRoutes.get('/', controller.index);
normasRoutes.post('/', controller.store);
normasRoutes.get('/:id', controller.show);
normasRoutes.put('/:id', controller.update);
normasRoutes.delete('/:id', controller.destroy);

export { normasRoutes };
