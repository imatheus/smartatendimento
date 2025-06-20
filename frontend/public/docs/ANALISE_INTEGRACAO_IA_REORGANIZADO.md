# Análise e Implementação do Agente de IA "PEPE"

## 🚀 FUNCIONALIDADES BÁSICAS (IMPLEMENTAÇÃO PRIORITÁRIA)

### 1. Características Essenciais do Agente PEPE

#### **Identidade e Comportamento Básico**
- **Nome**: PEPE (Processador Eletrônico de Perguntas e Esclarecimentos)
- **Usuário Dedicado**: Conta de usuário própria no sistema (`pepe@ai.system`)
- **Sem Assinatura**: Mensagens enviadas sem identificação de remetente
- **Ícone Visual**: Ícone 🤖 para identificar atendimento por IA
- **Ativação**: Inicia após conclusão do fluxo de chatbot básico dos setores

#### **Controles Básicos de Operação**
- **Pausa Manual**: Operadores podem pausar IA (transfere para "Aguardando")
- **Transferência Automática**: Quando IA não consegue responder → "Aguardando"
- **Alertas Simples**: Notificação quando IA precisa de ajuda humana

### 2. Integração com Sistema de Planos (BÁSICO)

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

### 4. Aba "Agente IA" Básica na Tela de Atendimentos

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

#### **Cenários de Transferência para "Aguardando"**
1. **IA não consegue responder** → Aguardando
2. **Cliente solicita humano** → Aguardando  
3. **Erro técnico da IA** → Aguardando
4. **Operador pausa IA** → Aguardando

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

### 9. Dependências e Configuração Básica

#### **Dependências Necessárias (Básico)**
```json
{
  "openai": "^4.53.2",
  "node-cache": "^5.1.2"
}
```

#### **Configuração de Ambiente (Básico)**
```env
# OpenRouter
OPENROUTER_API_KEY=your_openrouter_key
OPENROUTER_BASE_URL=https://openrouter.ai/api/v1

# IA Configuration
AI_ENABLED=true
AI_MODEL=deepseek/deepseek-chat-v3-0324:free
AI_MAX_TOKENS=100
AI_TEMPERATURE=0.1
```

#### **Estrutura de Arquivos (Básico)**
```
backend/src/services/
├── AIServices/
│   ├── PepeAIService.ts          # Serviço principal (BÁSICO)
│   └── AIConfigService.ts        # Configurações (BÁSICO)
```

---

## 🔧 FUNCIONALIDADES AVANÇADAS (IMPLEMENTAÇÃO FUTURA)

### 1. Sistema Avançado de Treinamento

#### **Extração Automática de Site**
```typescript
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

#### **Interface Avançada de Treinamento**
```typescript
const AdvancedTrainingTab = () => (
  <div className="training-section">
    <h4>Treinamento Avançado do PEPE</h4>
    
    {/* URL do Site */}
    <div className="website-section">
      <label>Site da Empresa (para consulta automática):</label>
      <input
        type="url"
        placeholder="https://www.suaempresa.com.br"
        value={aiConfig.websiteUrl}
      />
      <button onClick={extractWebsiteInfo}>🔍 Extrair Informações</button>
      <small>
        O PEPE irá consultar seu site e extrair informações automaticamente 
        (produtos, serviços, políticas, contato, etc.)
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

    {/* Perguntas e Respostas Personalizadas */}
    <div className="custom-qa-section">
      <h4>Perguntas e Respostas Personalizadas</h4>
      {aiConfig.customQA.map((qa, index) => (
        <div key={index} className="qa-item">
          <input value={qa.question} placeholder="Pergunta comum dos clientes" />
          <textarea value={qa.answer} placeholder="Resposta que a IA deve dar" />
          <button onClick={() => removeQA(index)}>Remover</button>
        </div>
      ))}
      <button onClick={addQA}>+ Adicionar Pergunta</button>
    </div>
  </div>
);
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
    <label>Criatividade (Temperature): {aiConfig.temperature}</label>
    <input type="range" min="0" max="1" step="0.1" />
    
    {/* Regras de Transferência */}
    <div className="transfer-rules">
      <h4>Quando Transferir para Humano</h4>
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

