# Análise e Recomendações para Integração de Agente de IA

## Situação Atual do Sistema

Após análise do código, identifiquei que o sistema atual possui:

### Estrutura Existente
- Backend: Node.js/TypeScript com Express
- WhatsApp Integration: Baileys (@whiskeysockets/baileys)
- Processamento de Mensagens: `wbotMessageListener.ts` - ponto central de processamento
- Sistema de Filas: Já implementado com chatbot básico baseado em opções
- Banco de Dados: Sequelize com PostgreSQL/MySQL

### Dependências Atuais Relevantes
```json
{
  "@whiskeysockets/baileys": "^6.7.18",
  "axios": "^0.21.1",
  "express": "^4.17.3",
  "mustache": "^4.2.0"
}
```

## Análise do Fluxo Atual de Mensagens

O sistema processa mensagens através do arquivo `wbotMessageListener.ts`:

1. **Recepção**: Mensagens chegam via webhook do Baileys
2. **Validação**: Verifica se é mensagem válida e não do próprio bot
3. **Processamento**: 
   - Verifica se há setor atribuído
   - Se não há setor, mostra opções de setores
   - Se há setor com chatbot, executa fluxo de opções
4. **Resposta**: Envia resposta baseada em templates fixos

## 🚀 FUNCIONALIDADES BÁSICAS (IMPLEMENTAÇÃO PRIORITÁRIA)

### 1. Características Essenciais do Agente PEPE

#### Identidade e Comportamento Básico
- Nome: PEPE (Processador Eletrônico de Perguntas e Esclarecimentos)
- Usuário Dedicado: Conta de usuário própria no sistema (`pepe@ai.system`)
- Sem Assinatura: Mensagens enviadas sem identificação de remetente
- Ícone Visual: Ícone 🤖 para identificar atendimento por IA
- Ativação: Inicia após conclusão do fluxo de chatbot básico dos setores

#### Controles Básicos de Operação
- Pausa Manual: Operadores podem pausar IA (transfere para "Aguardando")
- Transferência Automática: Quando IA não consegue responder → "Aguardando"
- Alertas Simples: Notificação quando IA precisa de ajuda humana

### 2. Integração com Sistema de Planos

#### **Novo Parâmetro em Planos**
```sql
-- Adicionar coluna na tabela de planos
ALTER TABLE plans ADD COLUMN ai_agent_enabled BOOLEAN DEFAULT false;

-- Exemplos de configuração por plano
UPDATE plans SET ai_agent_enabled = false WHERE name = 'Básico';
UPDATE plans SET ai_agent_enabled = true WHERE name = 'Premium';
UPDATE plans SET ai_agent_enabled = true WHERE name = 'Enterprise';
```

#### **Controle de Acesso**
- **Se Habilitado**: Mostra aba "Agente de IA" nas integrações
- **Se Desabilitado**: Esconde completamente a aba
- **Verificação**: Middleware verifica permissão antes de exibir/acessar funcionalidades

### 3. API de IA Básica

#### **OpenRouter com DeepSeek (100% Gratuito)**
- **Modelo Principal**: `deepseek/deepseek-chat-v3-0324:free`
- **Custo**: $0 (totalmente gratuito)
- **Limite**: 20 requests/minuto (suficiente para maioria)
- **Qualidade**: Excelente para chatbot de atendimento
- **Integração**: API compatível com OpenAI (simples)

### 4. Aba "Agente IA" Básica

#### **Nova Aba na Tela de Atendimentos**
```typescript
const ticketTabs = [
  { name: 'Aguardando', status: 'pending' },
  { name: 'Atendendo', status: 'open' },
  { name: 'Agente IA', status: 'ai_assisted' }  // NOVA ABA
];
```

#### **Comportamento Simples**
- **Localização**: Ao lado de "Atendendo" e "Aguardando"
- **Conteúdo**: Tickets sendo atendidos pelo PEPE
- **Transferência**: IA falha → move para "Aguardando"

### 5. Configuração Básica da IA

#### **Aba "Agente de IA" Simples nas Integrações**
```typescript
const BasicAITab = () => (
  <div className="ai-agent-basic">
    <h3>🤖 Agente PEPE</h3>
    
    {/* Ativar/Desativar */}
    <label>
      <input type="checkbox" checked={enabled} />
      Ativar Agente PEPE
    </label>
    
    {/* Treinamento Básico */}
    <textarea 
      placeholder="Informações da sua empresa..."
      rows={4}
    />
    
    {/* Teste Simples */}
    <input placeholder="Testar PEPE..." />
    <button>Testar</button>
    
    <button>Salvar</button>
  </div>
);
```

### 6. Integração Pós-Chatbot Básica

#### **Fluxo Simples de Ativação**
```typescript
// No wbotMessageListener.ts
if (ticket.queueId && !ticket.userId && company.plan.ai_agent_enabled) {
  // Ativar PEPE
  const pepeUser = await User.findOne({ where: { email: 'pepe@ai.system' } });
  await ticket.update({ userId: pepeUser.id, aiAssisted: true });
  
  // Processar com IA
  const response = await pepeService.generateResponse(message, companyInfo);
  
  if (response.needsHuman) {
    // Transferir para "Aguardando"
    await ticket.update({ userId: null, status: 'pending', aiAssisted: false });
    await generateAlert(ticket.id, 'IA precisa de ajuda');
  } else {
    // Enviar resposta
    await SendWhatsAppMessage({ body: response.message, ticket });
  }
}
```

### 7. Banco de Dados Básico

#### **Estrutura Mínima Necessária**
```sql
-- Adicionar coluna na tabela de planos
ALTER TABLE plans ADD COLUMN ai_agent_enabled BOOLEAN DEFAULT false;

-- Configuração básica de IA
CREATE TABLE ai_configs_basic (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  enabled BOOLEAN DEFAULT false,
  training_data TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Adicionar colunas básicas em tickets
ALTER TABLE tickets ADD COLUMN ai_assisted BOOLEAN DEFAULT false;

-- Criar usuário PEPE
INSERT INTO users (name, email, profile, "isAI") 
VALUES ('PEPE', 'pepe@ai.system', 'ai_agent', true);
```

### 8. Controle de Alucinação Básico

#### **Prompt Restritivo Simples**
```typescript
const BASIC_PROMPT = `
Você é PEPE, assistente da empresa.

REGRAS RÍGIDAS:
- Use APENAS as informações abaixo
- Se não souber, responda: "Vou transferir para um atendente"
- Máximo 100 palavras

INFORMAÇÕES DA EMPRESA:
${companyInfo}

Pergunta do cliente: ${message}
`;
```

#### **Validação Simples**
```typescript
const validateResponse = (response) => {
  const forbidden = ['acho que', 'talvez', 'provavelmente'];
  if (forbidden.some(word => response.includes(word))) {
    return { valid: false, reason: 'Resposta incerta' };
  }
  return { valid: true };
};
```

