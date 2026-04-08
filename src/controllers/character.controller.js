const characterService = require('../services/character.service');

async function getAll(req, res, next) {
  try {
    const characters = await characterService.getAllCharacters(req.userId);
    res.json({ count: characters.length, characters });
  } catch (err) {
    next(err);
  }
}

async function getOne(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const character = await characterService.getCharacterById(id, req.userId);
    res.json(character);
  } catch (err) {
    next(err);
  }
}

async function create(req, res, next) {
  try {
    const character = await characterService.createCharacter(req.userId, req.body);
    res.status(201).json(character);
  } catch (err) {
    next(err);
  }
}

async function update(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    const character = await characterService.updateCharacter(id, req.userId, req.body);
    res.json(character);
  } catch (err) {
    next(err);
  }
}

async function remove(req, res, next) {
  try {
    const id = parseInt(req.params.id);
    await characterService.deleteCharacter(id, req.userId);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
}

async function getOptions(req, res) {
  res.json({
    races: characterService.VALID_RACES,
    classes: characterService.VALID_CLASSES,
    alignments: [
      'Lawful Good', 'Neutral Good', 'Chaotic Good',
      'Lawful Neutral', 'True Neutral', 'Chaotic Neutral',
      'Lawful Evil', 'Neutral Evil', 'Chaotic Evil'
    ]
  });
}

module.exports = { getAll, getOne, create, update, remove, getOptions };
