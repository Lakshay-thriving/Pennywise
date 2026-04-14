# Business Logic & Rules Configuration

## O(N log N) Smart Algorithm: Debt Simplification Engine
This is the core business logic of the Pennywise system.

**Rule 1: Direct Debts Must Become Cyclic Net Graph Models**
Whenever `user_A` creates an expense of ₹1500 to split with `user_B` and `user_C`, the system natively computes an absolute vector table (`Splits`).
However, when fetching group settlements, parsing explicit links will scale infinitely. 
*Algorithm Implementation:* The system flattens all `Splits` mapping to a `groupId`. It computes a discrete numeric balance for every distinct user node `N`.
`Deficit = (Total Due To N) - (Total Owed By N)`

**Rule 2: The Two-Pointer Greedy Settlement Loop**
Once the nodes sit on a flat Net Array, the system runs native sorting. It establishes the `CreditorStack` (Those with positive margins) and `DebtorStack` (those with negative margins).
The service loops iteratively over the edges arrays. The highest debtor forcibly pays the highest available creditor until their edge balances resolve identically to zero.
This entirely circumvents multi-path debt links natively.

## Automated Subscription Detection Loop
**Rule 3: Artificial Intelligence via Aggregation Matching**
The backend maps a routine across the most recent 90-day time boundary. It executes `GROUP BY description` rules looking for normalized semantic matching strings (e.g. `Spotify Premium` or `Netflix`).
If `COUNT(transactions) > 2` matching identical textual boundaries AND variance thresholds per transaction stay identical to a ± 1% bounds threshold, the system parses the occurrence natively into a mapped Subscription JSON output and serves it directly onto the frontend `<SubscriptionsPage />`.

## Security Password Updates
**Rule 4: Implicit Multi-Factor Integrity**
- `currentPassword` must ALWAYS be parsed independently by the Controller via native backend BCrypt verification. 
- It forces the node application loop to verify prior inputs dynamically securing the database entirely against compromised active sessions (E.g. if the user forgets to log out, another peer cannot change their password without implicit knowledge of the original string).
- String length checks force 6-character thresholds directly.
