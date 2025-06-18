-- Script para verificar e limpar registros órfãos nas tabelas de associação

-- 1. Verificar registros órfãos na tabela WhatsappQueues
SELECT 'WhatsappQueues órfãos' as tabela, COUNT(*) as total
FROM "WhatsappQueues" wq
WHERE wq."queueId" NOT IN (SELECT id FROM "Queues")
   OR wq."whatsappId" NOT IN (SELECT id FROM "Whatsapps");

-- 2. Verificar registros órfãos na tabela UserQueues
SELECT 'UserQueues órfãos' as tabela, COUNT(*) as total
FROM "UserQueues" uq
WHERE uq."queueId" NOT IN (SELECT id FROM "Queues")
   OR uq."userId" NOT IN (SELECT id FROM "Users");

-- 3. Mostrar detalhes dos registros órfãos em WhatsappQueues
SELECT 'WhatsappQueues órfãos - Detalhes' as info, 
       wq."whatsappId", 
       wq."queueId",
       CASE 
         WHEN w.id IS NULL THEN 'WhatsApp não existe'
         WHEN q.id IS NULL THEN 'Queue não existe'
         ELSE 'OK'
       END as status
FROM "WhatsappQueues" wq
LEFT JOIN "Whatsapps" w ON w.id = wq."whatsappId"
LEFT JOIN "Queues" q ON q.id = wq."queueId"
WHERE w.id IS NULL OR q.id IS NULL;

-- 4. Mostrar detalhes dos registros órfãos em UserQueues
SELECT 'UserQueues órfãos - Detalhes' as info,
       uq."userId",
       uq."queueId",
       CASE 
         WHEN u.id IS NULL THEN 'User não existe'
         WHEN q.id IS NULL THEN 'Queue não existe'
         ELSE 'OK'
       END as status
FROM "UserQueues" uq
LEFT JOIN "Users" u ON u.id = uq."userId"
LEFT JOIN "Queues" q ON q.id = uq."queueId"
WHERE u.id IS NULL OR q.id IS NULL;

-- 5. Limpar registros órfãos (DESCOMENTE PARA EXECUTAR)
-- DELETE FROM "WhatsappQueues" 
-- WHERE "queueId" NOT IN (SELECT id FROM "Queues")
--    OR "whatsappId" NOT IN (SELECT id FROM "Whatsapps");

-- DELETE FROM "UserQueues" 
-- WHERE "queueId" NOT IN (SELECT id FROM "Queues")
--    OR "userId" NOT IN (SELECT id FROM "Users");

-- 6. Verificar setores existentes
SELECT 'Setores existentes' as info, id, name, "companyId" 
FROM "Queues" 
ORDER BY "companyId", name;

-- 7. Verificar associações WhatsApp-Queue
SELECT 'Associações WhatsApp-Queue' as info,
       w.id as whatsapp_id,
       w.name as whatsapp_name,
       w."companyId",
       q.id as queue_id,
       q.name as queue_name
FROM "WhatsappQueues" wq
JOIN "Whatsapps" w ON w.id = wq."whatsappId"
JOIN "Queues" q ON q.id = wq."queueId"
ORDER BY w."companyId", w.name, q.name;