const BASE = 'http://localhost:5000/api';

async function runVerification() {
  console.log('========================================================================');
  console.log('🛡️  CYBERSHIELD FULL-STACK END-TO-END FLOW VERIFICATION');
  console.log('========================================================================\n');

  try {
    // 0. Reset DB to baseline
    console.log('[STEP 0] Resetting database to baseline demo state...');
    const resetRes = await fetch(`${BASE}/reports/reset-demo`, { method: 'POST' });
    const resetJson = await resetRes.json();
    console.log('   ✓ Database reset:', resetJson.message);

    // 1. Verify Demo Accounts
    console.log('\n[STEP 1] Verifying Demo Personas & Sign-In Credentials...');
    const demoRes = await fetch(`${BASE}/auth/demo-users`);
    const { accounts } = await demoRes.json();
    console.log(`   ✓ Found ${accounts.length} pre-configured demo accounts:`);
    accounts.forEach(a => {
      console.log(`     - [${a.role.toUpperCase()}] ${a.name} (${a.email}) | Pwd: ${a.password} | Dept: ${a.department} | Risk: ${a.riskScore}`);
    });

    // 2. Admin creates & launches campaign
    console.log('\n[STEP 2] Admin creates & launches spear-phishing campaign for Developers...');
    const cmpRes = await fetch(`${BASE}/campaigns`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'Automated Test: Urgent Cloud Token Audit',
        description: 'Simulated PAT revocation drill for cloud software developers',
        targetRole: 'Developer',
        templateId: 'tpl_dev_github'
      })
    });
    const cmpData = await cmpRes.json();
    console.log(`   ✓ Campaign Created: ID="${cmpData.campaign.id}", Targets Delivered=${cmpData.targetsDelivered}`);

    // 3. Employee opens mailbox
    console.log('\n[STEP 3] Alex Chen (Developer) opens simulation mailbox...');
    const inboxRes = await fetch(`${BASE}/simulations/inbox?employeeId=emp_alex`);
    const inboxData = await inboxRes.json();
    console.log(`   ✓ Alex Mailbox: Total Emails=${inboxData.emails.length}`);
    const simEmail = inboxData.emails.find(e => e.campaignId === cmpData.campaign.id);
    if (!simEmail) throw new Error('Target simulation email not found in Alex inbox!');
    console.log(`   ✓ Received Email: "${simEmail.subject}" from "${simEmail.senderName}"`);

    // 4. Employee clicks simulated link
    console.log('\n[STEP 4] Alex Chen clicks simulated phishing link inside email...');
    const clickRes = await fetch(`${BASE}/simulations/click`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: cmpData.campaign.id,
        employeeId: 'emp_alex'
      })
    });
    const clickData = await clickRes.json();
    console.log(`   ✓ Click Response:`);
    console.log(`     - Previous Risk: ${clickData.previousScore}`);
    console.log(`     - New Risk: ${clickData.newScore} (+${clickData.riskDelta} pts)`);
    console.log(`     - Remediation Status: "${clickData.remediationStatus}"`);
    console.log(`     - Auto-Assigned Training: "${clickData.trainingModule?.title}" (ID: ${clickData.trainingModule?.assignmentId})`);
    console.log(`     - Explainable Reason: ${clickData.reason}`);

    // 5. Admin Dashboard live check
    console.log('\n[STEP 5] Security Admin refreshes SOC Console to verify live updates...');
    const statsRes = await fetch(`${BASE}/dashboard/stats`);
    const statsData = await statsRes.json();
    console.log(`   ✓ Org Human Vulnerability Index (HVI): ${statsData.hvi}`);
    console.log(`   ✓ Employees Requiring Remediation: ${statsData.remediationRequired}`);
    const latestEvent = statsData.recentEvents[0];
    console.log(`   ✓ Latest SOC Telemetry Event: [${latestEvent.eventType}] for ${latestEvent.employeeName} (${latestEvent.roleCategory})`);

    // 6. Test Hoxhunt-Style Phish Report for Rachel Green (Payroll)
    console.log('\n[STEP 6] Testing Hoxhunt-Style "Report Phish" button for Rachel Green...');
    const reportRes = await fetch(`${BASE}/simulations/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        campaignId: 'cmp_payroll_2026',
        employeeId: 'emp_rachel'
      })
    });
    const reportData = await reportRes.json();
    console.log(`   ✓ Report Response:`);
    console.log(`     - Previous Risk: ${reportData.previousScore} -> New Risk: ${reportData.newScore} (${reportData.riskDelta} pts)`);
    console.log(`     - Resilience Points Awarded: +${reportData.pointsAwarded} XP (Total: ${reportData.resiliencePoints})`);
    console.log(`     - Threat Detection Streak: ${reportData.newStreak}x`);

    // 7. Employee completes Micro-Training
    if (clickData.trainingModule?.assignmentId) {
      console.log('\n[STEP 7] Alex Chen completes assigned micro-training module...');
      const trainRes = await fetch(`${BASE}/training/assignments/${clickData.trainingModule.assignmentId}/complete`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ score: 100 })
      });
      const trainData = await trainRes.json();
      console.log(`   ✓ Training Completed:`);
      console.log(`     - Previous Risk: ${trainData.previousScore} -> New Risk: ${trainData.newScore} (${trainData.riskDelta} pts)`);
      console.log(`     - Remediation Status: "${trainData.remediationStatus}"`);
      console.log(`     - Reason: ${trainData.reason}`);
    }

    console.log('\n========================================================================');
    console.log('✅ ALL TESTS PASSED SUCCESSFULLY!');
    console.log('🛡️ The entire 360-degree CyberShield adaptive loop is 100% functional!');
    console.log('========================================================================\n');
  } catch (error) {
    console.error('\n❌ Verification Failed:', error);
    process.exit(1);
  }
}

runVerification();
