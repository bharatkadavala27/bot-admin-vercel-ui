const express = require('express');
const router = express.Router();
const { getBranches, createBranch, updateBranch, deleteBranch } = require('../controllers/branch_controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.get('/', getBranches);
router.post('/', createBranch);
router.put('/:id', updateBranch);
router.delete('/:id', deleteBranch);

module.exports = router;
