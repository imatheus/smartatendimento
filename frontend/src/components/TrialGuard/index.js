import React, { useContext, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import moment from "moment";
import { AuthContext } from "../../context/Auth/AuthContext";

const TrialGuard = ({ children }) => {
  const { user } = useContext(AuthContext);
  const history = useHistory();
  const location = useLocation();

  const isCompanyExpiredOrInactive = () => {
    // Super admins nunca são bloqueados
    if (user?.profile === 'super' || user?.super === true) return false;
    
    // Verificar se a empresa está vencida ou inativa
    if (!user?.company) return false;
    
    const company = user.company;
    
    // Se está em período de trial ativo, permitir acesso
    if (company.isInTrial) return false;
    
    // Se está vencida ou inativa, restringir acesso
    return company.isExpired || !company.status;
  };

  const isFinanceiroPage = () => {
    return location.pathname === "/financeiro";
  };

  const isLoginPage = () => {
    return location.pathname === "/login";
  };

  const isSignupPage = () => {
    return location.pathname === "/signup";
  };

  useEffect(() => {
    // Só verificar se o usuário está logado e não está nas páginas permitidas
    if (user && user.company && !isLoginPage() && !isSignupPage()) {
      if (isCompanyExpiredOrInactive() && !isFinanceiroPage()) {
        // Redirecionar para a página financeira se a empresa está vencida/inativa
        history.push("/financeiro");
      }
    }
  }, [user, location.pathname, history]);

  // Se a empresa está vencida/inativa e não está na página financeira, não renderizar o conteúdo
  if (user && user.company && isCompanyExpiredOrInactive() && !isFinanceiroPage() && !isLoginPage() && !isSignupPage()) {
    return null; // Não renderizar nada enquanto redireciona
  }

  return children;
};

export default TrialGuard;