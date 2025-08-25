# Sprint Backlog Items

## High Priority

### 1. 🔒 Unify Legacy Collections (Security Rules)
**Priority:** High  
**Effort:** 2-3 hours  
**Status:** Ready for Sprint 2

**Problem:** Legacy `cohorts` collection tests failing (2/11 security tests)
- Tests expect `cohorts` collection with `partnerEmail` field
- Rules expect `partnerCohorts` collection with `partnerEmail` field
- Current: 9/11 security tests passing

**Solution Options:**
- **Option A:** Migrate tests to use `partnerCohorts` collection
- **Option B:** Add rules adapter to alias `cohorts` → `partnerCohorts` read-only

**Acceptance Criteria:**
- [ ] All 11/11 security tests passing
- [ ] No breaking changes to existing functionality
- [ ] Clear documentation of collection naming convention

---

### 2. 🧭 Server-Side Analytics Endpoint
**Priority:** High  
**Effort:** 3-4 hours  
**Status:** Ready for Sprint 2

**Problem:** Analytics currently only in console logs
- Badge/report clicks logged to browser console
- No server-side tracking for pilot insights
- Difficult to aggregate data across sessions

**Solution:**
- Create lightweight `/api/analytics` endpoint
- Log badge/report generation events server-side
- Add simple dashboard panel for pilot metrics

**Acceptance Criteria:**
- [ ] `/api/analytics` endpoint accepts badge/report events
- [ ] Events stored in Firestore with timestamp and metadata
- [ ] Simple dashboard shows pilot metrics
- [ ] No performance impact on existing flows

---

## Medium Priority

### 3. ♻️ Centralize Collection Names
**Priority:** Medium  
**Effort:** 2 hours  
**Status:** Future Sprint

**Problem:** Collection names scattered across codebase
- `cohorts` vs `partnerCohorts` inconsistency
- Hard to maintain and prone to errors

**Solution:**
- Create `src/lib/collections.ts` with centralized names
- Update all references to use constants
- Add TypeScript types for collection paths

---

### 4. 🧪 API Contract Tests
**Priority:** Medium  
**Effort:** 4 hours  
**Status:** Future Sprint

**Problem:** No contract validation for API endpoints
- `/api/badge` and `/api/report` lack input validation
- Potential for runtime errors

**Solution:**
- Add Zod schemas for API input validation
- Create contract tests for both endpoints
- Ensure type safety across API boundaries

---

## Nice-to-Have

### 5. 📣 Social Meta Preview
**Priority:** Low  
**Effort:** 3 hours  
**Status:** Future Sprint

**Problem:** Badge links lack social media preview
- No Open Graph tags for sharing
- Poor UX when shared on social platforms

**Solution:**
- Add dynamic meta tags for badge URLs
- Include score, partner, and cohort in preview
- Optimize for Twitter, LinkedIn, Facebook

---

### 6. 🖨️ Branded PDF Themes
**Priority:** Low  
**Effort:** 6 hours  
**Status:** Future Sprint

**Problem:** Reports use generic styling
- No partner branding in PDF reports
- Missed opportunity for customization

**Solution:**
- Create partner-specific PDF themes
- Include partner logos and colors
- Allow customization per partner

---

## Sprint 2 Planning Notes

**Focus Areas:**
1. Security hardening (legacy collections)
2. Analytics infrastructure
3. Code quality improvements

**Definition of Done:**
- All tests passing (11/11 security)
- Analytics events captured server-side
- No breaking changes to existing functionality
- Documentation updated
