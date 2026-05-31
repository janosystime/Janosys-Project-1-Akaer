export interface CredencialMock {
  email: string;
  senha: string;
  nome: string;
  perfil: 'administrador' | 'usuario' | 'checker';
}

export const USUARIOS_MOCK: CredencialMock[] = [
  { email: 'admin',      senha: '123', nome: 'Administrador Janosys', perfil: 'administrador' },
  { email: 'usuario', senha: '123', nome: 'Usuario Janosys',    perfil: 'usuario'    },
  { email: 'checker',   senha: '123', nome: 'Checker Janosys',      perfil: 'checker'      },
];