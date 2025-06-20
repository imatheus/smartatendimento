// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
    const navLinks = document.querySelectorAll('.nav-link');
    const sections = document.querySelectorAll('.section');

    navLinks.forEach(link => {
        link.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all links and sections
            navLinks.forEach(l => l.classList.remove('active'));
            sections.forEach(s => s.classList.remove('active'));
            
            // Add active class to clicked link
            this.classList.add('active');
            
            // Show corresponding section
            const targetSection = this.getAttribute('data-section');
            const section = document.getElementById(targetSection);
            if (section) {
                section.classList.add('active');
                
                // Scroll to top of main content on mobile
                if (window.innerWidth <= 768) {
                    document.querySelector('.main').scrollIntoView({ 
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
});

// Function to scroll to specific sections within content
function scrollToSection(sectionId) {
    const element = document.getElementById(sectionId);
    if (element) {
        // First, make sure the parent section is active
        const parentSection = element.closest('.section');
        if (parentSection) {
            // Remove active from all sections
            document.querySelectorAll('.section').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
            
            // Activate parent section
            parentSection.classList.add('active');
            
            // Activate corresponding nav link
            const sectionId = parentSection.id;
            const navLink = document.querySelector(`[data-section="${sectionId}"]`);
            if (navLink) {
                navLink.classList.add('active');
            }
        }
        
        // Scroll to the specific element
        setTimeout(() => {
            element.scrollIntoView({ 
                behavior: 'smooth',
                block: 'center'
            });
            
            // Highlight the element temporarily
            element.style.background = '#333333';
            element.style.transition = 'background 0.3s ease';
            setTimeout(() => {
                element.style.background = '';
            }, 2000);
        }, 100);
    }
}

// Modal functions with embedded content
function loadMarkdownContent(docType, title) {
    const modal = document.getElementById('documentModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalBody = document.getElementById('modalBody');
    
    modalTitle.textContent = title;
    modalBody.innerHTML = '<p>Carregando...</p>';
    modal.classList.add('active');
    
    // Get content based on document type
    let content = '';
    
    switch(docType) {
        case 'architecture':
            content = getArchitectureContent();
            break;
        case 'dependencies':
            content = getDependenciesContent();
            break;
        case 'api':
            content = getApiContent();
            break;
        case 'development':
            content = getDevelopmentContent();
            break;
        case 'troubleshooting':
            content = getTroubleshootingContent();
            break;
        default:
            content = '<p>Documento não encontrado.</p>';
    }
    
    modalBody.innerHTML = content;
}

// Content functions
function getArchitectureContent() {
    return `
        <h1><i class="fas fa-sitemap"></i> Arquitetura do Backend - Smart Atendimento</h1>
        
        <h2><i class="fas fa-layer-group"></i> Visão Geral da Arquitetura</h2>
        <p>O Smart Atendimento segue uma arquitetura em camadas (Layered Architecture) com separação clara de responsabilidades.</p>
        
        <h2><i class="fas fa-folder-tree"></i> Estrutura de Diretórios</h2>
        <pre><code>backend/
├── src/
│   ├── controllers/     # Controladores das rotas
│   ├── services/       # Lógica de negócio
│   ├── models/         # Modelos Sequelize
│   ├── routes/         # Definição das rotas
│   ├── libs/          # WhatsApp, Socket.IO, Filas
│   └── middleware/    # Middlewares customizados</code></pre>
        
        <h2><i class="fas fa-layer-group"></i> Camadas da Aplicação</h2>
        
        <h3><i class="fas fa-route"></i> 1. API Layer (Routes + Controllers)</h3>
        <p><strong>Localização:</strong> <code>src/routes/</code> e <code>src/controllers/</code></p>
        <p><strong>Responsabilidade:</strong> Receber requisições HTTP, validar dados de entrada e retornar respostas.</p>
        
        <h3><i class="fas fa-cogs"></i> 2. Service Layer (Business Logic)</h3>
        <p><strong>Localização:</strong> <code>src/services/</code></p>
        <p><strong>Responsabilidade:</strong> Implementar regras de negócio, orquestrar operações complexas.</p>
        
        <h3><i class="fas fa-database"></i> 3. Data Layer (Models + Database)</h3>
        <p><strong>Localização:</strong> <code>src/models/</code> e <code>src/database/</code></p>
        <p><strong>Responsabilidade:</strong> Definir estrutura de dados e interagir com o banco.</p>
        
        <h2><i class="fas fa-edit"></i> Onde Alterar Funcionalidades</h2>
        
        <h3><i class="fas fa-key"></i> Para alterar autenticação:</h3>
        <ul>
            <li><strong>Middleware:</strong> <code>src/middleware/CheckAuth.ts</code></li>
            <li><strong>Service:</strong> <code>src/services/AuthServices/</code></li>
            <li><strong>Controller:</strong> <code>src/controllers/AuthController.ts</code></li>
        </ul>
        
        <h3><i class="fas fa-ticket-alt"></i> Para alterar lógica de tickets:</h3>
        <ul>
            <li><strong>Service:</strong> <code>src/services/TicketServices/</code></li>
            <li><strong>Model:</strong> <code>src/models/Ticket.ts</code></li>
            <li><strong>Controller:</strong> <code>src/controllers/TicketController.ts</code></li>
        </ul>
        
        <h3><i class="fab fa-whatsapp"></i> Para alterar integração WhatsApp:</h3>
        <ul>
            <li><strong>Lib:</strong> <code>src/libs/wbot.ts</code></li>
            <li><strong>Services:</strong> <code>src/services/WbotServices/</code></li>
            <li><strong>Listener:</strong> <code>src/services/WbotServices/wbotMessageListener.ts</code></li>
        </ul>
    `;
}

function getDependenciesContent() {
    return `
        <h1><i class="fas fa-cube"></i> Dependências do Backend - Smart Atendimento</h1>
        
        <h2><i class="fas fa-box"></i> Dependências de Produção</h2>
        
        <h3><i class="fas fa-server"></i> Core Framework</h3>
        <ul>
            <li><strong>express:</strong> Framework web principal para criação da API REST</li>
            <li><strong>typescript:</strong> Linguagem principal do projeto</li>
            <li><strong>sequelize:</strong> ORM para interação com banco de dados</li>
        </ul>
        
        <h3><i class="fas fa-database"></i> Banco de Dados</h3>
        <ul>
            <li><strong>Banco de dados:</strong> PostgreSQL</li>
            <li><strong>ORM:</strong> Sequelize com TypeScript</li>
            <li><strong>Configuração:</strong> <code>src/config/database.ts</code></li>
            <li><strong>Conexão:</strong> <code>src/database/index.ts</code></li>
        </ul>
        
        <h3><i class="fab fa-whatsapp"></i> WhatsApp Integration</h3>
        <ul>
            <li><strong>@whiskeysockets/baileys:</strong> Biblioteca principal para integração com WhatsApp Web</li>
            <li><strong>Onde é usado:</strong> <code>src/libs/wbot.ts</code>, <code>src/services/WbotServices/</code></li>
        </ul>
        
        <h3><i class="fas fa-shield-alt"></i> Authentication & Security</h3>
        <ul>
            <li><strong>jsonwebtoken:</strong> Autenticação JWT</li>
            <li><strong>bcryptjs:</strong> Criptografia de senhas</li>
            <li><strong>Onde é usado:</strong> <code>src/middleware/CheckAuth.ts</code>, <code>src/services/AuthServices/</code></li>
        </ul>
        
        <h3><i class="fas fa-plug"></i> WebSocket</h3>
        <ul>
            <li><strong>socket.io:</strong> Comunicação em tempo real com o frontend</li>
            <li><strong>Onde é usado:</strong> <code>src/libs/socket.ts</code>, <code>src/helpers/</code></li>
        </ul>
        
        <h3><i class="fas fa-tasks"></i> Queue System (Bull + Redis)</h3>
        <ul>
            <li><strong>bull:</strong> Gerenciador de filas para processamento assíncrono</li>
            <li><strong>redis:</strong> Armazenamento e broker das filas (requerido pelo Bull)</li>
            <li><strong>Funcionam juntos:</strong> Bull usa Redis como backend para persistir filas</li>
            <li><strong>Onde é usado:</strong> <code>src/libs/Queue.ts</code>, <code>src/jobs/</code></li>
        </ul>
        
        <h2><i class="fas fa-exclamation-triangle"></i> Dependências Críticas (Não Remover)</h2>
        <ul>
            <li><strong>express</strong> - Core do servidor</li>
            <li><strong>sequelize</strong> - ORM principal</li>
            <li><strong>@whiskeysockets/baileys</strong> - WhatsApp (funcionalidade principal)</li>
            <li><strong>socket.io</strong> - Tempo real (essencial)</li>
            <li><strong>jsonwebtoken</strong> - Autenticação (segurança)</li>
            <li><strong>bull + redis</strong> - Sistema de filas (performance crítica)</li>
        </ul>
    `;
}

function getApiContent() {
    return `
        <h1><i class="fas fa-plug"></i> API Reference - Smart Atendimento Backend</h1>
        
        <h2><i class="fas fa-info-circle"></i> Visão Geral</h2>
        <p>Base URL: <code>http://localhost:8080</code> (desenvolvimento)</p>
        <p>Todas as rotas (exceto autenticação) requerem header de autorização:</p>
        <pre><code>Authorization: Bearer &lt;jwt_token&gt;</code></pre>
        
        <h2><i class="fas fa-key"></i> Autenticação</h2>
        
        <h3><i class="fas fa-sign-in-alt"></i> POST /auth/login</h3>
        <p><strong>Arquivo:</strong> <code>src/controllers/AuthController.ts</code> → <code>store()</code></p>
        <p><strong>Body:</strong></p>
        <pre><code>{
  "email": "user@example.com",
  "password": "password123"
}</code></pre>
        
        <h2><i class="fas fa-ticket-alt"></i> Tickets</h2>
        
        <h3><i class="fas fa-list"></i> GET /tickets</h3>
        <p><strong>Arquivo:</strong> <code>src/controllers/TicketController.ts</code> → <code>index()</code></p>
        <p><strong>Query Params:</strong></p>
        <ul>
            <li><code>searchParam</code> (string): Busca</li>
            <li><code>pageNumber</code> (number): Página</li>
            <li><code>status</code> (string): open, pending, closed</li>
            <li><code>userId</code> (number): Filtrar por usuário</li>
        </ul>
        
        <h3><i class="fas fa-plus"></i> POST /tickets</h3>
        <p><strong>Arquivo:</strong> <code>src/controllers/TicketController.ts</code> → <code>store()</code></p>
        <p><strong>Body:</strong></p>
        <pre><code>{
  "contactId": 1,
  "status": "open",
  "userId": 1,
  "queueId": 1
}</code></pre>
        
        <h2><i class="fab fa-whatsapp"></i> WhatsApp</h2>
        
        <h3><i class="fas fa-list"></i> GET /whatsapp</h3>
        <p><strong>Arquivo:</strong> <code>src/controllers/WhatsAppController.ts</code> → <code>index()</code></p>
        
        <h3><i class="fas fa-play"></i> POST /whatsapp/:id/start</h3>
        <p><strong>Arquivo:</strong> <code>src/controllers/WhatsAppController.ts</code> → <code>startSession()</code></p>
        
        <h2><i class="fas fa-comments"></i> Mensagens</h2>
        
        <h3><i class="fas fa-list"></i> GET /messages/:ticketId</h3>
        <p><strong>Arquivo:</strong> <code>src/controllers/MessageController.ts</code> → <code>index()</code></p>
        
        <h3><i class="fas fa-paper-plane"></i> POST /messages</h3>
        <p><strong>Arquivo:</strong> <code>src/controllers/MessageController.ts</code> → <code>store()</code></p>
        <p><strong>Body:</strong></p>
        <pre><code>{
  "ticketId": 1,
  "body": "Mensagem de texto"
}</code></pre>
        
        <h2><i class="fas fa-code"></i> Códigos de Status HTTP</h2>
        <ul>
            <li><code>200</code> - OK</li>
            <li><code>201</code> - Created</li>
            <li><code>400</code> - Bad Request</li>
            <li><code>401</code> - Unauthorized</li>
            <li><code>404</code> - Not Found</li>
            <li><code>500</code> - Internal Server Error</li>
        </ul>
    `;
}

function getDevelopmentContent() {
    return `
        <h1><i class="fas fa-code"></i> Guia de Desenvolvimento - Smart Atendimento Backend</h1>
        
        <h2><i class="fas fa-cog"></i> Configuração do Ambiente</h2>
        
        <h3><i class="fas fa-check-circle"></i> Pré-requisitos</h3>
        <ul>
            <li>Node.js 18+</li>
            <li>PostgreSQL</li>
            <li>Redis</li>
            <li>Git</li>
        </ul>
        
        <h3><i class="fas fa-database"></i> Configuração do Banco de Dados</h3>
        <p><strong>Banco de dados:</strong> PostgreSQL</p>
        <pre><code># .env
DB_DIALECT=postgres
DB_HOST=localhost
DB_USER=postgres
DB_PASS=root
DB_NAME=smart_atendimento_db
DB_PORT=5432</code></pre>
        
        <h3><i class="fas fa-download"></i> Instalação</h3>
        <pre><code>git clone &lt;repository-url&gt;
cd smartatendimento/backend
npm install
cp .env.example .env
npm run db:migrate
npm run db:seed
npm run dev</code></pre>
        
        <h2><i class="fas fa-edit"></i> Onde Alterar Funcionalidades</h2>
        
        <h3><i class="fas fa-key"></i> 1. Sistema de Autenticação</h3>
        <p><strong>Para alterar login/logout:</strong></p>
        <ul>
            <li><strong>Controller:</strong> <code>src/controllers/AuthController.ts</code></li>
            <li><strong>Service:</strong> <code>src/services/AuthServices/AuthUserService.ts</code></li>
            <li><strong>Middleware:</strong> <code>src/middleware/CheckAuth.ts</code></li>
        </ul>
        
        <h3><i class="fas fa-ticket-alt"></i> 2. Sistema de Tickets</h3>
        <p><strong>Para alterar criação de tickets:</strong></p>
        <ul>
            <li><strong>Service:</strong> <code>src/services/TicketServices/CreateTicketService.ts</code></li>
            <li><strong>Model:</strong> <code>src/models/Ticket.ts</code></li>
            <li><strong>Controller:</strong> <code>src/controllers/TicketController.ts</code></li>
        </ul>
        
        <h3><i class="fab fa-whatsapp"></i> 3. Integração WhatsApp</h3>
        <p><strong>Para alterar conexão WhatsApp:</strong></p>
        <ul>
            <li><strong>Lib:</strong> <code>src/libs/wbot.ts</code></li>
            <li><strong>Service:</strong> <code>src/services/WbotServices/StartWhatsAppSession.ts</code></li>
        </ul>
        
        <h2><i class="fas fa-plus"></i> Adicionando Novas Funcionalidades</h2>
        
        <h3><i class="fas fa-plug"></i> 1. Novo Endpoint</h3>
        <ol>
            <li>Criar Service em <code>src/services/</code></li>
            <li>Criar Controller em <code>src/controllers/</code></li>
            <li>Criar Route em <code>src/routes/</code></li>
            <li>Registrar Route em <code>src/routes/index.ts</code></li>
        </ol>
        
        <h3><i class="fas fa-database"></i> 2. Novo Model</h3>
        <ol>
            <li>Criar arquivo em <code>src/models/</code></li>
            <li>Criar migration com <code>npx sequelize-cli migration:generate</code></li>
            <li>Executar migration com <code>npm run db:migrate</code></li>
        </ol>
        
        <h2><i class="fas fa-terminal"></i> Scripts Principais</h2>
        <ul>
            <li><code>npm run dev</code> - Desenvolvimento</li>
            <li><code>npm run build</code> - Build para produção</li>
            <li><code>npm start</code> - Iniciar produção</li>
            <li><code>npm run db:migrate</code> - Executar migrations</li>
            <li><code>npm test</code> - Executar testes</li>
        </ul>
    `;
}

function getTroubleshootingContent() {
    return `
        <h1><i class="fas fa-wrench"></i> Troubleshooting - Smart Atendimento Backend</h1>
        
        <h2><i class="fas fa-exclamation-triangle"></i> Problemas Comuns e Soluções</h2>
        
        <h3><i class="fas fa-database"></i> 1. Problemas de Conexão com Banco de Dados</h3>
        
        <h4><i class="fas fa-times-circle"></i> Erro: "Unable to connect to the database"</h4>
        <p><strong>Onde verificar:</strong></p>
        <ul>
            <li><code>src/database/index.ts</code> - Configuração da conexão</li>
            <li><code>.env</code> - Variáveis de ambiente do banco</li>
        </ul>
        
        <p><strong>Soluções:</strong></p>
        <ol>
            <li>Verificar variáveis de ambiente no <code>.env</code></li>
            <li>Testar conexão manual: <code>psql -h localhost -U postgres -d smart_atendimento_db</code></li>
            <li>Verificar se o serviço está rodando: <code>sudo systemctl status postgresql</code></li>
        </ol>
        
        <h3><i class="fab fa-whatsapp"></i> 2. Problemas com WhatsApp</h3>
        
        <h4><i class="fas fa-times-circle"></i> Erro: "WhatsApp session not found"</h4>
        <p><strong>Onde verificar:</strong></p>
        <ul>
            <li><code>src/libs/wbot.ts</code> - Configuração do bot</li>
            <li><code>src/services/WbotServices/StartWhatsAppSession.ts</code> - Inicialização</li>
        </ul>
        
        <p><strong>Soluções:</strong></p>
        <ol>
            <li>Limpar sessão: <code>rm -rf .wwebjs_auth/ .wwebjs_cache/</code></li>
            <li>Verificar dependências do Chrome</li>
            <li>Configurar Chrome args no código</li>
        </ol>
        
        <h3><i class="fas fa-memory"></i> 3. Problemas com Redis/Filas</h3>
        
        <h4><i class="fas fa-times-circle"></i> Erro: "Redis connection failed"</h4>
        <p><strong>Onde verificar:</strong></p>
        <ul>
            <li><code>src/libs/Queue.ts</code> - Configuração do Redis</li>
            <li><code>.env</code> - Variáveis do Redis</li>
        </ul>
        
        <p><strong>Soluções:</strong></p>
        <ol>
            <li>Verificar se Redis está rodando: <code>sudo systemctl status redis</code></li>
            <li>Testar conexão: <code>redis-cli ping</code></li>
            <li>Configurar variáveis de ambiente</li>
        </ol>
        
        <h3><i class="fas fa-tachometer-alt"></i> 4. Problemas de Performance</h3>
        
        <h4><i class="fas fa-clock"></i> Queries lentas</h4>
        <p><strong>Soluções:</strong></p>
        <ol>
            <li>Adicionar índices no banco de dados</li>
            <li>Otimizar queries com includes específicos</li>
            <li>Implementar paginação</li>
            <li>Usar cache Redis</li>
        </ol>
        
        <h2><i class="fas fa-terminal"></i> Comandos Úteis para Diagnóstico</h2>
        <pre><code># Verificar status dos serviços
sudo systemctl status postgresql redis nginx

# Verificar portas em uso
sudo netstat -tulpn | grep :8080

# Verificar uso de memória
free -h
top -p $(pgrep node)

# Verificar logs do sistema
sudo journalctl -u postgresql -f
sudo journalctl -u redis -f</code></pre>
        
        <h2><i class="fas fa-file-alt"></i> Logs e Debugging</h2>
        <p>Para habilitar logs detalhados, configure no <code>.env</code>:</p>
        <pre><code>NODE_ENV=development
LOG_LEVEL=debug</code></pre>
        
        <p>Monitorar logs em tempo real:</p>
        <pre><code># PM2
pm2 logs smartatendimento-backend --lines 100

# Arquivo de log
tail -f logs/app.log</code></pre>
    `;
}

function closeModal() {
    const modal = document.getElementById('documentModal');
    modal.classList.remove('active');
}

// Simple markdown to HTML converter
function convertMarkdownToHTML(markdown) {
    let html = markdown;
    
    // Headers
    html = html.replace(/^### (.*$)/gim, '<h3>$1</h3>');
    html = html.replace(/^## (.*$)/gim, '<h2>$1</h2>');
    html = html.replace(/^# (.*$)/gim, '<h1>$1</h1>');
    
    // Bold
    html = html.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    
    // Italic
    html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
    
    // Code blocks
    html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>');
    
    // Inline code
    html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
    
    // Links
    html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
    
    // Lists
    html = html.replace(/^\* (.*$)/gim, '<li>$1</li>');
    html = html.replace(/^- (.*$)/gim, '<li>$1</li>');
    
    // Wrap consecutive list items in ul tags
    html = html.replace(/(<li>.*<\/li>)/gs, function(match) {
        return '<ul>' + match + '</ul>';
    });
    
    // Line breaks
    html = html.replace(/\n\n/g, '</p><p>');
    html = '<p>' + html + '</p>';
    
    // Clean up empty paragraphs
    html = html.replace(/<p><\/p>/g, '');
    html = html.replace(/<p>(<h[1-6]>)/g, '$1');
    html = html.replace(/(<\/h[1-6]>)<\/p>/g, '$1');
    html = html.replace(/<p>(<ul>)/g, '$1');
    html = html.replace(/(<\/ul>)<\/p>/g, '$1');
    html = html.replace(/<p>(<pre>)/g, '$1');
    html = html.replace(/(<\/pre>)<\/p>/g, '$1');
    
    return html;
}

// Close modal when clicking outside
document.addEventListener('click', function(event) {
    const modal = document.getElementById('documentModal');
    if (event.target === modal) {
        closeModal();
    }
});

// Close modal with ESC key
document.addEventListener('keydown', function(event) {
    if (event.key === 'Escape') {
        closeModal();
    }
});

// AI Tabs functionality
document.addEventListener('DOMContentLoaded', function() {
    const aiTabBtns = document.querySelectorAll('.ai-tab-btn');
    const aiTabContents = document.querySelectorAll('.ai-tab-content');

    aiTabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            
            // Remove active class from all buttons and contents
            aiTabBtns.forEach(b => b.classList.remove('active'));
            aiTabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked button
            this.classList.add('active');
            
            // Show corresponding content
            const targetContent = document.getElementById(targetTab);
            if (targetContent) {
                targetContent.classList.add('active');
            }
        });
    });
});

// Mobile menu toggle (if needed in future)
function toggleMobileMenu() {
    const sidebar = document.querySelector('.sidebar');
    sidebar.classList.toggle('mobile-open');
}