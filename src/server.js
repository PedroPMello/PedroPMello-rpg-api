require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log('');
  console.log('D&D Character Sheet API');
  console.log(`Servidor rodando em http://localhost:${PORT}`);
  console.log(`Documentação em  http://localhost:${PORT}/api-docs`);
  console.log(`Health check em  http://localhost:${PORT}/health`);
  console.log('');
});
