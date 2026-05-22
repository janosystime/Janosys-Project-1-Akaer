# Matriz de Permissões — SIGNA
**Sistema Integrado de Gestão de Normativas Aeronáuticas**
Cliente: AKAER | Dev: JanoSys Technologies | Curso: 2º sem TI FATEC


## Perfis de Acesso

| Perfil | Descrição |
|---|---|
| **Administrador** | Acesso total ao sistema. Gerencia normas, solicitações, catálogo e usuários. |
| **Usuário** | Visualiza normas e catálogo. Pode solicitar novas normas e acompanhar o painel de solicitações. |
| **Checker** | Aprova/Recusa solicitações de novas normas. Visualiza normas e catálogo. Acompanha o painel de solicitações. |


## Matriz de Permissões

| Funcionalidade | Administrador | Usuário | Checker |
|---|:---:|:---:|:---:|
| **HOME** |
| ↳ Visualizar catálogo | ✅ | ✅ | ✅ |
| ↳ Adicionar subcategoria / item | ✅ | ❌ | ❌ |
| ↳ Editar subcategoria / item | ✅ | ❌ | ❌ |
| ↳ Excluir subcategoria / item | ✅ | ❌ | ❌ |
| ↳ Vincular normas ao item | ✅ | ❌ | ❌ |
| **NORMAS** |
| ↳ Visualizar normas | ✅ | ✅ | ✅ |
| ↳ Visualizar PDF/imagens | ✅ | ✅ | ✅ |
| ↳ Cadastrar norma | ✅ | ❌ | ✅ |
| ↳ Editar norma | ✅ | ❌ | ✅ |
| ↳ Excluir norma | ✅ | ❌ | ✅ |
| **SOLICITAÇÕES** |
| ↳ Visualizar painel completo | ✅ | ✅ | ✅ |
| ↳ Visualizar motivo de indeferimento | ✅ | ✅ | ✅ |
| ↳ Criar solicitação | ✅ | ✅ | ❌ |
| ↳ Analisar / Aceitar / Indeferir | ❌ | ❌ | ✅ |
| **USUÁRIOS** |
| ↳ Gerenciar usuários | ✅ | ❌ | ❌ |


## Credenciais de Teste (Ambiente Mock)

| Login | Senha | Perfil |
|---|---|---|
| `admin` | `123` | Administrador |
| `checker` | `123` | Checker |
| `usuario` | `123` | Usuário |
> ⚠️ Credenciais válidas apenas no ambiente de desenvolvimento. Substituir por autenticação real em produção.


## Regras de Negócio

- **Usuário visualiza todas as solicitações** — para evitar duplicatas antes de abrir uma nova.
- **Solicitações criadas por usuário/admin** são analisadas exclusivamente pelo checker.