---

## 🔧 FUNCIONALIDADES AVANÇADAS (IMPLEMENTAÇÃO FUTURA)

### 1. Sistema Avançado de Treinamento

#### **Extração Automática de Site**
```typescript
class WebsiteExtractionService {
  async extractWebsiteInfo(url: string): Promise<ExtractedInfo> {
    // Extrair informações do site automaticamente
    // Agendar atualizações periódicas
    // Integrar com prompt personalizado
  }
}
```

#### **Treinamento por Níveis**
- **Básico**: 10 perguntas/respostas
- **Premium**: 50 perguntas/respostas + upload de documentos
- **Enterprise**: Treinamento ilimitado + IA dedicada

### 2. Controles Avançados de Operação

#### **Interface Completa de Controle**
```typescript
const AdvancedAIControls = () => (
  <div className="ai-advanced-controls">
    {/* Configurações do Modelo */}
    <select>
      <option>DeepSeek Chat</option>
      <option>Gemini 2.0</option>
      <option>Llama 3.3</option>
    </select>
    
    {/* Criatividade */}
    <input type="range" min="0" max="1" step="0.1" />
    
    {/* Regras de Transferência */}
    <div className="transfer-rules">
      <label><input type="checkbox" /> Reclamações</label>
      <label><input type="checkbox" /> Orçamentos</label>
      <label><input type="checkbox" /> Questões técnicas</label>
    </div>
    
    {/* Analytics */}
    <div className="ai-analytics">
      <span>Taxa de resolução: 85%</span>
      <span>Transferências: 12</span>
      <span>Satisfação: 4.2/5</span>
    </div>
  </div>
);
```

### 3. Sistema Avançado de Alertas

#### **Tipos Detalhados de Alertas**
```typescript
const AdvancedAlertTypes = {
  NEEDS_HUMAN: 'IA não conseguiu responder',
  TECHNICAL_ERROR: 'Erro técnico no sistema',
  RATE_LIMIT: 'Limite de API atingido',
  UNKNOWN_QUERY: 'Pergunta desconhecida',
  CUSTOMER_REQUEST: 'Cliente solicitou humano',
  LOW_CONFIDENCE: 'IA com baixa confiança',
  SENSITIVE_TOPIC: 'Tópico sensível detectado'
};
```

### 4. Analytics e Monitoramento

#### **Dashboard Completo**
```typescript
const AIAnalyticsDashboard = () => (
  <div className="ai-analytics-dashboard">
    <div className="metrics">
      <div>Mensagens processadas: 1,247</div>
      <div>Taxa de resolução: 78%</div>
      <div>Tempo médio de resposta: 2.3s</div>
      <div>Satisfação do cliente: 4.1/5</div>
    </div>
    
    <div className="charts">
      {/* Gráficos de performance */}
      {/* Análise de tópicos mais comuns */}
      {/* Horários de maior demanda */}
    </div>
    
    <div className="improvements">
      {/* Sugestões de melhoria */}
      {/* Perguntas que IA não conseguiu responder */}
    </div>
  </div>
);
```

### 5. Integração com Sistemas Externos

#### **APIs Externas**
- **Estoque**: Consultar disponibilidade de produtos
- **Preços**: Buscar preços atualizados
- **Agendamento**: Integrar com calendário
- **CRM**: Acessar histórico do cliente

### 6. Fallback Inteligente

#### **Sistema de Múltiplos Modelos**
```typescript
const models = [
  'deepseek/deepseek-chat-v3-0324:free',    // Principal
  'google/gemini-2.0-flash-exp:free',       // Fallback 1  
  'meta-llama/llama-3.3-70b-instruct:free' // Fallback 2
];

// Tentar modelos em sequência se um falhar
```

### 7. Personalização Avançada

#### **IA Personalizada por Segmento**
- **Loja de Roupas**: Templates específicos para moda
- **Oficina**: Conhecimento automotivo
- **Restaurante**: Cardápios e pedidos
- **Clínica**: Agendamentos médicos

### 8. Aprendizado Contínuo

#### **Sistema de Feedback**
```typescript
// Quando humano corrige IA
const improveAI = (wrongAnswer, correctAnswer) => {
  // Adicionar à base de conhecimento
  // Ajustar prompts automaticamente
  // Melhorar respostas futuras
};
```

---

## 📋 CRONOGRAMA DE IMPLEMENTAÇÃO

### **Fase 1: Básico (4-6 semanas)**
1. ✅ Usuário PEPE + integração OpenRouter
2. ✅ Aba "Agente IA" simples
3. ✅ Controle por planos
4. ✅ Integração pós-chatbot
5. ✅ Transferência para "Aguardando"
6. ✅ Configuração básica de treinamento

### **Fase 2: Avançado (6-8 semanas)**
1. 🔧 Extração automática de site
2. 🔧 Analytics e métricas
3. 🔧 Controles avançados
4. 🔧 Sistema de alertas detalhado
5. 🔧 Fallback entre modelos
6. 🔧 Personalização por segmento

**Prioridade**: Implementar primeiro as funcionalidades básicas para ter o PEPE funcionando rapidamente, depois evoluir com recursos avançados.

### 4. Arquitetura de Integração do Agente PEPE

#### **Estrutura de Arquivos Sugerida**
```
backend/src/services/
├── AIServices/
│   ├── PepeAIService.ts          # Serviço principal do agente PEPE
│   ├── AIProviderInterface.ts
│   ├── OpenRouterService.ts
│   ├── GeminiService.ts
│   ├── HuggingFaceService.ts
│   ├─�� AIResponseService.ts
│   ├── AIConfigService.ts
│   └── AIControlService.ts       # Controles de pausa/retomada
├── models/
│   ├── AIAgent.ts               # Modelo do usuário PEPE
│   └── AISession.ts             # Sessões de IA ativas
```

#### **Fluxo de Integração PEPE**
1. **Pós-Chatbot**: PEPE ativa após usuário completar opções de setor
2. **Verificação de Plano**: Confirma se empresa tem acesso ao agente IA
3. **Criação de Sessão**: Inicia sessão de IA vinculada ao ticket
4. **Processamento**: PEPE processa mensagens usando OpenRouter
5. **Controle Humano**: Sistema permite pausa/transferência a qualquer momento
6. **Alertas**: Gera notificações quando IA não consegue responder

#### **Usuário PEPE no Sistema**
```typescript
// Criação automática do usuário PEPE
const pepeUser = {
  name: "PEPE",
  email: "pepe@ai.system",
  profile: "ai_agent",
  isAI: true,
  companyId: null, // Usuário global do sistema
  avatar: "🤖", // Ícone do Gemini
  signature: null // Sem assinatura nas mensagens
};
```

### 3. Implementação Técnica

