import React, { useState, useEffect, useReducer, useContext } from "react";

import { makeStyles } from "@material-ui/core/styles";
import List from "@material-ui/core/List";
import Paper from "@material-ui/core/Paper";

import TicketListItem from "../TicketListItemCustom";
import TicketsListSkeleton from "../TicketsListSkeleton";

import useTickets from "../../hooks/useTickets";
import { i18n } from "../../translate/i18n";
import { AuthContext } from "../../context/Auth/AuthContext";
import { socketConnection } from "../../services/socket";

const useStyles = makeStyles((theme) => ({
  ticketsListWrapper: {
    position: "relative",
    display: "flex",
    height: "100%",
    flexDirection: "column",
    overflow: "hidden",
    borderTopRightRadius: 0,
    borderBottomRightRadius: 0,
  },

  ticketsList: {
    flex: 1,
    maxHeight: "100%",
    overflowY: "scroll",
    ...theme.scrollbarStyles,
    borderTop: "2px solid rgba(0, 0, 0, 0.12)",
  },

  ticketsListHeader: {
    color: "rgb(67, 83, 105)",
    zIndex: 2,
    backgroundColor: "white",
    borderBottom: "1px solid rgba(0, 0, 0, 0.12)",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
  },

  ticketsCount: {
    fontWeight: "normal",
    color: "rgb(104, 121, 146)",
    marginLeft: "8px",
    fontSize: "14px",
  },

  noTicketsText: {
    textAlign: "center",
    color: "rgb(104, 121, 146)",
    fontSize: "14px",
    lineHeight: "1.4",
  },

  noTicketsTitle: {
    textAlign: "center",
    fontSize: "16px",
    fontWeight: "600",
    margin: "0px",
  },

  noTicketsDiv: {
    display: "flex",
    height: "100px",
    margin: 40,
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
  },
}));

const reducer = (state, action) => {
  if (action.type === "LOAD_TICKETS") {
    const newTickets = action.payload;
    let newState = [...state];

    newTickets.forEach((ticket) => {
      const ticketIndex = newState.findIndex((t) => t.id === ticket.id);
      if (ticketIndex !== -1) {
        newState[ticketIndex] = ticket;
        if (ticket.unreadMessages > 0) {
          const updatedTicket = newState.splice(ticketIndex, 1)[0];
          newState.unshift(updatedTicket);
        }
      } else {
        newState.push(ticket);
      }
    });

    return newState;
  }

  if (action.type === "RESET_UNREAD") {
    const ticketId = action.payload;

    const ticketIndex = state.findIndex((t) => t.id === ticketId);
    if (ticketIndex !== -1) {
      const newState = [...state];
      newState[ticketIndex] = { ...newState[ticketIndex], unreadMessages: 0 };
      return newState;
    }

    return state;
  }

  if (action.type === "UPDATE_TICKET") {
    const ticket = action.payload;

    const ticketIndex = state.findIndex((t) => parseInt(t.id) === parseInt(ticket.id));
    if (ticketIndex !== -1) {
      const newState = [...state];
      newState[ticketIndex] = ticket;
      return newState;
    } else {
      const newState = [ticket, ...state];
      return newState;
    }
  }

  if (action.type === "UPDATE_TICKET_UNREAD_MESSAGES") {
    const ticket = action.payload;

    const ticketIndex = state.findIndex((t) => parseInt(t.id) === parseInt(ticket.id));
    if (ticketIndex !== -1) {
      const newState = [...state];
      newState[ticketIndex] = ticket;
      // Move ticket to top if it has unread messages
      const updatedTicket = newState.splice(ticketIndex, 1)[0];
      newState.unshift(updatedTicket);
      return newState;
    } else {
      const newState = [ticket, ...state];
      return newState;
    }
  }

  if (action.type === "UPDATE_TICKET_CONTACT") {
    const contact = action.payload;
    const ticketIndex = state.findIndex((t) => t.contactId === contact.id);
    if (ticketIndex !== -1) {
      const newState = [...state];
      newState[ticketIndex] = { ...newState[ticketIndex], contact };
      return newState;
    }
    return state;
  }

  if (action.type === "DELETE_TICKET") {
    const ticketId = action.payload;
    const ticketIndex = state.findIndex((t) => parseInt(t.id) === parseInt(ticketId));
    console.log(`TicketsListCustom DELETE_TICKET: ticketId=${ticketId}, found at index=${ticketIndex}, current state length=${state.length}`);
    if (ticketIndex !== -1) {
      const newState = [...state];
      newState.splice(ticketIndex, 1);
      console.log(`TicketsListCustom DELETE_TICKET: Removed ticket, new state length=${newState.length}`);
      return newState;
    }

    return state;
  }

  if (action.type === "RESET") {
    return [];
  }
};

