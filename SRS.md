# 📄 Software Requirements Specification (SRS)

## Pennywise – Personal Finance & Group Expense Sharing System

---

# 1. Introduction

## 1.1 Purpose

This document specifies the requirements for **Pennywise**, a mobile-first personal finance and group expense-sharing application. The system enables users to track personal expenses, manage shared group expenses, and settle debts efficiently while ensuring high data integrity and accuracy.

---

## 1.2 System Scope

Pennywise provides:

* Individual expense tracking and budgeting
* Group-based expense sharing and debt management
* Intelligent settlement optimization
* Financial analytics and reporting

The system uses a **PostgreSQL database** to ensure **ACID compliance**, critical for financial correctness.

---

## 1.3 Definitions

* **Split:** Distribution of expense among users
* **Settlement:** Payment to clear outstanding balances
* **Recurring Expense:** Expense repeated at fixed intervals
* **Audit Log:** Record of system actions for traceability

---

# 2. Overall Description

## 2.1 Product Perspective

The system follows a **Monolithic-to-Process Architecture**:

* **Frontend:** React Native
* **Backend:** Node.js (Express)
* **Database:** PostgreSQL
* **Process Manager:** PM2

---

## 2.2 Design Patterns Used

* **Repository Pattern** – abstracts DB logic
* **Singleton Pattern** – DB connection pool
* **Strategy Pattern** – multiple split methods
* **Observer Pattern** – real-time updates via sockets

---

## 2.3 User Classes

* **Admin (Group Creator)** – manages group settings
* **Member** – participates in expenses
* **Individual User** – manages personal expenses

---

# 3. Functional Requirements

---

## 3.1 Expense Management

### FR-1: Personal Expense Tracking

Users shall be able to CRUD personal expenses with categories.

---

### FR-2: Group Creation & Management

Users shall:

* Create groups
* Invite members via ID/email
* Assign roles (Admin/Member)

---

### FR-3: Bill Splitting

System shall support:

* Equal Split
* Exact Split
* Percentage Split

---

### FR-4: Recurring Expenses

Users shall define recurring expenses with:

* Frequency: Daily, Weekly, Monthly
* Auto-generation of entries via scheduler

---

### FR-5: Multi-Currency Support

System shall:

* Allow expenses in multiple currencies
* Convert using stored exchange rates

---

## 3.2 Settlement & Debt Management

### FR-6: Smart Settlement Algorithm

System shall minimize transactions using a **debt simplification algorithm**.

---

### FR-7: Partial Settlements

Users shall:

* Pay partial amounts
* Track remaining balances dynamically

---

### FR-8: Real-Time Balance Updates

All balances must update instantly across users using **WebSockets**.

---

## 3.3 Collaboration Features

### FR-9: Expense Approval Workflow

* Expenses may require approval
* Status: Pending / Approved / Rejected

---

### FR-10: Comments & Notes

Users shall comment on expenses.

---

### FR-11: Notifications

System shall send notifications for:

* New expenses
* Pending approvals
* Unsettled debts
* Recurring expense reminders

---

## 3.4 Budgeting & Analytics

### FR-12: Budget Management

Users shall:

* Set monthly category budgets
* Receive alerts on threshold breach

---

### FR-13: Financial Insights

System shall provide:

* Monthly spending trends
* Category-wise breakdown
* Debt summaries

---

### FR-14: Data Export

Users shall export reports in:

* CSV
* PDF

---

## 3.5 Security & Audit

### FR-15: Authentication & Authorization

* JWT-based authentication
* Role-based access control

---

### FR-16: Audit Logging

System shall log:

* Expense creation/update/deletion
* Settlements
* User actions

---

## 3.6 Offline Capability

### FR-17: Offline Mode

* Users can add expenses offline
* Data syncs when connectivity is restored

---

## 3.7 User Experience Enhancements

### FR-18: Smart Expense Suggestions
* System suggests:
  * frequent categories
  * commonly used group members
* Based on past data (simple frequency analysis)

### FR-19: Quick Add (Minimal Input Mode)
* Add expense in one line:
  * `"Dinner 1200 with A,B,C"`
* Backend parses input

### FR-20: Expense Templates
* Save common splits (e.g., rent, trip expenses)
* Reuse with one click

## 3.8 Intelligent Features

### FR-21: Expense Anomaly Detection
* Detect unusual spending:
  * “You spent 3× more on food this week”

### FR-22: Predictive Budgeting
* Predict end-of-month spending based on trends

