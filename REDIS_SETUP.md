# Configuração do Redis (Opcional)

O sistema funciona sem Redis, mas para melhor performance em produção, é recomendado configurá-lo.

## Opção 1: Instalar Redis no Windows

1. Baixe o Redis para Windows: https://github.com/microsoftarchive/redis/releases
2. Instale e inicie o serviço
3. Configure as variáveis no .env:
```
IO_REDIS_SERVER=127.0.0.1
IO_REDIS_PORT=6379
```

## Opção 2: Usar Docker

```bash
docker run -d -p 6379:6379 --name redis redis:alpine
```

## Opção 3: Redis Cloud (Gratuito)

1. Acesse: https://redis.com/try-free/
2. Crie uma conta gratuita
3. Configure as variáveis no .env com os dados fornecidos

## Sem Redis

Se não configurar o Redis, o sistema funcionará normalmente processando campanhas diretamente, mas:
- Não haverá fila de processamento
- Campanhas serão processadas imediatamente
- Menos controle sobre jobs em andamento

## Verificar se está funcionando

Após configurar, reinicie o servidor e verifique os logs:
- ✅ "Background job queues initialized successfully with Redis"
- ❌ "Redis not available - campaigns will be processed directly"