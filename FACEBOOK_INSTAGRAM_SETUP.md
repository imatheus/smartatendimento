# Configuração Facebook/Instagram

Este documento explica como configurar e usar as integrações com Facebook Messenger e Instagram Direct no sistema.

## Pré-requisitos

### 1. Criar App no Facebook Developers

1. Acesse [Facebook Developers](https://developers.facebook.com/)
2. Crie um novo app ou use um existente
3. Adicione os produtos:
   - **Messenger** (para Facebook Messenger)
   - **Instagram Basic Display** (para Instagram Direct)

### 2. Configurar Permissões

Seu app precisa das seguintes permissões:
- `pages_manage_metadata`
- `pages_read_engagement`
- `pages_manage_posts`
- `pages_read_user_content`
- `pages_messaging`
- `instagram_basic`
- `instagram_manage_messages`

### 3. Configurar Webhook

Configure o webhook para receber mensagens:
- **URL do Webhook**: `https://seu-dominio.com/webhook/meta`
- **Token de Verificação**: Configure no arquivo `.env` como `VERIFY_TOKEN`

## Configuração do Sistema

### Backend (.env)

```env
# Facebook App Credentials
FACEBOOK_APP_ID=seu_app_id_aqui
FACEBOOK_APP_SECRET=seu_app_secret_aqui

# Webhook Token
VERIFY_TOKEN=seu_token_de_verificacao
```

### Frontend (.env)

```env
# Facebook App ID para login
REACT_APP_FACEBOOK_APP_ID=seu_app_id_aqui
```

## Como Usar

### 1. Conectar Facebook/Instagram

1. Acesse **Conexões** no menu lateral
2. Clique no botão **Facebook/Instagram**
3. Marque a opção "Incluir contas do Instagram vinculadas" se desejar
4. Clique em **Autorizar com Facebook**
5. Faça login na sua conta Facebook
6. Autorize o acesso às suas páginas

### 2. Gerenciar Conexões

Após a autorização, o sistema criará automaticamente:
- Uma conexão para cada página do Facebook
- Uma conexão para cada conta comercial do Instagram vinculada

### 3. Identificar Canais

Na tela de conexões, você verá:
- **Ícone WhatsApp** (verde) - Conexões WhatsApp
- **Ícone Facebook** (azul) - Páginas do Facebook
- **Ícone Instagram** (rosa) - Contas do Instagram

### 4. Status das Conexões

- **CONNECTED** - Conexão ativa e funcionando
- **DISCONNECTED** - Conexão inativa (apenas WhatsApp)
- **OPENING** - Conectando (apenas WhatsApp)

## Funcionalidades

### Facebook Messenger
- Recebimento de mensagens
- Envio de mensagens
- Envio de mídias (imagens, vídeos, documentos)
- Política de 24h do Facebook aplicada

### Instagram Direct
- Recebimento de mensagens
- Envio de mensagens
- Envio de mídias
- Integração com contas comerciais

### WhatsApp (existente)
- QR Code para conexão
- Todas as funcionalidades existentes mantidas

## Limitações

### Facebook Messenger
- **Janela de 24h**: Você tem 24 horas para responder após receber uma mensagem
- Após 24h, só pode enviar mensagens com templates aprovados

### Instagram Direct
- Apenas contas comerciais do Instagram
- Deve estar vinculada a uma página do Facebook
- Limitações similares ao Facebook Messenger

## Troubleshooting

### Erro: "Facebook page not found"
- Verifique se sua conta tem páginas do Facebook
- Certifique-se de que as permissões foram concedidas

### Erro: "Para usar esta funcionalidade, configure o REACT_APP_FACEBOOK_APP_ID"
- Configure o `REACT_APP_FACEBOOK_APP_ID` no arquivo `.env` do frontend
- Reinicie o servidor frontend

### Conexões não aparecem
- Verifique os logs do backend
- Confirme se o webhook está configurado corretamente
- Verifique se as credenciais do Facebook estão corretas

### Mensagens não chegam
- Verifique se o webhook está respondendo corretamente
- Confirme se o `VERIFY_TOKEN` está configurado
- Teste o webhook usando a ferramenta do Facebook Developers

## Suporte

Para mais informações sobre as APIs:
- [Facebook Messenger Platform](https://developers.facebook.com/docs/messenger-platform)
- [Instagram Basic Display API](https://developers.facebook.com/docs/instagram-basic-display-api)
- [WhatsApp Business API](https://developers.facebook.com/docs/whatsapp)