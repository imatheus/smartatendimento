import { socketConnection } from "../services/socket";

/**
 * Valida se um companyId é válido
 * @param {any} companyId - O ID da empresa a ser validado
 * @returns {boolean} - true se válido, false caso contrário
 */
export const isValidCompanyId = (companyId) => {
  const companyIdNum = Number(companyId);
  return companyId && !isNaN(companyIdNum) && companyIdNum > 0;
};

/**
 * Cria uma conexão socket segura com validação de companyId
 * @param {any} companyId - O ID da empresa
 * @param {string} context - Contexto para logs (opcional)
 * @returns {object|null} - Socket connection ou null se inválido
 */
export const createSafeSocketConnection = (companyId, context = 'Unknown') => {
  if (!isValidCompanyId(companyId)) {
    console.warn(`${context}: companyId inválido, não conectando socket:`, companyId);
    return null;
  }

  const companyIdNum = Number(companyId);
  return socketConnection({ companyId: companyIdNum });
};

/**
 * Obtém o companyId do localStorage de forma segura
 * @returns {number|null} - companyId válido ou null
 */
export const getSafeCompanyId = () => {
  const companyId = localStorage.getItem("companyId");
  return isValidCompanyId(companyId) ? Number(companyId) : null;
};

/**
 * Obtém o userId do localStorage de forma segura
 * @returns {number|null} - userId válido ou null
 */
export const getSafeUserId = () => {
  const userId = localStorage.getItem("userId");
  const userIdNum = Number(userId);
  return userId && !isNaN(userIdNum) && userIdNum > 0 ? userIdNum : null;
};