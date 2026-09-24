# MVP Plan: ComplianceOS

## Description
Multi-tenant EU AI Act compliance platform with AI system inventory, readiness scoring, regulatory assessment engine, and an AI-powered compliance assistant.

## Tech Stack
- **frontend**: Next.js 14 + TypeScript + Tailwind CSS
- **backend**: Python + FastAPI
- **database**: PostgreSQL (SQLite for demo)
- **testing**: Playwright

## Features
1. Command Centre dashboard — readiness score gauge, open gaps, pending approvals, incidents, and 'What needs attention today' panel with role-aware quick actions
2. AI System Inventory — register AI tools (ChatGPT, Copilot, internal models), tag provider/purpose/data sensitivity, set owner and approval status
3. EU AI Act Assessment — questionnaire flow per AI system (purpose, users, data, oversight, geography) that produces an applicability result with pathway explanation and gap list
4. Ask ComplianceOS — contextual AI assistant scoped to the user's role and selected AI system; answers questions like 'Can I upload customer data to ChatGPT?' with sources and recommended actions
5. RBAC role switcher — toggle between Employee / Manager / Compliance Manager / Auditor views to demonstrate permission-scoped UI (read-only vs manage vs admin panels)

## Pages
- Landing
- Login
- Command Centre
- AI Inventory
- AI System Detail
- EU AI Act Assessment
- Requirements & Gaps
- Ask ComplianceOS
- Super Admin Portal

## API Endpoints
- GET /api/dashboard/summary
- GET /api/ai-systems
- POST /api/ai-systems
- GET /api/ai-systems/{id}
- GET /api/ai-systems/{id}/assessment
- POST /api/ai-systems/{id}/assessment
- GET /api/requirements
- GET /api/requirements/{id}
- POST /api/ask
- GET /api/tenants
- POST /api/tenants
- GET /api/users/me
- GET /api/gaps

## Data Models
### Tenant
Fields: id, name, industry, country, employeeCount, readinessScore, createdAt

### User
Fields: id, tenantId, name, email, role, createdAt

### AISystem
Fields: id, tenantId, name, provider, purpose, ownerUserId, dataSensitivity, customerFacing, approvalStatus, euAiActStatus, createdAt

### Assessment
Fields: id, aiSystemId, tenantId, questionnaireData, applicabilityResult, pathway, riskLevel, status, createdAt

### Requirement
Fields: id, aiSystemId, tenantId, article, title, status, ownerUserId, dueDate, createdAt

### Gap
Fields: id, requirementId, tenantId, priority, description, recommendedAction, status, createdAt

### AskSession
Fields: id, userId, tenantId, aiSystemId, question, answer, sources, modelVersion, createdAt
