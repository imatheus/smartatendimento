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
import MainContainer from "../../components/MainContainer";
import MainHeader from "../../components/MainHeader";
import Title from "../../components/Title";
import SubscriptionModal from "../../components/SubscriptionModal";
import api from "../../services/api";
import TableRowSkeleton from "../../components/TableRowSkeleton";
import { AuthContext } from "../../context/Auth/AuthContext";

import toastError from "../../errors/toastError";

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
      state[userIndex] = user;
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
  mainPaper: {
    flex: 1,
    padding: theme.spacing(1),
    overflowY: "scroll",
    ...theme.scrollbarStyles,
  },
  planCard: {
    marginBottom: theme.spacing(2),
    backgroundColor: theme.palette.background.paper,
  },
  planTitle: {
    fontWeight: "bold",
    color: theme.palette.primary.main,
  },
  planDetails: {
    marginTop: theme.spacing(1),
  },
  cancelNotice: {
    marginTop: theme.spacing(2),
    padding: theme.spacing(1),
    backgroundColor: theme.palette.grey[100],
    borderRadius: theme.shape.borderRadius,
    fontStyle: "italic",
    color: theme.palette.text.secondary,
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


  const handleOpenContactModal = (invoices) => {
    setStoragePlans(invoices);
    setSelectedContactId(null);
    setContactModalOpen(true);
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
    if (dias < 0 && record.status !== "paid") {
      return { backgroundColor: "#ffbcbc9c" };
    }
  };

  const rowStatus = (record) => {
    const hoje = moment(moment()).format("DD/MM/yyyy");
    const vencimento = moment(record.dueDate).format("DD/MM/yyyy");
    var diff = moment(vencimento, "DD/MM/yyyy").diff(moment(hoje, "DD/MM/yyyy"));
    var dias = moment.duration(diff).asDays();    
    const status = record.status;
    if (status === "paid") {
      return "Pago";
    }
    if (dias < 0) {
      return "Vencido";
    } else {
      return "Em Aberto"
    }

  }

  return (
    <MainContainer>
      <SubscriptionModal
        open={contactModalOpen}
        onClose={handleCloseContactModal}
        aria-labelledby="form-dialog-title"
        Invoice={storagePlans}
        contactId={selectedContactId}

      ></SubscriptionModal>
      <MainHeader>
        <Title>Financeiro</Title>
      </MainHeader>
      
      {/* Plan Information Card */}
      <Card className={classes.planCard}>
        <CardContent>
          <Typography variant="h6" className={classes.planTitle}>
            Plano Contratado
          </Typography>
          <Grid container spacing={2} className={classes.planDetails}>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Nome do Plano:</strong> {user?.company?.plan?.name || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Valor:</strong> {user?.company?.plan?.value ? 
                  user.company.plan.value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' }) : "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Usuários:</strong> {user?.company?.plan?.users || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Conexões:</strong> {user?.company?.plan?.connections || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Filas:</strong> {user?.company?.plan?.queues || "N/A"}
              </Typography>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="body2">
                <strong>Seu plano vence em:</strong> {user?.company?.dueDate ? 
                  moment(user.company.dueDate).format("DD/MM/YYYY") : "N/A"}
              </Typography>
            </Grid>
          </Grid>
          <div className={classes.cancelNotice}>
            <Typography variant="body2">
              Para cancelar o plano, envie um e-mail para contato@pepchat.com.br
            </Typography>
          </div>
        </CardContent>
      </Card>

      <Paper
        className={classes.mainPaper}
        variant="outlined"
        onScroll={handleScroll}
      >
        <Typography variant="h6" style={{ padding: '16px', fontWeight: 'bold' }}>
          Faturas
        </Typography>
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
            <>
              {invoices.map((invoices) => (
                <TableRow style={rowStyle(invoices)} key={invoices.id}>
                  <TableCell align="center">{invoices.id}</TableCell>
                  <TableCell align="center">{invoices.detail}</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }} align="center">{invoices.value.toLocaleString('pt-br', { style: 'currency', currency: 'BRL' })}</TableCell>
                  <TableCell align="center">{moment(invoices.dueDate).format("DD/MM/YYYY")}</TableCell>
                  <TableCell style={{ fontWeight: 'bold' }} align="center">{rowStatus(invoices)}</TableCell>
                  <TableCell align="center">
                    {rowStatus(invoices) !== "Pago" ?
                      <Button
                        size="small"
                        variant="outlined"
                        color="secondary"
                        onClick={() => handleOpenContactModal(invoices)}
                      >
                        PAGAR
                      </Button> :
                      <Button
                        size="small"
                        variant="outlined" 
                        /* color="secondary"
                        disabled */
                      >
                        PAGO 
                      </Button>}

                  </TableCell>
                </TableRow>
              ))}
              {loading && <TableRowSkeleton columns={4} />}
            </>
          </TableBody>
        </Table>
      </Paper>
    </MainContainer>
  );
};

export default Invoices;