### FR-23: Smart Reminders
* Notify users:
  * “You haven’t settled dues in 7 days”
  * “Budget nearly exceeded”

## 3.9 Social & Interaction Features

### FR-24: Activity Feed
* Timeline of group actions:
  * “A added expense”
  * “B settled ₹500”

### FR-25: Emojis/Reactions on Expenses
* React 👍 😂 💸 on expenses

### FR-26: User Profiles
* Profile page with:
  * total spending
  * total owed
  * most frequent category

## 3.10 Financial Realism Features

### FR-27: Expense Attachments
* Upload receipts/bills (images/PDF)

### FR-28: Split by Shares (Advanced Split)
* Instead of equal, support ratios (e.g., A = 2 shares, B = 1 share)

### FR-29: Taxes & Tips Handling
* Add tax % and tip %
* Auto-calculated before splitting

## 3.11 Connectivity & Integration

### FR-30: Email Notifications
* Send expense summaries, reminders

### FR-31: Calendar Integration
* Show recurring expenses in calendar

### FR-32: Import Bank Statements (CSV)
* Upload bank CSV → auto-create expenses

## 3.12 Advanced Security & Control

### FR-33: Two-Factor Authentication (2FA)
* OTP/email-based login verification

### FR-34: Session Management
* Logout from all devices
* Track active sessions

### FR-35: Data Privacy Controls
* Users control who sees their expenses and visibility settings

## 3.13 Advanced Analytics

### FR-36: Group Insights
* Who spends the most?
* Who owes the most?

### FR-37: Heatmaps of Spending
* Visual representation by day/week

### FR-38: Category Trends Over Time
* Compare this month vs last month

## 3.14 Power Features

### FR-39: Custom Split Rules Engine
* Users define rules: “Always split rent equally”, “Food split by shares”

### FR-40: Conflict Resolution System
* If users disagree on splits: mark dispute, resolve later

### FR-41: Undo / Version History
* Track changes to expenses
* Revert edits

# 4. Non-Functional Requirements

---

## 4.1 Data Integrity & Precision

### NFR-1: Precision Handling

* Use `DECIMAL` or integer (paise/cents)
* Avoid floating-point errors

---

### NFR-2: ACID Compliance

* All financial operations must use DB transactions
* Rollback on failure

---

### NFR-3: Constraint Enforcement

* Splits must equal total expense
* Enforced via DB constraints/triggers

---

## 4.2 Performance

### NFR-4: Response Time

* API response < 200 ms (local)

---

### NFR-5: Scalability

* Efficient indexing on:

  * `user_id`
  * `group_id`
  * `expense_id`

---

## 4.3 Reliability

### NFR-6: Fault Tolerance

* Backend auto-restarts using PM2

---

### NFR-7: Data Recovery

* Support database backups

---

## 4.4 Security

### NFR-8: Data Protection

* Password hashing (bcrypt)
* Secure JWT storage

---

# 5. Database Design (PostgreSQL)

---

## 5.1 Core Tables

* **Users**
  `id, name, email, password_hash`

* **Groups**
  `id, group_name, created_at`

* **Group_Members**
  `user_id, group_id, role`

---

## 5.2 Expense Tables

* **Expenses**
  `id, description, amount, currency, creator_id, group_id, status, timestamp`

* **Splits**
  `id, expense_id, user_id, amount_owed, is_paid`

---

## 5.3 Additional Tables

* **Payments** (Partial settlements)
  `id, payer_id, receiver_id, amount, group_id, timestamp`

* **Budgets**
  `user_id, category, limit_amount`

* **Exchange_Rates**
  `currency_code, rate`

* **Comments**
  `id, expense_id, user_id, text, timestamp`

* **Audit_Logs**
  `id, user_id, action, timestamp`

---

## 5.4 Advanced Features

* **Soft Deletes:**
  `is_deleted BOOLEAN`

* **Triggers:**
  Ensure:

  * Split sum = expense total

---

# 6. External Interface Requirements

---

## 6.1 User Interface

* Mobile-first UI (React Native)
* Dashboard, Group View, Analytics

---

## 6.2 API Interface

* REST APIs via Express
* JSON-based communication

---

## 6.3 Communication Interfaces

* WebSockets for real-time updates

---

# 7. System Constraints

* PostgreSQL must run locally
* No Docker usage
* Node.js runtime required

---

# 8. Future Enhancements

* AI-based spending suggestions
* Integration with banking APIs
* Credit score tracking
