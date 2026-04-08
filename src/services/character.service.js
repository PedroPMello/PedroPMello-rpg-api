const characterDao = require('../dao/character.dao');
const { createError } = require('../middlewares/errorHandler');

function calcModifier(score) {
  return Math.floor((score - 10) / 2);
}

function calcProficiencyBonus(level) {
  return Math.ceil(level / 4) + 1;
}

function enrichCharacter(char) {
  return {
    ...char,
    computed: {
      strengthModifier:     calcModifier(char.strength),
      dexterityModifier:    calcModifier(char.dexterity),
      constitutionModifier: calcModifier(char.constitution),
      intelligenceModifier: calcModifier(char.intelligence),
      wisdomModifier:       calcModifier(char.wisdom),
      charismaModifier:     calcModifier(char.charisma),
      proficiencyBonus:     calcProficiencyBonus(char.level),
      passivePerception:    10 + calcModifier(char.wisdom),
      isAlive:              char.currentHitPoints > 0,
    }
  };
}

const VALID_RACES = [
  'Human', 'Elf', 'Dwarf', 'Halfling', 'Gnome',
  'Half-Elf', 'Half-Orc', 'Tiefling', 'Dragonborn'
];

const VALID_CLASSES = [
  'Barbarian', 'Bard', 'Cleric', 'Druid', 'Fighter',
  'Monk', 'Paladin', 'Ranger', 'Rogue', 'Sorcerer',
  'Warlock', 'Wizard', 'Artificer'
];

function validateCharacterData(data, isCreate = false) {
  if (isCreate) {
    if (!data.name) throw createError(400, 'O campo name é obrigatório.');
    if (!data.race) throw createError(400, 'O campo race é obrigatório.');
    if (!data.class) throw createError(400, 'O campo class é obrigatório.');
  }

  if (data.race && !VALID_RACES.includes(data.race)) {
    throw createError(400, `Raça inválida. Opções: ${VALID_RACES.join(', ')}`);
  }
  if (data.class && !VALID_CLASSES.includes(data.class)) {
    throw createError(400, `Classe inválida. Opções: ${VALID_CLASSES.join(', ')}`);
  }
  if (data.level !== undefined && (data.level < 1 || data.level > 20)) {
    throw createError(400, 'O nível deve estar entre 1 e 20.');
  }

  const abilityScores = ['strength', 'dexterity', 'constitution', 'intelligence', 'wisdom', 'charisma'];
  for (const ability of abilityScores) {
    if (data[ability] !== undefined && (data[ability] < 1 || data[ability] > 30)) {
      throw createError(400, `O atributo ${ability} deve estar entre 1 e 30.`);
    }
  }
}

async function getAllCharacters(userId) {
  return characterDao.findAllByUser(userId);
}

async function getCharacterById(id, userId) {
  const character = await characterDao.findById(id);

  if (!character) {
    throw createError(404, 'Personagem não encontrado.');
  }
  if (character.userId !== userId) {
    throw createError(403, 'Você não tem permissão para acessar este personagem.');
  }

  return enrichCharacter(character);
}

async function createCharacter(userId, data) {
  validateCharacterData(data, true);

  if (!data.currentHitPoints && data.maxHitPoints) {
    data.currentHitPoints = data.maxHitPoints;
  }

  if (data.level) {
    data.proficiencyBonus = calcProficiencyBonus(data.level);
  }

  const character = await characterDao.create(userId, data);
  return enrichCharacter(character);
}

async function updateCharacter(id, userId, data) {

  await getCharacterById(id, userId);

  validateCharacterData(data, false);

  if (data.level) {
    data.proficiencyBonus = calcProficiencyBonus(data.level);
  }

  const updated = await characterDao.update(id, data);
  return enrichCharacter(updated);
}

async function deleteCharacter(id, userId) {
  await getCharacterById(id, userId);
  await characterDao.remove(id);
}

module.exports = {
  getAllCharacters,
  getCharacterById,
  createCharacter,
  updateCharacter,
  deleteCharacter,
  VALID_RACES,
  VALID_CLASSES
};
