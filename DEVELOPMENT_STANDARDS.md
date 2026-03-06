# Sentinel DeFi Development Standards

## Purpose
This document establishes the systematic workflow for all feature development and bug fixes to ensure:
- Zero regressions or unexpected side effects
- Complete mobile-first responsive design
- Full backend integration before frontend implementation
- Comprehensive testing before marking complete
- Reduced credit waste through proactive planning

---

## Phase 1: Pre-Implementation Planning Checklist

**BEFORE writing ANY code, document the following:**

### 1. Frontend Requirements
- [ ] Desktop UI components needed
- [ ] Mobile/responsive adaptations required (320px - 768px)
- [ ] Tablet adaptations required (768px - 1024px)
- [ ] State management needs
- [ ] API calls needed
- [ ] Loading states required
- [ ] Error states required
- [ ] Empty states required

### 2. Backend Requirements
- [ ] Database tables/columns needed
- [ ] RLS policies required (Who can read? Who can write?)
- [ ] Edge functions needed
- [ ] Database triggers/functions needed
- [ ] Secrets/environment variables needed
- [ ] Email notifications needed

### 3. Integration Points
- [ ] How frontend calls backend (supabase.functions.invoke, supabase.from, etc.)
- [ ] Error handling strategy documented
- [ ] Loading states strategy documented
- [ ] Success/failure toast notifications planned
- [ ] Edge case scenarios identified

### 4. Mobile-First Considerations
- [ ] Will this work on 320px width?
- [ ] Touch target sizes adequate (min 44px)?
- [ ] Text readable on small screens (min 16px)?
- [ ] Horizontal scrolling avoided?
- [ ] Forms work on mobile keyboards?
- [ ] Modals/dialogs work on small screens?

### 5. Testing Scenarios
- [ ] Happy path defined
- [ ] Error states defined (network, permissions, validation)
- [ ] Empty states defined (no data scenarios)
- [ ] Permission failure scenarios
- [ ] Rate limiting scenarios
- [ ] Multiple user role scenarios

---

## Phase 2: Phased Implementation

### Step 1: Backend First (Always!)

**Order of operations:**
1. Create database schema with migrations
2. Add RLS policies (test with different user roles)
3. Create edge functions
4. Add proper logging to edge functions
5. Test edge functions with curl/function tester
6. Document endpoints and expected responses

**Verification before proceeding:**
- [ ] Database tables created successfully
- [ ] RLS policies prevent unauthorized access
- [ ] Edge functions deploy without errors
- [ ] Edge functions tested and working
- [ ] All secrets/env vars configured

### Step 2: Frontend Desktop

**Order of operations:**
1. Build UI components (use design system tokens)
2. Integrate with backend APIs
3. Add comprehensive error handling
4. Add loading states
5. Add empty states
6. Test all scenarios on desktop

**Verification before proceeding:**
- [ ] UI matches design system
- [ ] All API calls work correctly
- [ ] Error handling displays properly
- [ ] Loading states show correctly
- [ ] Empty states display properly
- [ ] Console has ZERO errors or warnings
- [ ] Success/failure toasts work

### Step 3: Mobile Adaptation

**Order of operations:**
1. Test on 320px width (smallest mobile)
2. Fix any responsive issues
3. Test touch interactions
4. Verify no horizontal scroll
5. Check text readability
6. Test forms with mobile keyboard
7. Test modals/dialogs on mobile

**Verification before proceeding:**
- [ ] Works perfectly at 320px
- [ ] Works perfectly at 375px (iPhone SE)
- [ ] Works perfectly at 390px (iPhone 12/13/14)
- [ ] Works perfectly at 414px (iPhone Plus)
- [ ] No horizontal scrolling
- [ ] All text readable
- [ ] Touch targets adequate size
- [ ] Forms work with mobile keyboard

### Step 4: Tablet Adaptation

