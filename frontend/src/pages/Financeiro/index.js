import React, { useState, useEffect, useReducer, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Paper from "@material-ui/core/Paper";
import Button from "@material-ui/core/Button";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import Card from "@material-ui/core/Card";
import CardContent from "@material-ui/core/CardContent";
import Typography from "@material-ui/core/Typography";
import Grid from "@material-ui/core/Grid";
import Box from "@material-ui/core/Box";
import CheckIcon from "@material-ui/icons/Check";
import CloseIcon from "@material-ui/icons/Close";
import OpenInNewIcon from "@material-ui/icons/OpenInNew";
import VisibilityIcon from "@material-ui/icons/Visibility";
import IconButton from "@material-ui/core/IconButton";
import Tooltip from "@material-ui/core/Tooltip";
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import SubscriptionModal from "../../components/SubscriptionModal";
import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { AuthContext } from "../../context/Auth/AuthContext";

import toastError from "../../errors/toastError";
import { toast } from "react-toastify";
import { socketConnection } from "../../services/socket";

import moment from "moment";

const reducer = (state, action) => {
  if (action.type === "LOAD_INVOICES") {
    const invoices = action.payload;
    const newUsers = [];

    invoices.forEach((user) => {
      const userIndex = state.findIndex((u) => u.id === user.id);
      if (userIndex !== -1) {
        state[userIndex] = user;
      } else {
        newUsers.push(user);
      }
    });

    return [...state, ...newUsers];
  }

  if (action.type === "UPDATE_USERS") {
    const user = action.payload;
    const userIndex = state.findIndex((u) => u.id === user.id);

    if (userIndex !== -1) {
      // Atualizar apenas os campos fornecidos, mantendo os outros
      state[userIndex] = { ...state[userIndex], ...user };
      console.log('Fatura atualizada no reducer:', state[userIndex]);
      return [...state];
    } else {
      return [user, ...state];
    }
  }

  if (action.type === "DELETE_USER") {
    const userId = action.payload;

    const userIndex = state.findIndex((u) => u.id === userId);
    if (userIndex !== -1) {
      state.splice(userIndex, 1);
    }
    return [...state];
  }

  if (action.type === "RESET") {
    return [];
  }
};

const useStyles = makeStyles((theme) => ({
  mainContainer: {
    display: "flex",
    gap: theme.spacing(3),
    marginTop: theme.spacing(2),
    [theme.breakpoints.down("md")]: {
      flexDirection: "column",
    },
  },
  leftColumn: {
    flex: "0 0 320px",
    [theme.breakpoints.down("md")]: {
      flex: "1 1 auto",
    },
  },
  rightColumn: {
    flex: "1 1 auto",
    minWidth: 0,
  },
  planCard: {
    borderRadius: "16px",
    padding: theme.spacing(2.5),
    backgroundColor: "#ffffff",
    boxShadow: "0 4px 12px rgba(0, 0, 0, 0.08)",
    border: "2px solid #4caf50",
    position: "relative",
    height: "fit-content",
  },
  activeBadge: {
    position: "absolute",
    top: "-12px",
    left: "50%",
    transform: "translateX(-50%)",
    backgroundColor: "#4caf50",
    color: "#ffffff",
    padding: theme.spacing(0.5, 2),
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "bold",
    textTransform: "uppercase",
    letterSpacing: "0.5px",
  },
  planHeader: {
    textAlign: "center",
    marginBottom: theme.spacing(2),
  },
  planTitle: {
    fontSize: "1.25rem",
    fontWeight: "bold",
    marginBottom: theme.spacing(1.5),
    color: "#333333",
  },
  planPrice: {
    fontSize: "2rem",
    fontWeight: "bold",
    marginBottom: theme.spacing(0.5),
    color: "#333333",
  },
  planPriceUnit: {
    fontSize: "0.8rem",
    opacity: 0.7,
    color: "#666666",
  },
  featuresList: {
    marginBottom: theme.spacing(1.5),
  },
  featureItem: {
    display: "flex",
    alignItems: "center",
    marginBottom: theme.spacing(1),
    fontSize: "0.8rem",
    fontFamily: "'Lato', sans-serif",
  },
  featureIcon: {
    marginRight: theme.spacing(0.8),
    color: "#ffffff",
    fontSize: "0.8rem",
    backgroundColor: "#4caf50",
    borderRadius: "50%",
    padding: "3px",
    width: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  featureIconMissing: {
    marginRight: theme.spacing(0.8),
    color: "#ffffff",
    fontSize: "0.8rem",
    backgroundColor: "#f44336",
    borderRadius: "50%",
    padding: "3px",
    width: "16px",
    height: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  cancelNotice: {
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(1.5),
    backgroundColor: "#f8f9fa",
    borderRadius: "8px",
    border: "1px solid #e9ecef",
    textAlign: "center",
  },
  dueDate: {
    textAlign: "center",
    marginTop: theme.spacing(1.5),
    padding: theme.spacing(1),
    backgroundColor: "#fff3cd",
    borderRadius: "8px",
    border: "1px solid #ffeaa7",
  },
  invoicesPaper: {
    padding: theme.spacing(2),
    height: "fit-content",
    minHeight: "500px",
    borderRadius: "16px",
  },
  invoicesTitle: {
    marginBottom: theme.spacing(2),
    padding: theme.spacing(2),
    backgroundColor: "#f5f5f5",
    margin: `-${theme.spacing(2)}px -${theme.spacing(2)}px ${theme.spacing(2)}px -${theme.spacing(2)}px`,
    borderRadius: "16px 16px 0 0",
  },
  paidStatusBadge: {
    display: "inline-flex",
    alignItems: "center",
    backgroundColor: "#4caf50",
    color: "white",
    padding: theme.spacing(0.5, 1.5),
    borderRadius: "20px",
    fontSize: "0.75rem",
    fontWeight: "bold",
    gap: theme.spacing(0.5),
  },
  paidStatusIcon: {
    fontSize: "1rem",
  },
  viewInvoiceButton: {
    padding: theme.spacing(0.5),
    color: "#1976d2",
    "&:hover": {
      backgroundColor: "rgba(25, 118, 210, 0.1)",
    },
  },
}));

const Invoices = () => {
  const classes = useStyles();
  const { user } = useContext(AuthContext);

  const [loading, setLoading] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [searchParam, ] = useState("");
  const [invoices, dispatch] = useReducer(reducer, []);
  const [storagePlans, setStoragePlans] = React.useState([]);
  const [selectedContactId, setSelectedContactId] = useState(null);
  const [contactModalOpen, setContactModalOpen] = useState(false);

  const formatCurrency = (value) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(value);
  };

  const getPlanFeatures = (plan) => {
    if (!plan) return [];
    
    const features = [
      { text: `${plan.users} usuário${plan.users > 1 ? 's' : ''} por licença`, included: true },
      { text: `${plan.connections} ${plan.connections > 1 ? 'conexões' : 'conexão'} WhatsApp`, included: true },
      { text: `${plan.queues} fila${plan.queues > 1 ? 's' : ''} de atendimento`, included: true },
    ];

    // Add conditional features based on plan capabilities
    if (plan.useFacebook !== undefined) {
      features.push({ text: "Facebook Messenger", included: plan.useFacebook });
    }
    if (plan.useInstagram !== undefined) {
      features.push({ text: "Instagram Direct", included: plan.useInstagram });
    }
    if (plan.useCampaigns !== undefined) {
      features.push({ text: "Campanhas de Marketing", included: plan.useCampaigns });
    }

    // Always included features
    features.push(
      { text: "Agendamento de Mensagens", included: true },
      { text: "Suporte técnico", included: true },
      { text: "Atualizações automáticas", included: true }
    );

    return features;
  };

  const handleOpenContactModal = (invoice) => {
    // Se a fatura tem invoiceUrl, redireciona diretamente para o Asaas
    if (invoice.invoiceUrl) {
      window.open(invoice.invoiceUrl, '_blank');
      return;
    }
    
    // Fallback para o modal antigo se não tiver invoiceUrl
    setStoragePlans(invoice);
    setSelectedContactId(null);
    setContactModalOpen(true);
  };

  const handleViewInvoice = (invoice) => {
    // Abrir fatura paga para visualização
    if (invoice.invoiceUrl) {
      window.open(invoice.invoiceUrl, '_blank');
    }
  };

  const handleCloseContactModal = () => {
    setSelectedContactId(null);
    setContactModalOpen(false);
  };

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [searchParam]);

  useEffect(() => {
    setLoading(true);
    const delayDebounceFn = setTimeout(() => {
      const fetchInvoices = async () => {
        try {
          const { data } = await api.get("/invoices/all", {
            params: { searchParam, pageNumber },
          });
          dispatch({ type: "LOAD_INVOICES", payload: data });
          setHasMore(data.hasMore);
          setLoading(false);
        } catch (err) {
          toastError(err);
        }
      };
      fetchInvoices();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchParam, pageNumber]);

  // Socket.IO listener para atualizações de pagamento em tempo real
  useEffect(() => {
    if (user?.companyId) {
      const socket = socketConnection({ companyId: user.companyId });

      // Listener para pagamento confirmado
      socket.on(`company-${user.companyId}-invoice-paid`, (data) => {
        if (data.action === "payment_confirmed") {
          // Atualizar a fatura na lista
          dispatch({
            type: "UPDATE_USERS", // Reutilizando o reducer existente
            payload: { 
              id: data.invoice.id, 
              status: data.invoice.status,
              paymentDate: data.invoice.paymentDate,
              paymentMethod: data.invoice.paymentMethod
            }
          });

          // Mostrar notificação de sucesso
          toast.success(`🎉 Pagamento confirmado! Fatura #${data.invoice.id} foi paga com sucesso.`);
        }
      });

      // Listener para atualizações de status (vencimento, etc.)
      socket.on(`company-${user.companyId}-invoice-updated`, (data) => {
        if (data.action === "payment_overdue") {
          // Atualizar a fatura na lista
          dispatch({
            type: "UPDATE_USERS",
            payload: { 
              id: data.invoice.id, 
              status: data.invoice.status
            }
          });

          // Mostrar notificação de vencimento
          toast.warning(`⚠️ Fatura #${data.invoice.id} está vencida.`);
        }
      });

      return () => {
        socket.disconnect();
      };
    }
  }, [user?.companyId]);

  const loadMore = () => {
    setPageNumber((prevState) => prevState + 1);
  };

  const handleScroll = (e) => {
    if (!hasMore || loading) return;
    const { scrollTop, scrollHeight, clientHeight } = e.currentTarget;
    if (scrollHeight - (scrollTop + 100) < clientHeight) {
      loadMore();
    }
  };

  const rowStyle = (record) => {
    const hoje = moment(moment()).format("DD/MM/yyyy");
    const vencimento = moment(record.dueDate).format("DD/MM/yyyy");
    var diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
    var dias = moment.duration(diff).asDays();    
    const status = record.status;
    
    // Destacar faturas vencidas (por status do Asaas ou por data)
    if (status === "OVERDUE" || (dias < 0 && status !== "paid" && status !== "CONFIRMED" && status !== "RECEIVED" && status !== "RECEIVED_IN_CASH")) {
      return { backgroundColor: "#ffbcbc9c" };
    }
  };

  const getStatusText = (record) => {
    const hoje = moment(moment()).format("DD/MM/yyyy");
    const vencimento = moment(record.dueDate).format("DD/MM/yyyy");
    var diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
    var dias = moment.duration(diff).asDays();    
    const status = record.status;
    
    console.log('Status da fatura:', status, 'ID:', record.id, 'Dias:', dias);
    
    // Verificar diferentes status do Asaas
    if (status === "paid" || status === "CONFIRMED" || status === "RECEIVED" || status === "RECEIVED_IN_CASH") {
      return "Pago";
    }
    // Verificar se está vencido pelo status do Asaas ou pela data
    if (status === "OVERDUE" || (dias < 0 && status !== "paid" && status !== "CONFIRMED" && status !== "RECEIVED" && status !== "RECEIVED_IN_CASH")) {
      return "Vencido";
    } else {
      return "Em Aberto"
    }
  }

  const renderStatus = (record) => {
    if (isPaid(record)) {
      return (
        <div className={classes.paidStatusBadge}>
          <CheckIcon className={classes.paidStatusIcon} />
          PAGO
        </div>
      );
    }
    return getStatusText(record);
  }

  const isPaid = (record) => {
    const status = record.status;
    return status === "paid" || status === "CONFIRMED" || status === "RECEIVED" || status === "RECEIVED_IN_CASH";
  }

  return (
    <MainContainer>
      <SubscriptionModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        Invoice={storagePlans}
        contactId={selectedContactId}
      />
      
      <MainHeader>
        <Title>Financeiro</Title>
      </MainHeader>
      
      {/* Two Column Layout */}
      <div className={classes.mainContainer}>
        {/* Left Column - Plan Information */}
        <div className={classes.leftColumn}>
          <Paper className={classes.planCard} elevation={0}>
            {/* Active Plan Badge */}
            <div className={classes.activeBadge}>
              Plano Ativo
            </div>

            <div className={classes.planHeader}>
              <Typography className={classes.planTitle}>
                {user?.company?.plan?.name || "Plano Não Identificado"}
              </Typography>

              <Box>
                <Typography className={classes.planPrice}>
                  {user?.company?.plan?.value ? formatCurrency(user.company.plan.value) : "R$ 0,00"}
                </Typography>
                <Typography className={classes.planPriceUnit}>
                  por mês
                </Typography>
              </Box>
            </div>

            <div className={classes.featuresList}>
              {getPlanFeatures(user?.company?.plan).map((feature, index) => (
                <div key={index} className={classes.featureItem}>
                  {feature.included ? (
                    <CheckIcon className={classes.featureIcon} />
                  ) : (
                    <CloseIcon className={classes.featureIconMissing} />
                  )}
                  <span 
                    style={{ 
                      fontFamily: "'Lato', sans-serif",
                      opacity: feature.included ? 1 : 0.6,
                      textDecoration: feature.included ? 'none' : 'line-through'
                    }}
                  >
                    {feature.text}
                  </span>
                </div>
              ))}
            </div>

            {user?.company?.dueDate && (
              <div className={classes.dueDate}>
                <Typography variant="body2" style={{ fontWeight: "bold", color: "#856404" }}>
                  Próximo vencimento: {moment(user.company.dueDate).format("DD/MM/YYYY")}
                </Typography>
              </div>
            )}

            <div className={classes.cancelNotice}>
              <Typography variant="body2" style={{ fontStyle: "italic", color: "#6c757d" }}>
                Suporte: contato@pepchat.com.br
              </Typography>
            </div>
          </Paper>
        </div>

        {/* Right Column - Invoices */}
        <div className={classes.rightColumn}>
          <Paper className={classes.invoicesPaper} variant="outlined">
            <Typography variant="h6" className={classes.invoicesTitle} style={{ fontWeight: 'bold' }}>
              Faturas
            </Typography>
            
            <div style={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell align="center">Id</TableCell>
                    <TableCell align="center">Detalhes</TableCell>
                    <TableCell align="center">Valor</TableCell>
                    <TableCell align="center">Data Venc.</TableCell>
                    <TableCell align="center">Status</TableCell>
                    <TableCell align="center">Ação</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {invoices.length === 0 && !loading ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" style={{ padding: '40px', color: '#666' }}>
                        <Typography variant="body1">
                          Nenhuma fatura encontrada
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoices.map((invoice) => (
                      <TableRow style={rowStyle(invoice)} key={invoice.id}>
                        <TableCell align="center">{invoice.id}</TableCell>
                        <TableCell align="center">{invoice.detail}</TableCell>
                        <TableCell style={{ fontWeight: 'bold' }} align="center">
                          {invoice.value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}
                        </TableCell>
                        <TableCell align="center">{moment(invoice.dueDate).format("DD/MM/YYYY")}</TableCell>
                        <TableCell style={{ fontWeight: 'bold' }} align="center">{renderStatus(invoice)}</TableCell>
                        <TableCell align="center">
                          {!isPaid(invoice) ? (
                            <Button
                              size="small"
                              variant="contained"
                              color="primary"
                              onClick={() => handleOpenContactModal(invoice)}
                              startIcon={invoice.invoiceUrl ? <OpenInNewIcon /> : null}
                              title={invoice.invoiceUrl ? "Abrir página de pagamento do Asaas" : "Processar pagamento"}
                            >
                              PAGAR
                            </Button>
                          ) : (
                            invoice.invoiceUrl && (
                              <Tooltip title="Ver fatura" arrow>
                                <IconButton
                                  className={classes.viewInvoiceButton}
                                  onClick={() => handleViewInvoice(invoice)}
                                  size="small"
                                >
                                  <VisibilityIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            )
                          )}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                  {loading && <TableRowSkeleton columns={6} />}
                </TableBody>
              </Table>
            </div>
          </Paper>
        </div>
      </div>
    </MainContainer>
  );
};

export default Invoices;