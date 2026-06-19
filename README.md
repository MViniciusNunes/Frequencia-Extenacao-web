# 🕊️ Sistema de Gestão de Frequência - Grupo Ágape

![Status do Projeto](https://img.shields.io/badge/Status-Concluído-success)
![Node.js](https://img.shields.io/badge/Node.js-Backend-339933?logo=node.js)
![MongoDB](https://img.shields.io/badge/MongoDB-Database-47A248?logo=mongodb)
![Licença](https://img.shields.io/badge/Licen%C3%A7a-MIT-blue)

Sistema web responsivo desenvolvido para o gerenciamento de presenças e histórico de atividades do **Grupo de Jovens Ágape (Paróquia da Ressurreição - Arquidiocese de Brasília)**. 

Este projeto foi desenvolvido aplicando os princípios da **Engenharia de Software**, visando resolver o problema de controle manual de chamadas e automatizar a contagem de frequências para o Retiro anual, garantindo integridade, segurança de dados e uma excelente experiência de usuário (UX).

---

## 🎯 O Problema e a Solução
**Problema:** O controle de presença manual (em papel ou planilhas) gerava perda de dados, dificuldade na totalização de faltas.
**Solução:** Implementação de um sistema de "Ponto Digital", onde o coordenador gera um QR Code dinâmico no telão/tablet e os próprios jovens registram sua presença usando a câmera do celular de forma autônoma.

---

## 🛡️ Arquitetura e Padrões de Projeto

O sistema foi modularizado separando claramente as responsabilidades de Front-end (Visualização) e Back-end (Regras de Negócio e Persistência), facilitando a manutenção e escalabilidade.

### 📂 Estrutura de Diretórios
```text
📦 frequencia-extenacao-web
 ┣ 📂 middlewares      # Travas de segurança (JWT e Validação de Admin)
 ┣ 📂 models           # Esquemas do Banco de Dados (Mongoose)
 ┣ 📂 public           # Front-end (HTML, CSS, Imagens)
 ┃ ┣ 📂 css            # Estilos componentizados
 ┃ ┣ 📂 js             # Scripts de interface e consumo de API (Separados por domínio)
 ┣ 📂 routes           # Controladores das rotas da API RESTful
 ┣ 📜 db.js            # Configuração de conexão com o MongoDB Atlas
 ┣ 📜 server.js        # Arquivo principal de inicialização (Maestro)
 ┗ 📜 package.json     # Dependências do projeto

📡 Documentação da API (RESTful)
O Back-end expõe uma API protegida para o consumo do Front-end. As rotas sensíveis exigem um Bearer Token no cabeçalho da requisição.

👥 Usuários (/api/users)
POST /api/login: Autentica o usuário e devolve o Token JWT. (Pública)

GET /api/users-full: Retorna a lista de usuários sem as senhas. (Autenticada)

POST /api/users: Cria um novo usuário (Aluno ou Admin). (Restrita a Admin)

PUT /api/users/:id: Edita os dados de um usuário. (Restrita a Admin)

DELETE /api/users/:id: Exclui um usuário e todo o seu histórico em cascata. (Restrita a Admin)

📅 Encontros (/api/encontros)
POST /api/encontros: Cria um evento (Missa, Retiro, Formação). Impede datas futuras. (Restrita a Admin)

DELETE /api/encontros/:id: Exclui um encontro e limpa as frequências atreladas a ele. (Restrita a Admin)

✅ Frequência (/api/frequencias)
POST /api/marcar-presenca: Valida o código lido pela câmera e registra a presença. (Autenticada)

GET /api/frequencias-completas: Retorna a matriz de dados para os cálculos do Dashboard. (Autenticada)

🔐 Segurança Implementada
Autenticação JWT (JSON Web Tokens): Sessões com tempo de expiração que evitam exposição de dados.

Dupla Verificação de Rota: Middlewares no Express.js garantem que requisições via ferramentas externas (como Postman) sem token sejam rejeitadas com erro 403 Forbidden.

Bloqueio de Roteamento no Front-end: Scripts interceptadores impedem que usuários comuns acessem páginas HTML administrativas (menu.html, usuarios.html, etc).

Debounce Otimista: Prevenção de ataques de negação de serviço (DoS) acidentais ao limitar a taxa de leitura (FPS) da biblioteca da câmera no Front-end.

🛠️ Tecnologias Utilizadas
Front-end: HTML5, CSS3, JavaScript (Vanilla), html5-qrcode (Acesso nativo à câmera) e QRCode.js.

Back-end: Node.js, Express.js.

Banco de Dados: MongoDB e Mongoose (Modelagem de Dados).

Segurança: jsonwebtoken (JWT).

🚀 Como Executar o Projeto Localmente
1. Pré-requisitos
Node.js (v16 ou superior).

Cluster no MongoDB Atlas ou instância local do MongoDB.

2. Passos para Instalação
Clone este repositório e instale as dependências:
git clone [https://github.com/mviniciusnunes/frequencia-extenacao-web.git](https://github.com/mviniciusnunes/frequencia-extenacao-web.git)
cd frequencia-extenacao-web
npm install

Crie um arquivo .env na raiz do projeto com as seguintes chaves:
PORT=3000
MONGO_URI=sua_string_de_conexao_do_mongodb_aqui
JWT_SECRET=sua_chave_secreta_super_segura

Inicie o servidor:
npm start

O sistema estará disponível em http://localhost:3000.

👨‍💻 Autores
Desenvolvido como projeto acadêmico do curso de Engenharia de Software na Universidade Católica de Brasília por:

Maria Luiza Ricardo Fernandes
Marcos Vinicius Nunes Moreira 
Leticia Delmilio Soares
Mariana Cardoso Honorato
Paulo Vinícius Sousa Lima

