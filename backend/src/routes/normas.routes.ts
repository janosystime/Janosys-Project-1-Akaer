import { Router } from 'express';
import { NormasController } from '../controllers/NormasController';

const normasRoutes = Router();
const controller = new NormasController();

normasRoutes.get('/', controller.index);
normasRoutes.post('/', controller.store);
normasRoutes.get('/versoes', controller.todasVersoes);
normasRoutes.get('/:id', controller.show);
normasRoutes.get('/:id/versoes', controller.versoes);
normasRoutes.get('/:id/view', controller.view);
normasRoutes.get('/:id/download', controller.download);
normasRoutes.put('/:id', controller.update);
normasRoutes.delete('/:id', controller.destroy);

export { normasRoutes };
