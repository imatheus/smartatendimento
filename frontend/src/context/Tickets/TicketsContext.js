import React, { useState, useEffect, createContext } from "react";
import { useHistory } from "react-router-dom";
import { socketConnection } from "../../services/socket";

const TicketsContext = createContext();

const TicketsContextProvider = ({ children }) => {
  const [currentTicket, setCurrentTicket] = useState({ id: null, code: null });
  const [tickets, setTickets] = useState([]);
  const history = useHistory();

  useEffect(() => {
    const companyId = localStorage.getItem("companyId");
    const socket = socketConnection({ companyId });

    socket.on("connect", () => {
      socket.emit("joinTickets", `company-${companyId}`);
    });

    socket.on(`company-${companyId}-ticket`, (data) => {
      if (data.action === "create" || data.action === "update") {
        setTickets((prevTickets) => {
          const ticketIndex = prevTickets.findIndex((t) => t.id === data.ticket.id);
          let newTickets = [...prevTickets];
          if (ticketIndex !== -1) {
            newTickets[ticketIndex] = data.ticket;
          } else {
            newTickets.push(data.ticket);
          }
          // Sort tickets by last message time (most recent first)
          return newTickets.sort((a, b) => 
            new Date(b.updatedAt) - new Date(a.updatedAt)
          );
        });
      }
    });

    socket.on(`company-${companyId}-appMessage`, (data) => {
      if (data.action === "create") {
        setTickets((prevTickets) => {
          const ticketIndex = prevTickets.findIndex((t) => t.id === data.ticket.id);
          if (ticketIndex !== -1) {
            const updatedTicket = {
              ...prevTickets[ticketIndex],
              lastMessage: data.message.body,
              updatedAt: data.message.createdAt,
            };
            const newTickets = [...prevTickets];
            newTickets[ticketIndex] = updatedTicket;
            // Reorder tickets based on the latest message
            return newTickets.sort((a, b) => 
              new Date(b.updatedAt) - new Date(a.updatedAt)
            );
          }
          return prevTickets;
        });
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  useEffect(() => {
    if (currentTicket.id !== null) {
      history.push(`/tickets/${currentTicket.uuid}`);
    }
  }, [currentTicket, history]);

  return (
    <TicketsContext.Provider
      value={{ currentTicket, setCurrentTicket, tickets, setTickets }}
    >
      {children}
    </TicketsContext.Provider>
  );
};

export { TicketsContext, TicketsContextProvider };