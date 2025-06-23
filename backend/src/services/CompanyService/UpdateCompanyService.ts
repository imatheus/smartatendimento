import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import Setting from "../../models/Setting";

interface CompanyData {
  name: string;
  id?: number | string;
  phone?: string;
  email?: string;
  status?: boolean;
  planId?: number;
  campaignsEnabled?: boolean;
  dueDate?: string;
  recurrence?: string;
  trialExpiration?: string;
}

const UpdateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {
  const company = await Company.findByPk(companyData.id);
  const {
    name,
    phone,
    email,
    status,
    planId,
    campaignsEnabled,
    dueDate,
    recurrence,
    trialExpiration
  } = companyData;

  if (!company) {
    throw new AppError("ERR_NO_COMPANY_FOUND", 404);
  }

  // Se uma dueDate está sendo definida, remover o trialExpiration
  const updateData: any = {
    name,
    phone,
    email,
    status,
    planId,
    dueDate,
    recurrence
  };

  // Se está definindo uma dueDate, remover o período de trial
  if (dueDate) {
    updateData.trialExpiration = null;
  } else if (trialExpiration !== undefined) {
    // Só atualizar trialExpiration se não estiver definindo dueDate
    updateData.trialExpiration = trialExpiration ? new Date(trialExpiration) : null;
  }

  await company.update(updateData);

  if (companyData.campaignsEnabled !== undefined) {
    const [setting, created] = await Setting.findOrCreate({
      where: {
        companyId: company.id,
        key: "campaignsEnabled"
      },
      defaults: {
        companyId: company.id,
        key: "campaignsEnabled",
        value: `${campaignsEnabled}`
      }
    });
    if (!created) {
      await setting.update({ value: `${campaignsEnabled}` });
    }
  }

  return company;
};

export default UpdateCompanyService;
