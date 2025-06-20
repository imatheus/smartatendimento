# Treinamento do Agente IA - Atualização

## Localização do Botão de Treinamento

**IMPORTANTE:** O botão de treinamento da IA deve estar localizado na tela **"Minhas Conexões"** e não em "Integrações".

### Localização Correta
- **Tela:** Minhas Conexões
- **Posição:** Ao lado de cada conexão WhatsApp
- **Botão:** "Treinar IA" ou ícone 🎓

### Comportamento do Botão

#### ✅ Se Plano Permite IA
- Botão "Treinar IA" visível e ativo
- Abre modal de treinamento ao clicar
- Permite configurar informações da empresa
- Salva dados específicos por conexão

#### ❌ Se Plano Não Permite IA
- Botão não aparece ou aparece desabilitado
- Tooltip: "Upgrade seu plano para usar IA"
- Redireciona para página de upgrade

## Modal de Treinamento

Quando o usuário clicar no botão "Treinar IA", deve abrir um modal com as seguintes seções:

### 📋 Informações da Empresa
- Nome da empresa
- Tipo de negócio (dropdown com opções)
- Descrição dos produtos/serviços
- Horário de funcionamento
- Informações de contato
- Endereço

### ❓ Perguntas e Respostas
- Lista de perguntas frequentes
- Respostas personalizadas
- Botão "Adicionar nova pergunta"
- Limite baseado no plano (ex: 10 para básico, 50 para premium)

### 🌐 Extração do Site
- Campo para URL do site da empresa
- Botão "Extrair informações"
- Preview das informações extraídas
- Opção de editar informações extraídas

### 🎯 Teste da IA
- Campo para testar perguntas
- Visualização da resposta da IA
- Score de confiança
- Sugestões de melhoria

## Implementação Técnica

### Frontend
```typescript
// Componente do botão na tela Minhas Conexões
const TrainAIButton = ({ connection, userPlan }) => {
  const canUseAI = userPlan.ai_agent_enabled;
  
  if (!canUseAI) {
    return (
      <Tooltip title="Upgrade seu plano para usar IA">
        <Button disabled>
          🎓 Treinar IA
        </Button>
      </Tooltip>
    );
  }
  
  return (
    <Button onClick={() => openTrainingModal(connection.id)}>
      🎓 Treinar IA
    </Button>
  );
};
```

### Backend
```typescript
// Rota para salvar dados de treinamento
POST /api/ai-training/:connectionId
{
  "companyInfo": {
    "name": "Empresa ABC",
    "type": "retail",
    "description": "...",
    "workingHours": "9h às 18h",
    "contact": "..."
  },
  "customQA": [
    {
      "question": "Vocês fazem entrega?",
      "answer": "Sim, entregamos em toda a cidade"
    }
  ],
  "websiteUrl": "https://empresa.com.br"
}
```

### Banco de Dados
```sql
-- Tabela para dados de treinamento por conexão
CREATE TABLE ai_training_data (
  id SERIAL PRIMARY KEY,
  whatsapp_id INTEGER REFERENCES whatsapps(id),
  company_id INTEGER REFERENCES companies(id),
  company_info JSONB,
  custom_qa JSONB,
  website_url VARCHAR(500),
  extracted_info JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## Fluxo de Uso

1. **Usuário acessa "Minhas Conexões"**
2. **Vê botão "Treinar IA" ao lado de cada conexão**
3. **Clica no botão (se plano permite)**
4. **Modal abre com formulário de treinamento**
5. **Usuário preenche informações da empresa**
6. **Adiciona perguntas e respostas personalizadas**
7. **Opcionalmente, insere URL do site para extração**
8. **Testa a IA com perguntas de exemplo**
9. **Salva as configurações**
10. **IA fica treinada para essa conexão específica**

## Benefícios desta Abordagem

- **Mais Intuitivo:** Usuário treina a IA diretamente onde gerencia as conexões
- **Específico por Conexão:** Cada WhatsApp pode ter treinamento diferente
- **Acesso Rápido:** Não precisa navegar até integrações
- **Contexto Claro:** Fica óbvio que o treinamento é para aquela conexão específica