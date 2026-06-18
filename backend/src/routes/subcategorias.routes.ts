import { Router } from 'express';
import { SubcategoriasController } from '../controllers/SubcategoriasController';

const subcategoriasRoutes = Router();
const controller = new SubcategoriasController();

subcategoriasRoutes.post('/', controller.store);
subcategoriasRoutes.put('/:id', controller.update);
subcategoriasRoutes.delete('/:id', controller.destroy);

export { subcategoriasRoutes };
