# 🔧 Como Configurar Facebook/Instagram com Credenciais Reais

## ⚠️ **Importante**
Atualmente o sistema está configurado com credenciais de exemplo. Para usar as funcionalidades reais do Facebook/Instagram, você precisa configurar suas próprias credenciais.

## 📋 **Passo a Passo**

### 1. **Criar App no Facebook Developers**

1. Acesse: https://developers.facebook.com/
2. Clique em "Meus Apps" → "Criar App"
3. Escolha "Empresa" ou "Consumidor"
4. Preencha:
   - **Nome do App**: SmartAtendimento
   - **Email de Contato**: seu@email.com
   - **Finalidade**: Atendimento ao Cliente

### 2. **Adicionar Produtos**

No painel do seu app, adicione:
- **Messenger** (para Facebook Messenger)
- **Instagram Basic Display** (para Instagram Direct)

### 3. **Obter Credenciais**

1. Vá em "Configurações" → "Básico"
2. Copie:
   - **ID do App**
   - **Chave Secreta do App**

### 4. **Configurar no Sistema**

#### **Frontend (.env):**
```env
REACT_APP_FACEBOOK_APP_ID=SEU_APP_ID_AQUI
```

#### **Backend (.env):**
```env
FACEBOOK_APP_ID=SEU_APP_ID_AQUI
FACEBOOK_APP_SECRET=SUA_CHAVE_SECRETA_AQUI
```

### 5. **Configurar Webhook**

1. No Facebook Developers, vá em "Messenger" → "Configurações"
2. Configure:
   - **URL do Webhook**: `http://localhost:8080/webhook/meta`
   - **Token de Verificação**: `smartatendimento_webhook_token`
   - **Eventos**: Marque `messages` e `messaging_postbacks`

### 6. **Configurar Permissões**

Solicite as seguintes permissões:
- `pages_manage_metadata`
- `pages_read_engagement`
- `pages_manage_posts`
- `pages_read_user_content`
- `pages_messaging`
- `instagram_basic`
- `instagram_manage_messages`

### 7. **Testar**

1. Reinicie os servidores:
   ```bash
   # Backend
   cd backend && npm start
   
   # Frontend
   cd frontend && npm start
   ```

2. Acesse: http://localhost:3000
3. Vá em "Conexões"
4. Teste os botões Facebook/Instagram

## 🚀 **Script Automático**

Para facilitar, use o script:
```bash
node configure-facebook.js
```

## 📝 **Configuração Atual**

### **Status:**
- ✅ Interface implementada
- ✅ Botões separados funcionando
- ⚠️ Credenciais de exemplo configuradas
- ❌ Credenciais reais não configuradas

### **Para Produção:**
1. Substitua as credenciais de exemplo pelas reais
2. Configure domínio real no webhook
3. Solicite revisão do app no Facebook
4. Configure HTTPS para produção

## 🆘 **Problemas Comuns**

**Erro: "Invalid App ID"**
- Verifique se o App ID está correto
- Confirme se o app está ativo no Facebook Developers

**Webhook não funciona:**
- Verifique se a URL está acessível
- Confirme se o token de verificação está correto
- Teste a URL manualmente

**Permissões negadas:**
- Solicite revisão do app no Facebook
- Aguarde aprovação das permissões
- Use conta de teste durante desenvolvimento

## 📞 **Suporte**

- Documentação Facebook: https://developers.facebook.com/docs/
- Instagram API: https://developers.facebook.com/docs/instagram-basic-display-api/
- Webhook Testing: https://developers.facebook.com/tools/webhooks/