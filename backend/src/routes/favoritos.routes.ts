import { Router } from 'express';
import { FavoritosController } from '../controllers/FavoritosController';

const favoritosRoutes = Router();
const controller = new FavoritosController();

favoritosRoutes.get('/', controller.index);
favoritosRoutes.post('/', controller.store);
favoritosRoutes.delete('/:usuarioId/:normaId', controller.destroy);

export { favoritosRoutes };
