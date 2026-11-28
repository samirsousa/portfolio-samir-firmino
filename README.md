# 🚀 3D Interactive Portfolio | Samir Firmino

<div align="center">

  <img src="https://img.shields.io/badge/Three.js-black?style=for-the-badge&logo=three.js&logoColor=white" alt="Three.js" />
  <img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
  <img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
  <img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
  <img src="https://img.shields.io/badge/GitHub%20Pages-222222?style=for-the-badge&logo=githubpages&logoColor=white" alt="GitHub Pages" />

  <p align="center">
    <strong>Portfólio 3D interativo com avatar personalizado em Three.js, suporte multilíngue e vitrine de projetos em Engenharia de Dados & Inteligência Artificial.</strong>
  </p>

  <p align="center">
    <a href="https://samirsousa.github.io/portfolio-samir-firmino/">🌐 <strong>Ver Demonstração Online</strong></a> •
    <a href="#-principais-funcionalidades">Funcionalidades</a> •
    <a href="#-tecnologias-utilizadas">Tecnologias</a> •
    <a href="#-como-rodar-localmente">Como Rodar</a> •
    <a href="#-contato">Contato</a>
  </p>

</div>

---

## 📌 Sobre o Projeto

Este é o meu portfólio pessoal e interativo, projetado para oferecer uma experiência visual imersiva e moderna diretamente no navegador:

- **Avatar 3D Personalizado**: Personagem 3D modelado e adaptado com animações procedurais em Three.js, vestindo moletom preto com o Swoosh da Nike e acomodado em uma cadeira de rodas esportiva projetada geometricamente.
- **Engenharia de Dados & IA em Foco**: Apresentação da minha trajetória profissional (atuação na ANP, formação na UniLaSalle-RJ e competências técnicas).
- **Internacionalização (i18n)**: Suporte completo e dinâmico a 3 idiomas: **Português (PT)**, **Inglês (EN)** e **Espanhol (ES)**.
- **Minigame Interativo**: Batalha de rolamento de dados em 3D contra o bot do GitHub com física de colisão.
- **Design 100% Responsivo**: Otimizado para desktop, tablets e smartphones com transições suaves via GSAP.

---

## ✨ Principais Funcionalidades

