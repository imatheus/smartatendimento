import React, { useState } from "react";
import axios from "axios";
import { makeStyles } from "@material-ui/core/styles";
import { 
  Button, 
  CircularProgress, 
  Grid, 
  TextField, 
  Typography, 
  Paper,
  Box,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  IconButton,
  Tooltip,
  InputAdornment
} from "@material-ui/core";
import { Alert } from "@material-ui/lab";
import { 
  Send as SendIcon,
  Code as CodeIcon,
  Description as DescriptionIcon,
  Image as ImageIcon,
  ExpandMore as ExpandMoreIcon,
  FileCopy as FileCopyIcon,
  Info as InfoIcon,
  CheckCircle as CheckCircleIcon
} from "@material-ui/icons";
import { Field, Form, Formik } from "formik";
import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { i18n } from "../../translate/i18n";

const useStyles = makeStyles((theme) => ({
  root: {
    padding: theme.spacing(2),
  },
  sectionCard: {
    marginBottom: theme.spacing(3),
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    borderRadius: theme.spacing(2),
  },
  methodCard: {
    marginBottom: theme.spacing(2),
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.spacing(1),
  },
  formContainer: {
    padding: theme.spacing(2),
    backgroundColor: theme.palette.grey[50],
    borderRadius: theme.spacing(1),
  },
  codeBlock: {
    backgroundColor: theme.palette.grey[900],
    color: theme.palette.common.white,
    padding: theme.spacing(2),
    borderRadius: theme.spacing(1),
    fontFamily: 'monospace',
    fontSize: '0.875rem',
    position: 'relative',
    overflow: 'auto',
  },
  copyButton: {
    position: 'absolute',
    top: theme.spacing(1),
    right: theme.spacing(1),
    color: theme.palette.common.white,
  },
  endpointChip: {
    backgroundColor: theme.palette.success.main,
    color: theme.palette.success.contrastText,
    fontFamily: 'monospace',
    fontSize: '0.75rem',
  },
  methodChip: {
    backgroundColor: theme.palette.info.main,
    color: theme.palette.info.contrastText,
    fontWeight: 'bold',
  },
  submitButton: {
    borderRadius: theme.spacing(3),
    padding: theme.spacing(1, 4),
    textTransform: 'none',
    fontWeight: 600,
  },
  fileInput: {
    display: 'none',
  },
  fileInputLabel: {
    border: `2px dashed ${theme.palette.primary.main}`,
    borderRadius: theme.spacing(1),
    padding: theme.spacing(3),
    textAlign: 'center',
    cursor: 'pointer',
    transition: 'all 0.3s ease',
    '&:hover': {
      backgroundColor: theme.palette.primary.light + '10',
    },
  },
  infoAlert: {
    marginBottom: theme.spacing(2),
  },
  stepNumber: {
    backgroundColor: theme.palette.primary.main,
    color: theme.palette.primary.contrastText,
    width: 32,
    height: 32,
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontWeight: 'bold',
    marginRight: theme.spacing(2),
  },
  stepContainer: {
    display: 'flex',
    alignItems: 'flex-start',
    marginBottom: theme.spacing(2),
  },
}));

