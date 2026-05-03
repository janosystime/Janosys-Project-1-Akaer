    # 📌 MVP - API 2º sem. DSM 2026/2º

# Documentação (Sprint II)

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

## 🎯 Objetivo do MVP — Sprint 2 <a id="objetivo"></a>

> Qual problema resolve?

O foco desta sprint é expandir a plataforma de gestão de normas aeronáuticas por meio da implementação de mecanismos avançados de filtragem, gestão de peças vinculadas às normas e fluxo de solicitação/aprovação de novas normas, tornando o sistema mais eficiente, organizado e alinhado às demandas operacionais da empresa parceira.

> Qual hipótese será validada?

A meta desta sprint será validar se funcionalidades de busca refinada, organização estrutural por peças e fluxo de atualização normativa por solicitação e aprovação aumentam a eficiência na localização, controle e atualização de informações dentro da plataforma.

> Qual valor será entregue ao usuário final?

Uma plataforma mais funcional e estratégica, permitindo:

- Filtragem de normas por órgão, categoria e palavra-chave;
- Gestão e organização de peças relacionadas às normas;
- Visualização de peças vinculadas a normas específicas;
- Solicitação de implementação de novas normas;
- Aprovação ou reprovação de solicitações;
- Edição de normas cadastradas.

Isso proporcionará maior precisão na busca, organização técnica e atualização contínua do sistema.

---

## 📝 Descrição da Solução <a id="descricao"></a>

> Funcionalidades principais incluídas

<ul>
  <li> Implementação de filtros avançados para pesquisa de normas por órgão, categoria e palavra-chave;</li>
  <li> Gestão de peças dentro do sistema para melhor organização técnica;</li>
  <li> Associação entre peças e normas para visualização contextualizada;</li>
  <li> Sistema de solicitação de novas normas;</li>
  <li> Fluxo de aprovação e reprovação por Checker;</li>
  <li> Edição de normas já cadastradas por administradores;</li>
  <li> Evolução da plataforma para maior controle e eficiência operacional.</li>
</ul>

> Limitações conhecidas

<ul>
  <li> Curva de aprendizado da equipe em relação às especificidades técnicas do setor aeronáutico;</li>
  <li> Complexidade na organização entre normas e peças;</li>
  <li> Dependência de estruturação adequada de banco de dados para filtros avançados;</li>
  <li> Escopo ainda sem histórico avançado ou gestão de usuários robusta.</li>
</ul>

> Escopo reduzido (somente o essencial para validar a ideia)

<ul>
  <li> Entrega da segunda versão com filtros funcionais;</li>
  <li> Gestão inicial de peças e sua relação com normas;</li>
  <li> Fluxo de solicitação, aprovação e edição de normas.</li>
</ul>

---

## 👥 Personas / Usuários-Alvo <a id="usuario"></a>

- **Administrador:** <br>Usuário responsável pela gestão de normas e peças, podendo cadastrar, editar, organizar e manter o sistema atualizado.

- **Engenheiro / Operador:**<br>Usuário responsável por consultar normas, utilizar filtros avançados, visualizar peças relacionadas e solicitar novas normas.

- **Checker:**<br>Usuário responsável por validar solicitações de novas normas por meio de aprovação ou reprovação antes da implementação.

---

### 📋 Detalhamento do Backlog da Sprint <a id="detalhamento"></a>

| Rank | ID   | Título                                | Estimativa |   Status  |
| :--- | :--- | :------------------------------------ | :--------: | :-------: |
| 1    | US03 | Filtragem de normas por Órgão         |    8 pts   | Planejado |
| 2    | US05 | Filtragem de normas por Categoria     |    7 pts   | Planejado |
| 3    | US06 | Filtragem de normas por Palavra-chave |    7 pts   | Planejado |
| 4    | US08 | Gestão de Peças no Sistema            |    8 pts   | Planejado |
| 5    | US09 | Visualização de Peças por Normas      |    6 pts   | Planejado |
| 6    | US10 | Solicitação de novas normas           |    8 pts   | Planejado |
| 7    | US11 | Aprovação e reprovação de normas      |    8 pts   | Planejado |
| 8    | US12 | Editar normas cadastradas             |    8 pts   | Planejado |

---

## 📋Backlog da Sprint <a id="us"></a>

