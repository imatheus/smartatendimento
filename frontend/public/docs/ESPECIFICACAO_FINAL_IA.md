# Especificação Final - Treinamento IA Simplificado

## 🎯 RESUMO EXECUTIVO

### O que o usuário fará:
1. **Clica no botão "Treinar IA"** na tela "Minhas Conexões"
2. **Preenche um formulário simples** com informações da empresa
3. **Clica "Treinar/Concluir"**
4. **PEPE é automaticamente ativado** para essa conexão

### O que NÃO terá:
- ❌ Configurações avançadas
- ❌ Teste manual da IA
- ❌ Regras de transferência customizáveis
- ❌ Perguntas e respostas personalizadas
- ❌ Monitoramento de uso
- ❌ Seleção de modelos

## 📋 FORMULÁRIO ÚNICO - INFORMAÇÕES DA EMPRESA

```
┌─────────────────────────────────────────────┐
│ 🎓 Treinar IA - WhatsApp [Nome da Conexão] │
├─────────────────────────────────────────────┤
│                                             │
│ Nome da Empresa: *                          │
│ [________________________________]         │
│                                             │
│ Tipo de Negócio: *                         │
│ [Dropdown ▼]                               │
│ ├ Loja/Varejo                              │
│ ├ Restaurante/Food                         │
│ ├ Oficina/Automotivo                       │
│ ├ Beleza/Estética                          │
│ ├ Clínica/Saúde                           │
│ ├ Serviços Gerais                          │
│ └ Outros                                   │
│                                             │
│ Descrição dos Produtos/Serviços: *         │
│ [________________________________]         │
│ [________________________________]         │
│ [________________________________]         │
│                                             │
│ Horário de Funcionamento:                  │
│ [________________________________]         │
│                                             │
│ Telefone/WhatsApp:                         │
│ [________________________________]         │
│                                             │
│ Endereço:                                  │
│ [________________________________]         │
│                                             │
│ Site da Empresa (opcional):                │
│ [________________________________]         │
│                                             │
├─────────────────────────────────────────────┤
│              [Cancelar] [Treinar/Concluir] │
└─────────────────────────────────────────────┘

* Campos obrigatórios
```

## 🎯 COMPORTAMENTO DO BOTÃO "TREINAR/CONCLUIR"

### Ao clicar:
1. ✅ **Valida campos obrigatórios**
2. ✅ **Salva informações no banco**
3. ✅ **Gera embeddings automaticamente**
4. ✅ **Ativa PEPE para essa conexão**
5. ✅ **Fecha modal**
6. ✅ **Mostra notificação: "PEPE ativado com sucesso!"**
7. ✅ **Botão muda para: "IA Ativa ✅"**

## 🔧 ESPECIFICAÇÕES TÉCNICAS

### API de IA - DeepSeek (100% Gratuito)
```typescript
const AI_CONFIG = {
  provider: 'deepseek',
  baseURL: 'https://api.deepseek.com/v1',
  model: 'deepseek-chat',
  temperature: 0.7,
  maxTokens: 150,
  apiKey: process.env.DEEPSEEK_API_KEY
};
```

### Banco de Dados Vetorial - PostgreSQL Local
```sql
-- Extensão pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Tabela de treinamento simplificada
CREATE TABLE ai_training_simple (
  id SERIAL PRIMARY KEY,
  whatsapp_id INTEGER REFERENCES whatsapps(id),
  company_id INTEGER REFERENCES companies(id),
  company_name VARCHAR(255) NOT NULL,
  business_type VARCHAR(100) NOT NULL,
  description TEXT NOT NULL,
  working_hours VARCHAR(255),
  phone VARCHAR(50),
  address TEXT,
  website_url VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabela de embeddings locais
CREATE TABLE ai_embeddings_local (
  id SERIAL PRIMARY KEY,
  training_id INTEGER REFERENCES ai_training_simple(id),
  content_text TEXT NOT NULL,
  embedding VECTOR(384), -- Modelo local
  content_type VARCHAR(50), -- 'company_info', 'description', 'contact'
  created_at TIMESTAMP DEFAULT NOW()
);

-- Índices
CREATE INDEX idx_ai_training_whatsapp ON ai_training_simple(whatsapp_id);
CREATE INDEX idx_ai_embeddings_vector ON ai_embeddings_local 
USING ivfflat (embedding vector_cosine_ops);
```

