import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class FavoritosController {
  // GET /favoritos?usuarioId=1  -> lista os normaId favoritados pelo usuário
  async index(req: Request, res: Response) {
    const usuarioId = Number(req.query.usuarioId);
    if (!usuarioId) {
      return res.status(400).json({ error: 'usuarioId é obrigatório' });
    }
    try {
      const favoritos = await prisma.favorito.findMany({
        where: { usuarioId },
        select: { normaId: true },
        orderBy: { dataCriacao: 'desc' },
      });
      return res.json(favoritos.map((f: { normaId: string }) => f.normaId));
    } catch (error) {
      console.error('Erro ao buscar favoritos:', error);
      return res.status(500).json({ error: 'Erro ao buscar favoritos' });
    }
  }

  // POST /favoritos { usuarioId, normaId } -> favorita (idempotente)
  async store(req: Request, res: Response) {
    const { usuarioId, normaId } = req.body;
    if (!usuarioId || !normaId) {
      return res.status(400).json({ error: 'usuarioId e normaId são obrigatórios' });
    }
    try {
      const favorito = await prisma.favorito.upsert({
        where: { usuarioId_normaId: { usuarioId: Number(usuarioId), normaId } },
        update: {},
        create: { usuarioId: Number(usuarioId), normaId },
      });
      return res.status(201).json(favorito);
    } catch (error) {
      console.error('Erro ao favoritar:', error);
      return res.status(500).json({ error: 'Erro ao favoritar' });
    }
  }

  // DELETE /favoritos/:usuarioId/:normaId -> desfavorita
  async destroy(req: Request, res: Response) {
    const usuarioId = Number(req.params.usuarioId);
    const normaId = req.params.normaId as string;
    try {
      await prisma.favorito.deleteMany({ where: { usuarioId, normaId } });
      return res.json({ message: 'Favorito removido' });
    } catch (error) {
      console.error('Erro ao remover favorito:', error);
      return res.status(500).json({ error: 'Erro ao remover favorito' });
    }
  }
}
