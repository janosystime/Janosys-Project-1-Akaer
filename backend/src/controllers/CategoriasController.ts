import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class CategoriasController {
  // Lista categorias com suas subcategorias.
  async index(req: Request, res: Response) {
    try {
      const categorias = await prisma.categoria.findMany({
        include: { subcategorias: { orderBy: { nome: 'asc' } } },
        orderBy: { dataCriacao: 'asc' },
      });
      return res.json(categorias);
    } catch (error) {
      console.error('Erro ao buscar categorias:', error);
      return res.status(500).json({ error: 'Erro ao buscar categorias' });
    }
  }

  async store(req: Request, res: Response) {
    try {
      const { nome, icone, tema } = req.body;
      if (!nome || !nome.trim()) {
        return res.status(400).json({ error: 'Nome da categoria é obrigatório' });
      }

      const existente = await prisma.categoria.findUnique({ where: { nome: nome.trim() } });
      if (existente) {
        return res.status(409).json({ error: 'Já existe uma categoria com esse nome' });
      }

      const categoria = await prisma.categoria.create({
        data: {
          nome: nome.trim(),
          icone: icone || 'fa-folder',
          tema: tema || 'theme-cat-geral',
        },
        include: { subcategorias: true },
      });
      return res.status(201).json(categoria);
    } catch (error) {
      console.error('Erro ao criar categoria:', error);
      return res.status(500).json({ error: 'Erro ao criar categoria' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { nome, icone, tema } = req.body;

      const categoria = await prisma.categoria.findUnique({ where: { id } });
      if (!categoria) return res.status(404).json({ error: 'Categoria não encontrada' });

      const novoNome = nome !== undefined ? String(nome).trim() : categoria.nome;
      if (!novoNome) return res.status(400).json({ error: 'Nome inválido' });

      // se renomeou, propaga o novo nome para as peças daquela categoria
      if (novoNome !== categoria.nome) {
        const duplicada = await prisma.categoria.findUnique({ where: { nome: novoNome } });
        if (duplicada) return res.status(409).json({ error: 'Já existe uma categoria com esse nome' });
        await prisma.peca.updateMany({
          where: { categoria: categoria.nome },
          data: { categoria: novoNome },
        });
      }

      const atualizada = await prisma.categoria.update({
        where: { id },
        data: {
          nome: novoNome,
          icone: icone !== undefined ? icone : categoria.icone,
          tema: tema !== undefined ? tema : categoria.tema,
        },
        include: { subcategorias: true },
      });
      return res.json(atualizada);
    } catch (error) {
      console.error('Erro ao atualizar categoria:', error);
      return res.status(500).json({ error: 'Erro ao atualizar categoria' });
    }
  }

  async destroy(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const categoria = await prisma.categoria.findUnique({ where: { id } });
      if (!categoria) return res.status(404).json({ error: 'Categoria não encontrada' });

      if (categoria.padrao) {
        return res.status(403).json({ error: 'Categoria padrão não pode ser excluída' });
      }

      // remove as peças dessa categoria (subcategorias caem por cascade no banco)
      await prisma.peca.deleteMany({ where: { categoria: categoria.nome } });
      await prisma.categoria.delete({ where: { id } });

      return res.json({ message: 'Categoria removida com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir categoria:', error);
      return res.status(500).json({ error: 'Erro ao excluir categoria' });
    }
  }
}
