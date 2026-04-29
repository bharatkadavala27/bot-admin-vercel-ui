const express = require('express');
const router = express.Router();
const { addSalary, getSalaryByEmployee, getMonthlyReport, updateSalary, generateSalaries } = require('../controllers/salary_controller');
const { protect } = require('../middleware/auth.middleware');

router.use(protect);
router.post('/', addSalary);
router.post('/generate', generateSalaries);
router.put('/:id', updateSalary);
router.get('/employee/:employeeId', getSalaryByEmployee);
router.get('/report', getMonthlyReport);

module.exports = router;
