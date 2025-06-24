import Invoice from "../../models/Invoices";
import Company from "../../models/Company";
import Plan from "../../models/Plan";
import CompanyPlan from "../../models/CompanyPlan";
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
  const company = await Company.findByPk(companyId);

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  // Buscar o plano personalizado da empresa
  const companyPlan = await CompanyPlan.findOne({
    where: {
      companyId,
      isActive: true
    },
    include: [{ model: Plan, as: 'basePlan' }]
  });

  if (!companyPlan) {
    throw new AppError("ERR_NO_COMPANY_PLAN_FOUND", 404);
  }

  // Definir valores padrão se não fornecidos
  const invoiceDetail = detail || `Mensalidade ${companyPlan.name}`;
  const invoiceValue = value || companyPlan.totalValue; // Usar valor total do plano personalizado
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