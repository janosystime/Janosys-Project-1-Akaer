# 📌 MVP - API 2º sem. DSM 2026/2º

# Documentação (Sprint III)

<p align="center">
      <img src="https://github.com/user-attachments/assets/6a2c0103-81cb-4431-81b9-643b9f40add8" alt="logo da Janosys" width="200">
      <p align="center">"Entre o ontem e o amanhã, soluções que permanecem."</p>

<p align="center">
  | <a href ="#objetivo">Objetivo</a>  |
  <a href ="#descricao">Descrição</a>  |   
  <a href ="#usuario">Usuário</a>  |
  <a href ="#detalhamento">Detalhamento</a>  |
  <a href ="#us">User Stories</a>  |   
  <a href ="#tasks">Tasks</a>  |
  <a href ="#dod">DoD</a>  |
  <a href ="#dor">DoR</a>  |
  <a href ="#metricas">Métricas</a>  | 
  <a href ="#anexos">Anexos</a>  |
  <a href ="#time">Time</a> |
</p>

---

## 🎯 Objetivo do MVP — Sprint 3 <a id="objetivo"></a>

> Qual problema resolve?

O foco desta sprint é realizar a transição completa de dados mockados em `localStorage` para uma infraestrutura de **persistência relacional real robusta (MySQL + Prisma ORM)**, implementar o controle de permissão e autenticação de usuários por níveis de privilégio estruturados (**Segregação de Funções - SoD**) e estabelecer uma **trilha de auditoria independente e automática** por meio de **Triggers SQL procedurais nativas no banco de dados**, garantindo conformidade, rastreabilidade e segurança às normas aeronáuticas da Akaer.

> Qual hipótese será validada?

Será validado se a integração de um banco de dados relacional físico aliado a mecanismos de controle de segurança rígidos e auditoria por triggers SQL nativas no banco garante confiabilidade operacional, integridade das normas técnicas e facilidade no rastreamento de responsabilidades de modificações do sistema.

> Qual valor será entregue ao usuário final?

Uma plataforma segura, de alta performance e totalmente auditável, que oferece:

- **Autenticação Real**: Login seguro validado por nível de usuário.
- **Segregação de Funções (SoD)**: Acessos e permissões personalizadas para Visualizador, Checker e Administrador.
- **Persistência Real**: Armazenamento definitivo de normas, usuários e solicitações em MySQL.
- **Auditoria por Triggers SQL**: Rastreamento independente gravando logs de `CADASTRO`, `EDICAO` e `EXCLUSAO` no MySQL automaticamente.
- **Painel de Auditoria Global (Admin)**: Tela interativa exclusiva de administrador para pesquisar e filtrar todos os logs do banco de dados.
- **Linha do Tempo Visual**: Linha cronológica das modificações no detalhamento de cada norma técnica.

---

## 📝 Descrição da Solução <a id="descricao"></a>

> Funcionalidades principais incluídas

<ul>
  <li> Banco de dados relacional local estruturado no MySQL gerenciado via Prisma ORM;</li>
  <li> Sistema de autenticação (Login) conectando a base real de usuários;</li>
  <li> CRUD completo de usuários no backend e no frontend exclusivo para Administradores;</li>
  <li> Triggers de auditoria nativas (`AFTER INSERT`, `AFTER UPDATE`, `BEFORE DELETE`) instaladas e rodando no MySQL;</li>
  <li> Variável de sessão de banco (`@usuario_atual`) repassada dinamicamente via transações interativas do Prisma para as Triggers;</li>
  <li> Painel administrativo de Auditoria Global no frontend, com filtros e buscas avançadas;</li>
  <li> Linha do tempo visual de logs cronológicos exibida nas informações de cada norma.</li>
</ul>

> Limitações conhecidas

<ul>
  <li> Necessidade de o serviço MySQL local estar ativo na máquina executando na porta 3306;</li>
  <li> Dependência de configurações de variáveis de ambiente adequadas (`.env`).</li>
</ul>

> Escopo reduzido (somente o essencial para validar a ideia)

<ul>
  <li> Conexão do backend e frontend com MySQL;</li>
  <li> Telas de Login, Usuários, Solicitações e Normas 100% integradas às tabelas físicas;</li>
  <li> Triggers SQL de auditoria ativas e painel de logs do administrador operacional.</li>
