# 🚀 Pilot Program Infrastructure - Go/No-Go Checklist

## **Phase 1: Scoring Continuity Verification (MUST PASS 100%)**

### ✅ Regression Tests
- [ ] **Golden Vector Tests**: All 4 test vectors pass with exact scoring
- [ ] **Score Range Validation**: 35-100 range maintained
- [ ] **Star Rating Validation**: 1-5 system maintained  
- [ ] **Category Weights**: 20%, 25%, 20%, 15%, 20% maintained
- [ ] **Scoring Version Lock**: "locked-2025-01-27" maintained

**Command to run:**
```bash
npm test -- tests/regression/scoringContinuity.spec.ts
```

**Acceptance Criteria:**
- ✅ All vectors match exactly
- ❌ Any drift → STOP & investigate scoring pipeline

---

## **Phase 2: End-to-End Pilot Flow (Queens College Dry-Run)**

### ✅ Partner Cohort Creation
- [ ] **Seed Test Data**: Run seed script successfully
- [ ] **Partner Creation**: Queens College partner created in Firestore
- [ ] **Cohort Creation**: Fall 2025 cohort created with assessment URL
- [ ] **Assessment URL**: Contains `?partner_id=...&cohort_id=...`

**Command to run:**
```bash
npx ts-node scripts/seedTestData.ts
```

### ✅ Assessment Flow Testing
- [ ] **Mobile Assessment**: Complete 25-question flow on mobile
- [ ] **Desktop Assessment**: Complete 25-question flow on desktop
- [ ] **Partner Metadata**: Captured in Firestore document
- [ ] **Outcome Tracking Ready**: Set to `true`
- [ ] **Consent for ML**: Present and functional
- [ ] **Scoring Continuity**: 35-100 range, 5-star system maintained

### ✅ Outcome Tagging
- [ ] **Breakthrough Tag**: Successfully tagged with notes
- [ ] **Stagnation Tag**: Successfully tagged with notes
- [ ] **Firestore Write**: Outcome data written correctly
- [ ] **Google Sheets Sync**: Outbox pattern working
- [ ] **Error Handling**: Graceful failure when Google Sheets API down

### ✅ Metrics Generation
- [ ] **Pilot Metrics Callable**: Returns correct data
- [ ] **Total Assessments**: Matches seeded data
- [ ] **Completion Rate**: Calculated correctly
- [ ] **Average Score**: Uses existing 35-100 range
- [ ] **Outcome Distribution**: Matches tagged outcomes

**Command to test:**
```bash
firebase functions:shell
getPilotMetrics({ partnerId: "queens-college-test", cohortId: "fall-2025-test" })
```

### ✅ Negative Path Testing
- [ ] **Missing Partner ID**: Assessment blocked with friendly error
- [ ] **Invalid Partner ID**: Assessment blocked with validation error
- [ ] **Missing Cohort ID**: Assessment blocked with friendly error
- [ ] **Tampered Parameters**: Blocked with security error

---

## **Phase 3: Security & Privacy (MUST PASS 100%)**

### ✅ Firestore Rules Testing
- [ ] **Partner Read Access**: Can only read their own cohort sessions
- [ ] **User Privacy**: Users can only read their own sessions
- [ ] **Scoring Protection**: Partners cannot modify scoring fields
- [ ] **Cross-Partner Isolation**: Partners cannot read other partners' data
- [ ] **Anonymous Access**: Assessment creation allowed without auth

**Command to run:**
```bash
npm test -- tests/security/firestoreRules.spec.ts
```

### ✅ Consent & Privacy
- [ ] **Consent Copy**: Clear and compliant language
- [ ] **Data Usage**: Transparent about ML training
- [ ] **No PII Leakage**: Assessment URLs don't expose sensitive data
- [ ] **Partner Data Limits**: Partners only see aggregated metrics

---

## **Phase 4: Prototype Acceptance**

### ✅ Shareable Score Badge
- [ ] **Badge Generation**: SVG badge created successfully
- [ ] **Score Display**: Uses existing 35-100 range
- [ ] **Star Rating**: Uses existing 5-star system
- [ ] **Category Breakdown**: Uses existing category weights
- [ ] **Social Sharing**: LinkedIn, Copy Link buttons functional
- [ ] **No PII Exposure**: Badge doesn't leak personal information

