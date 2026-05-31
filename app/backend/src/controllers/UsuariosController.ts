import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { Perfil } from '@prisma/client';
import bcrypt from 'bcrypt';

export class UsuariosController {
  async index(req: Request, res: Response) {
    try {
      const dbUsuarios = await prisma.usuario.findMany({
        orderBy: { nome: 'asc' }
      });

      // Map profiles to lowercase for frontend compatibility
      const usuarios = dbUsuarios.map(u => ({
        id: u.id,
        nome: u.nome,
        login: u.login,
        senha: '', // Don't return password hashes to frontend
        perfil: u.perfil.toLowerCase(),
        telefone: u.telefone || '',
        departamento: u.departamento || '',
        dataCriacao: u.dataCriacao.toISOString().split('T')[0]
      }));

      return res.json(usuarios);
    } catch (error) {
      console.error('Erro ao buscar usuários:', error);
      return res.status(500).json({ error: 'Erro ao buscar usuários' });
    }
  }

  async store(req: Request, res: Response) {
    try {
      const { nome, login, senha, perfil, telefone, departamento } = req.body;

      if (!nome || !login || !senha || !perfil) {
        return res.status(400).json({ error: 'Nome, login, senha e perfil são obrigatórios' });
      }

      // Check if login already exists
      const loginExistente = await prisma.usuario.findUnique({
        where: { login }
      });
      if (loginExistente) {
        return res.status(400).json({ error: 'Este login já está em uso' });
      }

      // Hash password
      const senhaHasheada = await bcrypt.hash(senha, 10);

      const dbPerfil = perfil.toUpperCase() as Perfil;

      const usuario = await prisma.usuario.create({
        data: {
          nome,
          login,
          senha: senhaHasheada,
          perfil: dbPerfil,
          telefone: telefone || null,
          departamento: departamento || null
        }
      });

      return res.status(201).json({
        id: usuario.id,
        nome: usuario.nome,
        login: usuario.login,
        senha: '',
        perfil: usuario.perfil.toLowerCase(),
        telefone: usuario.telefone || '',
        departamento: usuario.departamento || '',
        dataCriacao: usuario.dataCriacao.toISOString().split('T')[0]
      });

    } catch (error) {
      console.error('Erro ao criar usuário:', error);
      return res.status(500).json({ error: 'Erro ao criar usuário' });
    }
  }

  async update(req: Request, res: Response) {
    try {
      const id = req.params.id as string;
      const { nome, login, senha, perfil, telefone, departamento } = req.body;

      if (!nome || !login || !perfil) {
        return res.status(400).json({ error: 'Nome, login e perfil são obrigatórios' });
      }

      // Check if user exists
      const usuarioExistente = await prisma.usuario.findUnique({
        where: { id: Number(id) }
      });
      if (!usuarioExistente) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      // Check if new login conflicts with another user
      const loginConflito = await prisma.usuario.findFirst({
        where: {
          login,
          id: { not: Number(id) }
        }
      });
      if (loginConflito) {
        return res.status(400).json({ error: 'Este login já está em uso' });
      }

      // Build data payload
      const dataUpdate: any = {
        nome,
        login,
        perfil: perfil.toUpperCase() as Perfil,
        telefone: telefone || null,
        departamento: departamento || null
      };

      // Only update password if a new one is provided (and it's not a dummy blank password from frontend)
      if (senha && senha.trim() !== '') {
        dataUpdate.senha = await bcrypt.hash(senha, 10);
      }

      const usuario = await prisma.usuario.update({
        where: { id: Number(id) },
        data: dataUpdate
      });

      return res.json({
        id: usuario.id,
        nome: usuario.nome,
        login: usuario.login,
        senha: '',
        perfil: usuario.perfil.toLowerCase(),
        telefone: usuario.telefone || '',
        departamento: usuario.departamento || '',
        dataCriacao: usuario.dataCriacao.toISOString().split('T')[0]
      });

    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      return res.status(500).json({ error: 'Erro ao atualizar usuário' });
    }
  }

  async destroy(req: Request, res: Response) {
    try {
      const id = req.params.id as string;

      const usuarioExistente = await prisma.usuario.findUnique({
        where: { id: Number(id) }
      });
      if (!usuarioExistente) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }

      await prisma.usuario.delete({
        where: { id: Number(id) }
      });

      return res.json({ message: 'Usuário removido com sucesso' });

    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      return res.status(500).json({ error: 'Erro ao excluir usuário' });
    }
  }
}
