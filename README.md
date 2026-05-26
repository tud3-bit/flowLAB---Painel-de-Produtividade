# flowLAB - Painel de Produtividade Clínica 🦷

O **flowLAB** é um sistema moderno de gestão de produtividade e relatórios customizados para Laboratorios odontológicos. 
Desenvolvido para funcionar de forma integrada ao ecossistema Google (Google Apps Script e Google Sheets), ele oferece uma interface web fluida, segura e com controle de acessos baseado em cargos.

## 🚀 Funcionalidades Principais

- **Autenticação Dinâmica:** Tela de login única que identifica o usuário e define seu nível de acesso (Admin ou Funcionário comum).
- **Painel Adaptativo (LGPD & Segurança):** - *Funcionários* visualizam e cadastram estritamente seus próprios dados de produtividade.
  - *Administradores (Admin)* possuem um filtro exclusivo para navegar e consolidar relatórios de qualquer funcionário da clínica.
- **Relatórios Automatizados:** Filtro por intervalo de datas com cálculo de métricas em tempo real e preparação de layout otimizado para impressão/PDF (ocultando elementos de navegação e forçando fundo branco para economia de tinta).
- **Interface Dark Mode (Dracula Theme):** Tema padrão claro/cinza refinado com opção de alternância para a famosa paleta *Dracula* do VS Code, salvando a preferência do usuário no navegador (`localStorage`).
- **Arquitetura Servidor/Planilha:** Banco de dados centralizado em uma única aba relacional, garantindo performance nas consultas e facilidade para geração de gráficos consolidados.

## 🛠️ Tecnologias Utilizadas

- **Frontend:** HTML5, CSS3, JavaScript (ES6+), [Tailwind CSS v4](https://tailwindcss.com/) (via compilador browser em tempo de execução).
- **Backend:** Google Apps Script (V8 Engine).
- **Banco de Dados:** Google Sheets (Planilhas Google).

## 📁 Estrutura do Projeto

O projeto está estruturado dentro do ambiente do Apps Script utilizando a separação limpa de responsabilidades (padrão modular):

* `Código.gs`: Camada de backend (funções de autenticação, persistência na planilha e busca filtrada).
* `Index.html`: Estrutura semântica da interface e componentes visuais (Navbar, Cards, Formulários e Tabelas).
* `Css.html`: Folha de estilo interna contendo as regras de transição, impressão (`@media print`) e o mapeamento de cores do tema Dracula.
* `Script.html`: Lógica de comportamento do cliente, alternador de tema, manipulação do DOM e chamadas assíncronas (`google.script.run`).

## 🔧 Configuração e Instalação

Como o projeto roda sob a infraestrutura do Google Apps Script como um **Web App**, siga os passos para implantação:

1. Crie uma nova Planilha Google no seu Drive.
2. Crie duas abas principais: `Usuarios` e `Produtividade`.
    * **Usuarios:** Deve conter as colunas `ID`, `Nome`, `Usuário (Login)`, `Senha` e `Cargo`. (Para administradores, defina o cargo exatamente como `Admin`).
    * **Produtividade:** Colunas de registros dos atendimentos associados ao login do funcionário.
3. Acesse **Extensões > Apps Script**.
4. Cole os códigos correspondentes nos respectivos arquivos (`Código.gs`, `Index.html`, `Css.html`, `Script.html`).
5. Clique em **Implantar > Nova implantação**.
6. Selecione o tipo **Aplicativo da Web**, configure para executar como "Você" e dê acesso a "Qualquer pessoa".
7. Copie a URL gerada para acessar o sistema.

## 🎨 Interface e Estética

O visual foi projetado utilizando componentes modernos do Tailwind CSS. O sistema inicia nativamente no modo claro (Clean Gray/White) para garantir um ambiente corporativo iluminado e confortável durante o dia, permitindo a transição instantânea para o modo noturno com as cores oficiais Dracula:
- **Fundo principal:** `#282a36`
- **Cards e Menus:** `#1e1f29`
- **Bordas e Seleções:** `#44475a`
- **Destaques e Foco:** `#bd93f9` (Roxo) e `#ff79c6` (Rosa)

---
Desenvolvido por [Hiago Tude] - 2026.
