import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

function paraFrontend(peca: any) {
  const { normas, ...resto } = peca;
  return { ...resto, normasVinculadas: (normas ?? []).map((n: any) => n.id) };
}

export class PecasController {
  async index(req: Request, res: Response) {
    try {
      const pecas = await prisma.peca.findMany({
        include: { normas: { select: { id: true } } },
        orderBy: { dataCriacao: 'asc' },
      });
      return res.json(pecas.map(paraFrontend));
    } catch (error) {
      console.error('Erro ao buscar peças:', error);
      return res.status(500).json({ error: 'Erro ao buscar peças' });
    }
  }

  async store(req: Request, res: Response) {
    try {
      const { nome, categoria, subcategoria, normasVinculadas } = req.body;
      if (!nome || !categoria || !subcategoria) {
        return res.status(400).json({ error: 'nome, categoria e subcategoria são obrigatórios' });
      }
      const ids: string[] = Array.isArray(normasVinculadas) ? normasVinculadas : [];

      const peca = await prisma.peca.create({
        data: {
          nome: String(nome).trim(),
          categoria,
          subcategoria,
          normas: { connect: ids.map((id) => ({ id })) },
        },
        include: { normas: { select: { id: true } } },
      });
      return res.status(201).json(paraFrontend(peca));
    } catch (error) {
      console.error('Erro ao criar peça:', error);
      return res.status(500).json({ error: 'Erro ao criar peça' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const { nome, categoria, subcategoria, normasVinculadas } = req.body;

      const existente = await prisma.peca.findUnique({ where: { id } });
      if (!existente) return res.status(404).json({ error: 'Peça não encontrada' });

      const data: any = {
        nome: nome !== undefined ? String(nome).trim() : existente.nome,
        categoria: categoria !== undefined ? categoria : existente.categoria,
        subcategoria: subcategoria !== undefined ? subcategoria : existente.subcategoria,
      };
      if (Array.isArray(normasVinculadas)) {
        data.normas = { set: normasVinculadas.map((nid: string) => ({ id: nid })) };
      }

      const peca = await prisma.peca.update({
        where: { id },
        data,
        include: { normas: { select: { id: true } } },
      });
      return res.json(paraFrontend(peca));
    } catch (error) {
      console.error('Erro ao atualizar peça:', error);
      return res.status(500).json({ error: 'Erro ao atualizar peça' });
    }
  }

  async destroy(req: Request, res: Response) {
    try {
      const id = Number(req.params.id);
      const existente = await prisma.peca.findUnique({ where: { id } });
      if (!existente) return res.status(404).json({ error: 'Peça não encontrada' });

      await prisma.peca.delete({ where: { id } });
      return res.json({ message: 'Peça removida com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir peça:', error);
      return res.status(500).json({ error: 'Erro ao excluir peça' });
    }
  }
}