const MessagesAPITab = () => {
  const classes = useStyles();
  const [formMessageTextData] = useState({ token: '', number: '', body: '' });
  const [formMessageMediaData] = useState({ token: '', number: '', medias: '' });
  const [file, setFile] = useState({});
  const [selectedFileName, setSelectedFileName] = useState('');

  const getEndpoint = () => {
    return process.env.REACT_APP_BACKEND_URL + '/api/messages/send';
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copiado para a área de transferência!');
  };

  const handleSendTextMessage = async (values) => {
    const { number, body } = values;
    const data = { number, body };
    const options = {
      method: 'POST',
      url: `${process.env.REACT_APP_BACKEND_URL}/api/messages/send`,
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${values.token}`
      },
      data
    };
    
    try {
      await axios.request(options);
      toast.success('Mensagem enviada com sucesso!');
    } catch (error) {
      toastError(error);
    }
  };

  const handleSendMediaMessage = async (values) => { 
    try {
      const firstFile = file[0];
      const data = new FormData();
      data.append('number', values.number);
      data.append('body', firstFile.name);
      data.append('medias', firstFile);
      
      const options = {
        method: 'POST',
        url: `${process.env.REACT_APP_BACKEND_URL}/api/messages/send`,
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${values.token}`
        },
        data
      };
      
      await axios.request(options);
      toast.success('Mensagem enviada com sucesso!');
    } catch (err) {
      toastError(err);
    }
  };

  const handleFileChange = (e) => {
    setFile(e.target.files);
    setSelectedFileName(e.target.files[0]?.name || '');
  };

  const textMessageExample = `{
  "number": "5511999999999",
  "body": "Olá! Esta é uma mensagem de teste."
}`;

  const curlTextExample = `curl -X POST "${getEndpoint()}" \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \\
  -d '${textMessageExample}'`;

  const curlMediaExample = `curl -X POST "${getEndpoint()}" \\
  -H "Content-Type: multipart/form-data" \\
  -H "Authorization: Bearer SEU_TOKEN_AQUI" \\
  -F "number=5511999999999" \\
  -F "body=nome_do_arquivo.jpg" \\
  -F "medias=@/caminho/para/arquivo.jpg"`;

  return (
    <div className={classes.root}>
      {/* Informações Importantes */}
      <Card className={classes.sectionCard}>
        <CardHeader 
          title="Informações Importantes" 
          avatar={<InfoIcon color="primary" />}
        />
        <CardContent>
          <Alert severity="info" className={classes.infoAlert}>
            <Typography variant="body2">
              <strong>Configuração do Token:</strong> Antes de usar a API, configure o token na seção "Conexões" do sistema.
            </Typography>
          </Alert>
          
          <Typography variant="h6" gutterBottom color="primary">
            Formato do Número
          </Typography>
          <Typography variant="body2" paragraph>
            O número deve seguir o formato internacional sem símbolos:
          </Typography>
          <Box ml={2}>
            <Typography variant="body2" component="div">
              • <strong>Código do país:</strong> 55 (Brasil)<br/>
              • <strong>DDD:</strong> 11, 21, etc.<br/>
              • <strong>Número:</strong> 999999999<br/>
              • <strong>Exemplo:</strong> 5511999999999
            </Typography>
          </Box>
        </CardContent>
      </Card>

      {/* Endpoint */}
      <Card className={classes.sectionCard}>
        <CardContent>
          <Box display="flex" alignItems="center" justifyContent="space-between" mb={2}>
            <Typography variant="h6">Endpoint da API</Typography>
            <Tooltip title="Copiar endpoint">
              <IconButton onClick={() => copyToClipboard(getEndpoint())}>
                <FileCopyIcon />
              </IconButton>
            </Tooltip>
          </Box>
          <Chip 
            label={getEndpoint()} 
            className={classes.endpointChip}
            size="medium"
          />
          <Box mt={1}>
            <Chip 
              label="POST" 
              className={classes.methodChip}
              size="small"
            />
          </Box>
        </CardContent>
      </Card>

      {/* Mensagens de Texto */}
      <Card className={classes.sectionCard}>
        <CardHeader 
          title="1. Mensagens de Texto" 
          avatar={<DescriptionIcon color="primary" />}
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Documentação */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Documentação
              </Typography>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Headers Necessários</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body2" component="div">
                      • <code>Content-Type: application/json</code><br/>
                      • <code>Authorization: Bearer SEU_TOKEN</code>
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Exemplo de Body (JSON)</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box className={classes.codeBlock}>
                    <Tooltip title="Copiar código">
                      <IconButton 
                        className={classes.copyButton}
                        onClick={() => copyToClipboard(textMessageExample)}
                        size="small"
                      >
                        <FileCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <pre>{textMessageExample}</pre>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Exemplo cURL</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box className={classes.codeBlock}>
                    <Tooltip title="Copiar comando">
                      <IconButton 
                        className={classes.copyButton}
                        onClick={() => copyToClipboard(curlTextExample)}
                        size="small"
                      >
                        <FileCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
                      {curlTextExample}
                    </pre>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Teste de Envio */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Teste de Envio
              </Typography>
              <Paper className={classes.formContainer}>
                <Formik
                  initialValues={formMessageTextData}
                  enableReinitialize={true}
                  onSubmit={(values, actions) => {
                    setTimeout(async () => {
                      await handleSendTextMessage(values);
                      actions.setSubmitting(false);
                      actions.resetForm();
                    }, 400);
                  }}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            label="Token de Autorização"
                            name="token"
                            variant="outlined"
                            fullWidth
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CodeIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            label="Número do WhatsApp"
                            name="number"
                            variant="outlined"
                            fullWidth
                            required
                            placeholder="5511999999999"
                            helperText="Formato: código do país + DDD + número"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            label="Mensagem"
                            name="body"
                            variant="outlined"
                            fullWidth
                            multiline
                            rows={3}
                            required
                            placeholder="Digite sua mensagem aqui..."
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            className={classes.submitButton}
                            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
                            disabled={isSubmitting}
                            fullWidth
                          >
                            {isSubmitting ? 'Enviando...' : 'Enviar Mensagem'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Mensagens de Mídia */}
      <Card className={classes.sectionCard}>
        <CardHeader 
          title="2. Mensagens de Mídia" 
          avatar={<ImageIcon color="primary" />}
        />
        <CardContent>
          <Grid container spacing={3}>
            {/* Documentação */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Documentação
              </Typography>
              
              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Headers Necessários</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body2" component="div">
                      • <code>Content-Type: multipart/form-data</code><br/>
                      • <code>Authorization: Bearer SEU_TOKEN</code>
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Campos do FormData</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box>
                    <Typography variant="body2" component="div">
                      • <code>number</code>: Número do WhatsApp<br/>
                      • <code>body</code>: Nome do arquivo<br/>
                      • <code>medias</code>: Arquivo a ser enviado
                    </Typography>
                  </Box>
                </AccordionDetails>
              </Accordion>

              <Accordion>
                <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                  <Typography>Exemplo cURL</Typography>
                </AccordionSummary>
                <AccordionDetails>
                  <Box className={classes.codeBlock}>
                    <Tooltip title="Copiar comando">
                      <IconButton 
                        className={classes.copyButton}
                        onClick={() => copyToClipboard(curlMediaExample)}
                        size="small"
                      >
                        <FileCopyIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                    <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.75rem' }}>
                      {curlMediaExample}
                    </pre>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Grid>

            {/* Teste de Envio */}
            <Grid item xs={12} md={6}>
              <Typography variant="h6" gutterBottom>
                Teste de Envio
              </Typography>
              <Paper className={classes.formContainer}>
                <Formik
                  initialValues={formMessageMediaData}
                  enableReinitialize={true}
                  onSubmit={(values, actions) => {
                    setTimeout(async () => {
                      await handleSendMediaMessage(values);
                      actions.setSubmitting(false);
                      actions.resetForm();
                      setSelectedFileName('');
                      document.getElementById('medias').value = null;
                    }, 400);
                  }}
                >
                  {({ isSubmitting }) => (
                    <Form>
                      <Grid container spacing={2}>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            label="Token de Autorização"
                            name="token"
                            variant="outlined"
                            fullWidth
                            required
                            InputProps={{
                              startAdornment: (
                                <InputAdornment position="start">
                                  <CodeIcon color="action" />
                                </InputAdornment>
                              ),
                            }}
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <Field
                            as={TextField}
                            label="Número do WhatsApp"
                            name="number"
                            variant="outlined"
                            fullWidth
                            required
                            placeholder="5511999999999"
                            helperText="Formato: código do país + DDD + número"
                          />
                        </Grid>
                        <Grid item xs={12}>
                          <input
                            type="file"
                            name="medias"
                            id="medias"
                            className={classes.fileInput}
                            onChange={handleFileChange}
                            accept="image/*,video/*,audio/*,.pdf,.doc,.docx"
                          />
                          <label htmlFor="medias" className={classes.fileInputLabel}>
                            <Box display="flex" flexDirection="column" alignItems="center">
                              <ImageIcon color="primary" style={{ fontSize: 48, marginBottom: 8 }} />
                              <Typography variant="body1" color="primary">
                                {selectedFileName || 'Clique para selecionar um arquivo'}
                              </Typography>
                              <Typography variant="caption" color="textSecondary">
                                Imagens, vídeos, áudios, PDF, DOC
                              </Typography>
                            </Box>
                          </label>
                        </Grid>
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            className={classes.submitButton}
                            startIcon={isSubmitting ? <CircularProgress size={20} /> : <SendIcon />}
                            disabled={isSubmitting || !selectedFileName}
                            fullWidth
                          >
                            {isSubmitting ? 'Enviando...' : 'Enviar Mídia'}
                          </Button>
                        </Grid>
                      </Grid>
                    </Form>
                  )}
                </Formik>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      {/* Status Codes */}
      <Card className={classes.sectionCard}>
        <CardHeader 
          title="Códigos de Resposta" 
          avatar={<CheckCircleIcon color="primary" />}
        />
        <CardContent>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6} md={3}>
              <Box p={2} bgcolor="success.light" borderRadius={1}>
                <Typography variant="h6" color="success.contrastText">200</Typography>
                <Typography variant="body2" color="success.contrastText">Sucesso</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box p={2} bgcolor="error.light" borderRadius={1}>
                <Typography variant="h6" color="error.contrastText">400</Typography>
                <Typography variant="body2" color="error.contrastText">Dados inválidos</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box p={2} bgcolor="warning.light" borderRadius={1}>
                <Typography variant="h6" color="warning.contrastText">401</Typography>
                <Typography variant="body2" color="warning.contrastText">Token inválido</Typography>
              </Box>
            </Grid>
            <Grid item xs={12} sm={6} md={3}>
              <Box p={2} bgcolor="grey.600" borderRadius={1}>
                <Typography variant="h6" style={{ color: 'white' }}>500</Typography>
                <Typography variant="body2" style={{ color: 'white' }}>Erro interno</Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    </div>
  );
};

export default MessagesAPITab;