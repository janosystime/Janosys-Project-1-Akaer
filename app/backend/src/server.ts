import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { normasRoutes } from './routes/normas.routes';
import { usuariosRoutes } from './routes/usuarios.routes';
import { authRoutes } from './routes/auth.routes';
import { solicitacoesRoutes } from './routes/solicitacoes.routes';
import { historicoRoutes } from './routes/historico.routes';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json({ limit: '50mb' }));

app.get('/', (req, res) => {
  res.json({ message: 'Janosys API is running' });
});

app.use('/auth', authRoutes);
app.use('/normas', normasRoutes);
app.use('/usuarios', usuariosRoutes);
app.use('/solicitacoes', solicitacoesRoutes);
app.use('/historico', historicoRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