#### **Dependências Necessárias**
```json
{
  "openai": "^4.53.2",
  "@google/generative-ai": "^0.2.1",
  "node-cache": "^5.1.2",
  "rate-limiter-flexible": "^3.0.8"
}
```

#### **Configuração de Ambiente**
```env
# OpenRouter
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# Google Gemini
GEMINI_API_KEY=your_gemini_key

# Hugging Face
HUGGINGFACE_API_KEY=your_hf_key

# IA Configuration
AI_ENABLED=true
AI_PRIMARY_PROVIDER=openrouter
AI_FALLBACK_PROVIDER=gemini
AI_CACHE_TTL=3600
AI_MAX_TOKENS=150
AI_TEMPERATURE=0.7
```

#### **Exemplo de Implementação Base**

```typescript
// AIServices/AIResponseService.ts
import { OpenRouterService } from './OpenRouterService';
import { GeminiService } from './GeminiService';
import NodeCache from 'node-cache';

export class AIResponseService {
  private cache = new NodeCache({ stdTTL: 3600 });
  private primaryProvider: OpenRouterService;
  private fallbackProvider: GeminiService;

  constructor() {
    this.primaryProvider = new OpenRouterService();
    this.fallbackProvider = new GeminiService();
  }

  async generateResponse(
    message: string, 
    context: string[], 
    companyInfo: any
  ): Promise<string> {
    const cacheKey = this.generateCacheKey(message, context);
    const cached = this.cache.get<string>(cacheKey);
    
    if (cached) return cached;

    try {
      const response = await this.primaryProvider.generateResponse(
        message, 
        context, 
        companyInfo
      );
      this.cache.set(cacheKey, response);
      return response;
    } catch (error) {
      console.log('Primary provider failed, trying fallback...');
      const response = await this.fallbackProvider.generateResponse(
        message, 
        context, 
        companyInfo
      );
      this.cache.set(cacheKey, response);
      return response;
    }
  }

  private generateCacheKey(message: string, context: string[]): string {
    return `ai_${Buffer.from(message + context.join('')).toString('base64').slice(0, 32)}`;
  }
}
```

#### **Integração PEPE no wbotMessageListener.ts**

```typescript
// Adicionar no início do arquivo
import { PepeAIService } from '../AIServices/PepeAIService';
import { AIControlService } from '../AIServices/AIControlService';

// Adicionar após as importações existentes
const pepeService = new PepeAIService();
const aiControlService = new AIControlService();

// Modificar a função handleMessage
const handleMessage = async (msg: proto.IWebMessageInfo, wbot: Session, companyId: number): Promise<void> => {
  // ... código existente do chatbot básico ...

  // NOVO: Ativação do PEPE após chatbot básico
  if (!hasMedia && !msg.key.fromMe) {
    const ticket = await getTicket(msg);
    
    // Verificar se empresa tem acesso ao agente IA
    const company = await Company.findByPk(companyId, { include: ['plan'] });
    if (!company.plan.ai_agent_enabled) {
      // Continuar com fluxo normal sem IA
      return handleNormalFlow(msg, wbot, companyId);
    }

    // Verificar se chatbot básico foi concluído e setor foi selecionado
    if (ticket.queueId && !ticket.userId && ticket.status === 'pending') {
      
      // Verificar se IA não está pausada para este ticket
      const aiSession = await aiControlService.getSession(ticket.id);
      if (aiSession && aiSession.isPaused) {
        // IA pausada, aguardar atendimento humano
        return;
      }

      try {
        // Ativar PEPE
        const pepeUser = await User.findOne({ where: { email: 'pepe@ai.system' } });
        
        // Atribuir ticket ao PEPE temporariamente
        await ticket.update({ 
          userId: pepeUser.id,
          status: 'open',
          aiAssisted: true // Flag para identificar atendimento por IA
        });

        // Processar mensagem com PEPE
        const messageHistory = await getRecentMessages(ticket.id, 5);
        const companyInfo = await getCompanyInfo(companyId);
        
        const aiResponse = await pepeService.generateResponse(
          bodyMessage,
          messageHistory,
          companyInfo,
          ticket.queueId
        );

        // Verificar se IA conseguiu responder
        if (aiResponse.needsHuman) {
          // Gerar alerta para atendimento humano
          await generateAIAlert(ticket.id, aiResponse.reason);
          await ticket.update({ userId: null, status: 'pending' });
          return;
        }

        // Enviar resposta do PEPE (sem assinatura)
        await SendWhatsAppMessage({ 
          body: aiResponse.message, 
          ticket,
          userId: pepeUser.id
        });

        // Atualizar ícone do ticket para mostrar que está sendo atendido por IA
        await ticket.update({ aiIcon: '🤖' });

        return;
      } catch (error) {
        console.error('PEPE AI response failed:', error);
        // Gerar alerta e transferir para humano
        await generateAIAlert(ticket.id, 'Erro técnico na IA');
        await ticket.update({ userId: null, status: 'pending' });
      }
    }
  }

  // ... resto do código existente ...
};

// Nova função para gerar alertas de IA
const generateAIAlert = async (ticketId: number, reason: string) => {
  await Notification.create({
    title: '🤖 PEPE precisa de ajuda',
    message: `Ticket #${ticketId}: ${reason}`,
    type: 'ai_assistance_needed',
    ticketId: ticketId
  });
};
```

### 5. Aba "Agente de IA" nas Integrações

#### **Interface da Nova Aba**
```typescript
// Frontend - Componente da aba Agente de IA
const AIAgentTab = () => {
  const [aiConfig, setAiConfig] = useState({
    enabled: false,
    model: 'deepseek/deepseek-chat-v3-0324:free',
    temperature: 0.7,
    maxTokens: 150,
    systemPrompt: '',
    trainingData: '',
    autoTransferRules: []
  });

  return (
    <div className="ai-agent-tab">
      <h3>🤖 Configurações do Agente PEPE</h3>
      
      {/* Status do Agente */}
      <div className="agent-status">
        <label>
          <input 
            type="checkbox" 
            checked={aiConfig.enabled}
            onChange={(e) => setAiConfig({...aiConfig, enabled: e.target.checked})}
          />
          Ativar Agente PEPE
        </label>
        <span className={`status ${aiConfig.enabled ? 'active' : 'inactive'}`}>
          {aiConfig.enabled ? '🟢 Ativo' : '🔴 Inativo'}
        </span>
      </div>

      {/* Configurações do Modelo */}
      <div className="model-config">
        <h4>Configurações do Modelo</h4>
        <select 
          value={aiConfig.model}
          onChange={(e) => setAiConfig({...aiConfig, model: e.target.value})}
        >
          <option value="deepseek/deepseek-chat-v3-0324:free">DeepSeek Chat (Gratuito)</option>
          <option value="google/gemini-2.0-flash-exp:free">Gemini 2.0 Flash (Gratuito)</option>
          <option value="meta-llama/llama-3.3-70b-instruct:free">Llama 3.3 (Gratuito)</option>
        </select>
        
        <label>Criatividade (Temperature): {aiConfig.temperature}</label>
        <input 
          type="range" 
          min="0" 
          max="1" 
          step="0.1"
          value={aiConfig.temperature}
          onChange={(e) => setAiConfig({...aiConfig, temperature: e.target.value})}
        />
      </div>

      {/* Treinamento Personalizado */}
      <div className="training-section">
        <h4>Treinamento do PEPE</h4>
        
        {/* URL do Site */}
        <div className="website-section">
          <label>Site da Empresa (para consulta automática):</label>
          <input
            type="url"
            placeholder="https://www.suaempresa.com.br"
            value={aiConfig.websiteUrl}
            onChange={(e) => setAiConfig({...aiConfig, websiteUrl: e.target.value})}
          />
          <button onClick={extractWebsiteInfo}>🔍 Extrair Informações</button>
          <small>
            O PEPE irá consultar seu site e extrair informações automaticamente 
            (produtos, serviços, políticas, contato, etc.)
          </small>
        </div>

        {/* Informações Manuais */}
        <div className="manual-training">
          <label>Informações Adicionais:</label>
          <textarea
            placeholder="Insira informações específicas da sua empresa que o PEPE deve conhecer..."
            value={aiConfig.trainingData}
            onChange={(e) => setAiConfig({...aiConfig, trainingData: e.target.value})}
            rows={6}
          />
          <small>
            Exemplo: "Somos uma loja de roupas femininas. Trabalhamos com marcas X, Y, Z. 
            Horário: 9h às 18h. Entregamos em toda cidade. Trocas em até 7 dias."
          </small>
        </div>

        {/* Informações Extraídas do Site */}
        {aiConfig.extractedInfo && (
          <div className="extracted-info">
            <h5>📄 Informações Extraídas do Site:</h5>
            <div className="info-preview">
              {aiConfig.extractedInfo}
            </div>
            <button onClick={editExtractedInfo}>✏️ Editar</button>
          </div>
        )}
      </div>

      {/* Controles de Transferência */}
      <div className="transfer-rules">
        <h4>Quando Transferir para Humano</h4>
        <div className="rule-checkboxes">
          <label>
            <input type="checkbox" /> Cliente solicita falar com atendente
          </label>
          <label>
            <input type="checkbox" /> Reclamações ou problemas
          </label>
          <label>
            <input type="checkbox" /> Pedidos de orçamento detalhado
          </label>
          <label>
            <input type="checkbox" /> Questões técnicas complexas
          </label>
        </div>
      </div>

      {/* Teste do Agente */}
      <div className="test-section">
        <h4>Testar PEPE</h4>
        <div className="chat-test">
          <input 
            placeholder="Digite uma mensagem para testar o PEPE..."
            onKeyPress={(e) => e.key === 'Enter' && testPepe()}
          />
          <button onClick={testPepe}>Testar</button>
        </div>
        {testResponse && (
          <div className="test-response">
            <strong>PEPE:</strong> {testResponse}
          </div>
        )}
      </div>

      <button onClick={saveConfig} className="save-btn">
        Salvar Configurações
      </button>
    </div>
  );
};
```

#### **Controle de Acesso por Plano**
```typescript
// Middleware para verificar acesso à aba Agente de IA
const checkAIAgentAccess = async (req, res, next) => {
  const { companyId } = req.user;
  const company = await Company.findByPk(companyId, { include: ['plan'] });
  
  if (!company.plan.ai_agent_enabled) {
    return res.status(403).json({
      error: "Seu plano não inclui o Agente de IA. Faça upgrade para acessar este recurso."
    });
  }
  
  next();
};

