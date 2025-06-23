import { useState, useEffect, useContext } from "react";
import { AuthContext } from "../context/Auth/AuthContext";
import moment from "moment";
import { socketConnection } from "../services/socket";
import { toast } from "react-toastify";
import api from "../services/api";

// Flag global para evitar múltiplos toasts de pagamento confirmado
let globalPaymentToastShown = false;

const useCompanyStatus = () => {
  const { user, refreshUserData } = useContext(AuthContext);
  const [companyStatus, setCompanyStatus] = useState({
    isActive: true,
    isInTrial: false,
    isExpired: false,
    daysRemaining: 0,
    message: ""
  });

  // Função para calcular o status da empresa de forma consistente
  const calculateCompanyStatus = (company) => {
    if (!company) {
      return {
        isActive: false,
        isInTrial: false,
        isExpired: true,
        daysRemaining: 0,
        message: "Empresa não encontrada"
      };
    }

    const now = moment();
    let isActive = company.status;
    let isInTrial = false;
    let isExpired = false;
    let daysRemaining = 0;
    let message = "";

    // Verificar período de avaliação primeiro
    if (company.trialExpiration) {
      const trialExpiration = moment(company.trialExpiration);
      isInTrial = trialExpiration.isAfter(now);
      
      if (isInTrial) {
        isActive = true;
        isExpired = false;
        daysRemaining = Math.ceil(trialExpiration.diff(now, 'days', true));
        message = `Período de avaliação - ${daysRemaining} ${daysRemaining === 1 ? 'dia restante' : 'dias restantes'}`;
      } else {
        // Trial expirou, verificar data de vencimento
        if (company.dueDate) {
          const dueDate = moment(company.dueDate);
          isExpired = dueDate.isBefore(now);
          isActive = !isExpired;
          
          if (isExpired) {
            const daysExpired = Math.ceil(now.diff(dueDate, 'days', true));
            message = `Empresa vencida há ${daysExpired} ${daysExpired === 1 ? 'dia' : 'dias'}`;
          } else {
            daysRemaining = Math.ceil(dueDate.diff(now, 'days', true));
            message = `Empresa ativa - vence em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}`;
          }
        } else {
          // Sem data de vencimento e trial expirado
          isExpired = true;
          isActive = false;
          message = "Período de avaliação expirado";
        }
      }
    } else if (company.dueDate) {
      // Não está em trial, verificar apenas data de vencimento
      const dueDate = moment(company.dueDate);
      isExpired = dueDate.isBefore(now);
      isActive = !isExpired;
      
      if (isExpired) {
        const daysExpired = Math.ceil(now.diff(dueDate, 'days', true));
        message = `Empresa vencida há ${daysExpired} ${daysExpired === 1 ? 'dia' : 'dias'}`;
      } else {
        daysRemaining = Math.ceil(dueDate.diff(now, 'days', true));
        message = `Empresa ativa - vence em ${daysRemaining} ${daysRemaining === 1 ? 'dia' : 'dias'}`;
      }
    } else {
      // Sem trial e sem data de vencimento - considerar ativa por padrão
      isActive = company.status;
      message = isActive ? "Empresa ativa" : "Empresa inativa";
    }

    return {
      isActive,
      isInTrial,
      isExpired,
      daysRemaining,
      message
    };
  };

  // Função para sincronizar status com o backend
  const syncStatusWithBackend = async () => {
    try {
      const { data } = await api.get("/companies/status");
      if (data.success) {
        const backendStatus = {
          isActive: data.data.company.status,
          isInTrial: data.data.isInTrial,
          isExpired: data.data.isExpired,
          daysRemaining: 0, // Será calculado pelo frontend
          message: data.data.message
        };
        
        // Calcular dias restantes baseado nos dados do backend
        if (data.data.isInTrial && data.data.company.trialExpiration) {
          const trialExpiration = moment(data.data.company.trialExpiration);
          const now = moment();
          backendStatus.daysRemaining = Math.ceil(trialExpiration.diff(now, 'days', true));
        } else if (!data.data.isExpired && data.data.company.dueDate) {
          const dueDate = moment(data.data.company.dueDate);
          const now = moment();
          backendStatus.daysRemaining = Math.ceil(dueDate.diff(now, 'days', true));
        }
        
        setCompanyStatus(backendStatus);
        return backendStatus;
      }
    } catch (error) {
      console.error("Erro ao sincronizar status com backend:", error);
      // Fallback para cálculo local
      if (user?.company) {
        const status = calculateCompanyStatus(user.company);
        setCompanyStatus(status);
        return status;
      }
    }
  };

  // Atualizar status quando o usuário mudar
  useEffect(() => {
    if (user?.company) {
      // Primeiro usar dados locais
      const localStatus = calculateCompanyStatus(user.company);
      setCompanyStatus(localStatus);
      
      // Depois sincronizar com backend
      syncStatusWithBackend();
    }
  }, [user?.company]);

  // Socket listeners para atualizações em tempo real
  useEffect(() => {
    // Só executa se companyId for um número válido e positivo
    const companyIdNum = Number(user?.companyId);
    if (!user?.companyId || isNaN(companyIdNum) || companyIdNum <= 0) {
      if (user?.companyId !== undefined) {
        console.warn('Tentativa de conectar socket com companyId inválido:', user?.companyId);
      }
      return;
    }
    
    // Verificar se o usuário tem uma empresa válida antes de conectar
    if (!user?.company?.id) {
      console.warn('Usuário não possui empresa válida para conectar socket');
      return;
    }
    
    const socket = socketConnection({ companyId: companyIdNum });

    // Listener para mudanças de status da empresa
    socket.on(`company-${companyIdNum}-status-updated`, async (data) => {
      console.log('Status da empresa atualizado via socket:', data);
      
      if (data.action === "company_reactivated") {
        toast.success(`Todas as funcionalidades foram liberadas`);
        
        // Atualizar dados do usuário e sincronizar status
        await refreshUserData();
        await syncStatusWithBackend();
        
        // Recarregar a página após 2 segundos para garantir que tudo seja atualizado
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      } else if (data.action === "company_blocked") {
        toast.error(`Sistema bloqueado por falta de pagamento.`);
        
        // Atualizar dados do usuário e sincronizar status
        await refreshUserData();
        await syncStatusWithBackend();
        
        // Recarregar a página após 2 segundos
        setTimeout(() => {
          window.location.reload();
        }, 2000);
      }
    });

    // Listener para pagamentos confirmados
    socket.on(`company-${companyIdNum}-invoice-paid`, async (data) => {
      if (data.action === "payment_confirmed" && !globalPaymentToastShown) {
        globalPaymentToastShown = true;
        toast.success(`Pagamento confirmado!`);
        await refreshUserData();
        await syncStatusWithBackend();
        setTimeout(() => {
          window.location.reload();
          globalPaymentToastShown = false; // libera para o próximo evento após reload
        }, 2000);
      }
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.companyId, refreshUserData, syncStatusWithBackend]);

  // Função para verificar se o usuário é super admin
  const isSuperAdmin = () => {
    return user?.profile === 'super' || user?.super === true;
  };

  // Função para verificar se a empresa está bloqueada
  const isCompanyBlocked = () => {
    // Super admins nunca são bloqueados
    if (isSuperAdmin()) return false;
    
    // Se não está ativa e não está em trial, está bloqueada
    return !companyStatus.isActive && !companyStatus.isInTrial;
  };

  // Função para verificar se deve mostrar aviso de vencimento próximo
  const shouldShowExpirationWarning = () => {
    if (isSuperAdmin()) return false;
    if (companyStatus.isExpired || companyStatus.isInTrial) return false;
    
    return companyStatus.daysRemaining <= 5 && companyStatus.daysRemaining > 0;
  };

  return {
    companyStatus,
    isCompanyBlocked: isCompanyBlocked(),
    isSuperAdmin: isSuperAdmin(),
    shouldShowExpirationWarning: shouldShowExpirationWarning(),
    calculateCompanyStatus // Exportar para uso em outros componentes
  };
};

export default useCompanyStatus;