import "dotenv/config";
import { PrismaMariaDb } from "@prisma/adapter-mariadb";
import { PrismaClient } from "@prisma/client";

const url = new URL(process.env.DATABASE_URL!);

const adapter = new PrismaMariaDb({
  host: url.hostname,
  port: Number(url.port) || 3306,
  user: url.username,
  password: url.password,
  database: url.pathname.slice(1),
  connectionLimit: 5,
});

const prisma = new PrismaClient({ adapter });

async function main() {
  // Categorias
  const categorias = await Promise.all([
    prisma.categoria.upsert({ where: { id: 1 }, update: {}, create: { descricao: "Peça" } }),
    prisma.categoria.upsert({ where: { id: 2 }, update: {}, create: { descricao: "Conjunto" } }),
    prisma.categoria.upsert({ where: { id: 3 }, update: {}, create: { descricao: "Instalação" } }),
    prisma.categoria.upsert({ where: { id: 4 }, update: {}, create: { descricao: "Geral" } }),
  ]);

  const [peca, conjunto, instalacao, geral] = categorias;

  // Subcategorias
  const subcategorias = await Promise.all([
    prisma.subcategoria.upsert({ where: { id: 1 }, update: {}, create: { descricao: "Metálica",                   categoriaId: peca.id } }),
    prisma.subcategoria.upsert({ where: { id: 2 }, update: {}, create: { descricao: "Não Metálica",               categoriaId: peca.id } }),
    prisma.subcategoria.upsert({ where: { id: 3 }, update: {}, create: { descricao: "Instalação de Acessórios",   categoriaId: conjunto.id } }),
    prisma.subcategoria.upsert({ where: { id: 4 }, update: {}, create: { descricao: "União de Peças",             categoriaId: conjunto.id } }),
    prisma.subcategoria.upsert({ where: { id: 5 }, update: {}, create: { descricao: "Cablagem",                   categoriaId: conjunto.id } }),
    prisma.subcategoria.upsert({ where: { id: 6 }, update: {}, create: { descricao: "Estrutura",                  categoriaId: instalacao.id } }),
    prisma.subcategoria.upsert({ where: { id: 7 }, update: {}, create: { descricao: "Hidromecânicos",             categoriaId: instalacao.id } }),
    prisma.subcategoria.upsert({ where: { id: 8 }, update: {}, create: { descricao: "Elétrica",                   categoriaId: instalacao.id } }),
    prisma.subcategoria.upsert({ where: { id: 9 }, update: {}, create: { descricao: "Geral",                      categoriaId: instalacao.id } }),
    prisma.subcategoria.upsert({ where: { id: 10}, update: {}, create: { descricao: "Teste",                      categoriaId: instalacao.id } }),
    prisma.subcategoria.upsert({ where: { id: 11}, update: {}, create: { descricao: "Basic Notes",                categoriaId: geral.id } }),
    prisma.subcategoria.upsert({ where: { id: 12}, update: {}, create: { descricao: "Identificação",              categoriaId: geral.id } }),
  ]);

  const [, , , uniaoDePecas, cablagem, , , , geralInstalacao] = subcategorias;

  // Tipos de norma (equivalente a "organizacao" no mock)
  const tipos = await Promise.all([
    prisma.tipoNorma.upsert({ where: { id: 1 }, update: {}, create: { descricao: "ANAC" } }),
    prisma.tipoNorma.upsert({ where: { id: 2 }, update: {}, create: { descricao: "FAA" } }),
    prisma.tipoNorma.upsert({ where: { id: 3 }, update: {}, create: { descricao: "EASA" } }),
    prisma.tipoNorma.upsert({ where: { id: 4 }, update: {}, create: { descricao: "ICAO" } }),
    prisma.tipoNorma.upsert({ where: { id: 5 }, update: {}, create: { descricao: "DoD" } }),
    prisma.tipoNorma.upsert({ where: { id: 6 }, update: {}, create: { descricao: "SAE" } }),
    prisma.tipoNorma.upsert({ where: { id: 7 }, update: {}, create: { descricao: "ISO" } }),
    prisma.tipoNorma.upsert({ where: { id: 8 }, update: {}, create: { descricao: "AKAER" } }),
  ]);

  const [anac, faa, easa, , , , iso] = tipos;

  // Notas
  const notas = await Promise.all([
    prisma.nota.upsert({ where: { id: 1 }, update: {}, create: { descricao: "Norma principal de safety." } }),
    prisma.nota.upsert({ where: { id: 2 }, update: {}, create: { descricao: "Requisitos gerais para o sistema de gestão da qualidade nas plantas de manufatura." } }),
    prisma.nota.upsert({ where: { id: 3 }, update: {}, create: { descricao: "Especificações essenciais para certificação EASA em aeronaves de grande porte." } }),
  ]);

  // Normas
  const norma1 = await prisma.norma.upsert({
    where: { id: 1 },
    update: {},
    create: {
      titulo:        "Análise de Segurança de Sistemas",
      identificador: "RBAC 25.1309",
      orgao:         "ANAC",
      status:        true,
      urlPdf:        "/pdf/rbac-25-1309.pdf",
      imagemUrl:     "/imagem/rbac-25-1309.jpeg",
      descricao:     "safety, análise de risco",
      tipoNormaId:   anac.id,
      subcategoriaId: geralInstalacao.id,
    },
  });

  const norma2 = await prisma.norma.upsert({
    where: { id: 2 },
    update: {},
    create: {
      titulo:        "Damage Tolerance and Fatigue Evaluation",
      identificador: "FAR 25.571",
      orgao:         "FAA",
      status:        true,
      urlPdf:        "/pdf/far-25-571.pdf",
      imagemUrl:     "/imagem/far-25-571.jpeg",
      descricao:     "fadiga, tolerância, dano",
      tipoNormaId:   faa.id,
      subcategoriaId: uniaoDePecas.id,
    },
  });

  const norma3 = await prisma.norma.upsert({
    where: { id: 3 },
    update: {},
    create: {
      titulo:        "Quality management systems — Requirements",
      identificador: "ISO 9001:2015",
      orgao:         "ISO",
      status:        true,
      descricao:     "qualidade, gestão, requisitos",
      tipoNormaId:   iso.id,
      subcategoriaId: 1, // Metálica
    },
  });

  const norma4 = await prisma.norma.upsert({
    where: { id: 4 },
    update: {},
    create: {
      titulo:        "Certification Specifications for Large Aeroplanes",
      identificador: "CS-25",
      orgao:         "EASA",
      status:        true,
      descricao:     "certificação, aeronave grande, easa",
      tipoNormaId:   easa.id,
      subcategoriaId: cablagem.id,
    },
  });

  // Notas das normas
  await Promise.all([
    prisma.notaNorma.upsert({ where: { notaId_normaId: { notaId: notas[0].id, normaId: norma1.id } }, update: {}, create: { notaId: notas[0].id, normaId: norma1.id } }),
    prisma.notaNorma.upsert({ where: { notaId_normaId: { notaId: notas[1].id, normaId: norma3.id } }, update: {}, create: { notaId: notas[1].id, normaId: norma3.id } }),
    prisma.notaNorma.upsert({ where: { notaId_normaId: { notaId: notas[2].id, normaId: norma4.id } }, update: {}, create: { notaId: notas[2].id, normaId: norma4.id } }),
  ]);

  // Referências entre normas (norma1 referencia norma2 como exemplo)
  await prisma.normaReferencia.upsert({
    where: { id: 1 },
    update: {},
    create: { normaOrigemId: norma3.id, normaDestinoId: norma3.id }, // ISO 9001 -> ISO 9000 (mesma base)
  });

  console.log("✅ Seed concluído!");
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });
