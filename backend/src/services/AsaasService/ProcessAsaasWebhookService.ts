import fs from "fs";
import path from "path";
import Invoices from "../../models/Invoices";
import Company from "../../models/Company";
import AsaasConfig from "../../models/AsaasConfig";
import AsaasService from "./AsaasService";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";
import { getIO } from "../../libs/socket";
import moment from "moment";

interface WebhookPayload {
  id?: string;
  event: string;
  dateCreated?: string;
  payment: {
    object?: string;
    id: string;
    dateCreated?: string;
    customer: string;
    subscription?: string;
    value: number;
    netValue: number;
    originalValue?: number;
    description: string;
    billingType: string;
    status: string;
    dueDate?: string;
    originalDueDate: string;
    paymentDate?: string;
    clientPaymentDate?: string;
    confirmedDate?: string;
    invoiceUrl: string;
    invoiceNumber: string;
    paymentMethod?: string;
    externalReference?: string;
    bankSlipUrl?: string;
    nossoNumero?: string;
    deleted?: boolean;
    anticipated?: boolean;
    anticipable?: boolean;
    creditDate?: string;
    estimatedCreditDate?: string;
    transactionReceiptUrl?: string;
    lastInvoiceViewedDate?: string;
    lastBankSlipViewedDate?: string;
    discount?: any;
    fine?: any;
    interest?: any;
    postalService?: boolean;
    custody?: any;
    escrow?: any;
    refunds?: any;
  };
}

interface Request {
  payload: WebhookPayload;
  signature?: string;
}

const ProcessAsaasWebhookService = async ({
  payload,
  signature
}: Request): Promise<void> => {
  try {
    logger.info(`Processing Asaas webhook: ${payload.event} for payment ${payload.payment.id}`);

    // Buscar configuração global do Asaas
    const asaasConfig = await AsaasConfig.findOne();

    if (!asaasConfig) {
      logger.warn(`Asaas config not found for payment ${payload.payment.id}`);
      return;
    }

    // Validar webhook se necessário
    if (signature) {
      const asaasService = new AsaasService(asaasConfig.apiKey, asaasConfig.environment);
      const isValid = asaasService.validateWebhook(payload, signature);
      if (!isValid) {
        throw new AppError("Invalid webhook signature");
      }
    }

    // Processar diferentes eventos
    switch (payload.event) {
      case 'PAYMENT_CREATED':
        await handlePaymentCreated(payload, asaasConfig);
        break;
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
        await handlePaymentConfirmed(payload, asaasConfig);
        break;
      case 'PAYMENT_OVERDUE':
        await handlePaymentOverdue(payload, asaasConfig);
        break;
      case 'PAYMENT_DELETED':
        await handlePaymentDeleted(payload, asaasConfig);
        break;
      default:
        logger.info(`Unhandled webhook event: ${payload.event}`);
    }

  } catch (error: any) {
    logger.error('Error processing Asaas webhook:', error);
    throw new AppError(error.message || "Erro ao processar webhook do Asaas");
  }
};

// Lidar com criação de pagamento
const handlePaymentCreated = async (payload: WebhookPayload, asaasConfig: AsaasConfig): Promise<void> => {
  try {
    // Verificar se a fatura já existe
    const existingInvoice = await Invoices.findOne({
      where: { asaasInvoiceId: payload.payment.id }
    });

    if (existingInvoice) {
      logger.info(`Invoice already exists for payment ${payload.payment.id}`);
      return;
    }

    // Tentar identificar a empresa pelo externalReference
    let targetCompanyId = null;
    if (payload.payment.externalReference) {
      const match = payload.payment.externalReference.match(/company_(\d+)_/);
      if (match) {
        targetCompanyId = parseInt(match[1]);
      }
    }

    // Se não conseguiu identificar, usar a primeira empresa ativa como fallback
    if (!targetCompanyId) {
      const company = await Company.findOne({ where: { status: true } });
      if (company) {
        targetCompanyId = company.id;
      }
    }

    if (!targetCompanyId) {
      logger.warn(`Could not identify company for payment ${payload.payment.id}`);
      return;
    }

    // Criar nova fatura
    const invoice = await Invoices.create({
      detail: payload.payment.description || `Fatura Asaas - ${payload.payment.id}`,
      status: payload.payment.status,
      value: payload.payment.value,
      dueDate: payload.payment.originalDueDate,
      companyId: targetCompanyId,
      asaasInvoiceId: payload.payment.id,
      asaasSubscriptionId: payload.payment.subscription,
      billingType: payload.payment.billingType,
      invoiceUrl: payload.payment.invoiceUrl
    });

    logger.info(`Invoice created: ${invoice.id} for payment ${payload.payment.id}`);

  } catch (error: any) {
    logger.error('Error handling payment created:', error);
    throw error;
  }
};

