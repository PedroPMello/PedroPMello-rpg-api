const prisma = require('../config/prisma');

async function findByEmail(email) {
  return prisma.user.findUnique({ where: { email } });
}

async function findById(id) {
  return prisma.user.findUnique({
    where: { id },
    select: { id: true, name: true, email: true, createdAt: true }
  });
}

async function create({ name, email, password }) {
  return prisma.user.create({
    data: { name, email, password },
    select: { id: true, name: true, email: true, createdAt: true }
  });
}

module.exports = { findByEmail, findById, create };
