import { verify } from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";
import moment from "moment";
import { logger } from "../utils/logger";
import AppError from "../errors/AppError";
import authConfig from "../config/auth";
import Company from "../models/Company";

interface TokenPayload {
  id: string;
  username: string;
  profile: string;
  companyId: number;
  iat: number;
  exp: number;
}

// Rotas permitidas para empresas vencidas (apenas financeiro)
const ALLOWED_EXPIRED_ROUTES = [
  '/invoices',
  '/companies/check-expiration',
  '/auth/logout',
  '/auth/me',
  '/auth/refresh_token'
];

const isAuthWithExpiredAccess = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    throw new AppError("ERR_SESSION_EXPIRED", 401);
  }

  const [, token] = authHeader.split(" ");

  try {
    const decoded = verify(token, authConfig.secret);
    const { id, profile, companyId } = decoded as TokenPayload;
    
    req.user = {
      id,
      profile,
      companyId
    };

    // Buscar informações da empresa
    const company = await Company.findByPk(companyId);
    
    if (!company) {
      throw new AppError("Empresa não encontrada", 404);
    }

    // Verificar se a empresa está ativa ou em período de avaliação
    const now = moment();
    let isCompanyActive = company.status;
    let isInTrial = false;
    let isExpired = false;

    // Verificar período de avaliação
    if (company.trialExpiration) {
      const trialExpiration = moment(company.trialExpiration);
      isInTrial = trialExpiration.isAfter(now);
      
      if (isInTrial) {
        isCompanyActive = true;
      }
    }

    // Verificar data de vencimento
    if (company.dueDate && !isInTrial) {
      const dueDate = moment(company.dueDate);
      isExpired = dueDate.isBefore(now);
      
      if (isExpired) {
        isCompanyActive = false;
      }
    }

    // Verificar se é super admin - super admins nunca são bloqueados
    const isSuperAdmin = profile === 'super' || profile === 'admin';
    
    // Se a empresa está inativa/vencida E o usuário NÃO é super admin, verificar se a rota é permitida
    if (!isCompanyActive && !isInTrial && !isSuperAdmin) {
      const requestPath = req.path;
      const isAllowedRoute = ALLOWED_EXPIRED_ROUTES.some(allowedRoute => 
        requestPath.startsWith(allowedRoute)
      );

      if (!isAllowedRoute) {
        // Adicionar informações sobre o status da empresa na resposta
        const errorMessage = isExpired 
          ? `Acesso restrito: Empresa vencida em ${moment(company.dueDate).format('DD/MM/YYYY')}. Acesse apenas o financeiro para regularizar.`
          : "Acesso restrito: Empresa inativa. Acesse apenas o financeiro para regularizar.";
          
        throw new AppError(errorMessage, 402); // 402 Payment Required
      }
    }

    // Adicionar informações da empresa ao request para uso posterior
    req.company = {
      id: company.id,
      name: company.name,
      status: isCompanyActive,
      isInTrial,
      isExpired,
      dueDate: company.dueDate,
      trialExpiration: company.trialExpiration
    };

  } catch (err: any) {
    if (err instanceof AppError) {
      throw err;
    }
    throw new AppError("Invalid token. We'll try to assign a new one on next request", 403);
  }

  return next();
};

export default isAuthWithExpiredAccess;