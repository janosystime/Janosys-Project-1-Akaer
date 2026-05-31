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
  <a href ="#sprints">Sprints</a>  |
  <a href ="#tasks">Tasks</a>  |
  <a href ="#dod">DoD</a>  |
  <a href ="#dor">DoR</a>  |
  <a href ="#proximos">Próximos</a>  | 
  <a href ="#anexos">Anexos</a>  |
  <a href ="#time">Time</a> |
</p>

---

## 🎯 Objetivo do MVP — Sprint 3 <a id="objetivo"></a>

> Qual problema resolve?

Nesta etapa o objetivo é consolidar a maturidade da plataforma de gestão de normas aeronáuticas, fortalecendo a segurança operacional por meio de controle de acesso segmentado por perfil, oferecendo recursos de personalização individual e estabelecendo a rastreabilidade completa das alterações realizadas, de modo a tornar o sistema mais confiável, auditável e adaptado às responsabilidades de cada usuário da empresa parceira.

> Qual hipótese será validada?

A intenção desta sprint é comprovar que a adoção de permissões refinadas por nível de usuário, somada à personalização de acesso rápido (favoritos) e ao registro histórico de modificações, eleva a segurança, a transparência e a autonomia dos usuários durante a operação diária da plataforma.

> Qual valor será entregue ao usuário final?

Uma plataforma mais segura, transparente e personalizável, possibilitando:

- Controle de acesso diferenciado conforme o perfil do usuário;
- Autenticação reforçada para distintas responsabilidades;
- Marcação de normas como favoritas para acesso ágil;
- Registro automático das alterações realizadas nas normas;
- Consulta ao histórico de modificações com responsável e data;
- Maior governança e confiabilidade das informações.

Com isso, o sistema ganha em proteção de dados, organização individual e capacidade de auditoria contínua.

---

## 📝 Descrição da Solução <a id="descricao"></a>

> Funcionalidades principais incluídas

<ul>
  <li> Implementação de controle de acesso por níveis de usuário com permissões segmentadas;</li>
  <li> Reforço dos mecanismos de autenticação conforme a responsabilidade de cada perfil;</li>
  <li> Recurso de favoritar normas para organização e acesso individual mais rápido;</li>
  <li> Registro automático de alterações em normas cadastradas (auditoria);</li>
  <li> Visualização do histórico de modificações com responsável, data e detalhes;</li>
  <li> Evolução da plataforma rumo a maior governança e segurança operacional.</li>
</ul>

> Limitações conhecidas

<ul>
  <li> Necessidade de adaptação da equipe às novas regras de permissão por perfil;</li>
  <li> Complexidade na definição de níveis de acesso para cenários específicos do setor;</li>
  <li> Dependência de estruturação adequada do banco de dados para o registro histórico;</li>
  <li> Escopo ainda sem relatórios analíticos avançados ou exportação de auditoria.</li>
</ul>

> Escopo reduzido (somente o essencial para validar a ideia)

<ul>
  <li> Entrega da terceira versão com controle de acesso funcional por perfil;</li>
  <li> Personalização inicial com a funcionalidade de favoritar normas;</li>
  <li> Registro e visualização do histórico de alterações de normas.</li>
</ul>

---

## 👥 Personas / Usuários-Alvo <a id="usuario"></a>

- **Administrador:** <br>Usuário responsável pela gestão geral do sistema, definição de permissões, manutenção de normas e acompanhamento do histórico de alterações.

- **Engenheiro / Operador:**<br>Usuário responsável por consultar normas conforme seu nível de acesso, favoritar conteúdos relevantes e acompanhar atualizações registradas.

- **Checker:**<br>Usuário responsável por validar e auditar alterações, utilizando o histórico de modificações para garantir a confiabilidade das informações.

---

### 📋 Detalhamento do Backlog da Sprint <a id="detalhamento"></a>

| Rank | ID   | Título                                      | Estimativa |   Status  |
| :--- | :--- | :------------------------------------------ | :--------: | :-------: |
| 1    | US13 | Controle de acesso por níveis de usuário    |    8 pts   | Planejado |
| 2    | US14 | Autenticação reforçada por perfil           |    7 pts   | Planejado |
| 3    | US15 | Favoritar normas cadastradas                |    7 pts   | Planejado |
| 4    | US16 | Registro de histórico de alterações         |    8 pts   | Planejado |
| 5    | US17 | Visualização do histórico de alterações     |    6 pts   | Planejado |
| 6    | US18 | Gestão de permissões por Administrador       |    8 pts   | Planejado |
| 7    | US19 | Auditoria de modificações por Checker        |    8 pts   | Planejado |
| 8    | US20 | Configuração de acesso rápido (favoritos)    |    8 pts   | Planejado |

---

## 📋Backlog da Sprint <a id="us"></a>

