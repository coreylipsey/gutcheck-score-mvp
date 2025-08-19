# Email Templates for Gutcheck.AI

This directory contains the HTML email templates for the Gutcheck.AI Email Engagement System. These templates are designed to be uploaded to Mailchimp and used with the automated email triggers.

## 📧 Template Files

### 1. `results-email.html` - Assessment Results Email
- **Purpose**: Sent immediately after assessment completion
- **Key Features**: 
  - Personalized score display
  - AI-generated recommendations
  - Clear call-to-action to view full report
  - Professional branding with Gutcheck.AI identity

### 2. `followup-1.html` - Your Gutcheck Game Plan
- **Purpose**: First follow-up email (3 days after assessment)
- **Key Features**:
  - Action plan with specific steps
  - Score reminder and strength focus
  - Motivational quote
  - Progress tracking encouragement

### 3. `followup-2.html` - How Entrepreneurs Like You Score Higher
- **Purpose**: Second follow-up email (7 days after assessment)
- **Key Features**:
  - Insights from top performers
  - Progress comparison
  - Success story
  - Data-driven recommendations

### 4. `followup-3.html` - Level Up: Learn from a 5-Star Performer
- **Purpose**: Third follow-up email (14 days after assessment)
- **Key Features**:
  - Featured entrepreneur profile
  - Key lessons and takeaways
  - Progress comparison
  - Next steps guidance

## 🚀 Uploading to Mailchimp

### Step 1: Access Mailchimp Templates
1. Log into your Mailchimp account
2. Navigate to **Templates** in the left sidebar
3. Click **Create Template**

### Step 2: Create Custom Template
1. Choose **Code your own** → **Paste in code**
2. Copy the HTML content from each template file
3. Paste into the code editor
4. Click **Save & Exit**

### Step 3: Configure Merge Fields
Each template uses Mailchimp merge fields for personalization:

#### Required Merge Fields:
- `*|FNAME|*` - First name
- `*|EMAIL|*` - Email address
- `*|GUTCHECK_SCORE|*` - Assessment score
- `*|SCORE_PERCENTILE|*` - Score percentile
- `*|TOP_STRENGTH|*` - Top strength category
- `*|AREA_GROWTH|*` - Area for growth
- `*|AI_RECOMMENDATION|*` - AI-generated recommendation
- `*|ASSESSMENT_ID|*` - Assessment session ID

#### Setting Up Merge Fields:
1. Go to **Audience** → **Settings** → **Audience name and defaults**
2. Click **Add a merge field**
3. Add each field with the exact names above
4. Set appropriate field types (Text, Number, etc.)

### Step 4: Test Templates
1. Create a test campaign using each template
2. Send to yourself or test email addresses
3. Verify merge fields populate correctly
4. Check mobile responsiveness
5. Test all links and CTAs

## 🎨 Design Features

### Brand Consistency
- **Colors**: Gutcheck.AI brand colors (#0A1F44, #147AFF, #19C2A0)
- **Typography**: System fonts for optimal email client compatibility
- **Logo**: Star icon representing the Gutcheck Score™
- **Gradients**: Professional gradient backgrounds

### Responsive Design
- Mobile-first approach
- Flexible grid layouts
- Optimized for all email clients
- Touch-friendly buttons and links

### Personalization
- Dynamic content based on assessment results
- AI-generated recommendations
- Personalized action plans
- Individual progress tracking

## 🔧 Technical Specifications

### Email Client Compatibility
- ✅ Gmail (Web & Mobile)
- ✅ Outlook (Desktop & Mobile)
- ✅ Apple Mail
- ✅ Yahoo Mail
- ✅ Thunderbird

### File Size
- All templates under 100KB
- Optimized images and CSS
- Inline styles for maximum compatibility

### Accessibility
- High contrast ratios
- Clear typography hierarchy
- Alt text for images
- Keyboard navigation support

## 📊 Performance Optimization

### Best Practices
1. **Subject Lines**: Keep under 50 characters
2. **Preheader Text**: Use compelling preview text
3. **Images**: Optimize for fast loading
4. **Links**: Use UTM parameters for tracking
5. **Unsubscribe**: Always include clear unsubscribe option

### A/B Testing Recommendations
- Subject line variations
- CTA button text and placement
- Send time optimization
- Content personalization levels

## 🔗 Integration with Firebase Functions

The templates work with the deployed Firebase Functions:

- `sendResultsEmail` - Triggers results email
- `sendFollowUpSequence` - Schedules follow-up emails
- `mailchimpWebhook` - Tracks email events

## 📈 Analytics Tracking

Each template includes:
- Click tracking on CTAs
- Open rate monitoring
- Engagement metrics
- Conversion tracking

## 🛠️ Customization

### Modifying Templates
1. Edit HTML files locally
2. Test in email preview tools
3. Upload updated version to Mailchimp
4. Update template ID in Firebase Functions

### Adding New Templates
1. Create new HTML file following existing structure
2. Add merge fields as needed
3. Upload to Mailchimp
4. Update Firebase Functions to use new template

## 📞 Support

For technical issues or customization requests:
- Email: support@gutcheck.ai
- Documentation: Check Firebase Functions logs
- Testing: Use Mailchimp's preview and test features

---

**Note**: Always test templates thoroughly before sending to your audience. Email client rendering can vary significantly across different platforms.