**Order of operations:**
1. Test on 768px width (iPad)
2. Test on 1024px width (iPad Pro)
3. Fix any layout issues
4. Verify navigation works

**Verification before proceeding:**
- [ ] Works perfectly at 768px
- [ ] Works perfectly at 1024px
- [ ] Layout adapts appropriately

### Step 5: Edge Cases & Polish

**Order of operations:**
1. Test with no data
2. Test with errors
3. Test permission failures
4. Test with different user roles
5. Test rapid user interactions
6. Add analytics/logging if needed

**Verification before proceeding:**
- [ ] No data state works
- [ ] Error states work
- [ ] Permission failures handled gracefully
- [ ] Different user roles work correctly
- [ ] Rapid clicks don't cause issues
- [ ] Analytics/logging in place

---

## Phase 3: Post-Implementation Verification Checklist

**MUST verify ALL before marking complete:**

### Frontend Verification
- [ ] Desktop UI works perfectly (1024px+)
- [ ] Mobile UI works perfectly (320px - 768px)
- [ ] Tablet UI works perfectly (768px - 1024px)
- [ ] No horizontal scrolling on any screen size
- [ ] All images load correctly
- [ ] All icons display correctly
- [ ] Color contrast meets WCAG standards
- [ ] Typography is readable at all sizes
- [ ] Buttons/links have hover states
- [ ] Touch targets are 44px minimum
- [ ] Forms validate properly
- [ ] Modals/dialogs work on all screen sizes

### Backend Verification
- [ ] Edge functions deployed successfully
- [ ] Edge function logs show no errors
- [ ] Database tables have correct schema
- [ ] RLS policies tested with different user roles
- [ ] Database triggers work correctly
- [ ] All secrets/env vars configured
- [ ] API responses are correct format
- [ ] Error responses are handled properly

### Integration Verification
- [ ] No console errors or warnings
- [ ] Loading states work correctly
- [ ] Error states display properly
- [ ] Empty states display properly
- [ ] Success toasts show correctly
- [ ] Error toasts show correctly
- [ ] Data persists correctly in database
- [ ] Real-time updates work (if applicable)
- [ ] Optimistic updates work (if applicable)

### Security Verification
- [ ] User permissions work as expected
- [ ] Users cannot access other users' data
- [ ] RLS policies prevent unauthorized access
- [ ] Input validation prevents injection
- [ ] Sensitive data not exposed in logs
- [ ] API keys/secrets not exposed to frontend

### Data Integrity Verification
- [ ] No orphaned records in database
- [ ] Foreign keys maintain referential integrity
- [ ] Cascade deletes work correctly (if applicable)
- [ ] Data updates propagate correctly
- [ ] No duplicate records created

### Communication Verification
- [ ] Email notifications work (if applicable)
- [ ] Email templates render correctly
- [ ] Emails sent to correct recipients
- [ ] Email logs show successful delivery
- [ ] Email error handling works

### Analytics/Monitoring Verification
- [ ] Analytics events firing correctly (if applicable)
- [ ] Logging captures important events
- [ ] Error logging works correctly
- [ ] Performance is acceptable

---

## Phase 4: Documentation

**After implementation, document:**

### Implementation Documentation
- What was built (features, components, functions)
- Why it was built this way (architectural decisions)
- How it works (data flow, state management)
- What could break if changed (dependencies, side effects)
- Related components/functions (what else might be affected)

### Known Limitations
- What doesn't work yet
- What's out of scope
- Performance limitations
- Browser/device limitations

### Future Considerations
- What could be improved
- What should be added later
- What should be refactored
- What should be deprecated

---

## Phase 5: Proactive Audit System

### Weekly Quick Audits (Every Monday)
- [ ] Check console for any errors/warnings
- [ ] Test mobile responsiveness on 3 key pages
- [ ] Verify email logs for delivery failures
- [ ] Check database for orphaned records
- [ ] Review edge function logs for errors
- [ ] Test critical user flows (auth, purchase, etc.)

