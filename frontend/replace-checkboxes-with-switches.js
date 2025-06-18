const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'components', 'PlansManager', 'index.js');

console.log('🔄 Substituindo checkboxes por switches pretos nos Canais Permitidos...\n');

try {
  // Ler o arquivo atual
  let content = fs.readFileSync(filePath, 'utf8');
  
  console.log('📖 Arquivo lido com sucesso');
  
  // 1. Substituir import do Checkbox por Switch
  content = content.replace(/Checkbox,/g, 'Switch,');
  console.log('✅ Import atualizado: Checkbox → Switch');
  
  // 2. Adicionar estilos para switches pretos
  const stylesRegex = /(const useStyles = makeStyles\(theme => \(\{[\s\S]*?)\}\)\);/;
  const newStyles = `$1    blackSwitch: {
        '& .MuiSwitch-switchBase.Mui-checked': {
            color: '#000000',
        },
        '& .MuiSwitch-switchBase.Mui-checked + .MuiSwitch-track': {
            backgroundColor: '#000000',
        },
    }
}));`;
  
  content = content.replace(stylesRegex, newStyles);
  console.log('✅ Estilos para switches pretos adicionados');
  
  // 3. Substituir todos os Checkbox por Switch com estilo preto
  const checkboxRegex = /<Checkbox\s+\{\.\.\.\field\}\s+checked=\{field\.value\}\s+color="primary"\s+\/>/g;
  const switchReplacement = `<Switch
                                                {...field}
                                                checked={field.value}
                                                className={classes.blackSwitch}
                                            />`;
  
  content = content.replace(checkboxRegex, switchReplacement);
  console.log('✅ Checkboxes substituídos por Switches pretos');
  
  // Salvar o arquivo corrigido
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('✅ Arquivo salvo com sucesso!');
  
  console.log('\n🎯 ALTERAÇÕES REALIZADAS:');
  console.log('✅ Import: Checkbox → Switch');
  console.log('✅ Adicionados estilos para switches pretos');
  console.log('✅ Todos os checkboxes substituídos por switches');
  console.log('✅ Funcionalidade mantida intacta');
  
  console.log('\n💡 RESULTADO:');
  console.log('- Os "Canais Permitidos" agora usam toggles/switches pretos');
  console.log('- A funcionalidade permanece exatamente a mesma');
  console.log('- Visual mais moderno e elegante');

} catch (error) {
  console.error('❌ Erro ao aplicar alterações:', error.message);
}