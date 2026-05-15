export interface CredencialMock {
  email: string;
  senha: string;
  nome: string;
  perfil: 'administrador' | 'engenheiro' | 'operador';
}

export const USUARIOS_MOCK: CredencialMock[] = [
  { email: 'admin',      senha: '123', nome: 'Administrador Janosys', perfil: 'administrador' },
  { email: 'engenheiro', senha: '123', nome: 'Engenheiro Janosys',    perfil: 'engenheiro'    },
  { email: 'operador',   senha: '123', nome: 'Operador Janosys',      perfil: 'operador'      },
];