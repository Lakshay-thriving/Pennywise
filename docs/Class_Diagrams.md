# Pennywise Class Diagrams Detailed

This document provides exact Class Diagrams and structural hierarchies detailing the underlying architecture down to the exact properties and core methods utilized by both the Node HTTP layer and the React Frontend layer.

## 1. Backend Core Domain (MVC/Service Architecture)

The backend follows a distinct Object-Oriented mapping structure. Even though Node.js is function-heavy, the architecture implements ES6 Classes for Controllers and Services to encapsulate explicit dependency states.

```mermaid
classDiagram
    class AuthController {
        +register(req, res) Promise
        +login(req, res) Promise
        +searchUsers(req, res) Promise
    }

    class UserController {
        +getProfile(req, res) Promise
        +updateProfile(req, res) Promise
        +updatePassword(req, res) Promise
    }

    class ExpenseController {
        +createExpense(req, res) Promise
        +quickAdd(req, res) Promise
    }

    class AdvancedFeaturesController {
        +getGoals(req, res) Promise
        +getSubscriptions(req, res) Promise
    }

    class SettlementController {
        +getSettlements(req, res) Promise
        +recordPayment(req, res) Promise
    }

    class SettlementService {
        -buildDebtGraph(splits, payments) Map
        +calculateOptimizedSettlements(groupId) Array~Transaction~
        +recordPayment(payerId, receiverId, amount, groupId, method) Object
    }

    class QuickAddService {
        +processQuickAdd(inputStr, creatorId, groupId) Object
    }
    
    class WebSocketService {
        -io : Server
        +initialize(server) void
        +broadcastExpenseUpdate(groupId, data) void
    }

    class DBClient {
        -pool : pg.Pool
        +getClient() Promise~pg.Client~
    }

    AuthController --> DBClient : Uses for User resolution
    UserController --> DBClient : Uses for Profile injection
    ExpenseController --> QuickAddService : Invokes NLP Routing
    SettlementController --> SettlementService : Orchestrates Payments
    SettlementService --> DBClient : Uses for Debt calculation
    WebSocketService --> ExpenseController : Hooked loosely for push events
```

### Backend Detailed Class Responsibilities
*   **`SettlementService`:** Central to the business logic. Contains `calculateOptimizedSettlements` which is the O(N log N) graph reduction method that strips out cyclical debts across groups.
*   **`QuickAddService`:** Holds strict `Regex` analysis mapping string queries parsing names/emails into database IDs conditionally.
*   **`DBClient` (Singleton):** Holds the singleton `pg.Pool` instance avoiding connection drops while serving hundreds of concurrent user requests.

---

## 2. Frontend React Component Hierarchy

The frontend relies heavily on Context Wrappers to avoid "prop drilling" state down to child routes, paired with a React Router abstraction mapping explicitly isolated page classes.

```mermaid
classDiagram
    class App {
        +render() JSX
    }

    class AuthProvider {
        -user : Object
        -isLoading : Boolean
        +login(email, password) Promise
        +register(name, email, password) Promise
        +logout() void
    }

    class FinanceProvider {
        -balance : Number
        -activityFeed : Array
        -goals : Array
        -subscriptions : Array
    }

    class MainLayout {
        -navItems : Array~Route~
        +render() JSX
    }

    class DashboardHome {
        -chartData : Array
        -desc : String
        -amount : Number
        -searchQuery : String
        +handleCreateExpense() void
        +searchUsers(query) void
        +render() JSX
    }

    class ProfilePage {
        -name : String
        -email : String
        -profileImage : String
        -currentPassword : String
        -newPassword : String
        +fetchProfile() Promise
        +handleProfileUpdate() Promise
        +handlePasswordUpdate() Promise
    }

    class SettlementsPage {
        -showSettlements : Boolean
        -paymentModal : Object
        +handleUpiSimulate(receiver, amount) void
    }

    class CommunityScreen {
        -articles : Array
        -isCreating : Boolean
        +fetchArticles() Promise
        +handleCreateSubmit() Promise
        +handleLike(articleId) Promise
    }

    App --> AuthProvider : Wraps Application
    App --> FinanceProvider : Wraps Layout Routes
    App --> MainLayout : Mounts Main Dashboard UI
    MainLayout *-- DashboardHome : Renders on /
    MainLayout *-- ProfilePage : Renders on /profile
    MainLayout *-- SettlementsPage : Renders on /settlements
    MainLayout *-- CommunityScreen : Renders on /community
    DashboardHome ..> FinanceProvider : Consumes State Context
    SettlementsPage ..> AuthProvider : Consumes User Auth Data
```

### Frontend Detailed Component Responsibilities
*   **`FinanceProvider`:** Acts as the globally scoped Central State Class. It abstracts dummy and live states for arrays including `activityFeed`, `goals`, and `subscriptions` preventing Unmount-Event wipeouts as users click across tabs.
*   **`MainLayout`:** Handles global view wrapping. Computes standard HTML wrappers and ensures CSS resets persist uniformly around dynamically changing `<Outlet />` sub-components. 
*   **`ProfilePage`:** Handles three-tier state execution handling forms independently (Profile text, image parsing natively over browser `<img src>` failure catchers, and strict Cryptographic Password hooks).
