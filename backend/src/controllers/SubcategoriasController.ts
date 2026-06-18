import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class SubcategoriasController {
  async store(req: Request, res: Response) {
    try {
      const { categoriaId, nome } = req.body;
      if (!categoriaId || !nome || !String(nome).trim()) {
        return res.status(400).json({ error: 'categoriaId e nome são obrigatórios' });
      }

      const categoria = await prisma.categoria.findUnique({ where: { id: Number(categoriaId) } });
      if (!categoria) return res.status(404).json({ error: 'Categoria não encontrada' });

      const existente = await prisma.subcategoria.findUnique({
        where: { categoriaId_nome: { categoriaId: Number(categoriaId), nome: String(nome).trim() } },
      });
      if (existente) return res.status(409).json({ error: 'Já existe uma subcategoria com esse nome nesta categoria' });

      const subcategoria = await prisma.subcategoria.create({
        data: { categoriaId: Number(categoriaId), nome: String(nome).trim() },
      });
      return res.status(201).json(subcategoria);
    } catch (error) {
      console.error('Erro ao criar subcategoria:', error);
      return res.status(500).json({ error: 'Erro ao criar subcategoria' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { nome } = req.body;
      const sub = await prisma.subcategoria.findUnique({ where: { id }, include: { categoria: true } });
      if (!sub) return res.status(404).json({ error: 'Subcategoria não encontrada' });

      const novoNome = String(nome ?? '').trim();
      if (!novoNome) return res.status(400).json({ error: 'Nome inválido' });

      if (novoNome !== sub.nome) {
        const duplicada = await prisma.subcategoria.findUnique({
          where: { categoriaId_nome: { categoriaId: sub.categoriaId, nome: novoNome } },
        });
        if (duplicada) return res.status(409).json({ error: 'Já existe uma subcategoria com esse nome nesta categoria' });

        // propaga o novo nome para as peças daquela categoria/subcategoria
        await prisma.peca.updateMany({
          where: { categoria: sub.categoria.nome, subcategoria: sub.nome },
          data: { subcategoria: novoNome },
        });
      }

      const atualizada = await prisma.subcategoria.update({ where: { id }, data: { nome: novoNome } });
      return res.json(atualizada);
    } catch (error) {
      console.error('Erro ao atualizar subcategoria:', error);
      return res.status(500).json({ error: 'Erro ao atualizar subcategoria' });
    }
  }

  async destroy(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const sub = await prisma.subcategoria.findUnique({ where: { id }, include: { categoria: true } });
      if (!sub) return res.status(404).json({ error: 'Subcategoria não encontrada' });

      // remove as peças dessa subcategoria
      await prisma.peca.deleteMany({ where: { categoria: sub.categoria.nome, subcategoria: sub.nome } });
      await prisma.subcategoria.delete({ where: { id } });

      return res.json({ message: 'Subcategoria removida com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir subcategoria:', error);
      return res.status(500).json({ error: 'Erro ao excluir subcategoria' });
    }
  }
}
