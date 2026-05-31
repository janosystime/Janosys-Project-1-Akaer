import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import bcrypt from 'bcrypt';

export class AuthController {
  async login(req: Request, res: Response) {
    try {
      const { login, senha } = req.body;

      if (!login || !senha) {
        return res.status(400).json({ error: 'Login e senha são obrigatórios' });
      }

      // Find user
      const usuario = await prisma.usuario.findUnique({
        where: { login }
      });

      if (!usuario) {
        return res.status(401).json({ error: 'Login ou senha incorretos' });
      }

      // Check password
      const senhaValida = await bcrypt.compare(senha, usuario.senha);
      if (!senhaValida) {
        return res.status(401).json({ error: 'Login ou senha incorretos' });
      }

      // Return user info in frontend format
      return res.json({
        nome: usuario.nome,
        perfil: usuario.perfil.toLowerCase(),
        departamento: usuario.departamento || ''
      });

    } catch (error) {
      console.error('Erro no login:', error);
      return res.status(500).json({ error: 'Erro interno do servidor' });
    }
  }
}
