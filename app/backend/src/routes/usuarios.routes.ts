import { Router } from 'express';
import { UsuariosController } from '../controllers/UsuariosController';

const usuariosRoutes = Router();
const controller = new UsuariosController();

usuariosRoutes.get('/', controller.index);
usuariosRoutes.post('/', controller.store);
usuariosRoutes.put('/:id', controller.update);
usuariosRoutes.delete('/:id', controller.destroy);

export { usuariosRoutes };
