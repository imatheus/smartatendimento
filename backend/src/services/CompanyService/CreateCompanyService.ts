import * as Yup from "yup";
import AppError from "../../errors/AppError";
import Company from "../../models/Company";
import User from "../../models/User";
import Setting from "../../models/Setting";
import CreateCompanyPlanService from "../CompanyPlanService/CreateCompanyPlanService";

interface CompanyData {
  name: string;
  phone?: string;
  email?: string;
  password?: string;
  fullName?: string;
  document?: string;
  status?: boolean;
  planId?: number;
  users?: number; // Número de licenças/usuários
  campaignsEnabled?: boolean;
  dueDate?: string;
  recurrence?: string;
  trialExpiration?: string;
}

const CreateCompanyService = async (
  companyData: CompanyData
): Promise<Company> => {
  const {
    name,
    phone,
    email,
    status,
    planId,
    users = 1, // Default para 1 usuário
    password,
    fullName,
    document,
    campaignsEnabled,
    dueDate,
    recurrence,
    trialExpiration
  } = companyData;

  const companySchema = Yup.object().shape({
    name: Yup.string()
      .min(2, "ERR_COMPANY_INVALID_NAME")
      .required("ERR_COMPANY_INVALID_NAME"),
    email: Yup.string()
      .email("ERR_COMPANY_INVALID_EMAIL")
      .required("ERR_COMPANY_EMAIL_REQUIRED")
      .test(
        "Check-unique-email",
        "ERR_COMPANY_EMAIL_ALREADY_EXISTS",
        async value => {
          if (value) {
            const companyWithSameEmail = await Company.findOne({
              where: { email: value }
            });

            return !companyWithSameEmail;
          }
          return false;
        }
      ),
    document: Yup.string()
      .required("ERR_COMPANY_DOCUMENT_REQUIRED")
      .test(
        "Check-unique-document",
        "ERR_COMPANY_DOCUMENT_ALREADY_EXISTS",
        async value => {
          if (value) {
            const companyWithSameDocument = await Company.findOne({
              where: { document: value }
            });

            return !companyWithSameDocument;
          }
          return false;
        }
      )
  });

  try {
    await companySchema.validate({ name, email, document });
  } catch (err: any) {
    throw new AppError(err.message);
  }

  const company = await Company.create({
    name,
    phone,
    email,
    fullName,
    document,
    status,
    planId,
    dueDate,
    recurrence,
    trialExpiration: trialExpiration ? new Date(trialExpiration) : undefined
  });

  // Criar o plano personalizado da empresa
  if (planId) {
    try {
      await CreateCompanyPlanService({
        companyId: company.id,
        basePlanId: planId,
        users
      });
    } catch (error) {
      console.error("Erro ao criar plano da empresa:", error);
      // Não falha a criação da empresa se houver erro no plano
    }
  }

  const [user, created] = await User.findOrCreate({
    where: { name, email },
    defaults: {
      name: name,
      email: email,
      password: password || "mudar123",
      profile: "admin",
      companyId: company.id
    }
  });

  if (!created) {
    await user.update({ companyId: company.id });
  }

  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "asaas"
    },
    defaults: {
      companyId: company.id,
      key: "asaas",
      value: ""
    },
  });

  //tokenixc
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "tokenixc"
    },
    defaults: {
      companyId: company.id,
      key: "tokenixc",
      value: ""
    },
  });

  //ipixc
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "ipixc"
    },
    defaults: {
      companyId: company.id,
      key: "ipixc",
      value: ""
    },
  });

  //ipmkauth
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "ipmkauth"
    },
    defaults: {
      companyId: company.id,
      key: "ipmkauth",
      value: ""
    },
  });

  //clientsecretmkauth
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "clientsecretmkauth"
    },
    defaults: {
      companyId: company.id,
      key: "clientsecretmkauth",
      value: ""
    },
  });

  //clientidmkauth
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "clientidmkauth"
    },
    defaults: {
      companyId: company.id,
      key: "clientidmkauth",
      value: ""
    },
  });

  //CheckMsgIsGroup
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "CheckMsgIsGroup"
    },
    defaults: {
      companyId: company.id,
      key: "enabled",
      value: ""
    },
  });

  //CheckMsgIsGroup
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: ""
    },
    defaults: {
      companyId: company.id,
      key: "call",
      value: "disabled"
    },
  });

  //scheduleType
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "scheduleType"
    },
    defaults: {
      companyId: company.id,
      key: "scheduleType",
      value: "disabled"
    },
  });

  //userRating
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "userRating"
    },
    defaults: {
      companyId: company.id,
      key: "userRating",
      value: "disabled"
    },
  });

  //userRating
  await Setting.findOrCreate({
    where: {
      companyId: company.id,
      key: "chatBotType"
    },
    defaults: {
      companyId: company.id,
      key: "chatBotType",
      value: "text"
    },
  });

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
      },

    });
    if (!created) {
      await setting.update({ value: `${campaignsEnabled}` });
    }
  }

  return company;
};

export default CreateCompanyService;