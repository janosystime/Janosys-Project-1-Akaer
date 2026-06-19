import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';
import { prisma } from '../lib/prisma';

const PDF_DIR = path.join(__dirname, '..', '..', 'pdfs');

function sanitizarNorma(norma: any) {
  const { urlPdf, ...resto } = norma;
  return { ...resto, temPdf: !!urlPdf };
}

function carregarBytesPdf(norma: any): Buffer | null {
  const url: string | null = norma?.urlPdf ?? null;
  if (!url) return null;

  if (url.startsWith('data:')) {
    const virgula = url.indexOf(',');
    const base64 = virgula >= 0 ? url.substring(virgula + 1) : url;
    return Buffer.from(base64, 'base64');
  }

  const nomeArquivo = path.basename(url);
  const caminho = path.join(PDF_DIR, nomeArquivo);
  if (!fs.existsSync(caminho)) return null;
  return fs.readFileSync(caminho);
}

async function aplicarMarcaDagua(pdfBytes: Buffer, texto: string): Promise<Uint8Array> {
  const pdfDoc = await PDFDocument.load(pdfBytes, { ignoreEncryption: true });
  const fonte = await pdfDoc.embedFont(StandardFonts.Helvetica);
  const tamanho = 11;

  for (const pagina of pdfDoc.getPages()) {
    const { width, height } = pagina.getSize();
    const passoX = 240;
    const passoY = 150;
    for (let y = -passoY; y < height + passoY; y += passoY) {
      for (let x = -passoX; x < width + passoX; x += passoX) {
        pagina.drawText(texto, {
          x,
          y,
          size: tamanho,
          font: fonte,
          color: rgb(0.45, 0.45, 0.45),
          opacity: 0.18,
          rotate: degrees(35),
        });
      }
    }
  }

  return pdfDoc.save();
}

function montarSnapshot(norma: any) {
  return {
    codigo: norma.codigo ?? null,
    titulo: norma.titulo,
    organizacao: norma.organizacao,
    categoria: norma.categoria,
    subcategoria: norma.subcategoria ?? null,
    item: norma.item ?? null,
    tipo: norma.tipo,
    revisao: norma.revisao ?? null,
    status: norma.status,
    notas: norma.notas ?? null,
    referencias: norma.referencias ?? null,
    palavrasChave: norma.palavrasChave ?? null,
    nomePdf: norma.nomePdf ?? null,
    urlPdf: norma.urlPdf ?? null,
    imagens: norma.imagens ?? null,
  };
}

async function registrarVersao(tx: any, norma: any, evento: 'CADASTRO' | 'EDICAO', usuarioNome: string) {
  const ultima = await tx.versaoNorma.findFirst({
    where: { normaId: norma.id },
    orderBy: { numero: 'desc' },
    select: { numero: true },
  });
  const numero = (ultima?.numero ?? 0) + 1;
  await tx.versaoNorma.create({
    data: { normaId: norma.id, numero, evento, usuarioNome, ...montarSnapshot(norma) },
  });
}

export class NormasController {
  async index(req: Request, res: Response) {
    try {
      const normas = await prisma.norma.findMany({
        include: { pecas: true },
        orderBy: { dataCriacao: 'desc' }
      });
      return res.json(normas.map(sanitizarNorma));
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

      const norma = await prisma.$transaction(async (tx: any) => {
        await tx.$executeRawUnsafe(`SET @usuario_atual = ?;`, usuarioNome);
        const criada = await tx.norma.create({
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
            imagens: imagens || null,
            criadoPor: usuarioNome
          }
        });
        await registrarVersao(tx, criada, 'CADASTRO', usuarioNome);
        return criada;
      });

      return res.status(201).json(sanitizarNorma(norma));
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
      return res.json(sanitizarNorma(norma));
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

      const norma = await prisma.$transaction(async (tx: any) => {
        await tx.$executeRawUnsafe(`SET @usuario_atual = ?;`, usuarioNome);
        const atualizada = await tx.norma.update({
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
            imagens: imagens !== undefined ? imagens : normaExistente.imagens,
            criadoPor: normaExistente.criadoPor
          }
        });
        await registrarVersao(tx, atualizada, 'EDICAO', usuarioNome);
        return atualizada;
      });

      return res.json(sanitizarNorma(norma));
    } catch (error) {
      console.error('Erro ao atualizar norma:', error);
      return res.status(500).json({ error: 'Erro ao atualizar norma' });
    }
  }

  async todasVersoes(_req: Request, res: Response) {
    try {
      const versoes = await prisma.versaoNorma.findMany({
        orderBy: { data: 'desc' },
      });
      return res.json(versoes);
    } catch (error) {
      console.error('Erro ao buscar todas as versões:', error);
      return res.status(500).json({ error: 'Erro ao buscar versões' });
    }
  }

  async versoes(req: Request, res: Response) {
    const normaId = req.params.id as string;
    try {
      const versoes = await prisma.versaoNorma.findMany({
        where: { normaId },
        orderBy: { numero: 'desc' },
      });
      return res.json(versoes);
    } catch (error) {
      console.error('Erro ao buscar versões da norma:', error);
      return res.status(500).json({ error: 'Erro ao buscar versões da norma' });
    }
  }

  async view(req: Request, res: Response) {
    const id = req.params.id as string;
    try {
      const norma = await prisma.norma.findUnique({ where: { id } });
      if (!norma) return res.status(404).json({ error: 'Norma não encontrada' });

      const bytes = carregarBytesPdf(norma);
      if (!bytes) return res.status(404).json({ error: 'PDF não disponível' });

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');
      return res.end(bytes);
    } catch (error) {
      console.error('Erro ao exibir PDF:', error);
      return res.status(500).json({ error: 'Erro ao exibir PDF' });
    }
  }

  async download(req: Request, res: Response) {
    const id = req.params.id as string;
    try {
      const norma = await prisma.norma.findUnique({ where: { id } });
      if (!norma) return res.status(404).json({ error: 'Norma não encontrada' });

      const bytes = carregarBytesPdf(norma);
      if (!bytes) return res.status(404).json({ error: 'PDF não disponível' });

      const usuarioNome = (req.headers['x-usuario-nome'] as string) || 'Usuário';
      const dataHora = new Date().toLocaleString('pt-BR', {
        dateStyle: 'short',
        timeStyle: 'short',
      });
      const texto = `${usuarioNome}  -  ${dataHora}  -  CONFIDENCIAL`;

      const marcado = await aplicarMarcaDagua(bytes, texto);

      const nomeDownload = (norma.nomePdf || `${id}.pdf`).replace(/"/g, '');
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename="${nomeDownload}"`);
      return res.end(Buffer.from(marcado));
    } catch (error) {
      console.error('Erro ao gerar PDF com marca d\'água:', error);
      return res.status(500).json({ error: 'Erro ao gerar PDF para download' });
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

      await prisma.$transaction(async (tx: any) => {
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
