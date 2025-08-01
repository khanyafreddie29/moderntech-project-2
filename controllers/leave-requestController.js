const LeaveRequest = require('../models/leave-requestModel');
const Employee = require('../models/employeeModel');

exports.getAllLeaveRequests = async (req, res) => {
  try {
    const { status } = req.query;
    const leaveRequests = await LeaveRequest.findAll(status);
    res.status(200).json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching leave requests', error: error.message });
  }
};

exports.createLeaveRequest = async (req, res) => {
  try {
    const { employee_id, leave_type, reason, start_date, end_date } = req.body;

    if (!employee_id || !leave_type || !reason || !start_date || !end_date) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const employee = await Employee.getById(employee_id);
    if (!employee) {
      return res.status(404).json({ message: 'Employee not found' });
    }

    // Validate dates
    if (new Date(start_date) > new Date(end_date)) {
      return res.status(400).json({ message: 'Start date cannot be after end date' });
    }

    const leaveRequest = await LeaveRequest.create({
      employee_id,
      leave_type,
      reason,
      start_date,
      end_date,
      status: 'Pending',
    });

    res.status(201).json(leaveRequest);
  } catch (error) {
    console.error('Error creating leave request:', error);
    res.status(500).json({ message: 'Error creating leave request', error: error.message });
  }
};

exports.updateLeaveRequestStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status' });
    }

    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const updatedRequest = await LeaveRequest.updateStatus(id, status);

    const hasApproved = await LeaveRequest.hasApprovedLeave(leaveRequest.employee_id);
    await Employee.updateStatus(leaveRequest.employee_id, hasApproved ? 'On Leave' : 'Active');

    res.status(200).json(updatedRequest);
  } catch (error) {
    console.error('Error updating leave request status:', error);
    res.status(500).json({ message: 'Error updating leave request', error: error.message });
  }
};

exports.deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;

    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({ message: 'Leave request not found' });
    }

    const result = await LeaveRequest.delete(id);

    const hasApproved = await LeaveRequest.hasApprovedLeave(leaveRequest.employee_id);
    await Employee.updateStatus(leaveRequest.employee_id, hasApproved ? 'On Leave' : 'Active');

    res.status(200).json(result);
  } catch (error) {
    console.error('Error deleting leave request:', error);
    res.status(500).json({ message: 'Error deleting leave request', error: error.message });
  }
};