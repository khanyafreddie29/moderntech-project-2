const express = require('express');
const router = express.Router();
const payrollController = require('../controllers/payrollController');

router.get('/', payrollController.getPayrolls);
router.get('/search', payrollController.searchPayrolls);
router.get('/employees', payrollController.getEmployees);
router.get('/:id', payrollController.getPayrollById);
router.post('/', payrollController.addPayroll);
router.delete('/:id', payrollController.deletePayroll);
router.get('/payslip/:id', payrollController.generatePayslip);
router.put('/:id', payrollController.updatePayroll);

module.exports = router;