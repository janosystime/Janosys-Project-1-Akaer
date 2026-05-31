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

      const norma = await prisma.norma.create({
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

      // Log to HistoricoAlteracao
      await prisma.historicoAlteracao.create({
        data: {
          normaId: id,
          codigoNorma: codigo || null,
          tituloNorma: titulo,
          usuarioNome,
          tipoAlteracao: 'CADASTRO',
          detalhes: `Norma "${id}" cadastrada com sucesso por ${usuarioNome}.`
        }
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

      // Track differences for audit trail
      const alteracoes: string[] = [];
      if (codigo !== undefined && codigo !== normaExistente.codigo) alteracoes.push(`Código: de "${normaExistente.codigo || 'vazio'}" para "${codigo}"`);
      if (titulo !== undefined && titulo !== normaExistente.titulo) alteracoes.push(`Título: de "${normaExistente.titulo}" para "${titulo}"`);
      if (organizacao !== undefined && organizacao !== normaExistente.organizacao) alteracoes.push(`Organização: de "${normaExistente.organizacao}" para "${organizacao}"`);
      if (categoria !== undefined && categoria !== normaExistente.categoria) alteracoes.push(`Categoria: de "${normaExistente.categoria}" para "${categoria}"`);
      if (subcategoria !== undefined && subcategoria !== normaExistente.subcategoria) alteracoes.push(`Subcategoria: de "${normaExistente.subcategoria || 'vazio'}" para "${subcategoria}"`);
      if (item !== undefined && item !== normaExistente.item) alteracoes.push(`Item: de "${normaExistente.item || 'vazio'}" para "${item}"`);
      if (tipo !== undefined && tipo !== normaExistente.tipo) alteracoes.push(`Tipo: de "${normaExistente.tipo}" para "${tipo}"`);
      if (revisao !== undefined && revisao !== normaExistente.revisao) alteracoes.push(`Revisão: de "${normaExistente.revisao || 'vazio'}" para "${revisao}"`);
      if (status !== undefined && status !== normaExistente.status) alteracoes.push(`Status: de "${normaExistente.status}" para "${status}"`);

      const norma = await prisma.norma.update({
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

      // Log to HistoricoAlteracao
      if (alteracoes.length > 0) {
        await prisma.historicoAlteracao.create({
          data: {
            normaId: id,
            codigoNorma: norma.codigo || null,
            tituloNorma: norma.titulo,
            usuarioNome,
            tipoAlteracao: 'EDICAO',
            detalhes: `Norma "${id}" editada por ${usuarioNome}. Alterações: ${alteracoes.join(', ')}.`
          }
        });
      }

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

      // Log to HistoricoAlteracao BEFORE deleting (to capture name/code)
      await prisma.historicoAlteracao.create({
        data: {
          normaId: id,
          codigoNorma: normaExistente.codigo || null,
          tituloNorma: normaExistente.titulo,
          usuarioNome,
          tipoAlteracao: 'EXCLUSAO',
          detalhes: `Norma "${id}" ("${normaExistente.titulo}") excluída por ${usuarioNome}.`
        }
      });

      await prisma.norma.delete({
        where: { id }
      });

      return res.json({ message: 'Norma removida com sucesso' });
    } catch (error) {
      console.error('Erro ao excluir norma:', error);
      return res.status(500).json({ error: 'Erro ao excluir norma' });
    }
  }
}
