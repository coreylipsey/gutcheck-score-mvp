# Deployment Fixes - Gutcheck Score™ MVP

## IAM Permission Fix - Cloud Scheduler (2025-08-18)

### Issue
During deployment, the `sendFollowUpSequence` function failed with the following error:
```
Request to https://cloudscheduler.googleapis.com/v1/projects/gutcheck-score-mvp/locations/us-central1/jobs/firebase-schedule-sendFollowUpSequence-us-central1?updateMask=name%2CtimeZone%2ChttpTarget%2Cschedule had HTTP Error: 403, The principal (user or service account) lacks IAM permission "cloudscheduler.jobs.update"
```

### Root Cause
Both the Firebase service account and the Cloud Build service account lacked the necessary Cloud Scheduler permissions to create and manage scheduled jobs during deployment.

### Solution Applied
Added the `roles/cloudscheduler.admin` role to both service accounts:

#### 1. Firebase Service Account
```bash
gcloud projects add-iam-policy-binding gutcheck-score-mvp \
  --member="serviceAccount:firebase-adminsdk-fbsvc@gutcheck-score-mvp.iam.gserviceaccount.com" \
  --role="roles/cloudscheduler.admin"
```

#### 2. Cloud Build Service Account (CI/CD Pipeline)
```bash
gcloud projects add-iam-policy-binding gutcheck-score-mvp \
  --member="serviceAccount:286731768309@cloudbuild.gserviceaccount.com" \
  --role="roles/cloudscheduler.admin"
```

### Verification
After applying the fix:
- ✅ All functions deployed successfully
- ✅ `sendFollowUpSequence` function now works with Cloud Scheduler
- ✅ No more IAM permission errors during deployment
- ✅ CI/CD pipeline can now deploy scheduled functions

### Current Service Account Permissions

#### Firebase Service Account (`firebase-adminsdk-fbsvc@gutcheck-score-mvp.iam.gserviceaccount.com`)
- `roles/firebase.sdkAdminServiceAgent`
- `roles/firebaseappcheck.admin`
- `roles/firebaseauth.admin`
- `roles/iam.serviceAccountTokenCreator`
- `roles/iam.serviceAccountUser`
- `roles/storage.admin`
- `roles/cloudscheduler.admin` ✅ **NEW**

#### Cloud Build Service Account (`286731768309@cloudbuild.gserviceaccount.com`)
- `roles/cloudbuild.builds.builder`
- `roles/cloudfunctions.developer`
- `roles/iam.serviceAccountTokenCreator`
- `roles/iam.serviceAccountUser`
- `roles/logging.logWriter`
- `roles/cloudscheduler.admin` ✅ **NEW**

## Deployment Status

### Functions (All Deployed Successfully)
- `claimScore` - Callable function
- `createTokenCheckoutSession` - Callable function  
- `generateFeedback` - HTTPS function
- `getUserTokenInfo` - Callable function
- `mailchimpWebhook` - HTTPS function
- `processStripeWebhook` - HTTPS function
- `scoreQuestion` - HTTPS function
- `scoreResponse` - Callable function
- `sendFollowUpSequence` - Scheduled function ✅ **FIXED**
- `sendResultsEmail` - Firestore trigger
- `spendTokensForFeature` - Callable function
- `testMailchimpConnection` - Callable function

### Hosting
- **URL**: https://gutcheck-score-mvp.web.app
- **Status**: Live and accessible
- **Last Deploy**: 2025-08-18 15:46:54

## Future Considerations

### IAM Best Practices
1. **Principle of Least Privilege**: Only grant necessary permissions
2. **Regular Audits**: Review service account permissions periodically
3. **Documentation**: Keep track of all IAM changes for troubleshooting
4. **CI/CD Considerations**: Ensure Cloud Build service account has necessary permissions

### Monitoring
- Monitor Cloud Scheduler job execution logs
- Set up alerts for failed scheduled functions
- Track IAM permission changes in audit logs
- Monitor CI/CD pipeline deployment success rates

## Related Documentation
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Main deployment guide
- [EMAIL_SYSTEM_SUMMARY.md](./EMAIL_SYSTEM_SUMMARY.md) - Email system overview
- [CLEAN_ARCHITECTURE_REVIEW.md](./CLEAN_ARCHITECTURE_REVIEW.md) - Architecture compliance
