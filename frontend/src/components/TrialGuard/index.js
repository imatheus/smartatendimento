import React, { useContext, useEffect } from "react";
import { useHistory, useLocation } from "react-router-dom";
import moment from "moment";
import { AuthContext } from "../../context/Auth/AuthContext";

const TrialGuard = ({ children }) => {
  const { user } = useContext(AuthContext);
  const history = useHistory();
  const location = useLocation();

  const isTrialExpired = () => {
    // Se a empresa tem uma data de vencimento definida, não está mais em período de trial
    if (user?.company?.dueDate) return false;
    
    // Se não tem trialExpiration, não está em trial
    if (!user?.company?.trialExpiration) return false;
    
    const trialExpiration = moment(user.company.trialExpiration);
    const now = moment();
    
    // Verificar se o período de teste expirou
    return now.isAfter(trialExpiration);
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
      if (isTrialExpired() && !isFinanceiroPage()) {
        // Redirecionar para a página financeira se o trial expirou
        history.push("/financeiro");
      }
    }
  }, [user, location.pathname, history]);

  // Se o trial expirou e não está na página financeira, não renderizar o conteúdo
  if (user && user.company && isTrialExpired() && !isFinanceiroPage() && !isLoginPage() && !isSignupPage()) {
    return null; // Não renderizar nada enquanto redireciona
  }

  return children;
};

export default TrialGuard;