// Rotas protegidas
router.get('/ai-agent/config', checkAIAgentAccess, getAIAgentConfig);
router.post('/ai-agent/config', checkAIAgentAccess, saveAIAgentConfig);
router.post('/ai-agent/test', checkAIAgentAccess, testAIAgent);
router.post('/ai-agent/pause/:ticketId', checkAIAgentAccess, pauseAIAgent);
router.post('/ai-agent/resume/:ticketId', checkAIAgentAccess, resumeAIAgent);
```

### 6. Sistema de Treinamento da IA

#### **Como Funciona o Treinamento**

##### **1. Treinamento por Empresa**
```typescript
// Cada empresa pode treinar seu PEPE com informações específicas
const trainingSystem = {
  // Informações básicas da empresa
  companyInfo: {
    name: "Loja ABC",
    type: "Varejo de roupas",
    description: "Loja especializada em moda feminina",
    products: ["Vestidos", "Blusas", "Calças", "Acessórios"],
    policies: "Trocas em até 7 dias com nota fiscal"
  },
  
  // Perguntas e respostas específicas
  customQA: [
    {
      question: "Vocês têm entrega?",
      answer: "Sim! Entregamos em toda a cidade em até 24h. Frete grátis acima de R$ 100."
    },
    {
      question: "Qual o horário de funcionamento?",
      answer: "Funcionamos de segunda a sábado, das 9h às 18h."
    }
  ],
  
  // Regras de negócio
  businessRules: [
    "Sempre mencionar promoções ativas",
    "Oferecer agendamento para prova de roupas",
    "Transferir para humano em caso de reclamações"
  ]
};
```

##### **2. Processo de Treinamento**
1. **Extração Automática**: PEPE consulta site da empresa e extrai informações
2. **Coleta Manual**: Empresa complementa com informações específicas
3. **Processamento**: Sistema gera prompt personalizado baseado nos dados
4. **Validação**: Testes automáticos verificam qualidade das respostas
5. **Ativação**: PEPE passa a usar o conhecimento personalizado
6. **Atualização Contínua**: Informações do site são atualizadas periodicamente

##### **2.1. Sistema de Extração de Site**
```typescript
// Serviço de extração de informações do site
class WebsiteExtractionService {
  async extractWebsiteInfo(url: string): Promise<ExtractedInfo> {
    const response = await fetch(url);
    const html = await response.text();
    
    // Usar IA para extrair informações estruturadas
    const extractionPrompt = `
    Analise este site e extraia as seguintes informações:
    - Nome da empresa
    - Produtos/serviços oferecidos
    - Horário de funcionamento
    - Informações de contato
    - Políticas (entrega, troca, garantia)
    - Preços (se disponíveis)
    
    HTML: ${html}
    
    Retorne em formato JSON estruturado.
    `;
    
    const extractedData = await openRouterAPI.extract(extractionPrompt);
    
    // Armazenar informações extraídas
    await AIConfig.update({
      websiteUrl: url,
      extractedInfo: extractedData,
      lastExtraction: new Date()
    }, { where: { companyId } });
    
    return extractedData;
  }

