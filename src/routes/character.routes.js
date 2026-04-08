const { Router } = require('express');
const characterController = require('../controllers/character.controller');
const authMiddleware = require('../middlewares/auth');

const router = Router();

router.use(authMiddleware);

router.get('/options', characterController.getOptions);

router.get('/', characterController.getAll);
router.post('/', characterController.create);

router.get('/:id', characterController.getOne);
router.put('/:id', characterController.update);
router.patch('/:id', characterController.update);
router.delete('/:id', characterController.remove);

module.exports = router;
