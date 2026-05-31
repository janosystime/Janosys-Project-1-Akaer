import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { StatusSolicitacao } from '@prisma/client';

const statusMapToFrontend: Record<StatusSolicitacao, string> = {
  AGUARDANDO: 'Aguardando análise',
  ANALISE: 'Em análise',
  ACEITA: 'Aceita',
  INDEFERIDA: 'Indeferida'
};

const statusMapToDb: Record<string, StatusSolicitacao> = {
  'Aguardando análise': 'AGUARDANDO',
  'Em análise': 'ANALISE',
  'Aceita': 'ACEITA',
  'Indeferida': 'INDEFERIDA'
};

export class SolicitacoesController {
  async index(req: Request, res: Response) {
    try {
      const dbSolicitacoes = await prisma.solicitacao.findMany({
        orderBy: { data: 'desc' }
      });

      const solicitacoes = dbSolicitacoes.map(s => ({
        id: s.id,
        codigo: s.codigo || '',
        titulo: s.titulo,
        motivo: s.motivo || '',
        solicitante: s.solicitante,
        data: s.data.toISOString().split('T')[0],
        status: statusMapToFrontend[s.status],
        motivoRecusa: s.motivoRecusa || ''
      }));

      return res.json(solicitacoes);
    } catch (error) {
      console.error('Erro ao buscar solicitações:', error);
      return res.status(500).json({ error: 'Erro ao buscar solicitações' });
    }
  }

  async store(req: Request, res: Response) {
    try {
      const { codigo, titulo, motivo, solicitante } = req.body;

      if (!titulo || !solicitante) {
        return res.status(400).json({ error: 'Título e solicitante são obrigatórios' });
      }

      const solicitacao = await prisma.solicitacao.create({
        data: {
          codigo: codigo || null,
          titulo,
          motivo: motivo || null,
          solicitante,
          status: 'AGUARDANDO'
        }
      });

      return res.status(201).json({
        id: solicitacao.id,
        codigo: solicitacao.codigo || '',
        titulo: solicitacao.titulo,
        motivo: solicitacao.motivo || '',
        solicitante: solicitacao.solicitante,
        data: solicitacao.data.toISOString().split('T')[0],
        status: statusMapToFrontend[solicitacao.status],
        motivoRecusa: ''
      });

    } catch (error) {
      console.error('Erro ao criar solicitação:', error);
      return res.status(500).json({ error: 'Erro ao criar solicitação' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { status, motivoRecusa } = req.body;

      const solicitacaoExistente = await prisma.solicitacao.findUnique({
        where: { id: Number(id) }
      });

      if (!solicitacaoExistente) {
        return res.status(404).json({ error: 'Solicitação não encontrada' });
      }

      const dbStatus = statusMapToDb[status];
      if (!dbStatus) {
        return res.status(400).json({ error: 'Status inválido' });
      }

      const solicitacao = await prisma.solicitacao.update({
        where: { id: Number(id) },
        data: {
          status: dbStatus,
          motivoRecusa: dbStatus === 'INDEFERIDA' ? (motivoRecusa || null) : null
        }
      });

      return res.json({
        id: solicitacao.id,
        codigo: solicitacao.codigo || '',
        titulo: solicitacao.titulo,
        motivo: solicitacao.motivo || '',
        solicitante: solicitacao.solicitante,
        data: solicitacao.data.toISOString().split('T')[0],
        status: statusMapToFrontend[solicitacao.status],
        motivoRecusa: solicitacao.motivoRecusa || ''
      });

    } catch (error) {
      console.error('Erro ao atualizar solicitação:', error);
      return res.status(500).json({ error: 'Erro ao atualizar solicitação' });
    }
  }
}