  async schedulePeriodicUpdate(companyId: number): Promise<void> {
    // Agendar atualização semanal das informações do site
    cron.schedule('0 2 * * 1', async () => {
      const config = await AIConfig.findOne({ where: { companyId } });
      if (config.websiteUrl) {
        await this.extractWebsiteInfo(config.websiteUrl);
      }
    });
  }
}
```

##### **2.2. Integração das Informações no Prompt**
```typescript
const buildEnhancedPrompt = (companyConfig) => {
  const websiteInfo = companyConfig.extractedInfo || {};
  const manualInfo = companyConfig.trainingData || '';
  
  return `
  Você é PEPE, assistente da ${websiteInfo.companyName || 'empresa'}.
  
  INFORMAÇÕES DO SITE (atualizadas automaticamente):
  ${JSON.stringify(websiteInfo, null, 2)}
  
  INFORMAÇÕES ADICIONAIS (fornecidas manualmente):
  ${manualInfo}
  
  Use SEMPRE essas informações para responder. Se não estiver aqui, transfira para humano.
  `;
};
```

##### **3. Tipos de Treinamento Disponíveis**

**Treinamento Básico (Todos os Planos com IA)**
- Informações básicas da empresa
- 10 perguntas e respostas personalizadas
- Configurações simples de transferência

**Treinamento Avançado (Planos Premium)**
- Até 50 perguntas e respostas personalizadas
- Upload de documentos (catálogos, manuais)
- Integração com sistemas externos (estoque, preços)
- Analytics de performance da IA

**Treinamento Enterprise**
- Treinamento ilimitado
- IA dedicada por empresa
- Suporte técnico especializado
- Customizações específicas

### 7. Configuração de Prompts para PEPE

#### **Prompt Base do PEPE**
```typescript
const PEPE_SYSTEM_PROMPT = `
Você é PEPE, o assistente virtual inteligente da empresa {COMPANY_NAME}.

IDENTIDADE:
- Nome: PEPE (Processador Eletrônico de Perguntas e Esclarecimentos)
- Personalidade: Educado, prestativo e eficiente
- Objetivo: Resolver dúvidas dos clientes de forma rápida e precisa

INSTRUÇÕES GERAIS:
- Responda SEMPRE em português brasileiro
- Seja conciso (m��ximo 150 palavras por resposta)
- Use linguagem clara e amigável
- NUNCA inclua assinatura ou identificação nas mensagens
- Se não souber algo,transferir para atendente humano na hora, mas sem o cliente/lead perceber.

INFORMAÇÕES DA EMPRESA:
{COMPANY_TRAINING_DATA}

REGRAS DE TRANSFERÊNCIA:
Transfira IMEDIATAMENTE para atendente humano quando:
- Cliente solicitar explicitamente falar com pessoa
- Houver reclamações ou problemas graves
- Questões que exigem acesso a sistemas internos
- Situações que você não consegue resolver
{CUSTOM_TRANSFER_RULES}

CONTEXTO DA CONVERSA:
{CONVERSATION_HISTORY}

IMPORTANTE: Se você não conseguir responder adequadamente, responda exatamente:
"Vou transferir você para um especialista que poderá ajudar melhor. Um momento, por favor!"

Responda à seguinte mensagem do cliente:
`;
```

### 8. Nova Aba "Agente IA" na Tela de Atendimentos

#### **Estrutura das Abas Atualizada**
```typescript
// Abas na tela de atendimentos
const ticketTabs = [
  { name: 'Aguardando', status: 'pending' },
  { name: 'Atendendo', status: 'open' },
  { name: 'Agente IA', status: 'ai_assisted' }  // NOVA ABA
];
```

#### **Comportamento da Aba "Agente IA"**
- **Localização**: Ao lado das abas "Atendendo" e "Aguardando"
- **Conteúdo**: Tickets sendo atendidos pelo PEPE
- **Ícone**: 🤖 para identificação visual
- **Filtro**: `WHERE aiAssisted = true AND status = 'open'`

#### **Fluxo de Transferência Automática**
```typescript
// Quando IA não consegue responder
const transferToWaiting = async (ticketId: number, reason: string) => {
  await Ticket.update({
    status: 'pending',        // Move para "Aguardando"
    userId: null,             // Remove PEPE
    aiAssisted: false,        // Desativa flag IA
    aiTransferReason: reason  // Motivo da transferência
  }, { where: { id: ticketId } });
  
  // Gerar alerta para atendentes
  await generateAIAlert(ticketId, 'NEEDS_HUMAN', { reason });
};
```

#### **Cenários de Transferência para "Aguardando"**
1. **IA não consegue responder** → Aguardando
2. **Cliente solicita humano** → Aguardando  
3. **Erro técnico da IA** → Aguardando
4. **Tópico complexo detectado** → Aguardando
5. **Operador pausa IA** → Aguardando

### 9. Controles de Operação do PEPE

#### **Sistema de Pausa/Retomada**
```typescript
// Serviço de controle da IA
class AIControlService {
  async pauseAI(ticketId: number, userId: number): Promise<void> {
    await AISession.update(
      { isPaused: true, pausedBy: userId, pausedAt: new Date() },
      { where: { ticketId } }
    );
    
    // Transferir ticket para aba "Aguardando"
    await Ticket.update(
      { userId: null, status: 'pending', aiAssisted: false },
      { where: { id: ticketId } }
    );
    
    // Notificar que IA foi pausada
    await this.notifyAIPaused(ticketId, userId);
  }

  async resumeAI(ticketId: number, userId: number): Promise<void> {
    await AISession.update(
      { isPaused: false, resumedBy: userId, resumedAt: new Date() },
      { where: { ticketId } }
    );
    
    // Reativar PEPE e mover para aba "Agente IA"
    const pepeUser = await User.findOne({ where: { email: 'pepe@ai.system' } });
    await Ticket.update(
      { userId: pepeUser.id, status: 'open', aiAssisted: true },
      { where: { id: ticketId } }
    );
  }

  async getSession(ticketId: number): Promise<AISession | null> {
    return await AISession.findOne({ where: { ticketId } });
  }
}
```

#### **Interface de Controle no Chat**
```typescript
// Componente de controle da IA no chat
const AIControlPanel = ({ ticket }) => {
  const [aiSession, setAiSession] = useState(null);

  return (
    <div className="ai-control-panel">
      {ticket.aiAssisted && (
        <div className="ai-status">
          <span className="ai-indicator">🤖 PEPE está atendendo</span>
          <div className="ai-controls">
            <button 
              onClick={() => pauseAI(ticket.id)}
              className="pause-ai-btn"
            >
              ⏸️ Pausar IA
            </button>
            <button 
              onClick={() => takeControl(ticket.id)}
              className="take-control-btn"
            >
              👤 Assumir Controle
            </button>
          </div>
        </div>
      )}
      
      {aiSession?.isPaused && (
        <div className="ai-paused">
          <span>⏸️ IA pausada - Atendimento humano</span>
          <button 
            onClick={() => resumeAI(ticket.id)}
            className="resume-ai-btn"
          >
            ▶️ Reativar PEPE
          </button>
        </div>
      )}
    </div>
  );
};
```

### 9. Sistema de Alertas e Notificações

#### **Tipos de Alertas do PEPE**
```typescript
const AIAlertTypes = {
  NEEDS_HUMAN: 'ai_needs_human',
  TECHNICAL_ERROR: 'ai_technical_error',
  RATE_LIMIT: 'ai_rate_limit',
  UNKNOWN_QUERY: 'ai_unknown_query',
  CUSTOMER_REQUEST: 'ai_customer_request_human'
};

