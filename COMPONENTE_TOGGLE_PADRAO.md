# Componente StandardToggleSwitch - Padrão do Sistema

## Implementação Realizada

Criei um componente **StandardToggleSwitch** baseado no design dos switches da tela de planos, para ser usado como padrão em todo o sistema.

## 🔧 **Componente Criado:**

### 📁 **Localização:**
```
frontend/src/components/StandardToggleSwitch/index.js
```

### 🎨 **Características:**
- ✅ **Design consistente** - Baseado no tema do Material-UI
- ✅ **Cor primária** - Usa a cor primária do tema
- ✅ **Responsivo** - Adapta-se a diferentes tamanhos
- ✅ **Acessível** - Suporte completo a acessibilidade
- ✅ **Customizável** - Props para personalização

### 📋 **Props Disponíveis:**
```javascript
{
  label: string,           // Texto do label
  checked: boolean,        // Estado do switch
  onChange: function,      // Função de mudança
  disabled: boolean,       // Desabilitar switch
  color: string,          // Cor do switch ('primary', 'secondary')
  size: string,           // Tamanho ('small', 'medium')
  labelPlacement: string, // Posição do label ('start', 'end', 'top', 'bottom')
  ...props               // Outras props do Switch
}
```

## 🔄 **Componentes Atualizados:**

### 1. **WhatsAppModal**
- ✅ Switch "Padrão" agora usa StandardToggleSwitch
- ✅ Visual consistente com o resto do sistema
- ✅ Melhor integração com Formik

### 2. **PlansManager**
- ✅ Switches de canais (WhatsApp, Facebook, Instagram)
- ✅ Substituído BlackToggleSwitch por StandardToggleSwitch
- ✅ Mantida toda funcionalidade existente

## 📖 **Como Usar:**

### **Importação:**
```javascript
import StandardToggleSwitch from "../StandardToggleSwitch";
```

### **Uso Básico:**
```javascript
<StandardToggleSwitch
  label="Ativar funcionalidade"
  checked={isActive}
  onChange={(e) => setIsActive(e.target.checked)}
/>
```

### **Com Formik:**
```javascript
<Field name="isEnabled">
  {({ field }) => (
    <StandardToggleSwitch
      label="Habilitado"
      checked={field.value}
      onChange={field.onChange}
      name={field.name}
    />
  )}
</Field>
```

### **Customizado:**
```javascript
<StandardToggleSwitch
  label="Modo avançado"
  checked={advanced}
  onChange={handleAdvancedChange}
  disabled={loading}
  color="secondary"
  size="small"
  labelPlacement="start"
/>
```

## 🎯 **Vantagens do Componente Padrão:**

### **Consistência Visual:**
- ✅ Mesmo design em todo o sistema
- ✅ Cores padronizadas do tema
- ✅ Animações suaves e consistentes

### **Manutenibilidade:**
- ✅ Mudanças centralizadas
- ✅ Fácil atualização de estilo
- ✅ Código reutilizável

### **Acessibilidade:**
- ✅ Suporte a screen readers
- ✅ Navegação por teclado
- ✅ Estados visuais claros

### **Flexibilidade:**
- ✅ Props customizáveis
- ✅ Integração com formulários
- ✅ Suporte a validação

## 🔄 **Migração de Componentes Existentes:**

### **De Switch padrão para StandardToggleSwitch:**
```javascript
// Antes
<FormControlLabel
  control={
    <Switch
      checked={value}
      onChange={onChange}
      color="primary"
    />
  }
  label="Label"
/>

// Depois
<StandardToggleSwitch
  label="Label"
  checked={value}
  onChange={onChange}
/>
```

### **De BlackToggleSwitch para StandardToggleSwitch:**
```javascript
// Antes
<BlackToggleSwitch
  label="WhatsApp"
  checked={field.value}
  onChange={field.onChange}
  name={field.name}
/>

// Depois
<StandardToggleSwitch
  label="WhatsApp"
  checked={field.value}
  onChange={field.onChange}
  name={field.name}
/>
```

## 📍 **Onde Aplicar:**

### **Locais Recomendados:**
- ✅ Configurações de usuário
- ✅ Habilitação de funcionalidades
- ✅ Filtros de busca
- ✅ Preferências do sistema
- ✅ Estados de ativação/desativação

### **Exemplos de Uso:**
- **Configurações:** Notificações, modo escuro, sons
- **Permissões:** Acesso a funcionalidades, visibilidade
- **Filtros:** Mostrar/ocultar elementos
- **Estados:** Ativo/inativo, público/privado

## 🎨 **Customização Avançada:**

### **Cores Personalizadas:**
```javascript
// Usar cor secundária
<StandardToggleSwitch color="secondary" />

// Usar cor customizada (via tema)
<StandardToggleSwitch color="primary" />
```

### **Tamanhos:**
```javascript
// Switch pequeno
<StandardToggleSwitch size="small" />

// Switch médio (padrão)
<StandardToggleSwitch size="medium" />
```

### **Posicionamento do Label:**
```javascript
// Label à esquerda
<StandardToggleSwitch labelPlacement="start" />

// Label à direita (padrão)
<StandardToggleSwitch labelPlacement="end" />

// Label acima
<StandardToggleSwitch labelPlacement="top" />
```

## 🚀 **Próximos Passos:**

1. ✅ **Implementar** em novos componentes
2. ✅ **Migrar** switches existentes gradualmente
3. ✅ **Documentar** padrões de uso
4. ✅ **Treinar** equipe sobre o componente
5. ✅ **Monitorar** consistência visual

O **StandardToggleSwitch** agora é o componente padrão para todos os switches do sistema, garantindo consistência visual e melhor experiência do usuário!