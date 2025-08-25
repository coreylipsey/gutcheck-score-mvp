# **Product Requirements Document (PRD)**
**Feature Name:** Pilot Program Operationalization
**Owner:** The Gutcheck.AI Development Team
**Last Updated:** January 27, 2025
**Status:** Draft

## **1. Overview / Summary**

This PRD outlines the requirements for operationalizing initial pilot programs with ecosystem partners like Queens College. The goal is to deliver a scalable, AI-native intake and behavior-tracking system that surfaces entrepreneurial potential, driving measurable action among early-stage founders within a structured "test-and-learn" funnel. This initiative focuses on enabling partners to seamlessly embed Gutcheck Score™ into their programs, and critically, to collect structured outcome data that directly fuels our machine learning model's learning loop and builds our proprietary data moat.

## **2. Problem Statement (Refined)**

While Gutcheck.AI has a core assessment built on Next.js, Firebase, and Google Cloud infrastructure, there's a need to formalize and streamline the process for institutional partners to effectively run pilot programs and contribute crucial outcome data. Partners require clear mechanisms for onboarding cohorts, delivering assessments, collecting feedback, and understanding basic user progression within their programs. Without proper operationalization of these data collection points, pilots may lack consistent, ML-ready data, hindering Gutcheck.AI's ability to validate its value proposition as "infrastructure" and secure future, data-driven partnerships.

## **3. Goals & Success Metrics**

**Goal 1:** Successfully activate and track initial institutional pilot programs, capturing ML-ready data.
* **Success Metric 1:** Launch and actively track 3 live institutional pilot programs by Q3 2025 (e.g., Queens College, Howard University, Bronx Tech Hub).
* **Success Metric 2:** Achieve an assessment completion rate of 60%+ for pilot cohorts.

**Goal 2:** Establish basic tracking of user journeys and feedback, directly contributing to the Outcome Learning Loop.
* **Success Metric 3:** Successfully track basic growth journeys and collect initial mentor matches/resource usage for 40% of pilot users within 30 days.
* **Success Metric 4:** Implement initial tagging of pilot outcomes (e.g., "stagnation," "no growth," "breakthrough") for at least 2 pilot cohorts, following preliminary schema.

## **4. Target Users**

**Ecosystem Partners (e.g., Queens College Tech Hub, Howard University, Bronx Tech Hub):**
* **Benefit:** Gain a streamlined process for onboarding their entrepreneurial cohorts to Gutcheck.AI, delivering the assessment, and having a basic way to understand their participants' engagement and initial progress. This allows them to leverage Gutcheck Score™ to contextualize talent and signal relevance within their physical sessions and programs, while also contributing crucial data for the collective good.

**HENRIs (within pilot programs):**
* **Benefit:** Receive access to the Gutcheck Score™ assessment through trusted institutional channels, leading to personalized feedback and actionable steps that integrate with their program's resources. Their engagement directly contributes to refining the predictive model that will help future entrepreneurs.

**Internal Operations (Corey/Admin/Data Science):**
* **Benefit:** Ability to monitor pilot health, collect structured feedback, and gather ML-ready data to validate the platform's "Activation to Engagement to Insight" modular layer. This is crucial for scaling partnerships and for the foundational phases of building the predictive ML model (Phase 1: Define Outcome Anchors, Phase 2: Integrate and Clean Source Data).

## **5. User Stories**

* **As an Ecosystem Partner**, I want to easily onboard a cohort of entrepreneurs to Gutcheck.AI, so that they can take the assessment as part of my program.
    * **Acceptance Criteria:** Gutcheck.AI provides a unique link or simple embed for the partner to share with their cohort. The onboarding process for the partner is clear and takes less than 10 minutes.

* **As an Ecosystem Partner**, I want to receive basic feedback and engagement data from my cohort's Gutcheck.AI activity, so that I can track their progress and contextualize their scores and contribute outcome data.
    * **Acceptance Criteria:** Gutcheck.AI provides a basic (e.g., Airtable-based or simple dashboard) view of cohort assessment completion rates, scores, and general engagement. A clear, simple mechanism is provided for partners to input/tag basic outcome data for their cohort members.

* **As a HENRI within a pilot program**, I want to easily take the Gutcheck.AI assessment as guided by my program, so that my results can inform my journey within the program and contribute to a smarter system for future founders.
    * **Acceptance Criteria:** The assessment link/embed provided by the partner works seamlessly. The assessment experience is consistent with general Gutcheck.AI standards. A clear, transparent consent mechanism for data usage in the ML model is presented.

* **As an admin**, I want to monitor the status of all active pilot programs and the data being collected, so that I can ensure data integrity and provide timely support to partners.
    * **Acceptance Criteria:** An admin dashboard or Airtable base provides a real-time view of pilot cohort progress, assessment completion rates, and key engagement metrics.

* **As an admin**, I want to have a clear process to tag and collect outcome data from partners, so that our ML model's learning loop is fueled with structured, reliable data.
    * **Acceptance Criteria:** The system provides a mechanism for partners to submit outcome tags (e.g., "stagnation," "breakthrough") for their users, and this data is correctly stored alongside the user's assessment record.

## **6. Functional Requirements (Refined)**

### **6.1 Partner Cohort Management**
* The system must implement a partner-facing onboarding process for creating pilot cohorts and generating unique, shareable assessment links.
* Each partner cohort must be assigned a unique `partner_id` and `cohort_id` that are stored in Firestore.
* The system must generate unique assessment URLs in the format: `gutcheck.ai/assessment?partner_id={partner_id}&cohort_id={cohort_id}`