// Geração de alertas específicos
const generateAIAlert = async (ticketId: number, type: string, details: any) => {
  const alertMessages = {
    [AIAlertTypes.NEEDS_HUMAN]: '🤖 PEPE não conseguiu responder - Intervenção necessária',
    [AIAlertTypes.TECHNICAL_ERROR]: '⚠️ Erro técnico no PEPE - Verificar sistema',
    [AIAlertTypes.RATE_LIMIT]: '🚫 Limite de API atingido - PEPE temporariamente indisponível',
    [AIAlertTypes.UNKNOWN_QUERY]: '❓ PEPE encontrou pergunta desconhecida - Considerar treinamento',
    [AIAlertTypes.CUSTOMER_REQUEST]: '👤 Cliente solicitou atendimento humano'
  };

  await Notification.create({
    title: alertMessages[type],
    message: `Ticket #${ticketId}: ${details.reason || details.message}`,
    type: type,
    ticketId: ticketId,
    priority: type === AIAlertTypes.TECHNICAL_ERROR ? 'high' : 'normal'
  });
};
```

### 10. Estratégia de Implementação do Agente PEPE

#### **Fase 1: Infraestrutura Base (2-3 semanas)**
1. **Banco de Dados**:
   - Adicionar coluna `ai_agent_enabled` na tabela `plans`
   - Criar tabelas `ai_sessions`, `ai_configs`, `ai_alerts`
   - Criar usuário PEPE no sistema

2. **Backend Básico**:
   - Implementar `PepeAIService`
   - Criar middleware de verificação de plano
   - Integrar com OpenRouter API

3. **Frontend Base**:
   - Criar aba "Agente de IA" nas integrações
   - Implementar controles de pausa/retomada
   - Adicionar ícone de IA nos tickets

#### **Fase 2: Funcionalidades Avançadas (3-4 semanas)**
1. **Sistema de Treinamento**:
   - Interface de configuração personalizada
   - Sistema de perguntas e respostas
   - Validação e testes automáticos

2. **Controles Operacionais**:
   - Sistema de alertas inteligentes
   - Analytics de performance
   - Logs detalhados de conversas

3. **Integrações**:
   - Integração pós-chatbot básico
   - Sistema de fallback entre modelos
   - Cache inteligente de respostas

#### **Fase 3: Otimização e Monitoramento (2-3 semanas)**
1. **Performance**:
   - Otimização de prompts
   - Rate limiting inteligente
   - Monitoramento de custos

2. **Qualidade**:
   - Sistema de feedback de qualidade
   - Métricas de satisfação
   - Ajustes automáticos baseados em dados

3. **Escalabilidade**:
   - Suporte a múltiplos modelos
   - Balanceamento de carga
   - Backup e redundância

### 6. Custos Estimados

#### **Cenário Conservador (500 mensagens/dia)**
- **OpenRouter**: $0 (dentro do limite gratuito com $10 de crédito)
- **Gemini**: $0 (dentro do limite gratuito)
- **Total mensal**: ~$10 (apenas o crédito inicial do OpenRouter)

#### **Cenário Médio (2000 mensagens/dia)**
- **OpenRouter**: ~$15-25/mês
- **Gemini**: ~$5-10/mês (como fallback)
- **Total mensal**: ~$20-35/mês

### 7. Benefícios Esperados

1. **Redução de Carga Humana**: 60-80% das consultas básicas automatizadas
2. **Disponibilidade 24/7**: Atendimento instantâneo fora do horário comercial
3. **Consistência**: Respostas padronizadas e sempre educadas
4. **Escalabilidade**: Capacidade de atender múltiplos clientes simultaneamente
5. **Coleta de Dados**: Insights sobre dúvidas mais comuns dos clientes

### 8. Considerações de Segurança e Privacidade

1. **Não enviar dados sensíveis**: CPF, senhas, dados bancários
2. **Implementar filtros**: Para detectar e bloquear informações sensíveis
3. **Logs seguros**: Não armazenar conversas completas
4. **Compliance**: Seguir LGPD para dados pessoais

### 9. Monitoramento e Métricas

#### **KPIs Sugeridos**
- Taxa de resolução automática
- Tempo médio de resposta
- Satisfação do cliente (via pesquisa)
- Custo por interação
- Taxa de escalação para humano

#### **Alertas**
- Falhas de API
- Limite de rate approaching
- Respostas inadequadas (via feedback)

## 10. IA Personalizada por Cliente

### Conceito
Implementar um sistema de IA personalizada onde cada cliente pode treinar sua própria instância de IA com informações específicas do seu negócio, garantindo respostas precisas e contextualizadas.

### Exemplos de Aplicação por Segmento

#### **Loja de Roupas**
- **Informações do Negócio**: Catálogo de produtos, tamanhos disponíveis, políticas de troca, horários de funcionamento
- **Casos de Uso**: 
  - "Vocês têm essa blusa no tamanho M?"
  - "Qual o prazo para troca?"
  - "Que cores vocês têm dessa calça?"
  - "Vocês fazem entrega?"

#### **Oficina Mecânica**
- **Informações do Negócio**: Serviços oferecidos, preços, especialidades, tempo de execução
- **Casos de Uso**:
  - "Quanto custa um alinhamento?"
  - "Vocês trabalham com freios ABS?"
  - "Qual o prazo para troca de óleo?"
  - "Fazem serviço em carros importados?"

#### **Cabeleireiro/Salão de Beleza**
- **Informações do Negócio**: Serviços, preços, profissionais, horários disponíveis
- **Casos de Uso**:
  - "Quanto custa uma escova progressiva?"
  - "Vocês fazem corte masculino?"
  - "Que horários têm disponível amanhã?"
  - "Trabalham com coloração?"

### Implementação Técnica

#### **Estrutura no Painel de API**

```typescript
// Adicionar nova seção no painel de API
interface AICustomizationPanel {
  companyId: number;
  planType: string; // verificar se plano permite IA personalizada
  businessInfo: {
    companyName: string;
    businessType: string;
    description: string;
    products: string[];
    services: string[];
    policies: string[];
    workingHours: string;
    contactInfo: string;
    specialties: string[];
    priceList: string;
    faq: string;
  };
  customPrompts: {
    greeting: string;
    fallback: string;
    transferToHuman: string;
  };
  trainingData: {
    commonQuestions: Array<{
      question: string;
      answer: string;
      category: string;
    }>;
    businessRules: string[];
    restrictions: string[];
  };
}
```

#### **Interface do Usuário - Painel de IA**

```html
<!-- Seção no painel de API -->
<div class="ai-customization-panel" v-if="userPlan.includes('ai')">
  <h3>🤖 IA Personalizada</h3>
  
  <!-- Informações Básicas da Empresa -->
  <div class="business-info-section">
    <h4>Informações do Negócio</h4>
    <form @submit="saveBusinessInfo">
      <div class="form-group">
        <label>Tipo de Negócio:</label>
        <select v-model="aiConfig.businessType">
          <option value="retail">Loja/Varejo</option>
          <option value="automotive">Oficina/Automotivo</option>
          <option value="beauty">Beleza/Estética</option>
          <option value="restaurant">Restaurante/Food</option>
          <option value="services">Serviços Gerais</option>
          <option value="other">Outro</option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Descrição da Empresa:</label>
        <textarea v-model="aiConfig.description" 
                  placeholder="Descreva sua empresa, o que faz, diferenciais..."></textarea>
      </div>
      
      <div class="form-group">
        <label>Produtos/Serviços (um por linha):</label>
        <textarea v-model="aiConfig.productsServices" 
                  placeholder="Lista seus principais produtos ou serviços..."></textarea>
      </div>
      
      <div class="form-group">
        <label>Políticas e Regras:</label>
        <textarea v-model="aiConfig.policies" 
                  placeholder="Políticas de troca, garantia, atendimento..."></textarea>
      </div>
      
      <div class="form-group">
        <label>Horário de Funcionamento:</label>
        <input v-model="aiConfig.workingHours" 
               placeholder="Ex: Segunda a Sexta: 8h às 18h">
      </div>
      
      <div class="form-group">
        <label>Informações de Contato:</label>
        <textarea v-model="aiConfig.contactInfo" 
                  placeholder="Endereço, telefone, redes sociais..."></textarea>
      </div>
    </form>
  </div>
  
  <!-- Perguntas e Respostas Personalizadas -->
  <div class="custom-qa-section">
    <h4>Perguntas e Respostas Personalizadas</h4>
    <div v-for="(qa, index) in aiConfig.customQA" :key="index" class="qa-item">
      <input v-model="qa.question" placeholder="Pergunta comum dos clientes">
      <textarea v-model="qa.answer" placeholder="Resposta que a IA deve dar"></textarea>
      <button @click="removeQA(index)">Remover</button>
    </div>
    <button @click="addQA">+ Adicionar Pergunta</button>
  </div>
  
  <!-- Configurações Avançadas -->
  <div class="advanced-settings">
    <h4>Configurações Avançadas</h4>
    <div class="form-group">
      <label>Tom de Voz:</label>
      <select v-model="aiConfig.tone">
        <option value="formal">Formal</option>
        <option value="casual">Casual</option>
        <option value="friendly">Amigável</option>
        <option value="professional">Profissional</option>
      </select>
    </div>
    
    <div class="form-group">
      <label>Quando transferir para humano:</label>
      <textarea v-model="aiConfig.transferRules" 
                placeholder="Ex: Quando cliente pedir orçamento detalhado, reclamações..."></textarea>
    </div>
  </div>
  
  <!-- Teste da IA -->
  <div class="ai-test-section">
    <h4>Testar IA</h4>
    <div class="chat-test">
      <input v-model="testMessage" placeholder="Digite uma mensagem para testar">
      <button @click="testAI">Testar</button>
      <div class="test-response" v-if="testResponse">
        <strong>Resposta da IA:</strong> {{ testResponse }}
      </div>
    </div>
  </div>
  
  <button @click="saveAIConfig" class="save-btn">Salvar Configurações</button>