### Monthly Deep Audits (First Monday of Month)
- [ ] Full security review (all RLS policies)
- [ ] Performance optimization check (load times, bundle size)
- [ ] Mobile UX review on real devices (iOS & Android)
- [ ] Content completeness verification (all courses, tutorials, blog posts)
- [ ] User flow testing (from landing to conversion)
- [ ] Email template testing (all templates)
- [ ] Analytics verification (tracking working correctly)
- [ ] Accessibility audit (WCAG compliance)
- [ ] SEO audit (meta tags, structured data, sitemap)
- [ ] Dead link check (all internal and external links)

---

## Emergency Response Protocol

**If a critical bug is discovered in production:**

1. **Assess Impact**
   - How many users affected?
   - Is data at risk?
   - Is revenue impacted?

2. **Immediate Mitigation**
   - Can we roll back to previous version?
   - Can we disable the feature temporarily?
   - Can we apply a hotfix?

3. **Root Cause Analysis**
   - What broke?
   - Why did our testing miss it?
   - How can we prevent this in the future?

4. **Post-Mortem**
   - Document what happened
   - Update standards to prevent recurrence
   - Update test cases
   - Update checklists

---

## Development Principles

### 1. Mobile-First Always
Every feature must work perfectly on mobile BEFORE being marked complete.

### 2. Backend Before Frontend
Database, RLS, and edge functions must be complete and tested before building UI.

### 3. Progressive Enhancement
Start with core functionality, then add polish and enhancements.

### 4. Fail Gracefully
Every error must be handled and displayed to the user appropriately.

### 5. Test Everything
If it's not tested, it's broken.

### 6. Document Everything
If it's not documented, it will be forgotten.

### 7. Security First
Always assume malicious users. Validate everything. Trust nothing.

### 8. Performance Matters
Slow is broken. Optimize for speed.

### 9. Accessibility is Required
Everyone should be able to use our platform.

### 10. Data Integrity is Sacred
User data must never be lost, corrupted, or exposed.

---

## Credit Efficiency Strategy

### How This Saves Credits

**Before (Reactive):**
```
Request → Quick Fix → Breaks Mobile → Fix Mobile → Breaks Backend → 
Fix Backend → Creates New Bug → Fix Bug → [10-15 messages wasted]
```

**After (Proactive):**
```
Request → Plan (frontend+backend+mobile) → Implement Systematically → 
Verify Checklist → Done [2-4 messages total]
```

### Key Principles:
1. **Plan holistically** - Consider all aspects before coding
2. **Implement systematically** - Backend first, then frontend, then mobile
3. **Verify comprehensively** - Use checklist to catch issues before they become problems
4. **Document thoroughly** - Prevent re-learning the same lessons

### When to Use Credits:
- ✅ Planning new features (worth it)
- ✅ Implementing features correctly the first time (worth it)
- ✅ Proactive audits to catch issues early (worth it)
- ❌ Fixing regressions from rushed implementations (waste)
- ❌ Discovering issues the hard way (waste)
- ❌ Band-aid fixes that create new problems (waste)

---

## Version History

### v1.0 - 2025-01-XX
- Initial standards document created
- Established 5-phase workflow
- Created comprehensive checklists
- Defined audit protocols
- Established emergency response protocol

---

## Compliance

**All developers (including AI) must:**
- Read and understand this document
- Follow all phases in order
- Complete all checklists before marking work complete
- Document all deviations with justification
- Update this document when standards evolve

**Non-compliance results in:**
- Regressions and bugs
- Wasted development credits
- Poor user experience
- Data integrity issues
- Security vulnerabilities

---

## Review and Updates

This document should be reviewed and updated:
- After every major feature release
- After every critical bug incident
- Monthly during deep audit
- Whenever a new pattern or best practice is discovered

Last Updated: 2025-01-XX
Next Review: [Set monthly reminder]
