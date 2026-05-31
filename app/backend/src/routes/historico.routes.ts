import { Router } from 'express';
import { HistoricoController } from '../controllers/HistoricoController';

const historicoRoutes = Router();
const controller = new HistoricoController();

historicoRoutes.get('/', controller.index);
historicoRoutes.post('/', controller.store);
historicoRoutes.get('/:normaId', controller.show);

export { historicoRoutes };
