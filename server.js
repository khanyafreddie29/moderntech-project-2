const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const employeeRoutes = require('./routes/employeeRoutes');
const payrollRoutes = require('./routes/payrollRoutes');   
const leaveRequestRoutes = require('./routes/leave-requestRoutes');
const performanceReviewRoutes = require('./routes/performance-reviewRoutes'); 
const authenticateToken = require('./middleware/authMiddleware');
const attendanceRoutes = require('./routes/attendanceRoutes');



dotenv.config();
const app = express();
const PORT = process.env.PORT || 8090;

// Middleware
app.use(cors()); 
app.use(express.json()); 

// Public routes
app.use('/api/auth', authRoutes); 

//Protected routes
app.use('/api/employees', authenticateToken, employeeRoutes);
app.use('/api/payroll', authenticateToken, payrollRoutes);
app.use('/api/leave-requests', authenticateToken, leaveRequestRoutes);
app.use('/api/performance-reviews', authenticateToken, performanceReviewRoutes);
app.use('/api/attendance', authenticateToken, attendanceRoutes);


// Root endpoint
app.get('/', (req, res) => {
  res.send('HR Staff App API is running');
});

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