- 🎮 **Navegação 3D Dinâmica**: Controles de órbita, rotação do avatar e iluminação cenográfica com shaders e materiais PBR.
- 🌐 **Suporte Multilíngue Instantâneo**: Troca de idioma em tempo real sem recarregar a página.
- 📦 **Vitrine de Projetos com Capas em Alta Resolução**:
  - **[AI Multi-Agent & Data Hub](https://github.com/samirsousa/analise-de-dados-IA)**: Hub corporativo com LLMs, agentes autônomos e dashboards preditivos em Streamlit e Python.
  - **[Data Engineering & Big Data](https://github.com/samirsousa/projetos-engenharia-de-dados)**: Pipelines ETL/ELT robustos com Apache Spark, orquestração e modelagem Star/Snowflake Schema.
  - **[Arcade Web Games Engine](https://github.com/samirsousa/Arcade-Web-Games)**: Coletânea e engine de jogos clássicos retrô com física em Canvas e Web Audio API.
  - **[Sistema de Gestão para ONG](https://github.com/samirsousa/projeto-ong)**: Plataforma completa de controle de doações, voluntários e relatórios de transparência.
- 🎲 **Seção "Play / Duel"**: Jogo de dados interativo com Three.js e animação física adaptada.

---

## 🛠️ Tecnologias Utilizadas

### Frontend & 3D
- **[Three.js](https://threejs.org/)** — Renderização gráfica 3D WebGL, câmeras, luzes e loaders GLTF/GLB.
- **[GSAP (GreenSock)](https://greensock.com/gsap/)** — Animações fluidas de interface e transições de scroll.
- **JavaScript Moderno (ES6+)** — Lógica modular, internacionalização e manipulação do DOM.
- **HTML5 & CSS3 Avançado** — Layout responsivo, Flexbox, CSS Grid e animações customizadas.

### Minhas Áreas & Ferramentas de Domínio
- **Linguagens & Frameworks**: Python, SQL, JavaScript, TypeScript, Streamlit, React, Flask, Django.
- **Engenharia de Dados & Banco**: Apache Spark, Apache Airflow, ETL/ELT, PostgreSQL, Oracle, MongoDB, Supabase.
- **DevOps, Automação & BI**: Docker, Git/GitHub, n8n, Power BI, Metabase.

---

## 📂 Estrutura de Pastas

```plaintext
portfolio-main/
│
├── assets/                  # Imagens, capas de projetos, ícones e texturas
│   └── projects/            # Capas em alta definição dos projetos em destaque
├── css/                     # Folhas de estilo modularizadas
│   ├── base.css             # Estilos globais e reset
│   ├── duel.css             # Estilos da seção interativa de dados
│   └── sections.css         # Layout das seções, timeline e cards de projetos
├── js/                      # Arquitetura de scripts em JavaScript
│   ├── boneco.js            # Modelagem do avatar, cadeira de rodas e Nike Swoosh
│   ├── glbAvatar.js         # Carregamento do modelo 3D e cena Three.js
│   ├── duel.js              # Física e animação do jogo de dados
│   ├── i18n.js              # Dicionários de tradução (PT, EN, ES)
│   ├── sections.js          # Controle de eventos e interação de tela
│   └── world.js             # Configuração da cena, iluminação e renderizador
├── models/                  # Malhas e arquivos 3D (.glb / .gltf)
├── index.html               # Ponto de entrada da aplicação
└── README.md                # Documentação do projeto
```

---

## 💻 Como Rodar Localmente

Por carregar modelos 3D (`.glb`) via JavaScript, os navegadores exigem que a página seja servida por um servidor local para evitar bloqueios de CORS.

### Opção 1: Com a extensão **Live Server** no VS Code (Recomendado)
1. Instale a extensão **Live Server** no VS Code (`Ritwick Dey`).
2. Clique com o botão direito no arquivo `index.html`.
3. Selecione **"Open with Live Server"** (ou clique em **Go Live** no rodapé do VS Code).
4. O navegador abrirá automaticamente em `http://127.0.0.1:5500`.

### Opção 2: Com Python
Abra o terminal na pasta do projeto e execute:

```bash
# Se tiver Python instalado:
python -m http.server 8000
```
Depois, abra seu navegador e acesse: `http://localhost:8000`

### Opção 3: Com Node.js / npx
```bash
npx serve .
```

---

## 🚀 Como Fazer o Deploy no GitHub Pages

1. O repositório já está criado e configurado em: `samirsousa/portfolio-samir-firmino`.
2. No repositório no GitHub:
   - Vá em **Settings** > **Pages** (ou acesse direto: `https://github.com/samirsousa/portfolio-samir-firmino/settings/pages`).
   - Em **Build and deployment** > **Branch**:
     - Selecione a branch `main` e a pasta `/(root)`.
     - Clique em **Save**.
3. Em 1 a 2 minutos, o GitHub Pages compilará e o site estará online no link oficial:
   **`https://samirsousa.github.io/portfolio-samir-firmino/`**

---

## 📬 Contato

<div align="center">

  **Samir Firmino Martins de Sousa**  
  *Engenheiro de Dados | Desenvolvedor de IA & Full-Stack*

  [![LinkedIn](https://img.shields.io/badge/LinkedIn-0077B5?style=for-the-badge&logo=linkedin&logoColor=white)](https://www.linkedin.com/in/samir-firmino-573322265/)
  [![GitHub](https://img.shields.io/badge/GitHub-100000?style=for-the-badge&logo=github&logoColor=white)](https://github.com/samirsousa)
  [![Email](https://img.shields.io/badge/Email-D14836?style=for-the-badge&logo=gmail&logoColor=white)](mailto:samir.sfmss@gmail.com)

</div>

---

<div align="center">
  <sub>Desenvolvido com dedicação por <a href="https://github.com/samirsousa">Samir Firmino</a>.</sub>
</div>
