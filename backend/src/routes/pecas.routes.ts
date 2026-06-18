import { Router } from 'express';
import { PecasController } from '../controllers/PecasController';

const pecasRoutes = Router();
const controller = new PecasController();

pecasRoutes.get('/', controller.index);
pecasRoutes.post('/', controller.store);
pecasRoutes.put('/:id', controller.update);
pecasRoutes.delete('/:id', controller.destroy);

export { pecasRoutes };
