import React, { useEffect, useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import { 
  Grid, 
  TextField, 
  FormControl, 
  Typography,
  Paper,
  Box
} from "@material-ui/core";
import useSettings from "../../hooks/useSettings";
import { toast } from 'react-toastify';

const useStyles = makeStyles((theme) => ({
  elementMargin: {
    marginTop: theme.spacing(2),
  },
  selectContainer: {
    width: "100%",
    textAlign: "left",
  },
  configPaper: {
    padding: theme.spacing(2),
    marginTop: theme.spacing(1),
  },
  sectionTitle: {
    marginBottom: theme.spacing(2),
    color: theme.palette.primary.main,
  },
}));

const AsaasTab = () => {
  const classes = useStyles();
  const [asaasToken, setAsaasToken] = useState("");
  const [loadingAsaasToken, setLoadingAsaasToken] = useState(false);
  const { update, getAll } = useSettings();

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const settings = await getAll();
        if (Array.isArray(settings) && settings.length) {
          const asaasType = settings.find((s) => s.key === "asaas");
          if (asaasType) {
            setAsaasToken(asaasType.value);
          }
        }
      } catch (error) {
        console.error("Erro ao carregar configurações:", error);
      }
    };

    fetchSettings();
  }, [getAll]);

  const handleChangeAsaasToken = async (value) => {
    setAsaasToken(value);
    setLoadingAsaasToken(true);
    try {
      await update({
        key: "asaas",
        value,
      });
      toast.success("Token ASAAS atualizado com sucesso.");
    } catch (error) {
      toast.error("Erro ao atualizar token ASAAS.");
      console.error("Erro:", error);
    } finally {
      setLoadingAsaasToken(false);
    }
  };

  return (
    <>
      <Typography variant="h6" className={classes.sectionTitle}>
        Configuração ASAAS
      </Typography>
      
      <Paper className={classes.configPaper} variant="outlined">
        <Typography variant="body1" className={classes.elementMargin}>
          Configure aqui o token de integração com o ASAAS para habilitar funcionalidades de cobrança e pagamento.
        </Typography>
        
        <Grid container spacing={3} className={classes.elementMargin}>
          <Grid item xs={12}>
            <FormControl className={classes.selectContainer}>
              <TextField
                id="asaas-token"
                name="asaasToken"
                margin="dense"
                label="Token ASAAS"
                variant="outlined"
                fullWidth
                value={asaasToken}
                onChange={(e) => {
                  handleChangeAsaasToken(e.target.value);
                }}
                disabled={loadingAsaasToken}
                helperText={loadingAsaasToken ? "Atualizando..." : "Insira o token de API fornecido pelo ASAAS"}
              />
            </FormControl>
          </Grid>
        </Grid>

        <Box className={classes.elementMargin}>
          <Typography variant="h6" color="primary">
            Como obter o Token ASAAS
          </Typography>
          <Typography component="div" className={classes.elementMargin}>
            <ol>
              <li>Acesse sua conta no ASAAS</li>
              <li>Vá para o menu "Integrações" ou "API"</li>
              <li>Gere um novo token de API</li>
              <li>Copie o token e cole no campo acima</li>
            </ol>
          </Typography>
          
          <Typography variant="body2" color="textSecondary" className={classes.elementMargin}>
            <strong>Importante:</strong> Mantenha seu token seguro e não o compartilhe. 
            Este token permite acesso às funcionalidades da sua conta ASAAS.
          </Typography>
        </Box>
      </Paper>
    </>
  );
};

export default AsaasTab;