### ✅ Funder-Ready Auto-Report
- [ ] **Data Aggregation**: Uses existing assessment data
- [ ] **PDF Generation**: Puppeteer creates report within 30s
- [ ] **Report Content**: Includes completion %, avg score, outcomes
- [ ] **Brand Compliance**: Follows Gutcheck.AI guidelines
- [ ] **File Size**: Report < 2MB

---

## **Phase 5: Observability & Error Handling**

### ✅ Logging & Monitoring
- [ ] **Structured Logs**: Include requestId, partnerId, cohortId
- [ ] **Error Codes**: Consistent error taxonomy
- [ ] **Performance Monitoring**: Response times tracked
- [ ] **Usage Analytics**: Partner activity tracked

### ✅ Error Recovery
- [ ] **Google Sheets Outbox**: Retry mechanism working
- [ ] **Exponential Backoff**: Proper retry timing
- [ ] **Alert System**: Failed syncs trigger alerts
- [ ] **Graceful Degradation**: System works without Google Sheets

---

## **Phase 6: Performance & Scalability**

### ✅ Response Times
- [ ] **Assessment Loading**: < 2s on mobile
- [ ] **Score Calculation**: < 1s
- [ ] **Metrics Generation**: < 3s
- [ ] **Badge Generation**: < 5s
- [ ] **PDF Report**: < 30s

### ✅ Scalability
- [ ] **Concurrent Users**: 100+ simultaneous assessments
- [ ] **Data Volume**: 1000+ sessions per cohort
- [ ] **Storage Efficiency**: Optimized Firestore queries
- [ ] **Cost Optimization**: Efficient resource usage

---

## **🚨 Go/No-Go Decision Matrix**

### **GO Criteria (ALL must be true):**
- ✅ **Scoring Regression**: 100% pass rate
- ✅ **E2E Pilot Flow**: Complete end-to-end success
- ✅ **Security Rules**: All tests pass
- ✅ **Badge Prototype**: Functional and secure
- ✅ **Report Prototype**: Generated successfully
- ✅ **Performance**: All response times met
- ✅ **Error Handling**: Graceful failure modes

### **NO-GO Criteria (ANY failure):**
- ❌ **Score Drift**: Any golden vector mismatch
- ❌ **Security Violation**: Partner can access other data
- ❌ **Data Leakage**: PII exposed in URLs or badges
- ❌ **Performance Failure**: Response times exceeded
- ❌ **Critical Error**: System crashes or data corruption

---

## **📅 Day-by-Day Execution Plan**

### **Day 1 (Today)**
- [ ] Run scoring regression tests
- [ ] Seed Queens College test data
- [ ] Complete 2 dummy assessments (mobile + desktop)

### **Day 2**
- [ ] Test outcome tagging workflow
- [ ] Run security rules tests
- [ ] Verify Google Sheets sync

### **Day 3**
- [ ] Implement badge generation
- [ ] Test metrics callable
- [ ] Performance testing

### **Day 4**
- [ ] Implement PDF report generation
- [ ] Partner dry-run with Queens College
- [ ] Final security review

### **Day 5 (Buffer)**
- [ ] Bug fixes and polish
- [ ] Documentation updates
- [ ] Demo preparation

---

## **🎯 Success Metrics**

### **Technical Metrics:**
- **Scoring Accuracy**: 100% regression test pass rate
- **Security**: 100% rules test pass rate
- **Performance**: All response times within limits
- **Reliability**: 99.9% uptime during testing

### **Business Metrics:**
- **Partner Satisfaction**: Queens College confirms usability
- **Data Quality**: ML-ready outcome data collected
- **User Experience**: Smooth assessment flow
- **Scalability**: Ready for 100+ participants

---

## **📞 Emergency Contacts**

- **Technical Issues**: Development team
- **Security Concerns**: Security team
- **Partner Relations**: Product team
- **Legal/Privacy**: Legal team

---

**Last Updated**: January 27, 2025  
**Next Review**: After each phase completion  
**Approval Required**: Product Owner + Technical Lead
