# flowLAB - Painel de Produtividade Protética 

O **flowLAB** é um sistema moderno de gestão de produtividade e relatórios customizados para laboratórios odontológicos. 
Desenvolvido para funcionar de forma integrada ao ecossistema Google (Google Apps Script e Google Sheets), 
ele oferece uma interface web fluida, segura e com controle de acessos baseado em cargos.

## 🚀 Funcionalidades Principais

- **Autenticação Dinâmica:** Tela de login única que identifica o usuário e define seu nível de acesso (Admin ou Funcionário comum).
- **Painel Adaptativo (LGPD & Segurança):**
  - *Funcionários* visualizam e cadastram estritamente seus próprios dados de produtividade.
  - *Administradores (Admin)* possuem um filtro exclusivo para navegar e consolidar relatórios de qualquer funcionário do laboratório.
- **Relatórios Automatizados:** Filtro por intervalo de datas com cálculo de métricas em tempo real e preparação de layout otimizado para impressão/PDF (ocultando elementos de navegação e forçando fundo branco para economia de tinta).
- **Interface Dark Mode (Dracula Theme):** Tema padrão claro/cinza refinado com opção de alternância para a famosa paleta *Dracula* do VS Code, salvando a preferência do usuário no navegador (`localStorage`).
- **Arquitetura Servidor/Planilha:** Banco de dados centralizado em uma única aba relacional, garantindo performance nas consultas e facilidade para geração de gráficos consolidados.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (ES6+), [Tailwind CSS v4](https://tailwindcss.com/) (via compilador browser em tempo de execução).
- **Backend:** Google Apps Script (V8 Engine).
- **Banco de Dados:** Google Sheets (Planilhas Google).

## 📁 Estrutura do Projeto

```text
flowlab-produtividade/
├── .github/                  # Configurações do GitHub (opcional)
│   └── workflows/            # Automações de deploy (CI/CD)
├── src/                      # Código-fonte que vai rodar no Google App Script
│   ├── Código.gs             # Funções de backend (Planilha, Autenticação)
│   ├── Index.html            # Estrutura principal do HTML (Views)
│   ├── Css.html              # Estilos e paleta Dracula
│   └── Script.html           # Lógica JavaScript do cliente (Front)
├── docs/                     # Documentação complementar ou manuais do laboratório
├── img/                      # Screenshots do sistema (Modo Claro / Dracula)
│   ├── preview-light.png
│   └── preview-dracula.png
├── .gitignore                # Arquivos para o Git ignorar (ex: node_modules)
├── appsscript.json           # Manifesto de configuração do Google Apps Script
└── README.md                 # Página inicial do repositório (Este arquivo)
