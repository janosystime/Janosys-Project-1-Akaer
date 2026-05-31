const { PrismaClient } = require('@prisma/client');
const { PrismaMariaDb } = require('@prisma/adapter-mariadb');
require('dotenv').config();

const databaseUrl = process.env.DATABASE_URL || 'mysql://root:password@localhost:3306/janosys_db';

const regex = /^mysql:\/\/([^:]+):([^@]+)@([^:]+):(\d+)\/(.+)$/;
const match = databaseUrl.match(regex);

let user = 'root';
let password = 'password';
let host = 'localhost';
let port = 3306;
let database = 'janosys_db';

if (match) {
  user = decodeURIComponent(match[1]);
  password = decodeURIComponent(match[2]);
  host = match[3];
  port = Number(match[4]);
  database = match[5];
}

const adapter = new PrismaMariaDb({
  host,
  port,
  user,
  password,
  database,
  connectionLimit: 5,
}, {
  useTextProtocol: true
});

const prisma = new PrismaClient({ adapter });

async function main() {
  console.log('Seeding initial data...');

  // 1. Seed Users
  const userCount = await prisma.usuario.count();
  if (userCount === 0) {
    console.log('Seeding users...');
    const hash123 = '123';
    await prisma.usuario.createMany({
      data: [
        {
          nome: 'Administrador Janosys',
          login: 'admin',
          senha: hash123,
          perfil: 'ADMINISTRADOR',
          telefone: '(12) 99999-0001',
          departamento: 'TI',
        },
        {
          nome: 'Usuario Janosys',
          login: 'usuario',
          senha: hash123,
          perfil: 'USUARIO',
          telefone: '(12) 99999-0002',
          departamento: 'Engenharia',
        },
        {
          nome: 'Checker Janosys',
          login: 'checker',
          senha: hash123,
          perfil: 'CHECKER',
          telefone: '(12) 99999-0003',
          departamento: 'Operações',
        },
      ],
    });
  } else {
    console.log('Users table not empty. Skipping user seed.');
  }

  // 2. Seed Norms
  const normsCount = await prisma.norma.count();
  if (normsCount === 0) {
    console.log('Seeding norms...');
    await prisma.norma.createMany({
      data: [
        {
          id: "RBAC 25.1309",
          codigo: "25.1309",
          titulo: "Análise de Segurança de Sistemas",
          organizacao: "ANAC",
          categoria: "Instalação",
          subcategoria: "Geral",
          item: "Parafuso",
          tipo: "Pública",
          revisao: "Emenda 09",
          status: "Vigente",
          notas: ["Norma principal de safety."],
          referencias: ["SAE ARP4761"],
          palavrasChave: ["safety", "análise de risco"],
          nomePdf: "rbac-25-1309.pdf",
          urlPdf: "/pdf/rbac-25-1309.pdf",
          imagens: ["/imagem/rbac-25-1309.jpeg"],
          criadoPor: "Administrador Janosys"
        },
        {
          id: "FAR 25.571",
          codigo: "25.571",
          titulo: "Damage Tolerance and Fatigue Evaluation",
          organizacao: "FAA",
          categoria: "Conjunto",
          subcategoria: "União de Peças",
          item: "Soldagem",
          tipo: "Pública",
          revisao: "Amendment 27",
          status: "Vigente",
          notas: [],
          referencias: [],
          palavrasChave: ["fadiga", "tolerância", "dano"],
          nomePdf: "far-25-571.pdf",
          urlPdf: "/pdf/far-25-571.pdf",
          imagens: ["/imagem/far-25-571.jpeg"],
          criadoPor: "Administrador Janosys"
        },
        {
          id: "ISO 9001:2015",
          codigo: "9001",
          titulo: "Quality management systems — Requirements",
          organizacao: "ISO",
          categoria: "Peça",
          subcategoria: "Metálica",
          item: "Usinado",
          tipo: "Pública",
          revisao: "2015",
          status: "Vigente",
          notas: ["Requisitos gerais para o sistema de gestão da qualidade nas plantas de manufatura."],
          referencias: ["ISO 9000:2015"],
          palavrasChave: ["qualidade", "gestão", "requisitos"],
          criadoPor: "Administrador Janosys"
        },
        {
          id: "CS-25",
          codigo: "CS-25",
          titulo: "Certification Specifications for Large Aeroplanes",
          organizacao: "EASA",
          categoria: "Conjunto",
          subcategoria: "Cablagem",
          item: "Conector",
          tipo: "Privada",
          revisao: "Amendment 27",
          status: "Vigente",
          notas: ["Especificações essenciais para certificação EASA em aeronaves de grande porte."],
          referencias: ["FAR 25"],
          palavrasChave: ["certificação", "aeronave grande", "easa"],
          criadoPor: "Administrador Janosys"
        }
      ]
    });
  } else {
    console.log('Norms table not empty. Skipping norm seed.');
  }

  // 3. Seed Solicitations
  const solicitationsCount = await prisma.solicitacao.count();
  if (solicitationsCount === 0) {
    console.log('Seeding solicitations...');
    await prisma.solicitacao.createMany({
      data: [
        {
          codigo: "AS9100",
          titulo: "Quality Management Systems - Requirements for Aviation",
          solicitante: "Ana Silva",
          data: new Date("2026-03-01"),
          status: "ACEITA",
          avaliador: "Checker Janosys"
        },
        {
          codigo: "MIL-STD-810",
          titulo: "Environmental Engineering Considerations and Laboratory Tests",
          solicitante: "Carlos Mendes",
          data: new Date("2026-03-05"),
          status: "ANALISE",
          avaliador: "Checker Janosys"
        },
        {
          codigo: "RTCA DO-160",
          titulo: "Environmental Conditions and Test Procedures for Airborne Equipment",
          solicitante: "Fernanda Rocha",
          data: new Date("2026-03-10"),
          status: "AGUARDANDO"
        },
        {
          codigo: "SAE ARP4754",
          titulo: "Guidelines for Development of Civil Aircraft and Systems",
          solicitante: "Marcos Oliveira",
          data: new Date("2026-03-12"),
          status: "AGUARDANDO"
        },
        {
          codigo: "MIL-STD-1553",
          titulo: "Digital Time Division Command/Response Multiplex Data Bus",
          solicitante: "Julia Ferreira",
          data: new Date("2026-03-15"),
          status: "ANALISE",
          avaliador: "Checker Janosys"
        },
        {
          codigo: "ASTM B117",
          titulo: "Standard Practice for Operating Salt Spray Apparatus",
          solicitante: "Ricardo Souza",
          data: new Date("2026-03-18"),
          status: "INDEFERIDA",
          motivoRecusa: "Norma já contemplada pela ISO 9227, disponível na biblioteca.",
          avaliador: "Checker Janosys"
        },
        {
          codigo: "",
          titulo: "Norma de proteção contra corrosão em estruturas metálicas aeronáuticas",
          solicitante: "Patrícia Lima",
          data: new Date("2026-03-20"),
          status: "AGUARDANDO"
        },
        {
          codigo: "ISO 10007",
          titulo: "Quality Management - Guidelines for Configuration Management",
          solicitante: "Eduardo Costa",
          data: new Date("2026-03-22"),
          status: "ACEITA",
          avaliador: "Checker Janosys"
        },
        {
          codigo: "RTCA DO-178C",
          titulo: "Software Considerations in Airborne Systems and Equipment Certification",
          solicitante: "Beatriz Nunes",
          data: new Date("2026-04-01"),
          status: "AGUARDANDO"
        },
        {
          codigo: "ARP5412",
          titulo: "Aircraft Lightning Environment and Related Test Waveforms",
          solicitante: "Thiago Alves",
          data: new Date("2026-04-10"),
          status: "ANALISE",
          avaliador: "Checker Janosys"
        }
      ]
    });
  } else {
    console.log('Solicitations table not empty. Skipping solicitation seed.');
  }

  console.log('Seed completed successfully!');
}

main()
  .catch((e) => {
    console.error('Error during seed:', e);
    process.exit(1);
  });