#### **Sistema de Pausa/Retomada Avançado**
```typescript
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
}
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

// Geração de alertas específicos
const generateAdvancedAIAlert = async (ticketId: number, type: string, details: any) => {
  const alertMessages = {
    [AdvancedAlertTypes.NEEDS_HUMAN]: '🤖 PEPE não conseguiu responder - Intervenção necessária',
    [AdvancedAlertTypes.TECHNICAL_ERROR]: '⚠️ Erro técnico no PEPE - Verificar sistema',
    [AdvancedAlertTypes.RATE_LIMIT]: '🚫 Limite de API atingido - PEPE temporariamente indisponível',
    [AdvancedAlertTypes.UNKNOWN_QUERY]: '❓ PEPE encontrou pergunta desconhecida - Considerar treinamento',
    [AdvancedAlertTypes.CUSTOMER_REQUEST]: '👤 Cliente solicitou atendimento humano'
  };

  await Notification.create({
    title: alertMessages[type],
    message: `Ticket #${ticketId}: ${details.reason || details.message}`,
    type: type,
    ticketId: ticketId,
    priority: type === AdvancedAlertTypes.TECHNICAL_ERROR ? 'high' : 'normal'
  });
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
class AdvancedAIService {
  async generateResponseWithFallback(message: string, context: any): Promise<string> {
    for (const model of models) {
      try {
        return await this.callModel(model, message, context);
      } catch (error) {
        console.log(`Model ${model} failed, trying next...`);
        continue;
      }
    }
    throw new Error('All AI models failed');
  }
}
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

### 9. Banco de Dados Avançado

#### **Estrutura Completa**
```sql
-- Tabela de configurações avançadas de IA
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
```

---

## 📋 CRONOGRAMA DE IMPLEMENTAÇÃO

### **Fase 1: Básico (4-6 semanas) - PRIORIDADE MÁXIMA**
1. ✅ **Semana 1-2**: Usuário PEPE + integração OpenRouter básica
2. ✅ **Semana 2-3**: Aba "Agente IA" simples na tela de atendimentos
3. ✅ **Semana 3-4**: Controle por planos + middleware de verificação
4. ✅ **Semana 4-5**: Integração pós-chatbot + transferência para "Aguardando"
5. ✅ **Semana 5-6**: Configuração básica de treinamento + validação simples

**Resultado**: PEPE funcionando com recursos essenciais

### **Fase 2: Avançado (6-8 semanas) - IMPLEMENTAÇÃO FUTURA**
1. 🔧 **Semana 7-8**: Extração automática de site
2. 🔧 **Semana 9-10**: Analytics e métricas detalhadas
3. 🔧 **Semana 11-12**: Controles avançados + sistema de alertas
4. 🔧 **Semana 13-14**: Fallback entre modelos + personalização por segmento

**Resultado**: PEPE com recursos avançados e analytics completos

---

## 🎯 RESUMO EXECUTIVO

### **Funcionalidades Básicas (Implementar PRIMEIRO)**
- ✅ Usuário PEPE dedicado
- ✅ Integração com OpenRouter (gratuito)
- ✅ Aba "Agente IA" na tela de atendimentos
- ✅ Controle por planos
- ✅ Transferência automática para "Aguardando"
- ✅ Configuração básica de treinamento
- ✅ Controle de alucinação simples

### **Funcionalidades Avançadas (Implementar DEPOIS)**
- 🔧 Extração automática de site
- 🔧 Analytics e dashboard
- 🔧 Controles avançados de IA
- 🔧 Sistema de alertas detalhado
- 🔧 Fallback entre modelos
- 🔧 Personalização por segmento

### **Benefícios Esperados**
- **Redução de Carga**: 60-80% das consultas básicas automatizadas
- **Disponibilidade 24/7**: Atendimento instantâneo
- **Custo Zero**: Usando modelos gratuitos
- **Controle Total**: Operadores podem pausar/retomar
- **Escalabilidade**: Atende múltiplos clientes simultaneamente

**Prioridade**: Implementar primeiro as funcionalidades básicas para ter o PEPE funcionando rapidamente, depois evoluir com recursos avançados conforme demanda e feedback dos usuários.