### Modelo de Embedding Local (Gratuito)
```typescript
// Usando @xenova/transformers (roda no Node.js)
import { pipeline } from '@xenova/transformers';

class LocalEmbeddingService {
  private embedder: any;

  async initialize() {
    this.embedder = await pipeline(
      'feature-extraction',
      'Xenova/all-MiniLM-L6-v2'
    );
  }

  async generateEmbedding(text: string): Promise<number[]> {
    const output = await this.embedder(text, {
      pooling: 'mean',
      normalize: true
    });
    return Array.from(output.data);
  }
}
```

## 💻 IMPLEMENTAÇÃO FRONTEND

```typescript
// Modal de treinamento simplificado
const SimpleTrainingModal = ({ connectionId, connectionName, onClose }) => {
  const [formData, setFormData] = useState({
    companyName: '',
    businessType: '',
    description: '',
    workingHours: '',
    phone: '',
    address: '',
    websiteUrl: ''
  });

  const [loading, setLoading] = useState(false);

  const businessTypes = [
    { value: 'retail', label: 'Loja/Varejo' },
    { value: 'restaurant', label: 'Restaurante/Food' },
    { value: 'automotive', label: 'Oficina/Automotivo' },
    { value: 'beauty', label: 'Beleza/Estética' },
    { value: 'health', label: 'Clínica/Saúde' },
    { value: 'services', label: 'Serviços Gerais' },
    { value: 'other', label: 'Outros' }
  ];

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validação
    if (!formData.companyName || !formData.businessType || !formData.description) {
      toast.error('Preencha todos os campos obrigatórios');
      return;
    }

    setLoading(true);
    
    try {
      // Salva e ativa PEPE automaticamente
      await api.post(`/ai-training/simple/${connectionId}`, formData);
      
      toast.success('PEPE ativado com sucesso!');
      onClose();
      
      // Atualiza lista de conexões
      window.location.reload();
      
    } catch (error) {
      toast.error('Erro ao ativar PEPE');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal open onClose={onClose} maxWidth="md">
      <form onSubmit={handleSubmit}>
        <DialogTitle>
          🎓 Treinar IA - {connectionName}
        </DialogTitle>
        
        <DialogContent>
          <TextField
            label="Nome da Empresa *"
            fullWidth
            margin="normal"
            value={formData.companyName}
            onChange={(e) => setFormData({...formData, companyName: e.target.value})}
            required
          />
          
          <FormControl fullWidth margin="normal" required>
            <InputLabel>Tipo de Negócio *</InputLabel>
            <Select
              value={formData.businessType}
              onChange={(e) => setFormData({...formData, businessType: e.target.value})}
            >
              {businessTypes.map(type => (
                <MenuItem key={type.value} value={type.value}>
                  {type.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          <TextField
            label="Descrição dos Produtos/Serviços *"
            fullWidth
            multiline
            rows={3}
            margin="normal"
            value={formData.description}
            onChange={(e) => setFormData({...formData, description: e.target.value})}
            required
            helperText="Descreva o que sua empresa faz, produtos ou serviços oferecidos"
          />
          
          <TextField
            label="Horário de Funcionamento"
            fullWidth
            margin="normal"
            value={formData.workingHours}
            onChange={(e) => setFormData({...formData, workingHours: e.target.value})}
            placeholder="Ex: Segunda a Sexta: 8h às 18h"
          />
          
          <TextField
            label="Telefone/WhatsApp"
            fullWidth
            margin="normal"
            value={formData.phone}
            onChange={(e) => setFormData({...formData, phone: e.target.value})}
          />
          
          <TextField
            label="Endereço"
            fullWidth
            margin="normal"
            value={formData.address}
            onChange={(e) => setFormData({...formData, address: e.target.value})}
          />
          
          <TextField
            label="Site da Empresa (opcional)"
            fullWidth
            margin="normal"
            value={formData.websiteUrl}
            onChange={(e) => setFormData({...formData, websiteUrl: e.target.value})}
            placeholder="https://www.suaempresa.com.br"
          />
        </DialogContent>
        
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancelar
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            disabled={loading}
            startIcon={loading ? <CircularProgress size={20} /> : <SmartToyIcon />}
          >
            {loading ? 'Treinando...' : 'Treinar/Concluir'}
          </Button>
        </DialogActions>
      </form>
    </Modal>
  );
};
```

