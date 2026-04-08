function errorHandler(err, req, res, next) {
  console.error(`[ERROR] ${err.message}`);

  if (err.code === 'P2002') {
    return res.status(409).json({ error: 'Já existe um registro com esse valor único.' });
  }
  if (err.code === 'P2025') {
    return res.status(404).json({ error: 'Registro não encontrado.' });
  }


  if (err.status) {
    return res.status(err.status).json({ error: err.message });
  }


  return res.status(500).json({ error: 'Erro interno do servidor.' });
}

function createError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

module.exports = { errorHandler, createError };
