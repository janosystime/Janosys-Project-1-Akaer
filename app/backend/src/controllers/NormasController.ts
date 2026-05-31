import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';

export class NormasController {
  async index(req: Request, res: Response) {
    try {
      const normas = await prisma.norma.findMany({
        include: { pecas: true },
        orderBy: { dataCriacao: 'desc' }
      });
      return res.json(normas);
    } catch (error) {
      console.error('Erro ao buscar normas:', error);
      return res.status(500).json({ error: 'Erro ao buscar normas' });
    }
  }

  async store(req: Request, res: Response) {
    try {
      const { id, codigo, titulo, organizacao, categoria, subcategoria, item, tipo, revisao, status, notas, referencias, palavrasChave, nomePdf, urlPdf, imagens } = req.body;
      const usuarioNome = (req.headers['x-usuario-nome'] as string) || 'Administrador';

      if (!id || !titulo || !organizacao || !categoria) {
        return res.status(400).json({ error: 'Campos ID, título, organização e categoria são obrigatórios' });
      }

      const norma = await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET @usuario_atual = ?;`, usuarioNome);
        return await tx.norma.create({
          data: {
            id,
            codigo: codigo || null,
            titulo,
            organizacao,
            categoria,
            subcategoria: subcategoria || null,
            item: item || null,
            tipo: tipo || 'Pública',
            revisao: revisao || null,
            status: status || 'Vigente',
            notas: notas || null,
            referencias: referencias || null,
            palavrasChave: palavrasChave || null,
            nomePdf: nomePdf || null,
            urlPdf: urlPdf || null,
            imagens: imagens || null
          }
        });
      });

      return res.status(201).json(norma);
    } catch (error) {
      console.error('Erro ao criar norma:', error);
      return res.status(500).json({ error: 'Erro ao criar norma' });
    }
  }

  async show(req: Request, res: Response) {
    const id = req.params.id as string;
    try {
      const norma = await prisma.norma.findUnique({
        where: { id },
        include: { pecas: true }
      });
      if (!norma) return res.status(404).json({ error: 'Norma não encontrada' });
      return res.json(norma);
    } catch (error) {
      console.error('Erro ao buscar norma:', error);
      return res.status(500).json({ error: 'Erro ao buscar norma' });
    }
  }

  async update(req: Request, res: Response) {
    const id = req.params.id as string;
    try {
      const { codigo, titulo, organizacao, categoria, subcategoria, item, tipo, revisao, status, notas, referencias, palavrasChave, nomePdf, urlPdf, imagens } = req.body;
      const usuarioNome = (req.headers['x-usuario-nome'] as string) || 'Administrador';

      const normaExistente = await prisma.norma.findUnique({
        where: { id }
      });

      if (!normaExistente) {
        return res.status(404).json({ error: 'Norma não encontrada' });
      }

      const norma = await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET @usuario_atual = ?;`, usuarioNome);
        return await tx.norma.update({
          where: { id },
          data: {
            codigo: codigo !== undefined ? codigo : normaExistente.codigo,
            titulo: titulo !== undefined ? titulo : normaExistente.titulo,
            organizacao: organizacao !== undefined ? organizacao : normaExistente.organizacao,
            categoria: categoria !== undefined ? categoria : normaExistente.categoria,
            subcategoria: subcategoria !== undefined ? subcategoria : normaExistente.subcategoria,
            item: item !== undefined ? item : normaExistente.item,
            tipo: tipo !== undefined ? tipo : normaExistente.tipo,
            revisao: revisao !== undefined ? revisao : normaExistente.revisao,
            status: status !== undefined ? status : normaExistente.status,
            notas: notas !== undefined ? notas : normaExistente.notas,
            referencias: referencias !== undefined ? referencias : normaExistente.referencias,
            palavrasChave: palavrasChave !== undefined ? palavrasChave : normaExistente.palavrasChave,
            nomePdf: nomePdf !== undefined ? nomePdf : normaExistente.nomePdf,
            urlPdf: urlPdf !== undefined ? urlPdf : normaExistente.urlPdf,
            imagens: imagens !== undefined ? imagens : normaExistente.imagens
          }
        });
      });

      return res.json(norma);
    } catch (error) {
      console.error('Erro ao atualizar norma:', error);
      return res.status(500).json({ error: 'Erro ao atualizar norma' });
    }
  }

  async destroy(req: Request, res: Response) {
    const id = req.params.id as string;
    try {
      const usuarioNome = (req.headers['x-usuario-nome'] as string) || 'Administrador';

      const normaExistente = await prisma.norma.findUnique({
        where: { id }
      });

      if (!normaExistente) {
        return res.status(404).json({ error: 'Norma não encontrada' });
      }

      await prisma.$transaction(async (tx) => {
        await tx.$executeRawUnsafe(`SET @usuario_atual = ?;`, usuarioNome);
        await tx.norma.delete({
          where: { id }
        });
      });

      return res.json({ message: 'Norma removida com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir norma:', error);
      return res.status(500).json({ error: 'Erro ao excluir norma' });
    }
  }
}
