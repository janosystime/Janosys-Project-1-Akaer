import { Router } from 'express';
import { SolicitacoesController } from '../controllers/SolicitacoesController';

const solicitacoesRoutes = Router();
const controller = new SolicitacoesController();

solicitacoesRoutes.get('/', controller.index);
solicitacoesRoutes.post('/', controller.store);
solicitacoesRoutes.put('/:id', controller.update);

export { solicitacoesRoutes };