</div>

<!-- Aviso para planos sem IA -->
<div class="ai-upgrade-notice" v-else>
  <h3>🤖 IA Personalizada</h3>
  <p>Upgrade seu plano para ter acesso à IA personalizada para seu negócio!</p>
  <button class="upgrade-btn">Fazer Upgrade</button>
</div>
```

#### **Backend - Serviço de IA Personalizada**

```typescript
// AIServices/PersonalizedAIService.ts
export class PersonalizedAIService {
  async generatePersonalizedPrompt(companyId: number): Promise<string> {
    const companyConfig = await this.getCompanyAIConfig(companyId);
    
    return `
Você é o assistente virtual da ${companyConfig.companyName}.

INFORMAÇÕES DA EMPRESA:
- Tipo de negócio: ${companyConfig.businessType}
- Descrição: ${companyConfig.description}
- Produtos/Serviços: ${companyConfig.productsServices}
- Horário de funcionamento: ${companyConfig.workingHours}
- Contato: ${companyConfig.contactInfo}

POLÍTICAS E REGRAS:
${companyConfig.policies}

PERGUNTAS FREQUENTES:
${companyConfig.customQA.map(qa => `P: ${qa.question}\nR: ${qa.answer}`).join('\n\n')}

INSTRUÇÕES:
- Tom de voz: ${companyConfig.tone}
- Seja sempre educado e prestativo
- Use as informações específicas da empresa para responder
- Se não souber algo específico, sugira falar com um atendente
- Transfira para humano quando: ${companyConfig.transferRules}

REGRAS DE TRANSFERÊNCIA:
- Para orçamentos detalhados
- Para reclamações complexas
- Para agendamentos específicos
- ${companyConfig.transferRules}

Responda à seguinte mensagem do cliente:
`;
  }

  async getCompanyAIConfig(companyId: number): Promise<AICustomizationPanel> {
    // Buscar configuração da IA personalizada do banco
    const config = await CompanyAIConfig.findOne({ where: { companyId } });
    return config || this.getDefaultConfig();
  }

