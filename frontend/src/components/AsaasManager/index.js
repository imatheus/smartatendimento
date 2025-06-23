import React, { useState, useEffect } from "react";
import {
  Paper,
  TextField,
  Button,
  Typography,
  Box,
  Switch,
  FormControlLabel,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Grid
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { makeStyles } from "@material-ui/core/styles";
import { toast } from "react-toastify";
import api from "../../services/api";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(3),
  },
  paper: {
    padding: theme.spacing(3),
    marginBottom: theme.spacing(2),
  },
  formField: {
    marginBottom: theme.spacing(2),
  },
  buttonContainer: {
    display: "flex",
    marginTop: theme.spacing(2),
    "& > button": {
      marginRight: theme.spacing(2),
    },
    "& > button:last-child": {
      marginRight: 0,
    },
  },
  statusCard: {
    marginTop: theme.spacing(2),
  },
  successText: {
    color: theme.palette.success.main,
  },
  errorText: {
    color: theme.palette.error.main,
  },
  infoBox: {
    backgroundColor: theme.palette.grey[100],
    padding: theme.spacing(2),
    borderRadius: theme.shape.borderRadius,
    marginBottom: theme.spacing(2),
  },
}));

const AsaasManager = () => {
  const classes = useStyles();
  const [loading, setLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState(false);
  const [syncingCompanies, setSyncingCompanies] = useState(false);
  const [syncingInvoices, setSyncingInvoices] = useState(false);
  
  const [config, setConfig] = useState({
    apiKey: "",
    webhookUrl: "",
    environment: "sandbox",
    enabled: true,
  });

  const [originalConfig, setOriginalConfig] = useState({});

  useEffect(() => {
    fetchAsaasConfig();
  }, []);

  const fetchAsaasConfig = async () => {
    try {
      setLoading(true);
      const { data } = await api.get("/asaas");
      
      // Manter as bolinhas se a API Key está mascarada
      setConfig(data);
      setOriginalConfig(data);
    } catch (error) {
      console.error("Erro ao buscar configuração do Asaas:", error);
      toast.error("Erro ao carregar configurações do Asaas");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setConfig(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Se não tem API Key (considerando que *** é válida) e não existe uma configurada, é obrigatória
      if (!config.apiKey && !config.hasApiKey) {
        toast.error("Chave de API é obrigatória");
        return;
      }

      const method = originalConfig.id ? "put" : "post";
      
      // Preparar payload - se API Key for as bolinhas (***), não enviar (manter a atual)
      const payload = { ...config };
      if (config.apiKey === '***') {
        delete payload.apiKey; // Não enviar API Key mascarada, manter a atual
      }
      
      const { data } = await api[method]("/asaas", payload);
      
      setConfig(data);
      setOriginalConfig(data);
      toast.success("Configurações salvas com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar configuração:", error);
      toast.error(error.response?.data?.error || "Erro ao salvar configurações");
    } finally {
      setLoading(false);
    }
  };

  const handleTestConnection = async () => {
    try {
      setTestingConnection(true);
      await api.post("/asaas/test");
      toast.success("Conexão testada com sucesso!");
    } catch (error) {
      console.error("Erro ao testar conexão:", error);
      toast.error(error.response?.data?.error || "Erro ao testar conexão");
    } finally {
      setTestingConnection(false);
    }
  };

  const handleSyncAllCompanies = async () => {
    try {
      setSyncingCompanies(true);
      const { data } = await api.post("/asaas/sync-all-companies");
      
      toast.success(`Sincronização concluída! ${data.synchronized} empresas criadas no Asaas, ${data.skipped} puladas.`);
      
      if (data.errors && data.errors.length > 0) {
        console.warn("Erros durante sincronização:", data.errors);
        toast.warning(`${data.errors.length} empresas tiveram erros. Verifique o console para detalhes.`);
      }

      // Mostrar detalhes no console
      console.log("Detalhes da sincronização:", data.details);
      
    } catch (error) {
      console.error("Erro ao sincronizar empresas:", error);
      toast.error(error.response?.data?.error || "Erro ao sincronizar empresas com Asaas");
    } finally {
      setSyncingCompanies(false);
    }
  };

  const handleSyncInvoices = async () => {
    try {
      setSyncingInvoices(true);
      const { data } = await api.post("/asaas/sync-invoices");
      
      toast.success(`Sincronização de faturas concluída! ${data.synchronized} criadas, ${data.updated} atualizadas.`);
      
      if (data.errors && data.errors.length > 0) {
        console.warn("Erros durante sincronização de faturas:", data.errors);
        toast.warning(`${data.errors.length} faturas tiveram erros. Verifique o console para detalhes.`);
      }

      // Mostrar detalhes no console
      console.log("Detalhes da sincronização de faturas:", data.details);
      
    } catch (error) {
      console.error("Erro ao sincronizar faturas:", error);
      toast.error(error.response?.data?.error || "Erro ao sincronizar faturas do Asaas");
    } finally {
      setSyncingInvoices(false);
    }
  };

  
  if (loading && !config.apiKey) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="200px">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <div className={classes.root}>
      <Typography variant="h4" gutterBottom>
        Configurações do Asaas
      </Typography>

      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          Configurações Básicas
        </Typography>

        <Box className={classes.infoBox}>
          <Typography variant="body2" color="textSecondary">
            <strong>Configuração Global do Sistema:</strong> Configure a integração com o Asaas para automatizar 
            a cobrança e gestão de faturas de todas as empresas do sistema. Esta configuração será aplicada 
            globalmente para todas as empresas que se cadastrarem.
          </Typography>
        </Box>

        
        <Grid container spacing={2}>
          <Grid item xs={12} md={8}>
            <TextField
              fullWidth
              label="Chave de API do Asaas"
              type="password"
              value={config.apiKey}
              onChange={(e) => handleInputChange("apiKey", e.target.value)}
              className={classes.formField}
              placeholder={config.hasApiKey ? "Digite uma nova API Key para alterar" : "Insira sua chave de API"}
              helperText={config.apiKey === '***' ? "API Key já configurada. Digite uma nova para alterar ou mantenha as bolinhas para não alterar." : "Sua chave de API do Asaas (encontrada no painel do Asaas)"}
            />
          </Grid>

          <Grid item xs={12} md={4}>
            <FormControl fullWidth className={classes.formField}>
              <InputLabel>Ambiente</InputLabel>
              <Select
                value={config.environment}
                onChange={(e) => handleInputChange("environment", e.target.value)}
              >
                <MenuItem value="sandbox">Sandbox (Teste)</MenuItem>
                <MenuItem value="production">Produção</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          <Grid item xs={12}>
            <TextField
              fullWidth
              label="URL do Webhook"
              value={config.webhookUrl}
              onChange={(e) => handleInputChange("webhookUrl", e.target.value)}
              className={classes.formField}
              helperText="URL que receberá as notificações do Asaas (opcional)"
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Switch
                  checked={config.enabled}
                  onChange={(e) => handleInputChange("enabled", e.target.checked)}
                  color="primary"
                />
              }
              label="Integração Ativa"
            />
          </Grid>
        </Grid>

        <Box className={classes.buttonContainer}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleSave}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : "Salvar Configurações"}
          </Button>

          <Button
            variant="outlined"
            onClick={handleTestConnection}
            disabled={testingConnection || (!config.apiKey && !config.hasApiKey)}
          >
            {testingConnection ? <CircularProgress size={24} /> : "Testar Conexão"}
          </Button>

          <Button
            variant="outlined"
            color="secondary"
            onClick={handleSyncAllCompanies}
            disabled={syncingCompanies || (!config.apiKey && !config.hasApiKey)}
          >
            {syncingCompanies ? <CircularProgress size={24} /> : "Sincronizar Empresas"}
          </Button>

          <Button
            variant="outlined"
            color="primary"
            onClick={handleSyncInvoices}
            disabled={syncingInvoices || (!config.apiKey && !config.hasApiKey)}
          >
            {syncingInvoices ? <CircularProgress size={24} /> : "Sincronizar Faturas"}
          </Button>
        </Box>
      </Paper>

      
      <Paper className={classes.paper}>
        <Typography variant="h6" gutterBottom>
          Informações Importantes
        </Typography>

        <Alert severity="info" style={{ marginBottom: 16 }}>
          <Typography variant="body2">
            <strong>Webhook URL:</strong> Configure esta URL no painel do Asaas para receber notificações automáticas de pagamento.
          </Typography>
        </Alert>

        <Alert severity="warning" style={{ marginBottom: 16 }}>
          <Typography variant="body2">
            <strong>Ambiente Sandbox:</strong> Use o ambiente de teste para desenvolvimento. 
            Mude para produção apenas quando estiver pronto para receber pagamentos reais.
          </Typography>
        </Alert>

        <Alert severity="success">
          <Typography variant="body2">
            <strong>Automação Global:</strong> Quando configurado, o sistema criará automaticamente 
            clientes e assinaturas no Asaas para todas as novas empresas que se cadastrarem no sistema.
          </Typography>
        </Alert>

        <Alert severity="info" style={{ marginTop: 16 }}>
          <Typography variant="body2">
            <strong>Sincronizar Empresas:</strong> Use o botão "Sincronizar Empresas" para criar 
            clientes e assinaturas no Asaas para todas as empresas já existentes no sistema. 
            Esta operação é útil quando você configura o Asaas pela primeira vez.
          </Typography>
        </Alert>

        <Alert severity="warning" style={{ marginTop: 16 }}>
          <Typography variant="body2">
            <strong>Sincronizar Faturas:</strong> Use o botão "Sincronizar Faturas" para buscar 
            e importar faturas do Asaas para o módulo "Financeiro > Faturas". As faturas pagas 
            automaticamente liberam as funções do sistema para as empresas.
          </Typography>
        </Alert>
      </Paper>
    </div>
  );
};

export default AsaasManager;