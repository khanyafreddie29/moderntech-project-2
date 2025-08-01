-- Create the main database
CREATE DATABASE IF NOT EXISTS hr_staff_app;

USE hr_staff_app;

-- Roles
CREATE TABLE roles (
    id INT PRIMARY KEY AUTO_INCREMENT,
    role_name VARCHAR(50) NOT NULL UNIQUE
);

-- Users Table
CREATE TABLE users (
    id INT PRIMARY KEY AUTO_INCREMENT,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Employee Table
CREATE TABLE employees (
    id INT PRIMARY KEY AUTO_INCREMENT,
    full_name VARCHAR(100) NOT NULL,
    position VARCHAR(100) NOT NULL,
    department VARCHAR(100) NOT NULL,
    salary DECIMAL(10,2) NOT NULL DEFAULT 0.00,
    employment_history TEXT NOT NULL,
    email VARCHAR(100),
    phone_number VARCHAR(45),
    profile_image VARCHAR(255),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

CREATE INDEX idx_emp_name ON employees(full_name);
CREATE INDEX idx_emp_department ON employees(department);

-- Attendance Table
CREATE TABLE attendance (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    time_in DATE,
    attendance_status ENUM('Present', 'Absent', 'Late', 'Leave') DEFAULT 'Present',
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX idx_time_in ON attendance(time_in);
CREATE INDEX idx_attendance_status ON attendance(attendance_status);

-- Payroll Table
CREATE TABLE payroll (
    id INT AUTO_INCREMENT PRIMARY KEY,
    employee_id INT NOT NULL,
    pay_period_start DATE NOT NULL,
    pay_period_end DATE NOT NULL,
    basic_salary DECIMAL(10,2) NOT NULL,
    hours_worked INT NOT NULL,
    leave_days INT NOT NULL,
    tax DECIMAL(10,2) NOT NULL,
    uif DECIMAL(10,2) NOT NULL,
    leave_penalty DECIMAL(10,2) NOT NULL,
    total_deductions DECIMAL(10,2) NOT NULL,
    net_salary DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    is_deleted BOOLEAN DEFAULT FALSE,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX idx_employee_period ON payroll(employee_id, pay_period_start);

-- Performance Reviews
CREATE TABLE performance_reviews (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    review_date DATE,
    reviewer VARCHAR(100),
    comments TEXT,
    rating ENUM('Excellent', 'Good', 'Average', 'Poor'),
    category VARCHAR(150),
    status ENUM('Pending', 'Reviewed', 'Action Required'),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX idx_review_rating ON performance_reviews(rating);

-- Leave Requests
CREATE TABLE leave_requests (
    id INT PRIMARY KEY AUTO_INCREMENT,
    employee_id INT,
    leave_type VARCHAR(50),
    reason TEXT,
    status ENUM('Pending', 'Approved', 'Rejected') DEFAULT 'Pending',
    start_date VARCHAR(50),
    end_date VARCHAR(50),
    is_deleted BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (employee_id) REFERENCES employees(id) ON DELETE CASCADE
);

CREATE INDEX idx_leave_status ON leave_requests(status);


-- Populate roles
INSERT INTO roles (role_name) VALUES ('Admin');

-- Populate users 
INSERT INTO users (username, email, password) VALUES
('sibongile_n', 'sibongile.nkosi@moderntech.com', 'hashed_password');

-- Populate Employees
INSERT INTO employees (full_name, position, department, salary, employment_history, email, phone_number, profile_image) VALUES
('Sibongile Nkosi', 'Software Engineer', 'Development', 70000.00, 'Joined in 2015, promoted to Senior in 2018', 'sibongile.nkosi@moderntech.com', '0876789087', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSVz13n5__CJit9WIsOztZ4fdZdZmrV_RRHwg&s'),
('Lungile Moyo', 'HR Manager', 'HR', 80000.00, 'Joined in 2013, promoted to Manager in 2017', 'lungile.moyo@moderntech.com', '0679562340', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcToonwNT4zbwCyq-k-qAzXexPn6URz3gT4BxQ&s'),
('Thabo Molefe', 'Quality Analyst', 'QA', 55000.00, 'Joined in 2018', 'thabo.molefe@moderntech.com', '0712345677', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTMTYDFHOsEqWaxITzH0YETeYXQw6fvastO8Q&s'),
('Keshav Naidoo', 'Sales Representative', 'Sales', 60000.00, 'Joined in 2020', 'keshav.naidoo@moderntech.com', '0767861234', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRkAkWcI0LFLuWTfiyCMiwl8TvYT_FsflDV1g&s'),
('Zanele Khumalo', 'Marketing Specialist', 'Marketing', 58000.00, 'Joined in 2019', 'zanele.khumalo@moderntech.com', '0698657546', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQUxarmEAWMbWnfZHQ8QVE6fZgR0fBe-63RSQ&s'),
('Sipho Zulu', 'UI/UX Designer', 'Design', 65000.00, 'Joined in 2016', 'sipho.zulu@moderntech.com', '0645672112', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS94d9Pn8Pjsqw4yz2zRDTzZeyeXWwT26Lxqw&s'),
('Naledi Moeketsi', 'DevOps Engineer', 'IT', 72000.00, 'Joined in 2017', 'naledi.moeketsi@moderntech.com', '0675678989', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcR-Y7KHt6ctQndNV9es3z2wUM43ZFhMLmu4WQ&s'),
('Heather Johnson', 'Content Strategist', 'Marketing', 56000.00, 'Joined in 2021', 'heather.johnson@moderntech.com', '0798497612', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQitWKXOGriZKh7u3b1VtWjNj8Ib7ld9rj_oA&s'),
('Chad Thompson', 'Accountant', 'Finance', 62000.00, 'Joined in 2018', 'chad.thompson@moderntech.com', '0760676560', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS_ylN5nbOIA_N9ZJZG8gEu_NiPNhgUNtI7xg&s'),
('Madison Clark', 'Customer Support Lead', 'Support', 58000.00, 'Joined in 2016', 'madison.clark@moderntech.com', '0764561234', 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTAgpxwU5u6XmPLMLgpexC2FnkAIueQ9ZWeSQ&s');


-- Populate leave_requests
INSERT INTO leave_requests (employee_id, leave_type, start_date, end_date, reason, status) VALUES
(1, 'Sick Leave', '2025-07-26', '2025-07-30', 'I got gramps','Approved');

                                                                 
-- Populate performance_reviews
INSERT INTO performance_reviews (
  employee_id, review_date, reviewer, comments, rating, category, status
) VALUES
(1,'2025-06-01', 'John Manager', 'Outstanding problem-solving and leadership in development projects.', 'Excellent', 'Leadership', 'Reviewed'),
(2, '2025-06-03', 'Jane Manager', 'Strong management of HR duties and team coordination.', 'Good', 'Management', 'Reviewed'),
(3, '2025-06-05', 'Mark Supervisor', 'Performs well but needs to enhance testing turnaround time.', 'Average', 'Productivity', 'Pending'),
(4, '2025-06-07', 'Lisa Manager', 'Consistently exceeds sales targets with great client relationships.', 'Excellent', 'Sales', 'Reviewed'),
(5, '2025-06-10', 'Mike Manager', 'Creative marketing strategies but on leave recently.', 'Good', 'Marketing', 'Pending'),
(6, '2025-06-12', 'Anna Manager', 'Strong UX design focus and collaboration.', 'Excellent', 'Design', 'Reviewed'),
(7, '2025-06-14', 'David Supervisor', 'Handles IT deployments efficiently, needs more documentation.', 'Good', 'IT', 'Pending'),
(8, '2025-06-16', 'Samantha Manager', 'Good content ideas, needs improvement in delivery timelines.', 'Average', 'Content Strategy', 'Action Required'),
(9, '2025-06-18', 'Brian Manager', 'Reliable and accurate in monthly reports.', 'Good', 'Finance', 'Reviewed'),
(10, '2025-06-20', 'Emily Manager', 'Strong communicator, currently on leave during review.', 'Average', 'Support', 'Pending');


-- Populate payroll
INSERT INTO payroll (
    employee_id, pay_period_start, pay_period_end, basic_salary, hours_worked, 
    leave_days, tax, uif, leave_penalty, total_deductions, net_salary
) VALUES
(1, '2025-07-01', '2025-07-31', 70000.00, 160, 2, 14000.00, 350.00, 500.00, 14850.00, 55150.00),
(2, '2025-07-01', '2025-07-31', 80000.00, 160, 1, 16000.00, 400.00, 250.00, 16650.00, 63350.00),
(3, '2025-07-01', '2025-07-31', 55000.00, 160, 1, 11000.00, 275.00, 250.00, 11525.00, 43475.00),
(4, '2025-07-01', '2025-07-31', 60000.00, 160, 0, 12000.00, 300.00, 0.00, 12300.00, 47700.00),
(5, '2025-07-01', '2025-07-31', 58000.00, 160, 1, 11600.00, 290.00, 250.00, 12140.00, 45860.00),
(6, '2025-07-01', '2025-07-31', 65000.00, 160, 0, 13000.00, 325.00, 0.00, 13325.00, 51675.00),
(7, '2025-07-01', '2025-07-31', 72000.00, 160, 1, 14400.00, 360.00, 250.00, 15010.00, 56990.00),
(8, '2025-07-01', '2025-07-31', 56000.00, 160, 1, 11200.00, 280.00, 250.00, 11730.00, 44270.00),
(9, '2025-07-01', '2025-07-31', 62000.00, 160, 0, 12400.00, 310.00, 0.00, 12710.00, 49290.00),
(10, '2025-07-01', '2025-07-31', 58000.00, 160, 1, 11600.00, 290.00, 250.00, 12140.00, 45860.00);

ALTER TABLE employees ADD COLUMN status VARCHAR(20) DEFAULT 'Active';

ALTER TABLE leave_requests
MODIFY COLUMN start_date DATE,
MODIFY COLUMN end_date DATE;
SELECT id, full_name FROM employees WHERE is_deleted = FALSE;

ALTER TABLE attendance ADD UNIQUE KEY uq_attendance_employee_date (employee_id, time_in);








