const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userDao = require('../dao/user.dao');
const { createError } = require('../middlewares/errorHandler');

const JWT_SECRET = process.env.JWT_SECRET || 'dnd-api-secret-dev';
const JWT_EXPIRES_IN = '7d';

async function register({ name, email, password }) {
  if (!name || !email || !password) {
    throw createError(400, 'name, email e password são obrigatórios.');
  }
  if (password.length < 6) {
    throw createError(400, 'A senha deve ter pelo menos 6 caracteres.');
  }

  const existing = await userDao.findByEmail(email);
  if (existing) {
    throw createError(409, 'Este e-mail já está cadastrado.');
  }

  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await userDao.create({ name, email, password: hashedPassword });

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });

  return { user, token };
}

async function login({ email, password }) {
  if (!email || !password) {
    throw createError(400, 'email e password são obrigatórios.');
  }

  const user = await userDao.findByEmail(email);
  if (!user) {
    throw createError(401, 'E-mail ou senha inválidos.');
  }

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) {
    throw createError(401, 'E-mail ou senha inválidos.');
  }

  const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN
  });

  const { password: _, ...userWithoutPassword } = user;
  return { user: userWithoutPassword, token };
}

module.exports = { register, login };
