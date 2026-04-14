# Software Requirements Specification (SRS)
**Project Name:** Pennywise Finance & Expense Settlement Ecosystem
**Date:** April 2026
**Version:** 1.0.0

---

## 1. Introduction

### 1.1 Purpose
The purpose of this Software Requirements Specification (SRS) document is to provide a detailed overview of the software requirements for the "Pennywise" platform. This document will describe the functional and non-functional requirements, architectural constraints, and user interactions required to govern the development and evaluation of the system.

### 1.2 Document Conventions
This document follows the IEEE standard for writing SRS documents. 
- **FR**: Functional Requirement
- **NFR**: Non-Functional Requirement
- **UI**: User Interface
- **API**: Application Programming Interface

### 1.3 Intended Audience
This document is intended for:
- **Developers:** To understand structural paradigms and REST API endpoints required for integration.
- **Project Managers & Course Evaluators:** To verify the fulfillment of the CS305 final deliverables against stated goals.
- **System Architects:** To guide future horizontal scaling and database migrations.

### 1.4 Project Scope
Pennywise is an enterprise-grade web application designed to solve the friction of tracking personal finances, identifying leaky recurring subscriptions, and eliminating cyclical debt within peer groups. The software aims to eliminate fractional math for end-users by routing group debts through an intrinsic mathematical graph-simplification algorithm, while maintaining an active social community engine for financial literacy.

---

## 2. Overall Description

### 2.1 Product Perspective
Pennywise is a distributed monolithic web application. It consists of a React.js (Vite) Single Page Application (SPA) communicating over standard HTTP protocols to a Node.js/Express REST API securely connected to a persistent PostgreSQL relational database.

### 2.2 Product Functions
- **Secure Authentication:** JWT-based user lifecycle parsing using `bcrypt` cryptographic hashing.
- **Expense Logging & Processing:** Seamless mapping of shared monetary splits natively utilizing implicit ACID Database Triggers across fractional edges.
- **Smart Settlements:** `O(N log N)` Graph Debt-Minimization Engine bypassing cyclical redundant money transfers.
- **AI Subscription Detection:** Automated Time-Series aggregation over persistent Postgres storage isolating exact monthly leakages in wealth.
- **Social Community Platform:** A fully operational article posting, liking, and comment architecture tracking timestamps.
- **Visual Financial Forecasting:** Direct mapping of user history to intuitive graphical line metrics utilizing `Chart.js`.

### 2.3 User Classes and Characteristics
*   **Standard Authenticated User:** Needs intuitive, frictionless entry of financial tasks. They expect "Glassmorphic" responsive feedback loops on operations mimicking modern Web 3.0 Fintech UX platforms.

### 2.4 Operating Environment
*   **Frontend End-User:** Modern Chromium or Webkit browsers (Chrome, Edge, Safari, Firefox).
*   **Server End:** Node.js v18+, running behind standard reverse-proxies.
*   **Database Engine:** PostgreSQL v14.

### 2.5 Design and Implementation Constraints
*   **Stateless Navigation:** The frontend React states MUST utilize Context Providers to actively abstract User Array histories preventing re-fetch delays upon tab switching.
*   **Currency Precision:** The Application backend MUST natively compute integers representing base-fiat mappings (Cents/Paise) explicitly omitting floating-point corruption matrices before converting inside the final rendering layer.

---

## 3. External Interface Requirements

### 3.1 User Interfaces
- **Main Dashboard Layout:** Will utilize a persistent Top Navigation Bar parsing React DOM `Outlets`.
- **Modals & Forms:** Forms modifying the database (Expense Creation, Password Changing) must display explicit UI Toasts to alert users of 200 vs 401/500 API responses.
- **Themes:** A strict internal mapping of dark-mode aesthetics utilizing deep space colors `#dark-bg`, neon-green highlights `#39FF14`, and muted grays explicitly defined via Tailwind configurations.

### 3.2 Software Interfaces
*   **PostgreSQL:** Will interact exclusively through a `pg.Pool` Singleton architecture, returning unformatted generic Promise rows directly to Services/Controllers.
*   **Node Crypto Libraries:** Explicit coupling to native Node algorithms dynamically executing Salt permutations implicitly outside frontend access.

---

## 4. System Features (Functional Requirements)

### 4.1 Debt Minimization (Smart Settlements)
**Description:** The system computes the absolute smallest amount of transactions necessary to bring all nodes to exactly 0.00 fractional deviation.
- **FR.4.1.1:** The backend shall parse `Splits` mapping to specific `Groups`.
- **FR.4.1.2:** The calculation engine shall isolate nodes logically segregating `(Sum Received) - (Sum Owed)`.
- **FR.4.1.3:** The algorithm iterates a two-pointer greedy allocation queue recursively until deficit arrays exhaust.

### 4.2 Automated Subscriptions
**Description:** Finding redundant leakage.
- **FR.4.2.1:** System fetches a recursive view of local user histories bounded entirely by `< 90 Days`.
- **FR.4.2.2:** Service aggregates raw transaction frequencies grouped cleanly by matching regex titles and explicit identical values.

### 4.3 Profile Parameter Configurations
**Description:** Safe mutability of Identity.
- **FR.4.3.1:** The user shall execute edits targeting solely name bindings and avatar external `.png / .jpg` remote URLs.
- **FR.4.3.2:** Explicit Password mutation demands 1:1 validation matching prior encrypted blocks implicitly within the `/api/users/password` endpoints.

---

## 5. Other Nonfunctional Requirements (NFR)

### 5.1 Performance Requirements
- **Latency:** Core API routes parsing single-row JSON operations (`GET /profile`, `POST /like`) MUST routinely return payloads under ~50ms inside isolated hardware scopes.
- **Algorithm Computation:** O(N log N) graph simplifications should isolate computational cycles bypassing any single-thread main-loop blocking thresholds inside V8 for graph matrices exceeding N=100.

### 5.2 Security Requirements
- **NFR.Sec.1 (Protection against XSS):** React implicitly escapes arbitrary payloads within the Forum components bypassing script executions unless implicitly explicitly defined with `dangerouslySetInnerHTML`.
- **NFR.Sec.2 (Authorization Scope Protection):** JSON Web Tokens encode strictly the `user_id`, stripping mutable state keys before hashing cleanly over internal RS256 equivalent HMAC derivations. Raw Passwords NEVER serialize via HTTP Response packets.

### 5.3 Software Quality Attributes
- **Maintainability:** Standard MVC architectures dictate exact class folder definitions separating Repository code away from Protocol Routing code infinitely.
- **Scalability:** By forcing pure standard stateless stateless Auth schemas, AWS or Digital Ocean could actively boot >10 identical Node processes wrapping over an identical Postgres container without tracking inter-container session limits safely.
