# 🚀 Deployment Guide - Gutcheck Score™ MVP

## **Overview**

This document outlines the automated CI/CD pipeline for the Gutcheck Score™ MVP. The pipeline automatically builds and deploys the application on every push to the `main` branch.

## **Architecture**

### **Components Deployed**
- **Frontend**: Next.js application (static export)
- **Backend**: Firebase Functions (Node.js)
- **Database**: Firestore rules and indexes
- **Storage**: Firebase Storage rules

### **Build Process**
1. Install dependencies (main app + functions)
2. Build Next.js application (static export)
3. Build Firebase Functions (TypeScript compilation)
4. Run linting checks
5. Deploy to Firebase

## **CI/CD Pipeline Setup**

### **Prerequisites**
- Google Cloud Project with Cloud Build enabled
- Firebase project configured
- Firebase CLI token stored in Secret Manager

### **Cloud Build Configuration**
- **File**: `cloudbuild.yaml`
- **Trigger**: Push to `main` branch
- **Timeout**: 20 minutes
- **Machine Type**: E2_HIGHCPU_8 (for faster builds)

### **Environment Variables**
- `PROJECT_ID`: Google Cloud Project ID
- `_FIREBASE_TOKEN`: Firebase CLI token (stored in Secret Manager)

## **Manual Deployment (Fallback)**

If the automated pipeline fails, you can deploy manually:

```bash
# Install dependencies
npm install
cd functions && npm install && cd ..

# Build application
npm run build

# Deploy to Firebase
firebase deploy
```

## **Deployment Verification**

### **Post-Deployment Checks**
1. **Frontend**: Visit the deployed URL and verify:
   - Landing page loads correctly
   - Assessment flow works
   - Results page displays properly

2. **Functions**: Test API endpoints:
   - `/api/gemini/score` - AI scoring endpoint
   - Verify Firestore connections

3. **Database**: Check Firestore rules:
   - Verify security rules are applied
   - Test data read/write permissions

### **Rollback Procedure**
If deployment fails or issues are discovered:

1. **Immediate Rollback**:
   ```bash
   firebase hosting:clone gutcheck-score-mvp:live gutcheck-score-mvp:rollback
   firebase hosting:clone gutcheck-score-mvp:rollback gutcheck-score-mvp:live
   ```

2. **Code Rollback**:
   ```bash
   git revert HEAD
   git push origin main
   ```

## **Monitoring & Alerts**

### **Build Status**
- Monitor Cloud Build console for build status
- Set up notifications for build failures
- Track deployment frequency and success rate

### **Application Monitoring**
- Firebase Console for function logs
- Google Analytics for user behavior
- Error tracking (to be implemented)

## **Security Considerations**

### **Secrets Management**
- Firebase token stored in Google Secret Manager
- No hardcoded credentials in code
- Environment-specific configurations

### **Access Control**
- Cloud Build service account has minimal required permissions
- Firebase security rules enforce data access controls
- HTTPS enforced for all connections

## **Performance Optimization**

### **Build Optimization**
- Parallel dependency installation
- Caching for node_modules
- Optimized machine type for faster builds

### **Deployment Optimization**
- Static export for frontend (faster loading)
- Function bundling for reduced cold starts
- CDN distribution for global performance

## **Troubleshooting**

### **Common Issues**

1. **Build Timeout**
   - Increase timeout in cloudbuild.yaml
   - Optimize build steps
   - Use higher machine type

2. **Dependency Issues**
   - Clear node_modules and reinstall
   - Check package.json compatibility
   - Verify npm registry access

3. **Deployment Failures**
   - Check Firebase project permissions
   - Verify Firebase token validity
   - Review Firestore rules syntax

### **Debug Commands**
```bash
# Check build logs
gcloud builds log [BUILD_ID]

# Test Firebase connection
firebase projects:list

# Verify deployment
firebase hosting:sites:list
```

## **Future Enhancements**

### **Planned Improvements**
- [ ] Automated testing in CI pipeline
- [ ] Staging environment for testing
- [ ] Blue-green deployment strategy
- [ ] Performance monitoring integration
- [ ] Automated security scanning

### **Monitoring & Observability**
- [ ] Application performance monitoring
- [ ] Error tracking and alerting
- [ ] User analytics integration
- [ ] Infrastructure monitoring

---

## **Contact & Support**

For deployment issues or questions:
- **Scrum Master**: Process and coordination
- **Development Team**: Technical implementation
- **Documentation**: This guide and related docs

---

*Last updated: Sprint 3, Day 1* 