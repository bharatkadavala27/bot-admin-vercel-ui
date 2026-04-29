const express = require('express');
const router = express.Router();
const { getAssets, addAsset, updateAsset, deleteAsset } = require('../controllers/asset_controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getAssets);
router.post('/', addAsset);
router.put('/:id', updateAsset);
router.delete('/:id', deleteAsset);

module.exports = router;
