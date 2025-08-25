# 🎯 Airtable Dashboard Setup Guide
**Partner & Admin Dashboard Implementation**

## **📋 Overview**

This guide shows how to use Airtable as the primary data management tool for partners and internal operations, as specified in the PRD constraints. Airtable provides a no-code solution that's perfect for the MVP phase.

---

## **🏗️ Airtable Base Structure**

### **Base Name:** `Gutcheck.AI Pilot Program Management`

### **Tables Overview:**
1. **Partners** - Partner organization management
2. **Cohorts** - Cohort tracking and metrics
3. **Assessment Sessions** - Individual assessment data
4. **Outcome Tracking** - Partner outcome tagging
5. **Admin Dashboard** - Executive summary and alerts

---

## **📊 Table 1: Partners**

### **Fields:**
| Field Name | Type | Description |
|------------|------|-------------|
| Partner ID | Single line text | Unique identifier (e.g., `queens-college`) |
| Partner Name | Single line text | Organization name |
| Partner Email | Email | Primary contact email |
| Status | Single select | `Active`, `Pending`, `Inactive` |
| Created At | Date | When partner was onboarded |
| Assessment URL Template | URL | Base URL for assessments |
| Total Cohorts | Number | Count of active cohorts |
| Total Assessments | Rollup | Sum of all cohort assessments |

### **Views:**
- **All Partners** - Complete list
- **Active Partners** - Only active partners
- **Partner Summary** - Key metrics per partner

---

## **📊 Table 2: Cohorts**

### **Fields:**
| Field Name | Type | Description |
|------------|------|-------------|
| Cohort ID | Single line text | Unique identifier (e.g., `alpha-fall25`) |
| Cohort Name | Single line text | Display name |
| Partner | Link to Partners | Reference to partner |
| Expected Participants | Number | Target cohort size |
| Assessment URL | URL | Full assessment link |
| Status | Single select | `Active`, `Completed`, `Draft` |
| Created At | Date | Cohort creation date |
| Total Assessments | Number | Count of assessments taken |
| Completed Assessments | Number | Count of completed assessments |
| Completion Rate | Formula | `{Completed Assessments} / {Total Assessments} * 100` |
| Average Score | Rollup | Average of all session scores |
| Tagged Outcomes | Number | Count of outcome-tagged sessions |

### **Views:**
- **All Cohorts** - Complete list
- **Active Cohorts** - Currently running cohorts
- **Cohort Performance** - Key metrics and completion rates
- **By Partner** - Grouped by partner organization

---

## **📊 Table 3: Assessment Sessions**

### **Fields:**
| Field Name | Type | Description |
|------------|------|-------------|
| Session ID | Single line text | Unique session identifier |
| User ID | Single line text | User identifier (if claimed) |
| Partner | Link to Partners | Reference to partner |
| Cohort | Link to Cohorts | Reference to cohort |
| Overall Score | Number | 35-100 scale score |
| Star Rating | Number | 1-5 star rating |
| Category Breakdown | Long text | JSON of category scores |
| Completed At | Date | Assessment completion date |
| Outcome Tracking Ready | Checkbox | Whether ready for outcome tagging |
| Consent for ML | Checkbox | User consent for ML training |
| Partner Metadata | Long text | JSON of partner context |

### **Views:**
- **All Sessions** - Complete list
- **Recent Completions** - Last 30 days
- **By Partner** - Grouped by partner
- **By Cohort** - Grouped by cohort
- **High Performers** - Scores 80+ |
| Low Performers** - Scores <60

---

## **📊 Table 4: Outcome Tracking**

### **Fields:**
| Field Name | Type | Description |
|------------|------|-------------|
| Session ID | Link to Assessment Sessions | Reference to session |
| Outcome Tag | Single select | `Breakthrough`, `Growth`, `Stagnation`, `Pending` |
| Outcome Notes | Long text | Partner's detailed notes |
| Tagged By | Single line text | Partner email who tagged |
| Tagged At | Date | When outcome was tagged |
| Partner | Rollup | Partner from session |
| Cohort | Rollup | Cohort from session |
| User Score | Rollup | Score from session |

### **Views:**
- **All Outcomes** - Complete list
- **Pending Review** - Sessions needing outcome tags
- **By Outcome Type** - Grouped by outcome tag
- **By Partner** - Grouped by partner
- **Recent Tags** - Last 30 days

---

## **📊 Table 5: Admin Dashboard**

### **Fields:**
| Field Name | Type | Description |
|------------|------|-------------|
| Metric Name | Single line text | Metric identifier |
| Current Value | Number | Current metric value |
| Target Value | Number | Target/goal value |
| Status | Single select | `On Track`, `At Risk`, `Behind` |
| Last Updated | Date | When metric was last calculated |
| Trend | Single select | `Up`, `Down`, `Stable` |
| Notes | Long text | Additional context |

### **Views:**
- **Key Metrics** - Executive summary
- **Alerts** - Items requiring attention
- **Trends** - Performance over time

---

## **🔗 Integration Setup**

### **1. Firebase to Airtable Sync**

Create a Cloud Function to sync data:

```typescript
// functions/src/airtableSync.ts
import * as functions from 'firebase-functions';
import Airtable from 'airtable';

const base = new Airtable({ apiKey: process.env.AIRTABLE_API_KEY })
  .base(process.env.AIRTABLE_BASE_ID);

export const syncToAirtable = functions.firestore
  .document('assessmentSessions/{sessionId}')
  .onCreate(async (snap, context) => {
    const sessionData = snap.data();
    
    try {
      // Create record in Assessment Sessions table
      await base('Assessment Sessions').create([
        {
          fields: {
            'Session ID': sessionData.sessionId,
            'Partner': [sessionData.partnerMetadata?.partnerId],
            'Cohort': [sessionData.partnerMetadata?.cohortId],
            'Overall Score': sessionData.scores?.overallScore,
            'Star Rating': sessionData.starRating,
            'Completed At': sessionData.completedAt?.toDate(),
            'Outcome Tracking Ready': sessionData.outcomeTrackingReady,
            'Consent for ML': sessionData.consentForML
          }
        }
      ]);
      
      console.log('Successfully synced to Airtable');
    } catch (error) {
      console.error('Airtable sync failed:', error);
      // Store in outbox for retry
      await storeInOutbox(sessionData);
    }
  });
```

### **2. Airtable to Firebase Sync**

For outcome tracking updates:

```typescript
// functions/src/airtableWebhook.ts
export const airtableWebhook = functions.https.onRequest(async (req, res) => {
  const { table, record } = req.body;
  
  if (table === 'Outcome Tracking') {
    try {
      // Update Firestore with outcome data
      const sessionId = record.fields['Session ID'];
      const outcomeTag = record.fields['Outcome Tag'];
      const outcomeNotes = record.fields['Outcome Notes'];
      const taggedBy = record.fields['Tagged By'];
      
      await db.collection('assessmentSessions').doc(sessionId).update({
        outcomeTracking: {
          isReady: true,
          outcomeTag,
          outcomeNotes,
          taggedBy,
          taggedAt: new Date()
        }
      });
      
      res.json({ success: true });
    } catch (error) {
      console.error('Firebase update failed:', error);
      res.status(500).json({ error: 'Update failed' });
    }
  }
});
```

---

## **👥 User Access Setup**

### **Partner Access:**
1. **Create Partner Views** - Filtered views showing only their data
2. **Set Permissions** - Read/write access to their cohorts and sessions
3. **Share Links** - Direct links to partner-specific views

### **Admin Access:**
1. **Full Access** - All tables and views
2. **Dashboard Views** - Executive summary and alerts
3. **Export Permissions** - Ability to export data for analysis

---

## **📱 Partner Dashboard Views**

### **Queens College Dashboard:**
- **Cohort Overview** - All Queens College cohorts
- **Recent Assessments** - Last 30 days of completions
- **Outcome Tracking** - Sessions needing outcome tags
- **Performance Metrics** - Completion rates and scores

### **Individual Cohort View:**
- **Participant List** - All assessment sessions
- **Completion Status** - Who has/hasn't completed
- **Score Distribution** - Performance breakdown
- **Outcome Tags** - Current outcome status

---

## **🔧 Admin Dashboard Views**

### **Executive Summary:**
- **Total Active Pilots** - Count of active partners
- **Overall Completion Rate** - Across all cohorts
- **Average Score** - Overall performance
- **Outcome Tagging Rate** - % of sessions tagged

### **Pilot Health:**
- **At-Risk Cohorts** - Low completion rates
- **High Performers** - Exceptional results
- **Recent Activity** - Last 7 days
- **Alerts** - Items requiring attention

---

## **📊 Key Metrics & Formulas**

### **Completion Rate:**
```
{Completed Assessments} / {Total Assessments} * 100
```

### **Average Score:**
```
AVERAGE({Overall Score})
```

### **Outcome Distribution:**
```
COUNTIF({Outcome Tag}, "Breakthrough")
COUNTIF({Outcome Tag}, "Stagnation")
```

### **Cohort Performance:**
```
IF({Completion Rate} > 60, "On Track", "At Risk")
```

---

## **🚀 Getting Started**

### **1. Create Airtable Base**
1. Go to [airtable.com](https://airtable.com)
2. Create new base: "Gutcheck.AI Pilot Program Management"
3. Create the 5 tables above with specified fields

### **2. Set Up API Integration**
1. Get API key from Airtable account settings
2. Add to Firebase environment variables
3. Deploy sync functions

### **3. Configure Partner Access**
1. Create filtered views for each partner
2. Set up sharing permissions
3. Send partner access links

### **4. Test End-to-End Flow**
1. Complete test assessment
2. Verify Airtable sync
3. Test outcome tagging
4. Validate metrics calculation

---

## **📈 Benefits of This Approach**

### **✅ No-Code Dashboard**
- Partners can use Airtable immediately
- No custom UI development needed
- Familiar spreadsheet interface

### **✅ Real-Time Sync**
- Firebase data automatically syncs
- Partners see updates instantly
- No manual data entry

### **✅ Flexible Views**
- Custom views per partner
- Filtered data access
- Export capabilities

### **✅ Scalable**
- Easy to add new partners
- Simple to extend fields
- Built-in collaboration tools

---

## **🎯 Success Metrics**

### **Partner Adoption:**
- 100% of partners can access their data
- <5 minutes to find key metrics
- >90% satisfaction with interface

### **Data Quality:**
- 100% of assessments sync to Airtable
- <1 hour delay in data updates
- 0% data loss or corruption

### **Operational Efficiency:**
- 50% reduction in partner support requests
- 90% of outcome tagging done via Airtable
- Real-time visibility into pilot health

---

**This Airtable setup provides a complete, no-code solution for partner and admin dashboards that aligns perfectly with the PRD constraints and enables immediate pilot program operationalization!** 🚀