## 🔄 BACKEND API

```typescript
// Rota para treinamento simplificado
router.post('/ai-training/simple/:connectionId', async (req, res) => {
  try {
    const { connectionId } = req.params;
    const { companyId } = req.user;
    const trainingData = req.body;

    // Validação
    if (!trainingData.companyName || !trainingData.businessType || !trainingData.description) {
      return res.status(400).json({ error: 'Campos obrigatórios não preenchidos' });
    }

    // Salva dados de treinamento
    const training = await AITrainingSimple.create({
      whatsapp_id: connectionId,
      company_id: companyId,
      ...trainingData
    });

    // Gera embeddings automaticamente
    await embeddingService.processTrainingData(training.id);

    // Ativa PEPE para essa conexão
    await WhatsApp.update(
      { ai_enabled: true, ai_training_id: training.id },
      { where: { id: connectionId, companyId } }
    );

    res.json({ 
      success: true, 
      message: 'PEPE ativado com sucesso!',
      trainingId: training.id 
    });

  } catch (error) {
    console.error('Erro no treinamento:', error);
    res.status(500).json({ error: 'Erro interno do servidor' });
  }
});
```

## 🎯 ESTADO DO BOTÃO

### Antes do Treinamento
```jsx
<Button 
  variant="outlined" 
  startIcon={<SchoolIcon />}
  onClick={() => openTrainingModal(connection.id)}
>
  Treinar IA
</Button>
```

### Após o Treinamento
```jsx
<Button 
  variant="contained" 
  color="success"
  startIcon={<CheckCircleIcon />}
  onClick={() => openEditTrainingModal(connection.id)}
>
  IA Ativa
</Button>
```

## 📊 VARIÁVEIS DE AMBIENTE

```env
# DeepSeek API (100% Gratuito)
DEEPSEEK_API_KEY=your_free_deepseek_api_key
DEEPSEEK_BASE_URL=https://api.deepseek.com/v1

# IA Configuration
AI_ENABLED=true
AI_PROVIDER=deepseek
AI_MODEL=deepseek-chat
AI_TEMPERATURE=0.7
AI_MAX_TOKENS=150

# Vector Database (PostgreSQL Local)
PGVECTOR_ENABLED=true
EMBEDDING_MODEL=local
EMBEDDING_DIMENSIONS=384

# Sem OpenRouter (será adicionado futuramente)
# OPENROUTER_API_KEY=
# OPENROUTER_BASE_URL=
```

---

## ✅ CHECKLIST DE IMPLEMENTAÇÃO

### Frontend
- [ ] Modal de treinamento simplificado
- [ ] Formulário com validação
- [ ] Botão "Treinar IA" na tela Minhas Conexões
- [ ] Estado do botão (antes/depois do treinamento)
- [ ] Notificações de sucesso/erro

### Backend
- [ ] Rota POST /ai-training/simple/:connectionId
- [ ] Validação de dados
- [ ] Salvamento no banco
- [ ] Geração de embeddings automática
- [ ] Ativação do PEPE

### Banco de Dados
- [ ] Extensão pgvector
- [ ] Tabela ai_training_simple
- [ ] Tabela ai_embeddings_local
- [ ] Índices de performance

### IA
- [ ] Integração com DeepSeek API
- [ ] Serviço de embeddings local
- [ ] Busca por similaridade
- [ ] Geração de respostas

---

**Esta é a especificação final e definitiva. Foco total na simplicidade e facilidade de uso.**