</ul>

---

## 👥 Personas / Usuários-Alvo <a id="usuario"></a>

- **Administrador (TI / SysAdmin):** <br>Usuário com permissão total para gerenciar contas de usuários, cadastrar/editar dados no banco e acessar de forma exclusiva o painel global de logs de auditoria e segurança. Não aprova/recusa solicitações de normas.
- **Visualizador (Colaborador / Engenheiro):** <br>Usuário final que consulta a biblioteca de normas vigentes, analisa peças vinculadas e faz solicitações de implementação de novas normas. Não altera o banco diretamente.
- **Checker (Revisor / Garantia de Qualidade):** <br>Autoridade técnica responsável por analisar, aceitar ou indeferir as solicitações de novas normas. Não gerencia usuários do sistema.

---

### 📋 Detalhamento do Backlog da Sprint <a id="detalhamento"></a>

| Rank | ID   | Título                                | Estimativa |   Status  |
| :--- | :--- | :------------------------------------ | :--------: | :-------: |
| 1    | US10 | Histórico de Alterações de Normas     |    7 pts   | Concluído |
| 2    | US11 | Visualização do Histórico de Alterações|    7 pts   | Concluído |
| 3    | US12 | Controle de Acesso por Níveis (SoD)   |    5 pts   | Concluído |
| 4    | US13 | Gestão de Usuários                    |    6 pts   | Concluído |

---

## 📋 Backlog da Sprint <a id="us"></a>

| Rank | Título | Prioridade | User Stories | Estimativa | Sprint |
| :---: | :--- | :---: | :--- | :---: | :---: |
| 1 | Histórico de Alterações de Normas | ALTA | Como administrador, quero registrar alterações feitas nas normas e quem as alterou de forma independente no banco de dados para segurança de dados. | 7 | 3 |
| 2 | Visualização do Histórico de Alterações | MÉDIA | Como administrador, desejo visualizar o histórico global de alterações de forma interativa e filtrável para maior conformidade técnica. | 7 | 3 |
| 3 | Controle de Acesso por Níveis (SoD) | ALTA | Como administrador, quero que o sistema valide logins e perfis (Visualizador, Checker, Admin) restringindo as ações no front e back de acordo com regras de negócio. | 5 | 3 |
| 4 | Gestão de Usuários | MÉDIA | Como administrador, quero gerenciar usuários (CRUD completo no MySQL) para conceder e controlar os acessos à plataforma. | 6 | 3 |

---

## 🛠️ Tasks da Sprint <a id="tasks"></a>

| Rank | Título | US Relacionada | Estimativa (hr) | Status |
| :--: | :---------------- | :--------: | :--------: | :---: |
| 1 | Modelagem e persistência relacional com MySQL e Prisma 7 | US12 | 8 | Concluído |
| 2 | Implementar autenticação real (Login) baseada em banco de dados | US12 | 7 | Concluído |
| 3 | Desenvolver CRUD completo de Usuários (APIs e Tela Frontend) | US13 | 10 | Concluído |
| 4 | Criar Triggers procedurais SQL nativas de auditoria no MySQL | US10 | 8 | Concluído |
| 5 | Integrar variável de sessão e transações interativas no Prisma para auditoria | US10 | 6 | Concluído |
| 6 | Desenvolver endpoint `/historico` de auditoria geral no backend | US11 | 5 | Concluído |
| 7 | Criar tela interativa global de Auditoria (Logs) exclusiva para Admin no frontend | US11 | 8 | Concluído |
| 8 | Desenvolver linha do tempo de alterações visual no Modal de Detalhes da Norma | US11 | 6 | Concluído |

---

## 🏃‍ DoR - Definition of Ready <a id="dor"></a>
  <ul>
      <li> User Stories com critérios de aceitação definidos no formato “Como [persona], quero [ação] para que [objetivo]";</li>
      <li> Compreensão do time sobre o fluxo de Segregação de Funções (SoD);</li>
      <li> Modelagem física do banco de dados MySQL definida no schema do Prisma;</li>
      <li> Escrita das triggers procedurais de auditoria prontas em SQL.</li> 
  </ul>

