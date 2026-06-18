import { Router } from 'express';
import { CategoriasController } from '../controllers/CategoriasController';

const categoriasRoutes = Router();
const controller = new CategoriasController();

categoriasRoutes.get('/', controller.index);
categoriasRoutes.post('/', controller.store);
categoriasRoutes.put('/:id', controller.update);
categoriasRoutes.delete('/:id', controller.destroy);

export { categoriasRoutes };