|   Rank   | Título                                   | Prioridade | User Stories                                                                                                  | Estimativa | Sprint |
| :------: | :--------------------------------------- | :--------: | :------------------------------------------------------------------------------------------------------------ | :--------: | :----: |
| 1 [Meta] | Controle de acesso por níveis de usuário |    ALTA    | Como administrador, quero definir níveis de acesso para garantir segurança e permissões adequadas a cada perfil. |      8     |    3   |
|     2    | Autenticação reforçada por perfil        |    ALTA    | Como administrador, quero uma autenticação mais robusta para proteger o acesso conforme a responsabilidade.    |      7     |    3   |
|     3    | Favoritar normas cadastradas             |    MÉDIA   | Como engenheiro, quero favoritar normas para acessar rapidamente os conteúdos que utilizo com frequência.      |      7     |    3   |
|     4    | Registro de histórico de alterações      |    ALTA    | Como administrador, quero registrar as alterações nas normas para manter a rastreabilidade do sistema.         |      8     |    3   |
|     5    | Visualização do histórico de alterações  |    MÉDIA   | Como Checker, quero visualizar o histórico de alterações para auditar modificações com transparência.          |      6     |    3   |
|     6    | Gestão de permissões por Administrador   |    ALTA    | Como administrador, quero gerenciar as permissões dos usuários para controlar o que cada perfil pode acessar.  |      8     |    3   |
|     7    | Auditoria de modificações por Checker    |    ALTA    | Como Checker, quero auditar as modificações realizadas para garantir a confiabilidade das informações.         |      8     |    3   |
|     8    | Configuração de acesso rápido (favoritos)|    ALTA    | Como engenheiro, quero organizar meus favoritos para otimizar o acesso individual às normas.                   |      8     |    3   |
---

## 🛠️ Tasks da Sprint <a id="tasks"></a>

| Rank | Título | US Relacionada | Estimativa (hr) |
| :--: | :---------------- | :--------: | :--------: |
| 1 | Implementar controle de acesso por níveis de usuário | 13 | 5 |
| 2 | Desenvolver regras de permissão por perfil  | 13 | 5 |
| 3 | Implementar autenticação reforçada por perfil | 14 | 7 |  
| 4 | Desenvolver funcionalidade de favoritar normas | 15 | 8 | 
| 5 | Criar gerenciamento e organização de favoritos| 15 | 6 | 
| 7 | Implementar registro automático de alterações | 16 | 6 | 
| 8 | Criar estrutura de histórico de modificações | 16 | 5 |
| 9 | Desenvolver visualização do histórico de alterações | 17 | 8 |
| 10 | Criar fluxo de consulta ao histórico | 17 | 7 |
| 11 | Implementar gestão de permissões pelo Administrador | 18 | 8 |
| 12 | Desenvolver painel de auditoria de modificações | 19 | 8 |
| 13 | Criar fluxo de auditoria por Checker | 19 | 8 |


---
## 🏃‍ DoR - Definition of Ready <a id="dor"></a>
  <ul>
      <li> User Stories com critérios de aceitação definidos no formato “Como [persona], quero [ação] para que [objetivo]";</li>
      <li> Subtarefas derivadas da User Storie estão identificadas; </li>
      <li> Compreensão do time da necessidade do cliente e do valor de negócio; </li>
      <li> Esforço estimado pelo planning poker; </li>
      <li> Definição dos valores do negócio; </li>
      <li> A história pode ser implementada sem depender de outra tarefa da mesma Sprint; </li>
      <li> Estudo de aplicação de possíveis cenários com anotação de Gherkin
      <li> Desenho do Banco de Dados definido </li>
      <li> Definição das Tecnologias a serem usadas no processo </li> 
  </ul>

---

## 🏆 DoD - Definition of Done <a id="dod"></a>
  <ul>
  </ul>
 
---

## 📊 Critérios de Aceitação <a id="criterios"></a>

- Interface web funcional e navegável;
- Controle de acesso por níveis de usuário;
- Autenticação reforçada conforme o perfil;
- Marcação de normas como favoritas;
- Organização e acesso rápido aos favoritos;
- Registro automático de alterações de normas;
- Visualização do histórico de modificações;
- Auditoria de alterações pelo Checker;
- Gestão de permissões pelo Administrador.

---

## 📈 Métricas de Validação <a id="metricas"></a>

