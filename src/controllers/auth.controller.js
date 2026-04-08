const authService = require('../services/auth.service');

async function register(req, res, next) {
  try {
    const { user, token } = await authService.register(req.body);
    res.status(201).json({ message: 'Usuário criado com sucesso.', user, token });
  } catch (err) {
    next(err);
  }
}

async function login(req, res, next) {
  try {
    const { user, token } = await authService.login(req.body);
    res.status(200).json({ message: 'Login realizado com sucesso.', user, token });
  } catch (err) {
    next(err);
  }
}

async function me(req, res, next) {
  try {
    const userDao = require('../dao/user.dao');
    const user = await userDao.findById(req.userId);
    if (!user) return res.status(404).json({ error: 'Usuário não encontrado.' });
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
