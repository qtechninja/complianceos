function createSchema(db) {
  db.exec(`
    CREATE TABLE IF NOT EXISTS tenants (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      industry TEXT NOT NULL,
      country TEXT NOT NULL,
      employeeCount INTEGER NOT NULL DEFAULT 0,
      readinessScore INTEGER NOT NULL DEFAULT 0,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenantId INTEGER NOT NULL REFERENCES tenants(id),
      name TEXT NOT NULL,
      email TEXT NOT NULL UNIQUE,
      role TEXT NOT NULL CHECK(role IN ('Employee','Manager','Compliance Manager','Auditor')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ai_systems (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenantId INTEGER NOT NULL REFERENCES tenants(id),
      name TEXT NOT NULL,
      provider TEXT NOT NULL,
      purpose TEXT NOT NULL,
      ownerUserId INTEGER REFERENCES users(id),
      dataSensitivity TEXT NOT NULL CHECK(dataSensitivity IN ('Low','Medium','High','Critical')),
      customerFacing INTEGER NOT NULL DEFAULT 0,
      approvalStatus TEXT NOT NULL CHECK(approvalStatus IN ('Pending','Approved','Under Review','Rejected')),
      euAiActStatus TEXT NOT NULL CHECK(euAiActStatus IN ('Not Assessed','In Progress','Compliant','Non-Compliant','Exempt')),
      department TEXT,
      useCase TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS assessments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aiSystemId INTEGER NOT NULL REFERENCES ai_systems(id),
      tenantId INTEGER NOT NULL REFERENCES tenants(id),
      questionnaireData TEXT NOT NULL DEFAULT '{}',
      applicabilityResult TEXT,
      pathway TEXT,
      riskLevel TEXT CHECK(riskLevel IN ('Unacceptable','High','Limited','Minimal','Exempt')),
      status TEXT NOT NULL CHECK(status IN ('Draft','Complete')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS requirements (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      aiSystemId INTEGER NOT NULL REFERENCES ai_systems(id),
      tenantId INTEGER NOT NULL REFERENCES tenants(id),
      article TEXT NOT NULL,
      title TEXT NOT NULL,
      description TEXT,
      status TEXT NOT NULL CHECK(status IN ('Open','In Progress','Complete','Waived')),
      ownerUserId INTEGER REFERENCES users(id),
      dueDate TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS gaps (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      requirementId INTEGER NOT NULL REFERENCES requirements(id),
      tenantId INTEGER NOT NULL REFERENCES tenants(id),
      priority TEXT NOT NULL CHECK(priority IN ('Critical','High','Medium','Low')),
      description TEXT NOT NULL,
      recommendedAction TEXT NOT NULL,
      status TEXT NOT NULL CHECK(status IN ('Open','In Progress','Resolved','Accepted')),
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS ask_sessions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      userId INTEGER REFERENCES users(id),
      tenantId INTEGER NOT NULL REFERENCES tenants(id),
      aiSystemId INTEGER REFERENCES ai_systems(id),
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      sources TEXT NOT NULL DEFAULT '[]',
      modelVersion TEXT NOT NULL DEFAULT 'ComplianceOS-1.0',
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS incidents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      tenantId INTEGER NOT NULL REFERENCES tenants(id),
      aiSystemId INTEGER REFERENCES ai_systems(id),
      title TEXT NOT NULL,
      severity TEXT NOT NULL CHECK(severity IN ('Critical','High','Medium','Low')),
      status TEXT NOT NULL CHECK(status IN ('Open','Investigating','Resolved')),
      description TEXT,
      reportedBy TEXT,
      createdAt TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

module.exports = { createSchema };