### **6.2 Assessment Data Collection**
* The backend must be updated to store metadata from these links (e.g., `partner_id`, `cohort_id`) in all new assessment records in the `assessmentSessions` Firestore collection.
* The system must implement the "Tag-Ready Data Layer" principles for new assessment data collected:
    * Generate and assign a persistent `User_ID` and `Assessment_Session_ID` at the beginning of each submission.
    * Store these IDs in all related Firestore collections.
    * Add an `Outcome_Tracking_Ready?` flag to each record (default = ✅ for new assessments).
    * Store metadata like scoring version, timestamp, and partner cohort.
    * Capture "Early Soft Signals of Future Outcomes" via optional questions at the end of the assessment.

### **6.3 Outcome Data Collection**
* The system must implement a clear data collection mechanism (e.g., a simple form or Airtable view) for partners to input user outcome data.
* The backend must ensure all outcome data is tagged with a consistent schema and stored in a format that is "ML-ready" for future model training.
* The system must handle `User_ID` and `Assessment_Session_ID` being explicitly stored in Firestore to allow for joining historical scores with future outcomes.

### **6.4 Data Integration with Existing Architecture**
* All new functionality must integrate with the existing Clean Architecture structure:
    * **Domain Layer**: Extend `AssessmentSession` entity to include partner metadata
    * **Application Layer**: Create new use cases for partner cohort management
    * **Infrastructure Layer**: Extend `FirestoreAssessmentRepository` for partner data
    * **Presentation Layer**: Add partner-facing components and routes

## **7. Non-Functional Requirements (Refined)**

* **Reliability:** The partner onboarding and assessment delivery process must be highly reliable, with clear error handling for Firebase API failures.
* **Data Integrity:** All new data collection and storage processes must ensure data integrity for future ML model training, leveraging Firestore's ACID compliance.
* **Security:** All data must be handled securely with appropriate Firestore security rules for partners and internal teams.
* **Scalability:** The system must be able to handle a growing number of pilot cohorts and assessment submissions without performance degradation, leveraging Google Cloud's auto-scaling capabilities.

## **8. Technical Considerations / High-Level Design (Refined)**

### **8.1 Current Architecture Integration**
The system will extend the existing Clean Architecture implementation:

**Frontend (Next.js 14):**
* Partner portal pages for cohort management
* Assessment flow updates to capture partner metadata
* Admin dashboard for pilot monitoring

**Backend (Firebase Cloud Functions):**
* New Cloud Functions for partner cohort management
* Extensions to existing assessment processing functions
* Integration with existing Gemini AI services

**Database (Firestore):**
* New collections: `partnerCohorts`, `outcomeData`
* Extended `assessmentSessions` collection with partner metadata
* Proper indexing for partner-based queries

### **8.2 Data Flow Architecture**
```
Partner creates cohort → Firestore stores cohort data → 
Partner shares assessment link → User completes assessment → 
Firebase Functions process and score → Firestore stores with partner metadata → 
Partner inputs outcome data → Admin monitors via dashboard
```

### **8.3 Integration Points**
* **Existing Assessment System**: Extend current 25-question framework
* **Scoring Engine**: Integrate with locked scoring system (ScoringService.ts)
* **AI Services**: Leverage existing GeminiAssessmentService
* **Authentication**: Extend current Firebase Auth system
* **Deployment**: Use existing Cloud Build pipeline

## **9. Assumptions & Constraints (Refined)**

* **Assumptions:** The technical design will initially rely on Airtable as the primary data management tool for partners and internal operations. The partner-facing UI does not need to be a custom application; a streamlined interface (e.g., Airtable view) is sufficient for the MVP.
* **Constraints:** Limited development resources (solo founder) mean prioritizing these critical operational and data collection features. The focus is on functionality and data integrity over a custom, polished UI for partners.

## **10. Open Questions / Decisions Needed (Refined)**

* What is the exact schema and data model for collecting and tagging user outcome data from partners?
* What is the exact wording and placement of the user consent prompt for outcome tracking within the assessment flow?
* Confirm the roles and permissions required for partners to access the data collection tools (e.g., Airtable).
* Define the URL structure for the partner-specific assessment embeds (e.g., `gutcheck.ai/assessment?partner_id=x&cohort_id=y`).
* How will partner authentication and access control be implemented within the existing Firebase Auth system?

## **11. Implementation Plan**

### **Phase 1: Foundation (Weeks 1-2)**
* Extend Firestore data model for partner cohorts
* Create partner cohort management Cloud Functions
* Update assessment flow to capture partner metadata

### **Phase 2: Partner Interface (Weeks 3-4)**
* Build partner onboarding process
* Create assessment link generation system
* Implement basic partner dashboard

### **Phase 3: Outcome Tracking (Weeks 5-6)**
* Design outcome data collection schema
* Build outcome data input interface
* Implement data validation and storage

### **Phase 4: Monitoring & Analytics (Weeks 7-8)**
* Create admin monitoring dashboard
* Implement pilot health metrics
* Set up automated reporting

## **12. Related Items**

* **Related OKRs:** Q3 Objective 1: Standardize Founder Readiness Signals.
* **Known Issues:** The existing assessment logic will need to be refactored to handle the new data collection points and ensure compatibility with the updated backend architecture.
* **Dependencies:** Firebase project configuration, Cloud Build pipeline, existing Clean Architecture implementation.

## **13. Success Criteria**

* **Technical:** Seamless integration with existing codebase without breaking current functionality
* **Operational:** Partners can successfully onboard cohorts and track outcomes
* **Data Quality:** ML-ready data collection with proper schema and validation
* **User Experience:** Smooth assessment flow for pilot participants
* **Scalability:** System can handle multiple concurrent pilot programs