// Lidar com confirmação de pagamento
const handlePaymentConfirmed = async (payload: WebhookPayload, asaasConfig: AsaasConfig): Promise<void> => {
  try {
    // Buscar fatura existente
    const invoice = await Invoices.findOne({
      where: { asaasInvoiceId: payload.payment.id }
    });

    if (!invoice) {
      logger.warn(`Invoice not found for payment ${payload.payment.id}`);
      return;
    }

    // Atualizar status da fatura
    const paymentDate = payload.payment.paymentDate || payload.payment.clientPaymentDate;
    const paymentMethod = payload.payment.paymentMethod || payload.payment.billingType;
    
    await invoice.update({
      status: payload.payment.status,
      paymentDate: paymentDate ? new Date(paymentDate) : null,
      paymentMethod: paymentMethod
    });

    // Atualizar status da empresa para ativo
    if (invoice.companyId) {
      await Company.update(
        { status: true },
        { where: { id: invoice.companyId } }
      );

      // Emitir evento via Socket.IO para atualizar a interface em tempo real
      const io = getIO();
      io.emit(`company-${invoice.companyId}-invoice-paid`, {
        action: "payment_confirmed",
        invoice: {
          id: invoice.id,
          status: payload.payment.status,
          paymentDate: payload.payment.paymentDate,
          paymentMethod: payload.payment.paymentMethod,
          asaasInvoiceId: payload.payment.id
        }
      });
    }

    logger.info(`Payment confirmed for invoice ${invoice.id}`);

  } catch (error: any) {
    logger.error('Error handling payment confirmed:', error);
    throw error;
  }
};

// Lidar com pagamento em atraso
const handlePaymentOverdue = async (payload: WebhookPayload, asaasConfig: AsaasConfig): Promise<void> => {
  try {
    // Buscar fatura existente
    const invoice = await Invoices.findOne({
      where: { asaasInvoiceId: payload.payment.id }
    });

    if (!invoice) {
      logger.warn(`Invoice not found for payment ${payload.payment.id}`);
      return;
    }

    // Atualizar status da fatura
    await invoice.update({
      status: payload.payment.status
    });

    logger.info(`Payment overdue for invoice ${invoice.id}`);

  } catch (error: any) {
    logger.error('Error handling payment overdue:', error);
    throw error;
  }
};

// Lidar com exclusão de pagamento
const handlePaymentDeleted = async (payload: WebhookPayload, asaasConfig: AsaasConfig): Promise<void> => {
  try {
    // Buscar fatura existente
    const invoice = await Invoices.findOne({
      where: { asaasInvoiceId: payload.payment.id }
    });

    if (!invoice) {
      logger.warn(`Invoice not found for payment ${payload.payment.id}`);
      return;
    }

    // Remover fatura
    await invoice.destroy();

    logger.info(`Invoice deleted: ${invoice.id} for payment ${payload.payment.id}`);

  } catch (error: any) {
    logger.error('Error handling payment deleted:', error);
    throw error;
  }
};

export default ProcessAsaasWebhookService;