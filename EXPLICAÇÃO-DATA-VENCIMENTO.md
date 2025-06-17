# 📅 Data de Vencimento - Smart Atendimento

## 🎯 **PARA QUE SERVE A DATA DE VENCIMENTO?**

A **Data de Vencimento** é um campo fundamental do sistema que controla a **validade da assinatura/licença** de cada empresa cliente.

## 🔧 **FUNCIONALIDADES PRINCIPAIS**

### 1. **Controle de Acesso ao Sistema**
- **Bloqueio automático**: Se a data de vencimento passou, o usuário não consegue fazer login
- **Verificação no login**: Sistema verifica se `moment().isBefore(dueDate)` antes de permitir acesso
- **Redirecionamento**: Usuários com assinatura vencida são bloqueados com mensagem de erro

### 2. **Alertas de Vencimento**
- **Aviso antecipado**: Quando restam menos de 5 dias, mostra toast de aviso
- **Notificação no login**: `"Sua assinatura vence em X dias"`
- **Dashboard**: Exibe a data de vencimento no card principal

### 3. **Gestão de Assinaturas**
- **Renovação automática**: Função `incrementDueDate()` para renovar por período (mensal, bimestral, etc.)
- **Recorrência**: Campo `recurrence` define se é MENSAL, BIMESTRAL, TRIMESTRAL, SEMESTRAL ou ANUAL
- **Gestão de empresas**: Administradores podem gerenciar vencimentos de múltiplas empresas

### 4. **Integração com Pagamentos**
- **Faturas**: Sistema gera faturas com data de vencimento
- **Boletos**: Integração com sistemas de cobrança (boletos, PIX)
- **Renovação**: Após pagamento, atualiza automaticamente a data de vencimento

## 📊 **ONDE É USADA**

### Frontend:
- **Dashboard**: Card "Data Vencimento" mostra quando a licença expira
- **Login**: Verificação antes de permitir acesso
- **Financeiro**: Listagem de faturas e vencimentos
- **Gestão de Empresas**: Administração de múltiplas empresas

### Backend:
- **Autenticação**: Middleware verifica validade da licença
- **Cobrança**: Geração de boletos e faturas
- **Notificações**: Envio de lembretes de vencimento

## 🚨 **COMPORTAMENTO DO SISTEMA**

### ✅ **Assinatura Válida** (data futura):
- ✅ Login permitido
- ✅ Acesso total ao sistema
- ⚠️ Aviso se restam menos de 5 dias

### ❌ **Assinatura Vencida** (data passada):
- ❌ Login bloqueado
- ❌ Mensagem: "Sua assinatura venceu em DD/MM/YYYY"
- ❌ Redirecionamento para contato com suporte

## 💰 **MODELO DE NEGÓCIO**

Este é um **sistema SaaS (Software as a Service)** onde:
- Cada empresa paga uma assinatura mensal/anual
- A data de vencimento controla o acesso
- Renovação automática ou manual
- Diferentes planos com diferentes durações

## 🔄 **FLUXO DE RENOVAÇÃO**

1. **Vencimento próximo**: Sistema avisa com 5 dias de antecedência
2. **Geração de fatura**: Sistema cria cobrança automaticamente
3. **Pagamento**: Cliente paga boleto/PIX
4. **Renovação**: Data de vencimento é estendida automaticamente
5. **Continuidade**: Cliente continua usando o sistema

## 📝 **EXEMPLO PRÁTICO**

```
Empresa: "Loja ABC"
Data de Vencimento: 15/02/2024
Recorrência: MENSAL

- 10/02/2024: Sistema avisa "Vence em 5 dias"
- 15/02/2024: Se não renovado, acesso é bloqueado
- Após pagamento: Nova data = 15/03/2024
```

---

**RESUMO**: A Data de Vencimento é o **coração do sistema de licenciamento**, controlando quem pode usar o sistema e por quanto tempo, garantindo o modelo de negócio SaaS da plataforma.