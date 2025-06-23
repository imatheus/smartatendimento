import fs from "fs";
import path from "path";
import Invoices from "../../models/Invoices";
import Company from "../../models/Company";
import AsaasConfig from "../../models/AsaasConfig";
import AsaasService from "./AsaasService";
import SyncCompanyDueDateService from "../CompanyService/SyncCompanyDueDateService";
import EnsureDefaultCompanyService from "../CompanyService/EnsureDefaultCompanyService";
import AppError from "../../errors/AppError";
import { logger } from "../../utils/logger";
import { getIO } from "../../libs/socket";
import moment from "moment";

interface WebhookPayload {
  id?: string;
  event: string;
  dateCreated?: string;
  payment?: {
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
  subscription?: {
    object?: string;
    id: string;
    dateCreated?: string;
    customer: string;
    paymentLink?: string;
    value: number;
    nextDueDate: string;
    cycle: string;
    description: string;
    billingType: string;
    deleted?: boolean;
    status: string;
    externalReference?: string;
    checkoutSession?: string;
    sendPaymentByPostalService?: boolean;
    fine?: any;
    interest?: any;
    split?: any;
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
    const eventId = payload.payment?.id || payload.subscription?.id || 'unknown';
    logger.info(`Processing Asaas webhook: ${payload.event} for ${eventId}`);

    // Validar payload básico
    if (!payload.event) {
      throw new AppError("Invalid webhook payload: missing event");
    }

    // Buscar configuração global do Asaas
    const asaasConfig = await AsaasConfig.findOne();

    if (!asaasConfig) {
      logger.warn(`Asaas config not found for event ${payload.event}`);
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
        if (payload.payment) {
          await handlePaymentCreated(payload, asaasConfig);
        } else {
          logger.warn(`PAYMENT_CREATED event without payment data: ${eventId}`);
        }
        break;
      case 'PAYMENT_CONFIRMED':
      case 'PAYMENT_RECEIVED':
        if (payload.payment) {
          await handlePaymentConfirmed(payload, asaasConfig);
        } else {
          logger.warn(`${payload.event} event without payment data: ${eventId}`);
        }
        break;
      case 'PAYMENT_OVERDUE':
        if (payload.payment) {
          await handlePaymentOverdue(payload, asaasConfig);
        } else {
          logger.warn(`PAYMENT_OVERDUE event without payment data: ${eventId}`);
        }
        break;
      case 'PAYMENT_DELETED':
        if (payload.payment) {
          await handlePaymentDeleted(payload, asaasConfig);
        } else {
          logger.warn(`PAYMENT_DELETED event without payment data: ${eventId}`);
        }
        break;
      case 'SUBSCRIPTION_CREATED':
        if (payload.subscription) {
          await handleSubscriptionCreated(payload, asaasConfig);
        } else {
          logger.warn(`SUBSCRIPTION_CREATED event without subscription data: ${eventId}`);
        }
        break;
      default:
        logger.info(`Unhandled webhook event: ${payload.event}`);
    }

  } catch (error: any) {
    logger.error('Error processing Asaas webhook:', error);
    
    // Se for erro de chave estrangeira, não relançar como erro crítico
    if (error.message && error.message.includes('chave estrangeira')) {
      logger.warn('Foreign key constraint error in webhook - data inconsistency detected');
      return; // Não relançar o erro para evitar retry infinito
    }
    
    throw new AppError(error.message || "Erro ao processar webhook do Asaas");
  }
};

// Lidar com criação de assinatura
const handleSubscriptionCreated = async (payload: WebhookPayload, asaasConfig: AsaasConfig): Promise<void> => {
  try {
    if (!payload.subscription) {
      logger.warn('Subscription data not found in payload');
      return;
    }

    // Tentar identificar a empresa pelo externalReference
    let targetCompanyId = null;
    if (payload.subscription.externalReference) {
      const match = payload.subscription.externalReference.match(/company_(\d+)_/);
      if (match) {
        targetCompanyId = parseInt(match[1]);
      }
    }

    if (!targetCompanyId) {
      logger.warn(`Could not identify company for subscription ${payload.subscription.id}`);
      return;
    }

    // Atualizar a empresa com o ID da assinatura
    const company = await Company.findByPk(targetCompanyId);
    if (company) {
      await company.update({
        asaasSubscriptionId: payload.subscription.id,
        asaasSyncedAt: new Date()
      });
      
      logger.info(`Company ${targetCompanyId} updated with subscription ${payload.subscription.id}`);
    }

  } catch (error: any) {
    logger.error('Error handling subscription created:', error);
    throw error;
  }
};

// Lidar com criação de pagamento
const handlePaymentCreated = async (payload: WebhookPayload, asaasConfig: AsaasConfig): Promise<void> => {
  try {
    if (!payload.payment) {
      logger.warn('Payment data not found in payload');
      return;
    }

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

    // Verificar se a empresa existe
    if (targetCompanyId) {
      const companyExists = await Company.findByPk(targetCompanyId);
      if (!companyExists) {
        logger.warn(`Company ${targetCompanyId} not found for payment ${payload.payment.id}`);
        targetCompanyId = null;
      }
    }

    // Se não conseguiu identificar ou empresa não existe, garantir que existe uma empresa padrão
    if (!targetCompanyId) {
      try {
        const { company } = await EnsureDefaultCompanyService();
        targetCompanyId = company.id;
        logger.info(`Using default company ${company.id} for payment ${payload.payment.id}`);
      } catch (error: any) {
        logger.error(`Failed to ensure default company for payment ${payload.payment.id}:`, error);
        return;
      }
    }

    if (!targetCompanyId) {
      logger.warn(`Could not identify any valid company for payment ${payload.payment.id}`);
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
    if (!payload.payment) {
      logger.warn('Payment data not found in payload');
      return;
    }

    // Buscar fatura existente
    const invoice = await Invoices.findOne({
      where: { asaasInvoiceId: payload.payment.id },
      include: [{ model: Company, as: 'company' }]
    });

    if (!invoice) {
      logger.warn(`Invoice not found for payment ${payload.payment.id}`);
      return;
    }

    // Verificar se a empresa da fatura ainda existe
    if (!invoice.company) {
      logger.warn(`Company not found for invoice ${invoice.id}, payment ${payload.payment.id}`);
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

    // Atualizar status da empresa e data de vencimento
    let newDueDate: string | null = null;
    
    if (invoice.companyId) {
      const company = await Company.findByPk(invoice.companyId);
      
      if (company) {
        // Calcular nova data de vencimento (próximo mês a partir de hoje)
        newDueDate = moment().add(1, 'month').format('YYYY-MM-DD');
        
        try {
          // Usar o serviço de sincronização para atualizar a data de vencimento
          await SyncCompanyDueDateService({
            companyId: invoice.companyId,
            dueDate: newDueDate,
            updateAsaas: false, // Não atualizar Asaas pois o pagamento já foi processado
            updateTrialExpiration: false // Não alterar trial quando pagamento é confirmado
          });
          
          logger.info(`Company ${company.name} due date updated to ${newDueDate} after payment confirmation`);
        } catch (error: any) {
          logger.error(`Error updating company due date after payment: ${error.message}`);
          
          // Fallback robusto: ativar empresa e limpar trial
          await Company.update(
            { 
              status: true,
              dueDate: newDueDate,
              trialExpiration: null // Remover período de trial
            },
            { where: { id: invoice.companyId } }
          );
          
          logger.info(`Company ${invoice.companyId} activated via fallback after payment confirmation`);
        }
        
        // Recarregar empresa para pegar dados atualizados
        await company.reload();
      }

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
        },
        company: {
          id: invoice.companyId,
          status: true,
          newDueDate: newDueDate,
          trialExpiration: null
        }
      });
      
      // Emitir evento específico para recarregar dados da empresa no frontend
      io.emit(`company-${invoice.companyId}-status-updated`, {
        action: "company_reactivated",
        company: {
          id: invoice.companyId,
          status: true,
          dueDate: newDueDate,
          isExpired: false,
          isInTrial: false
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
    if (!payload.payment) {
      logger.warn('Payment data not found in payload');
      return;
    }

    // Buscar fatura existente
    const invoice = await Invoices.findOne({
      where: { asaasInvoiceId: payload.payment.id },
      include: [{ model: Company, as: 'company' }]
    });

    if (!invoice) {
      logger.warn(`Invoice not found for payment ${payload.payment.id}`);
      return;
    }

    // Atualizar status da fatura
    await invoice.update({
      status: payload.payment.status
    });

    // Bloquear a empresa quando a fatura vence
    if (invoice.companyId && invoice.company) {
      const company = await Company.findByPk(invoice.companyId);
      
      if (company) {
        // Desativar a empresa
        await company.update({
          status: false // Bloquear empresa
        });
        
        logger.info(`Company ${company.name} (ID: ${company.id}) blocked due to overdue payment ${payload.payment.id}`);
        
        // Emitir evento via Socket.IO para notificar o frontend sobre o bloqueio
        const io = getIO();
        io.emit(`company-${invoice.companyId}-status-updated`, {
          action: "company_blocked",
          company: {
            id: invoice.companyId,
            status: false,
            isExpired: true,
            reason: "payment_overdue"
          },
          invoice: {
            id: invoice.id,
            status: payload.payment.status,
            asaasInvoiceId: payload.payment.id
          }
        });
      }
    }

    // Emitir evento via Socket.IO para atualizar a interface em tempo real
    if (invoice.companyId) {
      const io = getIO();
      io.emit(`company-${invoice.companyId}-invoice-updated`, {
        action: "payment_overdue",
        invoice: {
          id: invoice.id,
          status: payload.payment.status,
          asaasInvoiceId: payload.payment.id
        }
      });
    }

    logger.info(`Payment overdue for invoice ${invoice.id} - Company blocked`);

  } catch (error: any) {
    logger.error('Error handling payment overdue:', error);
    throw error;
  }
};

// Lidar com exclusão de pagamento
const handlePaymentDeleted = async (payload: WebhookPayload, asaasConfig: AsaasConfig): Promise<void> => {
  try {
    if (!payload.payment) {
      logger.warn('Payment data not found in payload');
      return;
    }

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