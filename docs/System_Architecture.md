# Application Architecture & Design Patterns

The Pennywise application utilizes a massive **Monolithic API layer** written in Node.js mapped explicitly to a **Single Page Application (SPA)** React Frontend. Both are bridged over normalized HTTP-REST methods and WebSocket persistence channels.

## 1. High-Level Macro Architecture

```mermaid
graph TD
    Client[React/Vite SPA] -->|HTTPS REST| Router[Express/Node Gateway]
    Client -->|WSS| Sockets[WebSocket Pub/Sub]
    Router --> Auth[JWT Authorization Middleware]
    Auth --> Controllers
    Controllers --> Services
    Services --> Repos[Repositories (SQL Access)]
    Repos --> DB[(PostgreSQL)]
    Sockets --> Services
```

## 2. Design Patterns Implemented

### Singleton Pattern
- **Where:** Database Configuration (`src/db.js`).
- **Why:** Postgres Client pools require heavy OS network threading. A singleton guarantees that regardless of how many controllers rapidly ping the database, the Node.js event loop maps requests exclusively off a shared pool instead of constructing new connection objects per request.

### Strategy Pattern & Factory Method
- **Where:** simulated Payment execution (`SettlementService.js`).
- **Why:** The codebase dynamically evaluates input methods. The algorithm switches between handling RAW CASH offsets vs simulating actual `Payupi` block validation network offsets flexibly, without littering the controller logic with giant `if/else` gateway cases.

### Model-View-Controller (MVC)
- **Where:** The complete overarching Project directory routing.
- **Why:** Enables rigorous decoupling. The `Router` layer manages path mapping -> The `Controller` layer parses strings/authorization -> The `Service` layer executes mathematical and algorithms -> The `Repository` layer mutates raw persistent memory.

## 3. Application of S.O.L.I.D Principles

- **Single Responsibility Principle (SRP):** The `QuickAddService` explicitly functions ONLY to perform text extraction via `regex` algorithms. It refuses any knowledge of database mutation. Mutation falls onto the Controller to ingest the service result.
- **Open-Closed Principle (OCP):** Endpoints such as `advancedFeaturesController` are closed for core modification, but infinitely open for algorithmic expansion via Service additions without rewriting underlying API definitions.
- **Dependency Inversion (DIP):** Top level controllers depend upon standard database abstraction APIs (`Client.query`), refusing exact binding tying them to low-level PG library internals.

## 4. Business Logic: O(N log N) Graphical Simplification
When complex groups intersect debts, cyclic paths appear (User A owes User B 50. User B owes User C 50. User C owes User A 20).
Instead of tracking absolute paths, the *Smart Settlement* routine abstracts all users as Nodes. It maps a running net "Total Wallet Deficit" for each node.
It subsequently segregates Nodes into two arrays (Creditors, Debtors), sorts them, and iterates them through a greedy consumption loop, perfectly guaranteeing the mathematically minimum number of real payments required.