  private getDefaultConfig(): AICustomizationPanel {
    return {
      companyName: "Empresa",
      businessType: "services",
      description: "Empresa prestadora de serviços",
      // ... outros campos padrão
    };
  }
}
```

#### **Modelo de Banco de Dados**

```sql
-- Tabela para configurações de IA personalizada
CREATE TABLE company_ai_configs (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  business_type VARCHAR(50),
  description TEXT,
  products_services TEXT,
  policies TEXT,
  working_hours VARCHAR(255),
  contact_info TEXT,
  tone VARCHAR(20) DEFAULT 'friendly',
  transfer_rules TEXT,
  custom_qa JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_company_ai_configs_company_id ON company_ai_configs(company_id);
CREATE INDEX idx_company_ai_configs_active ON company_ai_configs(is_active);
```

### Controle de Acesso por Plano

#### **Verificação de Plano**
```typescript
// Middleware para verificar se o plano permite IA personalizada
export const checkAIPlan = async (req: Request, res: Response, next: NextFunction) => {
  const { companyId } = req.user;
  const company = await Company.findByPk(companyId, { include: ['plan'] });
  
  if (!company.plan.features.includes('personalized_ai')) {
    return res.status(403).json({
      error: "Plano atual não inclui IA personalizada. Faça upgrade para acessar este recurso."
    });
  }
  
  next();
};

// Rotas protegidas
router.get('/ai-config', checkAIPlan, getAIConfig);
router.post('/ai-config', checkAIPlan, saveAIConfig);
router.post('/ai-test', checkAIPlan, testAI);
```

### Benefícios da IA Personalizada

1. **Respostas Precisas**: IA treinada com informações específicas do negócio
2. **Redução de Transferências**: Menos necessidade de atendimento humano
3. **Consistência de Marca**: Respostas alinhadas com o tom da empresa
4. **Escalabilidade**: Cada cliente tem sua IA otimizada
5. **Diferencial Competitivo**: Recurso premium que agrega valor ao produto

### Estratégia de Monetização

1. **Plano Premium**: IA personalizada como feature premium
2. **Setup Fee**: Taxa única para configuração inicial
3. **Mensalidade Adicional**: Valor extra mensal para manutenção da IA
4. **Limite de Mensagens**: Diferentes limites por plano

### Implementação Gradual

#### **Fase 1: Interface Básica**
- Criar painel de configuração no frontend
- Implementar CRUD de configurações de IA
- Controle de acesso por plano

#### **Fase 2: Integração com IA**
- Conectar configurações com serviço de IA
- Implementar prompts personalizados
- Sistema de teste da IA

#### **Fase 3: Otimizações**
- Analytics de performance da IA
- Sugestões automáticas de melhorias
- Templates por segmento de negócio

## 11. Modelos de Banco de Dados Necessários

### **Tabelas Adicionais para PEPE**
```sql
-- Adicionar coluna na tabela de planos
ALTER TABLE plans ADD COLUMN ai_agent_enabled BOOLEAN DEFAULT false;

-- Tabela de configurações de IA por empresa
CREATE TABLE ai_configs (
  id SERIAL PRIMARY KEY,
  company_id INTEGER REFERENCES companies(id),
  enabled BOOLEAN DEFAULT false,
  model VARCHAR(100) DEFAULT 'deepseek/deepseek-chat-v3-0324:free',
  temperature DECIMAL(3,2) DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 150,
  training_data TEXT,
  website_url VARCHAR(500),           -- URL do site para extração
  extracted_info JSONB,              -- Informações extraídas do site
  last_extraction TIMESTAMP,         -- Última extração do site
  custom_prompts JSONB,
  transfer_rules JSONB,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de sessões de IA ativas
CREATE TABLE ai_sessions (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id),
  company_id INTEGER REFERENCES companies(id),
  is_paused BOOLEAN DEFAULT false,
  paused_by INTEGER REFERENCES users(id),
  paused_at TIMESTAMP,
  resumed_by INTEGER REFERENCES users(id),
  resumed_at TIMESTAMP,
  messages_count INTEGER DEFAULT 0,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de alertas de IA
CREATE TABLE ai_alerts (
  id SERIAL PRIMARY KEY,
  ticket_id INTEGER REFERENCES tickets(id),
  company_id INTEGER REFERENCES companies(id),
  alert_type VARCHAR(50),
  message TEXT,
  details JSONB,
  resolved BOOLEAN DEFAULT false,
  resolved_by INTEGER REFERENCES users(id),
  resolved_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW()
);

-- Adicionar colunas na tabela de tickets
ALTER TABLE tickets ADD COLUMN ai_assisted BOOLEAN DEFAULT false;
ALTER TABLE tickets ADD COLUMN ai_icon VARCHAR(10);

-- Criar usuário PEPE
INSERT INTO users (name, email, profile, "isAI", avatar) 
VALUES ('PEPE', 'pepe@ai.system', 'ai_agent', true, '🤖');
```

## Conclusão

A implementação do **Agente de IA PEPE** representa uma evolução significativa do sistema de atendimento, oferecendo:

### **Benefícios Principais:**
1. **Atendimento 24/7**: PEPE nunca dorme, sempre disponível
2. **Redução de Carga**: 60-80% das consultas básicas automatizadas
3. **Consistência**: Respostas padronizadas e sempre educadas
4. **Escalabilidade**: Atende múltiplos clientes simultaneamente
5. **Controle Total**: Operadores podem pausar/retomar a qualquer momento
6. **Alertas Inteligentes**: Sistema avisa quando intervenção humana é necessária

### **Diferenciais do PEPE:**
- ✅ **Usuário Próprio**: Integração nativa com sistema de usuários
- ��� **Sem Assinatura**: Mensagens limpas, sem identificação
- ✅ **Pós-Chatbot**: Ativa após seleção de setor
- ✅ **Controle por Plano**: Acesso controlado via configuração de planos
- ✅ **Aba Dedicada**: Interface específica para configurações
- ✅ **Ícone Visual**: Identificação clara de atendimento por IA
- ✅ **Treinamento Personalizado**: Cada empresa treina seu PEPE

### **Estratégia de Monetização:**
- **Plano Básico**: Sem acesso ao PEPE
- **Plano Premium**: PEPE com treinamento básico
- **Plano Enterprise**: PEPE avançado com treinamento ilimitado

### **Próximos Passos Recomendados:**
1. **Semana 1-2**: Configurar OpenRouter e criar estrutura base
2. **Semana 3-5**: Implementar backend do PEPE e controles
3. **Semana 6-8**: Desenvolver aba "Agente de IA" no frontend
4. **Semana 9-10**: Integrar sistema de alertas e notificações
5. **Semana 11-12**: Testes, ajustes e deploy em produção

### **Investimento Estimado:**
- **Desenvolvimento**: 80-120 horas (2-3 meses)
- **Custo Mensal API**: $10-35 (dependendo do volume)
- **ROI Esperado**: 3-6 meses
- **Receita Adicional**: 20-40% dos clientes podem migrar para planos premium

### **Riscos Mitigados:**
- ✅ **Controle Humano**: Sempre possível pausar/assumir controle
- ✅ **Fallback**: Sistema de alertas quando IA não consegue responder
- ✅ **Custos Controlados**: Modelos gratuitos e monitoramento de uso
- ✅ **Qualidade**: Sistema de treinamento personalizado por empresa

O **Agente PEPE** posiciona o sistema como uma solução de atendimento inteligente e moderna, criando vantagem competitiva significativa no mercado de chatbots empresariais.