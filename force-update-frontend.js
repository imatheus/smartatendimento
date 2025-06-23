const { Server } = require('socket.io');
const http = require('http');

// Criar servidor HTTP temporário para Socket.IO
const server = http.createServer();
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

// Conectar ao servidor Socket.IO principal (assumindo que está rodando na porta 8080)
const { io: Client } = require('socket.io-client');
const client = Client('http://localhost:8080');

client.on('connect', () => {
  console.log('Conectado ao servidor Socket.IO principal');
  
  // Simular atualização de fatura vencida
  const updateData = {
    action: "payment_overdue",
    invoice: {
      id: 29, // ID da fatura que você mencionou
      status: "OVERDUE",
      dueDate: "2025-06-20"
    }
  };
  
  // Emitir evento para a empresa (assumindo companyId = 13 baseado no externalReference)
  client.emit(`company-13-invoice-updated`, updateData);
  
  console.log('Evento de fatura vencida enviado:', updateData);
  
  setTimeout(() => {
    client.disconnect();
    process.exit(0);
  }, 2000);
});

client.on('connect_error', (error) => {
  console.error('Erro ao conectar:', error);
  process.exit(1);
});