function seedDatabase(db) {
  const tenantCount = db.prepare('SELECT COUNT(*) as c FROM tenants').get().c;
  if (tenantCount > 0) return;

  // Tenants
  const t1 = db.prepare(`INSERT INTO tenants (name, industry, country, employeeCount, readinessScore) VALUES (?,?,?,?,?)`).run('Meridian Financial Group', 'Financial Services', 'Germany', 1200, 62);
  const t2 = db.prepare(`INSERT INTO tenants (name, industry, country, employeeCount, readinessScore) VALUES (?,?,?,?,?)`).run('NovaTech Systems', 'Technology', 'Netherlands', 450, 41);

  const tid = t1.lastInsertRowid;

  // Users
  const u1 = db.prepare(`INSERT INTO users (tenantId,name,email,role) VALUES (?,?,?,?)`).run(tid,'Sarah Müller','sarah.muller@meridian.de','Compliance Manager');
  const u2 = db.prepare(`INSERT INTO users (tenantId,name,email,role) VALUES (?,?,?,?)`).run(tid,'James Kowalski','james.k@meridian.de','Manager');
  const u3 = db.prepare(`INSERT INTO users (tenantId,name,email,role) VALUES (?,?,?,?)`).run(tid,'Priya Sharma','priya.s@meridian.de','Employee');
  const u4 = db.prepare(`INSERT INTO users (tenantId,name,email,role) VALUES (?,?,?,?)`).run(tid,'Erik Lindqvist','erik.l@meridian.de','Auditor');
  db.prepare(`INSERT INTO users (tenantId,name,email,role) VALUES (?,?,?,?)`).run(t2.lastInsertRowid,'Tom Bakker','tom.b@novatech.nl','Compliance Manager');

  const uid1 = u1.lastInsertRowid;
  const uid2 = u2.lastInsertRowid;
  const uid3 = u3.lastInsertRowid;

  // AI Systems
  const sys1 = db.prepare(`INSERT INTO ai_systems (tenantId,name,provider,purpose,ownerUserId,dataSensitivity,customerFacing,approvalStatus,euAiActStatus,department,useCase) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
    tid,'ChatGPT Enterprise','OpenAI','Content generation and internal knowledge base Q&A',uid2,'Medium',0,'Approved','Compliant','Marketing & HR','Drafting communications, summarising policies, onboarding FAQs'
  );
  const sys2 = db.prepare(`INSERT INTO ai_systems (tenantId,name,provider,purpose,ownerUserId,dataSensitivity,customerFacing,approvalStatus,euAiActStatus,department,useCase) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
    tid,'GitHub Copilot','GitHub / Microsoft','AI-assisted code completion for engineering team',uid2,'Low',0,'Approved','Compliant','Engineering','Code suggestion, test generation, PR reviews'
  );
  const sys3 = db.prepare(`INSERT INTO ai_systems (tenantId,name,provider,purpose,ownerUserId,dataSensitivity,customerFacing,approvalStatus,euAiActStatus,department,useCase) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
    tid,'LoanSense AI','Internal (TensorFlow)','Automated credit scoring for loan applications',uid1,'Critical',1,'Under Review','In Progress','Lending','Evaluating creditworthiness, flagging high-risk applicants'
  );
  const sys4 = db.prepare(`INSERT INTO ai_systems (tenantId,name,provider,purpose,ownerUserId,dataSensitivity,customerFacing,approvalStatus,euAiActStatus,department,useCase) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
    tid,'FraudGuard ML','Internal (PyTorch)','Real-time transaction fraud detection',uid1,'High',1,'Approved','Non-Compliant','Risk & Compliance','Flagging suspicious transactions, automatic holds'
  );
  const sys5 = db.prepare(`INSERT INTO ai_systems (tenantId,name,provider,purpose,ownerUserId,dataSensitivity,customerFacing,approvalStatus,euAiActStatus,department,useCase) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
    tid,'HireIQ','Hirevue','CV screening and candidate ranking for recruitment',uid2,'High',0,'Pending','Not Assessed','Human Resources','Resume parsing, culture-fit scoring, interview scheduling'
  );
  const sys6 = db.prepare(`INSERT INTO ai_systems (tenantId,name,provider,purpose,ownerUserId,dataSensitivity,customerFacing,approvalStatus,euAiActStatus,department,useCase) VALUES (?,?,?,?,?,?,?,?,?,?,?)`).run(
    tid,'CustomerIQ','Salesforce Einstein','Customer churn prediction and upsell recommendations',uid2,'Medium',1,'Approved','Compliant','Customer Success','Predicting churn, recommending products, routing tickets'
  );

  const sid1 = sys1.lastInsertRowid;
  const sid3 = sys3.lastInsertRowid;
  const sid4 = sys4.lastInsertRowid;
  const sid5 = sys5.lastInsertRowid;

  // Assessments
  const qData3 = JSON.stringify({
    purpose: 'Credit scoring for loan decisions',
    users: 'Loan officers and automated decision pipeline',
    dataTypes: ['Financial history','Personal identifiers','Employment data'],
    oversight: 'Human review required for loans above €50k',
    geography: 'EU customers only',
    vulnerable: true,
    biometricData: false,
    lawEnforcement: false
  });
  db.prepare(`INSERT INTO assessments (aiSystemId,tenantId,questionnaireData,applicabilityResult,pathway,riskLevel,status) VALUES (?,?,?,?,?,?,?)`).run(
    sid3, tid, qData3,
    'High Risk — Article 6(2) Annex III',
    'LoanSense AI falls under Annex III category 5(b): AI systems used to evaluate creditworthiness of natural persons or establish their credit score. As this system influences access to financial services for EU residents, it is classified as HIGH RISK under the EU AI Act.',
    'High', 'Complete'
  );

  const qData4 = JSON.stringify({
    purpose: 'Fraud detection and transaction blocking',
    users: 'Automated pipeline with analyst review',
    dataTypes: ['Transaction data','Behavioural patterns','Device fingerprints'],
    oversight: 'Analysts review flagged transactions within 4 hours',
    geography: 'EU and global',
    vulnerable: false,
    biometricData: false,
    lawEnforcement: false
  });
  db.prepare(`INSERT INTO assessments (aiSystemId,tenantId,questionnaireData,applicabilityResult,pathway,riskLevel,status) VALUES (?,?,?,?,?,?,?)`).run(
    sid4, tid, qData4,
    'High Risk — Article 6(2) Annex III',
    'FraudGuard ML processes personal financial data to make automated decisions that restrict access to services. Under Annex III category 5(b) and the broad interpretation of "access to financial services", this system requires conformity assessment, technical documentation, and human oversight mechanisms.',
    'High', 'Complete'
  );

  // Requirements for LoanSense AI (High Risk)
  const reqs = [
    [sid3, tid, 'Art. 9', 'Risk Management System', 'Establish and maintain a risk management system throughout the AI lifecycle', 'In Progress', uid1, '2025-03-31'],
    [sid3, tid, 'Art. 10', 'Data Governance', 'Training, validation and testing datasets must meet quality criteria and be free of bias', 'Open', uid1, '2025-04-15'],
    [sid3, tid, 'Art. 11', 'Technical Documentation', 'Maintain technical documentation before market placement', 'In Progress', uid2, '2025-03-15'],
    [sid3, tid, 'Art. 12', 'Record Keeping', 'Automatic logging of system activity for traceability', 'Open', uid2, '2025-05-01'],
    [sid3, tid, 'Art. 13', 'Transparency & Provision of Information', 'High-risk AI must be transparent to deployers with appropriate instructions', 'Complete', uid1, '2025-02-01'],
    [sid3, tid, 'Art. 14', 'Human Oversight', 'Effective human oversight measures must be implemented', 'In Progress', uid1, '2025-03-20'],
    [sid3, tid, 'Art. 15', 'Accuracy & Robustness', 'System must achieve appropriate levels of accuracy and be robust against errors', 'Open', uid2, '2025-06-01'],
    [sid3, tid, 'Art. 16', 'Obligations of Providers', 'Register in EU database, affix CE marking, draw up EU declaration of conformity', 'Open', uid1, '2025-07-01'],
  ];

  // Requirements for FraudGuard ML
  const reqsFraud = [
    [sid4, tid, 'Art. 9', 'Risk Management System', 'Risk management system required for high-risk AI', 'Open', uid1, '2025-04-01'],
    [sid4, tid, 'Art. 10', 'Data Governance', 'Training data must be bias-tested for protected characteristics', 'Open', uid1, '2025-04-30'],
    [sid4, tid, 'Art. 11', 'Technical Documentation', 'Full technical documentation including architecture and training data description', 'Open', uid2, '2025-05-15'],
    [sid4, tid, 'Art. 14', 'Human Oversight', 'Humans must be able to interpret and override AI decisions', 'Open', uid1, '2025-03-30'],
    [sid4, tid, 'Art. 17', 'Quality Management', 'Quality management system with documented procedures', 'Open', uid2, '2025-06-15'],
  ];

  const insertReq = db.prepare(`INSERT INTO requirements (aiSystemId,tenantId,article,title,description,status,ownerUserId,dueDate) VALUES (?,?,?,?,?,?,?,?)`);
  const reqIds = [];
  for (const r of [...reqs, ...reqsFraud]) {
    reqIds.push(insertReq.run(...r).lastInsertRowid);
  }

  // Gaps
  const gaps = [
    [reqIds[0], tid, 'High', 'Risk management system not formally documented or reviewed by risk committee', 'Draft and ratify a risk management policy covering LoanSense AI lifecycle. Assign risk owner and schedule quarterly reviews.', 'In Progress'],
    [reqIds[1], tid, 'Critical', 'Training dataset has not undergone bias testing for protected characteristics (age, gender, ethnicity)', 'Commission independent bias audit of training data. Use IBM AI Fairness 360 or equivalent. Establish ongoing bias monitoring.', 'Open'],
    [reqIds[2], tid, 'Medium', 'Technical documentation exists but is incomplete — missing model card and data sheet', 'Complete the model card using the EU AI Act Annex IV template. Include training data description, performance metrics by demographic group.', 'In Progress'],
    [reqIds[3], tid, 'High', 'Logging captures decisions but not model inputs — insufficient for traceability requirements', 'Extend logging to capture all model inputs per decision. Retain logs for minimum 10 years as required for financial AI systems.', 'Open'],
    [reqIds[5], tid, 'Critical', 'Human override mechanism exists but is not tested or accessible to all relevant staff', 'Implement formal override workflow with audit trail. Train all loan officers. Run quarterly override drills.', 'In Progress'],
    [reqIds[8], tid, 'Critical', 'No risk management system exists for FraudGuard ML — gap identified during audit', 'Immediately initiate risk management system creation. Assign DPO as interim risk owner. Target completion within 60 days.', 'Open'],
    [reqIds[9], tid, 'High', 'FraudGuard training data includes transaction data from 2018–2020 which may not reflect current fraud patterns', 'Retrain on 2023–2024 data. Conduct bias analysis across customer segments before deployment.', 'Open'],
    [reqIds[11], tid, 'High', 'FraudGuard decisions cannot be overridden manually — automatic blocks cannot be lifted without IT intervention', 'Develop analyst portal for manual override. Target 15-minute SLA for analyst review of all flagged transactions.', 'Open'],
  ];

  const insertGap = db.prepare(`INSERT INTO gaps (requirementId,tenantId,priority,description,recommendedAction,status) VALUES (?,?,?,?,?,?)`);
  for (const g of gaps) insertGap.run(...g);

  // Incidents
  const incidents = [
    [tid, sid4, 'FraudGuard false positive wave — 340 legitimate transactions blocked', 'High', 'Resolved', 'Model drift caused elevated false positives over 6-hour period on 2024-11-08. 340 customers affected. Root cause: distribution shift in merchant category codes. Resolved by model rollback.', 'Erik Lindqvist'],
    [tid, sid3, 'LoanSense bias complaint — applicant group with non-EU names scored lower', 'Critical', 'Investigating', 'Internal audit flagged statistically significant score difference between applicants with EU vs non-EU origin names. DPO notified. Independent review commissioned.', 'Sarah Müller'],
    [tid, sid5, 'HireIQ screening criteria missing accessibility accommodations', 'Medium', 'Open', 'Recruitment team reported that HireIQ filtered out candidates who disclosed disability-related employment gaps. Legal team reviewing.', 'James Kowalski'],
  ];

  const insertInc = db.prepare(`INSERT INTO incidents (tenantId,aiSystemId,title,severity,status,description,reportedBy) VALUES (?,?,?,?,?,?,?)`);
  for (const i of incidents) insertInc.run(...i);

  // Ask sessions (sample Q&A history)
  const sessions = [
    [uid1, tid, sid3, 'Is LoanSense AI subject to the EU AI Act?', 'Yes. LoanSense AI falls under Annex III, Category 5(b) of the EU AI Act, which covers AI systems used to evaluate the creditworthiness of natural persons or establish their credit score. This classifies it as HIGH RISK. You are required to implement: a risk management system (Art. 9), data governance controls (Art. 10), technical documentation (Art. 11), logging (Art. 12), human oversight (Art. 14), and register the system in the EU database before deployment.', JSON.stringify(['EU AI Act Art. 6(2)','Annex III Category 5(b)','Art. 9-15 compliance checklist'])],
    [uid3, tid, null, 'Can I upload customer data to ChatGPT?', 'Based on Meridian Financial Group\'s AI policy and ChatGPT Enterprise\'s data sensitivity classification (Medium), you MAY upload:\n✅ Anonymised or pseudonymised customer data\n✅ Internal documents without personal identifiers\n✅ Aggregated/statistical reports\n\nYou must NOT upload:\n❌ Full customer PII (name + account number + transaction data)\n❌ Sensitive financial records directly attributable to individuals\n❌ Data subject to bank secrecy obligations\n\nRecommended action: Use the approved data anonymisation tool before uploading any customer-related content.', JSON.stringify(['ChatGPT Enterprise Data Processing Agreement','Meridian AI Use Policy v2.1','GDPR Art. 25 (Data minimisation)'])],
    [uid2, tid, sid5, 'What do we need to do before deploying HireIQ?', 'HireIQ (CV screening, High Risk under Annex III Category 1(a)) requires the following before deployment:\n\n1. **Complete EU AI Act Assessment** — currently Not Assessed\n2. **Bias audit** of CV scoring algorithm across protected characteristics\n3. **Human oversight mechanism** — every rejection must be reviewable by an HR manager\n4. **Candidate transparency notice** — inform applicants that AI is used in screening\n5. **Technical documentation** per Annex IV\n6. **Manager approval** — currently Pending\n\nEstimated timeline: 8–12 weeks to achieve compliance readiness.', JSON.stringify(['EU AI Act Annex III Category 1(a)','Art. 14 Human Oversight','GDPR Art. 22 Automated Decision-Making'])],
  ];

  const insertAsk = db.prepare(`INSERT INTO ask_sessions (userId,tenantId,aiSystemId,question,answer,sources) VALUES (?,?,?,?,?,?)`);
  for (const s of sessions) insertAsk.run(...s);

  console.log('[seed] Database seeded with sample data');
}

module.exports = { seedDatabase };