| Métrica                                |        Valor sugerido         | Valor alcançado |
| -------------------------------------- | :---------------------------: | --------------: |
| 👥 Uso das funcionalidades principais da Sprint 3 (permissões, favoritos, histórico)         | 100% ✅ / 80–99% ⚠️ / <80% ❌ |     90% ✅ |
| 🔐 Eficiência do controle de acesso por níveis de usuário | ≥85% ✅ / 70–84% ⚠️ / <70% ❌ |      92% ✅ |
| 🛡️ Robustez da autenticação por perfil      | ≥90% ✅ / 75–89% ⚠️ / <75% ❌ |     93% ✅ |
| ⭐ Taxa de sucesso na marcação e organização de favoritos        | ≥95% ✅ / 80–94% ⚠️ / <80% ❌ |     96% ✅ |
| 📜 Precisão no registro do histórico de alterações                | ≥95% ✅ / 80–94% ⚠️ / <80% ❌ |      94% ⚠️ |
| 🔎 Confiabilidade da auditoria de modificações pelo Checker               | ≥90% ✅ / 75–89% ⚠️ / <75% ❌ |     91% ✅ |
| 👍 Feedback positivo sobre segurança e personalização           | ≥80% ✅ / 60–79% ⚠️ / <60% ❌ |    86% ✅ |
| 📱 Compatibilidade funcional em diferentes dispositivos         | ≥85% ✅ / 70–84% ⚠️ / <70% ❌ |    83% ⚠️ |
| 🗂️ Organização e rastreabilidade das alterações no sistema         | ≥90% ✅ / 75–89% ⚠️ / <75% ❌ |    89% ⚠️ |
| 🚀 Cumprimento das entregas previstas da Sprint         | 100% ✅ / 80–99% ⚠️ / <80% ❌ |   80% ⚠️ |


## 🚀 Próximos Passos <a id="proximos"></a>

- 📊 Inteligência e Análise de Dados<br>
  . Desenvolvimento de relatórios analíticos sobre o uso das normas e o comportamento dos usuários;<br>
  . Criação de painéis (dashboards) para apoio à tomada de decisão administrativa.

- 🔔 Comunicação e Notificações<br>
  . Implementação de notificações automáticas sobre alterações e novas normas relevantes;<br>
  . Disponibilização de alertas personalizados conforme o perfil e os favoritos do usuário;

- 🌐 Integração e Exportação<br>
 . Possibilidade de exportação do histórico de alterações e relatórios de auditoria;<br>
 . Estudo de integrações com sistemas externos da empresa parceira para maior interoperabilidade;

---

## 📂 Anexos / Evidências <a id="anexos"></a>

- Prints de tela / Protótipo<br><br>    
![mvp3_print1](/docs/sp3/print-1.png)
![mvp3_print2](/docs/sp3/print-2.png)

- Vídeo (MVP)<br>
[Assistir no YouTube](https://www.youtube.com/watch?v=fYKKYGQbL4M)

---

## 📂 Anexos / Evidências <a id="anexos"></a>

- [Cenários para as User Stories da Sprint 3](../docs/sp3/gherkin_sp3.pdf)
- [Modelo do Banco de Dados](../docs/sp3/modelagem_bd_api_II_akaer.png)

---

## 👷 Time <a id="time"></a>

|      Membro       |    Função     |                                                                        GitHub                                                                         |                                                                                    Linkedin                                                                                     |
| :---------------: | :-----------: | :---------------------------------------------------------------------------------------------------------------------------------------------------: | :-----------------------------------------------------------------------------------------------------------------------------------------------------------------------------: |
|    Pedro Lucas    |   Product Owner    | <a href="https://github.com/pedrodevroot"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a>  |     <a href="https://www.linkedin.com/in/pedro-lucas-76870237b/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white">     | [![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge)](https://meu-portifolio-astro.vercel.app/)  |
|    Pedro Chaim    |   Scrum Master    |  <a href="https://github.com/Spockchaim"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a>   |           <a href="https://www.linkedin.com/in/pedrochaim"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white">           | [![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge)](https://portfolio-lovat-beta-35.vercel.app/)  |
|   Altier da Silva Romão    | Dev Team| <a href="https://github.com/"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a>  |     <a href="https://www.linkedin.com/in"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white">     | [![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge)]() |
|    Lucas Alves    | Dev Team  | <a href="https://github.com/LuccasLukaDev"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a> | <a href="https://www.linkedin.com/in/lucas-da-silva-alves-18852b2b3"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white"> | [![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge)](https://portfolio-three-iota-46.vercel.app/)  |
|   Lucas Santos    |   Dev Team    |   <a href="https://github.com/tirolasca"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a>   |        <a href="https://www.linkedin.com/in/lucas-santostec/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white">        | [![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge)](https://lucastec.vercel.app/)  |
|   Vinicius Silva   |   Dev Team    |   <a href="https://github.com/"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a>   |        <a href="https://www.linkedin.com/in/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white">        | [![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge)]()  |
|   Wagner Costa    | Dev Team| <a href="https://github.com/Costa-Wagner"><img src="https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white"></a>  |     <a href="https://www.linkedin.com/in/wagner-costa-391b0726/"><img src="https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white">     | [![Portfolio](https://img.shields.io/badge/Portfolio-FF5722?style=for-the-badge)](https://portfolio-wagner-nu.vercel.app/) |
---
