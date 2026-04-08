const prisma = require('../config/prisma');

async function findAllByUser(userId) {
  return prisma.character.findMany({
    where: { userId },
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true, name: true, race: true, class: true, subclass: true,
      level: true, currentHitPoints: true, maxHitPoints: true,
      armorClass: true, updatedAt: true
    }
  });
}

async function findById(id) {
  return prisma.character.findUnique({ where: { id } });
}

async function create(userId, data) {
  return prisma.character.create({
    data: { ...data, userId }
  });
}

async function update(id, data) {
  return prisma.character.update({
    where: { id },
    data
  });
}

async function remove(id) {
  return prisma.character.delete({ where: { id } });
}

module.exports = { findAllByUser, findById, create, update, remove };
