const express = require('express');
const router = express.Router();
const assetCategoryController = require('../controllers/asset_category_controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);

router.get('/', assetCategoryController.getCategories);
router.post('/', assetCategoryController.createCategory);
router.put('/:id', assetCategoryController.updateCategory);
router.delete('/:id', assetCategoryController.deleteCategory);

module.exports = router;