const TicketsListCustom = (props) => {
  const {
    status,
    searchParam,
    tags,
    users,
    showAll,
    selectedQueueIds,
    updateCount,
    style,
  } = props;
  const classes = useStyles();
  const [pageNumber, setPageNumber] = useState(1);
  const [, setUpdate] = useState(0);
  const [ticketsList, dispatch] = useReducer(reducer, []);
  const [,] = useState([]);
  const { user } = useContext(AuthContext);
  const { profile, queues } = user;

  useEffect(() => {
    dispatch({ type: "RESET" });
    setPageNumber(1);
  }, [status, searchParam, dispatch, showAll, tags, users, selectedQueueIds]);

  const { tickets, hasMore, loading } = useTickets({
    pageNumber,
    searchParam,
    status,
    showAll,
    tags: JSON.stringify(tags),
    users: JSON.stringify(users),
    queueIds: JSON.stringify(selectedQueueIds),
  });

  useEffect(() => {
    const queueIds = queues.map((q) => q.id);
    const filteredTickets = tickets.filter(
      (t) => queueIds.indexOf(t.queueId) > -1
    );

    if (profile === "user") {
      dispatch({ type: "LOAD_TICKETS", payload: filteredTickets });
    } else {
      dispatch({ type: "LOAD_TICKETS", payload: tickets });
    }
  }, [tickets, status, searchParam, queues, profile]);

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketConnection({ companyId });

    const shouldUpdateTicket = (ticket) =>
      (!ticket.userId || ticket.userId === user?.id || showAll) &&
      (!ticket.queueId || selectedQueueIds.indexOf(ticket.queueId) > -1);

    const notBelongsToUserQueues = (ticket) =>
      ticket.queueId && selectedQueueIds.indexOf(ticket.queueId) === -1;

    socket.on("connect", () => {
      console.log(`🔌 TicketsListCustom(${status}): Socket connected`);
      if (status) {
        console.log(`🔌 TicketsListCustom(${status}): Joining tickets room: ${status}`);
        socket.emit("joinTickets", status);
      } else {
        console.log(`🔌 TicketsListCustom(${status}): Joining notification room`);
        socket.emit("joinNotification");
      }
    });

    socket.on(`company-${companyId}-ticket`, (data) => {
      console.log(`TicketsListCustom(${status}): Socket event received:`, data);
      
      if (data.action === "updateUnread") {
        dispatch({
          type: "RESET_UNREAD",
          payload: data.ticketId,
        });
      }

      if (data.action === "update") {
        console.log(`🎯 TicketsListCustom(${status}): Update event - ticket status: ${data.ticket.status}, list status: ${status}, ticket ID: ${data.ticket.id}`);
        
        // Se o status do ticket não corresponde ao status da lista atual, remove o ticket
        if (data.ticket.status !== status) {
          console.log(`❌ TicketsListCustom(${status}): Deleting ticket (status changed from ${status} to ${data.ticket.status})`);
          dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
          return;
        }
        
        // Se o ticket pertence a esta lista, verifica se deve ser atualizado
        if (shouldUpdateTicket(data.ticket)) {
          console.log(`✅ TicketsListCustom(${status}): Updating ticket in list`);
          dispatch({
            type: "UPDATE_TICKET",
            payload: data.ticket,
          });
        } else {
          // Se não pertence mais ao usuário/fila, remove da lista
          console.log(`❌ TicketsListCustom(${status}): Deleting ticket (doesn't belong to user queues)`);
          dispatch({ type: "DELETE_TICKET", payload: data.ticket.id });
        }
      }

      if (data.action === "delete") {
        console.log(`TicketsListCustom(${status}): Delete event for ticket ${data.ticketId}`);
        dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
      }

      if (data.action === "removeFromList") {
        console.log(`TicketsListCustom(${status}): RemoveFromList event for ticket ${data.ticketId}`);
        dispatch({ type: "DELETE_TICKET", payload: data.ticketId });
      }
    });

    socket.on(`company-${companyId}-appMessage`, (data) => {
      const queueIds = queues.map((q) => q.id);
      if (
        profile === "user" &&
        (queueIds.indexOf(data.ticket.queue?.id) === -1 ||
          data.ticket.queue === null)
      ) {
        return;
      }

      if (data.action === "create" && shouldUpdateTicket(data.ticket)) {
        dispatch({
          type: "UPDATE_TICKET_UNREAD_MESSAGES",
          payload: data.ticket,
        });
      }
    });

    socket.on(`company-${companyId}-contact`, (data) => {
      if (data.action === "update") {
        dispatch({
          type: "UPDATE_TICKET_CONTACT",
          payload: data.contact,
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [status, showAll, user, selectedQueueIds, tags, users, profile, queues]);

  useEffect(() => {
    if (typeof updateCount === "function") {
      updateCount(ticketsList.length);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ticketsList]);


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

  return (
    <Paper className={classes.ticketsListWrapper} style={style}>
      <Paper
        square
        name="closed"
        elevation={0}
        className={classes.ticketsList}
        onScroll={handleScroll}
      >
        <List style={{ paddingTop: 0 }}>
          {ticketsList.length === 0 && !loading ? (
            <div className={classes.noTicketsDiv}>
              <span className={classes.noTicketsTitle}>
                {i18n.t("ticketsList.noTicketsTitle")}
              </span>
              <p className={classes.noTicketsText}>
                {i18n.t("ticketsList.noTicketsMessage")}
              </p>
            </div>
          ) : (
            <>
              {ticketsList.map((ticket) => (
                <TicketListItem ticket={ticket} setUpdate={setUpdate} key={ticket.id} />
              ))}
            </>
          )}
          {loading && <TicketsListSkeleton />}
        </List>
      </Paper>
    </Paper>
  );
};

export default TicketsListCustom;
