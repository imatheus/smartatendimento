import Invoice from "../../models/Invoices";
import Company from "../../models/Company";
import Plan from "../../models/Plan";
import AppError from "../../errors/AppError";

interface InvoiceData {
  companyId: number;
  detail?: string;
  value?: number;
  dueDate?: string;
}

const CreateInvoiceService = async (data: InvoiceData): Promise<Invoice> => {
  const { companyId, detail, value, dueDate } = data;

  // Buscar dados da empresa
  const company = await Company.findByPk(companyId, {
    include: [{ model: Plan, as: "plan" }]
  });

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  if (!company.plan) {
    throw new AppError("ERR_NO_PLAN_FOUND", 404);
  }

  // Definir valores padrão se não fornecidos
  const invoiceDetail = detail || `Mensalidade ${company.plan.name} - ${company.name}`;
  const invoiceValue = value || company.plan.value;
  const invoiceDueDate = dueDate || company.dueDate;

  // Verificar se já existe fatura para esta data
  const existingInvoice = await Invoice.findOne({
    where: {
      companyId,
      dueDate: invoiceDueDate,
      status: ["pending", "paid"]
    }
  });

  if (existingInvoice) {
    throw new AppError("ERR_INVOICE_ALREADY_EXISTS", 400);
  }

  // Criar a fatura
  const invoice = await Invoice.create({
    companyId,
    detail: invoiceDetail,
    value: invoiceValue,
    dueDate: invoiceDueDate,
    status: "pending"
  });

  return invoice;
};

export default CreateInvoiceService;