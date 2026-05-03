# Entity Relationship Diagrams (ERD)

This document provides a high-level overview of the database schema for the Syncoboard application. The schema is defined using Prisma and can be logically divided into four main domains: Authentication, Workspaces & Boards, Tasks & Labels, and Billing & Subscriptions.

## 1. Authentication

This domain handles user identities, OAuth accounts, and sessions. It strictly follows the Auth.js (NextAuth) standard database pattern for seamless authentication integration.

```mermaid
erDiagram
    User ||--o{ Account : "has"
    User ||--o{ Session : "has"
    User {
        uuid id PK
        string name
        string email
        string image
        datetime createdAt
    }
    Account {
        uuid id PK
        uuid userId FK
        string provider
        string providerAccountId
    }
    Session {
        uuid id PK
        string sessionToken
        uuid userId FK
        datetime expires
    }
    VerificationToken {
        string identifier
        string token
        datetime expires
    }
```

## 2. Workspaces & Boards

Workspaces form the top-level grouping, which contain multiple Boards. A Board combines the concepts of a Kanban board and a connected GitHub repository. Users can be invited as members to both Workspaces and Boards with specific roles (`ADMIN` or `MEMBER`).

```mermaid
erDiagram
    Workspace ||--o{ Board : "contains"
    Workspace ||--o{ WorkspaceMember : "has members"
    User ||--o{ WorkspaceMember : "belongs to"
    Board ||--o{ BoardMember : "has members"
    User ||--o{ BoardMember : "belongs to"

    Workspace {
        uuid id PK
        string name
        string githubInstallationId
        boolean isDeleted
    }
    Board {
        uuid id PK
        uuid workspaceId FK
        string name
        string repositoryName
        string githubRepoId
    }
    WorkspaceMember {
        bigint id PK
        uuid workspaceId FK
        uuid userId FK
        Role role
    }
    BoardMember {
        bigint id PK
        uuid boardId FK
        uuid userId FK
        Role role
    }
```

## 3. Tasks & Labels

Tasks represent the work items within a Board. A Task aligns with a GitHub Pull Request and follows a hardcoded Kanban status (`TODO`, `IN_PROGRESS`, `IN_REVIEW`, `CHANGES_REQUESTED`, `DONE`). Tasks can be assigned to multiple Users and tagged with Labels.

```mermaid
erDiagram
    Board ||--o{ Task : "contains"
    Board ||--o{ Label : "defines"
    Task }o--o{ User : "assigned to"
    Task }o--o{ Label : "tagged with"

    Task {
        bigint id PK
        uuid boardId FK
        string title
        string description
        TaskStatus status "TODO | IN_PROGRESS | IN_REVIEW | CHANGES_REQUESTED | DONE | CLOSED"
        int prNumber
        string branchName
    }
    Label {
        bigint id PK
        uuid boardId FK
        string name
        string color
    }
```

## 4. Billing & Subscriptions

This domain manages plans, pricing, and user subscriptions. A `Plan` defines the limits (like max boards and members), while a `Price` defines the cost and interval. A user can have one active `Subscription` at a time.

```mermaid
erDiagram
    Plan ||--o{ Price : "has"
    Price ||--o{ Subscription : "has"
    User ||--o{ Subscription : "owns"

    Plan {
        uuid id PK
        string name
        int maxBoards
        int maxMembersPerBoard
    }
    Price {
        uuid id PK
        uuid planId FK
        int amount
        string currency
        PriceInterval interval
    }
    Subscription {
        uuid id PK
        uuid userId FK
        uuid priceId FK
        SubscriptionStatus status
        datetime currentPeriodStart
        datetime currentPeriodEnd
    }
```
