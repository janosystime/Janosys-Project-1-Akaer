import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class HistoricoController {
  async index(req: Request, res: Response) {
    try {
      const logs = await prisma.historicoAlteracao.findMany({
        orderBy: { data: 'desc' }
      });
      return res.json(logs);
    } catch (error) {
      console.error('Erro ao buscar histórico:', error);
      return res.status(500).json({ error: 'Erro ao buscar histórico' });
    }
  }

  async show(req: Request, res: Response) {
    const normaId = req.params.normaId as string;
    try {
      const logs = await prisma.historicoAlteracao.findMany({
        where: { normaId },
        orderBy: { data: 'desc' }
      });
      return res.json(logs);
    } catch (error) {
      console.error('Erro ao buscar histórico de norma:', error);
      return res.status(500).json({ error: 'Erro ao buscar histórico de norma' });
    }
  }

  async store(req: Request, res: Response) {
    try {
      const { normaId, codigoNorma, tituloNorma, usuarioNome, tipoAlteracao, detalhes } = req.body;

      if (!normaId || !tituloNorma || !usuarioNome || !tipoAlteracao || !detalhes) {
        return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
      }

      const log = await prisma.historicoAlteracao.create({
        data: {
          normaId,
          codigoNorma: codigoNorma || null,
          tituloNorma,
          usuarioNome,
          tipoAlteracao,
          detalhes
        }
      });

      return res.status(201).json(log);
    } catch (error) {
      console.error('Erro ao criar log de auditoria:', error);
      return res.status(500).json({ error: 'Erro ao criar log de auditoria' });
    }
  }
}
