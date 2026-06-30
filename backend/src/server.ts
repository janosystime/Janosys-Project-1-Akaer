import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { normasRoutes } from './routes/normas.routes';
import { usuariosRoutes } from './routes/usuarios.routes';
import { authRoutes } from './routes/auth.routes';
import { solicitacoesRoutes } from './routes/solicitacoes.routes';
import { historicoRoutes } from './routes/historico.routes';
import { favoritosRoutes } from './routes/favoritos.routes';
import { categoriasRoutes } from './routes/categorias.routes';
import { subcategoriasRoutes } from './routes/subcategorias.routes';
import { pecasRoutes } from './routes/pecas.routes';
import { sincronizarTodasNormasRAG } from './lib/rag-client';

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
app.use('/favoritos', favoritosRoutes);
app.use('/categorias', categoriasRoutes);
app.use('/subcategorias', subcategoriasRoutes);
app.use('/pecas', pecasRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);

  // Sincroniza todas as normas com o RAG na inicialização (fire-and-forget)
  setTimeout(() => {
    console.log('[RAG] Iniciando sincronização inicial com o serviço RAG...');
    sincronizarTodasNormasRAG()
      .then(() => console.log('[RAG] Sincronização inicial concluída.'))
      .catch((err) => console.error('[RAG] Erro na sincronização inicial:', err));
  }, 5000);
});