---

## 🏆 DoD - Definition of Done <a id="dod"></a>
  <ul>
      <li> Persistência em banco MySQL físico funcionando;</li>
      <li> Controle de nível de usuário bloqueando acessos indevidos em rotas front e back;</li>
      <li> Auditoria gerando logs via triggers SQL no MySQL em todas as inserções, atualizações e exclusões;</li>
      <li> Código fonte buildado no frontend e backend com 100% de sucesso (zero erros de TypeScript);</li>
      <li> Banco populado via seed com dados e credenciais de teste consistentes.</li>
  </ul>
 
---

## 📊 Critérios de Aceitação <a id="criterios"></a>

- Armazenamento das informações persistido e recuperado do MySQL em todas as páginas;
- Acesso à plataforma bloqueado para usuários não autenticados;
- Tela de gerenciamento de usuários funcional apenas para o Administrador;
- Triggers procedurais SQL ativas no MySQL interceptando modificações em tempo real;
- Linha do tempo visual no detalhe de cada norma exibindo quem, quando e o que alterou;
- Painel Administrativo de Auditoria Global exibindo logs de todas as normas com busca avançada e filtros por tipo de ação.

---

## 📈 Métricas de Validação <a id="metricas"></a>

| Métrica | Valor sugerido | Valor alcançado |
| :--- | :---: | :---: |
| 👥 Sucesso na autenticação e verificação de perfil de acesso | 100% ✅ | 100% ✅ |
| 🗄️ Persistência de dados relacional real no MySQL (sem localStorage) | 100% ✅ | 100% ✅ |
| 🛡️ Trilha de auditoria independente e automática gravada via Triggers SQL | 100% ✅ | 100% ✅ |
| 🔎 Eficiência nos filtros e pesquisas do Painel Global de Auditoria | ≥90% ✅ | 96% ✅ |
| ✏️ Precisão no cálculo das diferenças de edição gerado nativamente no banco | ≥95% ✅ | 100% ✅ |
| 🚀 Cumprimento das entregas previstas no Backlog da Sprint 3 | 100% ✅ | 100% ✅ |

---

## 📂 Anexos / Evidências <a id="anexos"></a>

### Arquivos e Códigos Criados
- **[triggers.sql](../app/backend/triggers.sql)**: Código procedural das Triggers nativas (`tr_normas_insert`, `tr_normas_update`, `tr_normas_delete`) criadas no MySQL.
- **[schema.prisma](../app/backend/prisma/schema.prisma)**: Modelagem do banco de dados relacional.
- **[Auditoria.tsx](../app/frontend/src/pages/Auditoria.tsx)**: Dashboard visual dos logs do sistema exclusivo para Administrador.

---

## 👷 Time <a id="time"></a>

|      Membro       |    Função     |                                                                        GitHub                                                                         |                                                                                    Linkedin                                                                                     |
| :---------------: | :-----------: | :---------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|    Pedro Lucas    |   Product Owner    | <a href="https://github.com/pedrodevroot"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a>  |     <a href="https://www.linkedin.com/in/pedro-lucas-76870237b/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white">     |
|    Pedro Chaim    |   Scrum Master    |  <a href="https://github.com/Spockchaim"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a>   |           <a href="https://www.linkedin.com/in/pedrochaim"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white">           |
|   Altier da Silva Romão    | Dev Team| <a href="https://github.com/"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a>  |     <a href="https://www.linkedin.com/in"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white">     |
|    Lucas Alves    | Dev Team  | <a href="https://github.com/LuccasLukaDev"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> | <a href="https://www.linkedin.com/in/lucas-da-silva-alves-18852b2b3"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"> |
|   Lucas Santos    |   Dev Team    |   <a href="https://github.com/tirolasca"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a>   |        <a href="https://www.linkedin.com/in/lucas-santostec/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white">        |
|   Vinicius Silva   |   Dev Team    |   <a href="https://github.com/"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a>   |        <a href="https://www.linkedin.com/in/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white">        |
|   Wagner Costa    | Dev Team| <a href="https://github.com/Costa-Wagner"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a>  |     <a href="https://www.linkedin.com/in/wagner-costa-391b0726/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white">     |
---