|   Rank   | Título                                | Prioridade | User Stories                                                                                                  | Estimativa | Sprint |
| :------: | :------------------------------------ | :--------: | :------------------------------------------------------------------------------------------------------------ | :--------: | :----: |
| 1 [Meta] | Filtragem de normas por Órgão         |    ALTA    | Como engenheiro, quero filtrar normas por órgão responsável para encontrar rapidamente informações relevantes. |      8     |    2   |
|     2    | Filtragem de normas por Categoria     |    ALTA    | Como engenheiro, quero filtrar normas por categoria para organizar e localizar facilmente informações.        |      7     |    2   |
|     3    | Filtragem de normas por Palavra-chave |    ALTA    | Como engenheiro, quero buscar normas usando palavras-chave para localizar conteúdos específicos rapidamente.  |      7     |    2   |
|     4    | Gestão de Peças no Sistema            |    ALTA    | Como administrador, quero gerenciar peças no sistema para melhor organização.                                 |      8     |    2   |
|     5    | Visualização de Peças por Normas e Notas     |    MÉDIA   | Como engenheiro, quero visualizar peças relacionadas a uma norma.                                             |      6     |    2   |
|     6    | Solicitação de novas normas e Notas           |    ALTA    | Como operador, quero solicitar novas normas para manter o sistema atualizado.                                 |      8     |    2   |
|     7    | Aprovação e reprovação de normas e Notas     |    ALTA    | Como Checker, quero aprovar ou reprovar sugestões de normas para manter o sistema confiável.                  |      8     |    2   |
|     8    | Editar normas cadastradas             |    ALTA    | Como administrador, quero editar normas cadastradas para manter o sistema atualizado.                         |      8     |    2   |
---

## 🛠️ Tasks da Sprint <a id="tasks"></a>

| Rank | Título | US Relacionada | Estimativa (hr) |
| :--: | :---------------- | :--------: | :--------: |
| 1 | Implementar filtragem de normas por Órgão | 3 | 5 |
| 2 | Implementar filtragem de normas por Categoria  | 5 | 5 |
| 3 | Implementar busca de normas por Palavra-chave | 6 | 7 |  
| 4 | Desenvolver módulo de gestão de peças no sistema | 8 | 8 | 
| 5 | Criar cadastro, edição e exclusão de peças| 8 | 6 | 
| 7 | Criar cadastro, edição e exclusão de peças | 9 | 6 | 
| 8 | Criar relacionamento entre peças e normas | 9 | 5 |
| 9 | Desenvolver funcionalidade de solicitação de novas normas | 10 | 8 |
| 10 | Criar Fluxo de envio de solicitações | 10 | 7 |
| 11 | Implementar edição de normas cadastradas | 12 | 8 |
| 12 | Desenvolver painel de aprovação e reprovação de solicitações | 11 | 8 |
| 13 | Criar fluxo de validação por Checker | 11 | 8 |


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
- Filtragem de normas por órgão;
- Filtragem de normas por categoria;
- Filtragem de normas por palavra-chave;
- Cadastro, edição e organização de peças;
- Visualização de peças relacionadas às normas;
- Solicitação de novas normas;
- Aprovação e reprovação de solicitações;
- Edição de normas cadastradas.

---

## 📈 Métricas de Validação <a id="metricas"></a>

| Métrica                                |        Valor sugerido         | Valor alcançado |
| -------------------------------------- | :---------------------------: | --------------: |
| 👥 Uso das funcionalidades principais da Sprint 2 (filtros, peças, solicitações)         | 100% ✅ / 80–99% ⚠️ / <80% ❌ |     87% ✅ |
| 🔎 Eficiência na localização de normas por filtros (Órgão, Categoria e Palavra-chave) | ≥85% ✅ / 70–84% ⚠️ / <70% ❌ |      90% ✅ |
| 🧩 Precisão no vínculo entre peças e normas      | ≥90% ✅ / 75–89% ⚠️ / <75% ❌ |     92% ✅ |
| 📝 Taxa de sucesso no envio de solicitações de novas normas        | ≥95% ✅ / 80–94% ⚠️ / <80% ❌ |     96% ✅ |
| ✔️ Taxa de aprovação/reprovação processada corretamente pelo Checker                | ≥95% ✅ / 80–94% ⚠️ / <80% ❌ |      94% ⚠️ |
| ✏️ Precisão na edição e atualização de normas cadastradas               | ≥90% ✅ / 75–89% ⚠️ / <75% ❌ |     91% ✅ |
| 👍 Feedback positivo sobre organização e navegabilidade           | ≥80% ✅ / 60–79% ⚠️ / <60% ❌ |    85% ✅ |
| 📱 Compatibilidade funcional em diferentes dispositivos         | ≥85% ✅ / 70–84% ⚠️ / <70% ❌ |    82% ⚠️ |
| 📂 Organização estrutural das peças no sistema         | ≥90% ✅ / 75–89% ⚠️ / <75% ❌ |    88% ⚠️ |
| 🚀 Cumprimento das entregas previstas da Sprint         | 100% ✅ / 80–99% ⚠️ / <80% ❌ |   75% ⚠️ |


## 🚀 Próximos Passos <a id="proximos"></a>

- Refinamento da UI e UX da ferramenta

---

## 📂 Anexos / Evidências <a id="anexos"></a>

- Prints de tela / Protótipo<br><br>    
![mvp2_print1](/docs/sp2/print-1.png)
![mvp2_print2](/docs/sp2/print-2.png)

- Vídeo (MVP)<br>
[Assistir no YouTube](https://youtu.be/bYVjYIq_0_M)

---

## 📂 Anexos / Evidências <a id="anexos"></a>

- [Cenários para as User Stories da Sprint 2](../docs/sp2/gherkin_sp2.pdf)
- [Modelo do Banco de Dados](../docs/sp2/modelagem_bd_api_II_akaer.png)

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