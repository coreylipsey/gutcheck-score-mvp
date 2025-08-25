# Google Sheets Integration Setup Guide

This guide will help you set up Google Sheets as a replacement for Airtable, providing a native Google Cloud integration for your pilot program management.

## Phase 1: Create Google Sheet Structure

### Step 1: Create the Main Google Sheet

1. **Go to Google Drive** and create a new Google Sheet
2. **Name it**: `Gutcheck.AI Pilot Program Management`
3. **Share it** with your team members who need access

### Step 2: Set Up Sheet Tabs

Create the following tabs in your Google Sheet:

#### Tab 1: Partners
**Headers (Row 1):**
- Partner ID
- Partner Name
- Partner Email
- Status
- Created At
- Notes

#### Tab 2: Cohorts
**Headers (Row 1):**
- Cohort ID
- Partner ID
- Cohort Name
- Start Date
- End Date
- Total Assessments
- Completed Assessments
- Completion Rate
- Average Score
- Tagged Outcomes

#### Tab 3: Assessment Sessions
**Headers (Row 1):**
- Session ID
- User ID
- Partner ID
- Cohort ID
- Overall Score
- Star Rating
- Category Breakdown
- Completed At
- Outcome Tracking Ready
- Consent for ML
- Partner Metadata

#### Tab 4: Outcome Tracking
**Headers (Row 1):**
- Session ID
- Outcome Tag
- Outcome Notes
- Tagged By
- Tagged At
- Partner ID
- Cohort ID
- User Score

#### Tab 5: Admin Dashboard
**Headers (Row 1):**
- Metric Name
- Value
- Last Updated
- Notes

## Phase 2: Enable Google Sheets API

### Step 1: Enable the API

1. **Go to Google Cloud Console** for your `gutcheck-score-mvp` project
2. **Navigate to**: APIs & Services > Library
3. **Search for**: "Google Sheets API"
4. **Click**: "Enable"

### Step 2: Create Service Account

1. **Go to**: IAM & Admin > Service Accounts
2. **Click**: "CREATE SERVICE ACCOUNT"
3. **Name**: `sheets-writer`
4. **Description**: `Service account for writing to Google Sheets`
5. **Click**: "CREATE AND CONTINUE"

### Step 3: Grant Permissions

1. **Role**: Select "Editor" role
2. **Click**: "CONTINUE"
3. **Click**: "DONE"

### Step 4: Share Google Sheet with Your Account

1. **Open** your Google Sheet
2. **Click**: "Share" button
3. **Add**: Your email (`coreylipsey@gutcheckaiapp.com`) if not already added
4. **Permission**: "Editor"
5. **Click**: "Send"

**Note**: Since your organization blocks service account key creation, we'll use Application Default Credentials instead, which is more secure.

## Phase 3: Configure Environment Variables

### Step 1: Get Spreadsheet ID

1. **Open** your Google Sheet
2. **Copy** the URL
3. **Extract** the spreadsheet ID from the URL:
   ```
   https://docs.google.com/spreadsheets/d/SPREADSHEET_ID/edit
   ```

### Step 2: Set Environment Variables

Add this to your Firebase Functions environment:

```bash
# Google Sheets Configuration
GOOGLE_SHEETS_SPREADSHEET_ID=your_spreadsheet_id_here
```

**Note**: We're using Application Default Credentials, so no service account key is needed.

## Phase 4: Deploy and Test

### Step 1: Deploy Functions

```bash
cd functions
npm install
firebase deploy --only functions
```

### Step 2: Test Integration

1. **Complete** a test assessment
2. **Check** the "Assessment Sessions" tab in your Google Sheet
3. **Verify** that a new row was added with the session data

## Phase 5: Create Partner Dashboard

### Option 1: Looker Studio (Recommended)

1. **Go to**: [Looker Studio](https://lookerstudio.google.com/)
2. **Create** a new report
3. **Add data source**: Google Sheets
4. **Select** your Google Sheet
5. **Create** visualizations for:
   - Cohort completion rates
   - Average scores by partner
   - Assessment trends over time
   - Outcome tracking metrics

### Option 2: Direct Google Sheets

1. **Use** Google Sheets' built-in charts and pivot tables
2. **Create** summary sheets with formulas
3. **Set up** conditional formatting for key metrics

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure the service account has Editor access to the sheet
2. **API Not Enabled**: Verify Google Sheets API is enabled in your project
3. **Invalid JSON**: Check that the service account key is properly formatted
4. **Sheet Not Found**: Verify the spreadsheet ID is correct

### Debug Steps

1. **Check** Firebase Functions logs:
   ```bash
   firebase functions:log
   ```

2. **Test** manual sync function:
   ```javascript
   // In Firebase Console > Functions > manualSheetsSync
   {
     "sessionId": "test-session-id"
   }
   ```

3. **Verify** environment variables are set:
   ```bash
   firebase functions:config:get
   ```

## Security Best Practices

1. **Never commit** the service account key to version control
2. **Use** environment variables for all sensitive data
3. **Regularly rotate** service account keys
4. **Monitor** API usage in Google Cloud Console
5. **Set up** alerts for unusual activity

## Next Steps

Once the Google Sheets integration is working:

1. **Create** partner-specific dashboards
2. **Set up** automated reporting
3. **Configure** email notifications for key metrics
4. **Build** custom visualizations for different stakeholders

This Google-native approach provides better integration, security, and scalability compared to third-party solutions like Airtable.
