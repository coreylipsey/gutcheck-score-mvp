// @ts-ignore
import mailchimp from '@mailchimp/mailchimp_marketing';
import * as admin from 'firebase-admin';

export interface EmailData {
  email: string;
  firstName?: string;
  lastName?: string;
  gutcheckScore?: number;
  starRating?: number;
  starLabel?: string;
  topStrength?: string;
  areaForGrowth?: string;
  scoutAnalysis?: string;
  assessmentId?: string;
  userId?: string;
}

export interface EmailEvent {
  userId: string;
  emailType: 'results' | 'followup_1' | 'followup_2' | 'followup_3';
  eventType: 'sent' | 'opened' | 'clicked' | 'bounced';
  timestamp: Date;
  assessmentId?: string;
  sequenceId?: string;
  mailchimpMessageId?: string;
}

export class MailchimpService {
  private client: mailchimp.Client;
  private audienceId: string;
  private serverPrefix: string;
  private templateIds: {
    results: string;
    followup1: string;
    followup2: string;
    followup3: string;
  };

  constructor() {
    this.serverPrefix = process.env.MAILCHIMP_SERVER_PREFIX || 'us7';
    this.audienceId = process.env.MAILCHIMP_AUDIENCE_ID || '5f69687516'; // Your audience ID
    
    mailchimp.setConfig({
      apiKey: process.env.MAILCHIMP_API_KEY || 'bacf67220b058842d6ffcd2fb02b3ac8-us7',
      server: this.serverPrefix,
    });
    
    this.client = mailchimp;
    
    // Template IDs from Mailchimp (Corrected Templates)
    this.templateIds = {
      results: '13698118',
      followup1: '13698119',
      followup2: '13698120',
      followup3: '13698121'
    };
  }

  /**
   * Test the Mailchimp connection
   */
  async ping(): Promise<boolean> {
    try {
      const response = await this.client.ping.get();
      console.log('Mailchimp ping response:', response);
      return response.health_status === "Everything's Chimpy!";
    } catch (error) {
      console.error('Mailchimp ping failed:', error);
      return false;
    }
  }

  /**
   * Send results email to user
   */
  async sendResultsEmail(emailData: EmailData): Promise<string> {
    try {
      // Add or update contact in Mailchimp
      await this.addOrUpdateContact(emailData);

      // Create campaign using the results template
      const campaign = await this.client.campaigns.create({
        type: 'regular',
        recipients: {
          list_id: this.audienceId,
          segment_opts: {
            match: 'all',
            conditions: [
              {
                condition_type: 'EmailAddress',
                op: 'is',
                field: 'EMAIL',
                value: emailData.email
              }
            ]
          }
        },
        settings: {
          subject_line: `Your Gutcheck Score is Ready, ${emailData.firstName || 'Entrepreneur'}`,
          title: `Gutcheck Results - ${emailData.email}`,
          from_name: 'Gutcheck.AI',
          reply_to: 'hello@gutcheck.ai',
          template_id: parseInt(this.templateIds.results),
          auto_footer: false
        }
      });

      // Send the campaign
      await this.client.campaigns.send(campaign.id);

      console.log(`Results email sent successfully to ${emailData.email}`);
      return campaign.id;

    } catch (error) {
      console.error('Error sending results email:', error);
      throw new Error(`Failed to send results email: ${error}`);
    }
  }

  /**
   * Add or update contact in Mailchimp audience
   */
  private async addOrUpdateContact(emailData: EmailData): Promise<string> {
    try {
      const subscriberHash = this.getSubscriberHash(emailData.email);

      // Try to add new contact
      try {
        await this.client.lists.addListMember(this.audienceId, {
          email_address: emailData.email,
          status: 'subscribed',
          merge_fields: {
            FNAME: emailData.firstName || '',
            LNAME: emailData.lastName || '',
            GUTCHECK_SCORE: emailData.gutcheckScore?.toString() || '',
            STAR_RATING: emailData.starRating?.toString() || '',
            STAR_LABEL: emailData.starLabel || '',
            TOP_STRENGTH: emailData.topStrength || '',
            AREA_GROWTH: emailData.areaForGrowth || '',
            SCOUT_ANALYSIS: emailData.scoutAnalysis || '',
            ASSESSMENT_ID: emailData.assessmentId || '',
            USER_ID: emailData.userId || ''
          },
          tags: ['gutcheck-results', 'assessment-completed']
        });

        console.log(`New contact added: ${emailData.email}`);
        return subscriberHash;

      } catch (error: any) {
        // If contact already exists, update them
        if (error.response?.body?.title === 'Member Exists') {
          await this.client.lists.updateListMember(this.audienceId, subscriberHash, {
            merge_fields: {
              FNAME: emailData.firstName || '',
              LNAME: emailData.lastName || '',
              GUTCHECK_SCORE: emailData.gutcheckScore?.toString() || '',
              STAR_RATING: emailData.starRating?.toString() || '',
              STAR_LABEL: emailData.starLabel || '',
              TOP_STRENGTH: emailData.topStrength || '',
              AREA_GROWTH: emailData.areaForGrowth || '',
              SCOUT_ANALYSIS: emailData.scoutAnalysis || '',
              ASSESSMENT_ID: emailData.assessmentId || '',
              USER_ID: emailData.userId || ''
            }
          });

          console.log(`Contact updated: ${emailData.email}`);
          return subscriberHash;
        }
        throw error;
      }

    } catch (error) {
      console.error('Error adding/updating contact:', error);
      throw new Error(`Failed to manage contact: ${error}`);
    }
  }

  /**
   * Send follow-up sequence email
   */
  async sendFollowUpEmail(emailData: EmailData, sequenceNumber: number): Promise<string> {
    try {
      await this.addOrUpdateContact(emailData);
      
      // Get the appropriate template ID
      const templateId = this.templateIds[`followup${sequenceNumber}` as keyof typeof this.templateIds];
      if (!templateId) {
        throw new Error(`No template found for follow-up ${sequenceNumber}`);
      }

      // Create campaign using the follow-up template
      const campaign = await this.client.campaigns.create({
        type: 'regular',
        recipients: {
          list_id: this.audienceId,
          segment_opts: {
            match: 'all',
            conditions: [
              {
                condition_type: 'EmailAddress',
                op: 'is',
                field: 'EMAIL',
                value: emailData.email
              }
            ]
          }
        },
        settings: {
          subject_line: this.getFollowUpSubjectLine(sequenceNumber, emailData.firstName),
          title: `Gutcheck Follow-up ${sequenceNumber} - ${emailData.email}`,
          from_name: 'Gutcheck.AI',
          reply_to: 'hello@gutcheck.ai',
          template_id: parseInt(templateId),
          auto_footer: false
        }
      });

      // Send the campaign
      await this.client.campaigns.send(campaign.id);

      console.log(`Follow-up email ${sequenceNumber} sent successfully to ${emailData.email}`);
      return campaign.id;

    } catch (error) {
      console.error(`Error sending follow-up email ${sequenceNumber}:`, error);
      throw new Error(`Failed to send follow-up email: ${error}`);
    }
  }

  /**
   * Get subject line for follow-up emails
   */
  private getFollowUpSubjectLine(sequenceNumber: number, firstName?: string): string {
    const name = firstName || 'Entrepreneur';
    
    switch (sequenceNumber) {
      case 1:
        return `Your Gutcheck Game Plan, ${name}`;
      case 2:
        return `How Entrepreneurs Like You Score Higher`;
      case 3:
        return `Level Up: Learn from a 5-Star Performer`;
      default:
        return `Your Gutcheck Journey Continues`;
    }
  }

  /**
   * Generate subscriber hash for Mailchimp
   */
  private getSubscriberHash(email: string): string {
    const crypto = require('crypto');
    return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  }

  /**
   * Handle webhook events from Mailchimp
   */
  async handleWebhookEvent(eventData: any): Promise<void> {
    try {
      const event: EmailEvent = {
        userId: eventData.user_id || '',
        emailType: this.mapEmailType(eventData.campaign_title || ''),
        eventType: eventData.type || 'sent',
        timestamp: new Date(),
        assessmentId: eventData.assessment_id || '',
        sequenceId: eventData.automation_id || '',
        mailchimpMessageId: eventData.message_id || ''
      };

      // Log to Firestore for analytics
      await this.logEmailEvent(event);

    } catch (error) {
      console.error('Error handling webhook event:', error);
    }
  }

  /**
   * Map Mailchimp campaign title to email type
   */
  private mapEmailType(campaignTitle: string): 'results' | 'followup_1' | 'followup_2' | 'followup_3' {
    if (campaignTitle.includes('Results')) return 'results';
    if (campaignTitle.includes('Follow-up 1')) return 'followup_1';
    if (campaignTitle.includes('Follow-up 2')) return 'followup_2';
    if (campaignTitle.includes('Follow-up 3')) return 'followup_3';
    return 'results'; // default
  }

  /**
   * Log email event to Firestore
   */
  private async logEmailEvent(event: EmailEvent): Promise<void> {
    try {
      const db = admin.firestore();
      await db.collection('email_events').add({
        ...event,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (error) {
      console.error('Error logging email event:', error);
    }
  }

  /**
   * Get audience information
   */
  async getAudienceInfo(): Promise<any> {
    try {
      const response = await this.client.lists.getList(this.audienceId);
      return response;
    } catch (error) {
      console.error('Error getting audience info:', error);
      throw error;
    }
  }

  /**
   * Get contact information
   */
  async getContactInfo(email: string): Promise<any> {
    try {
      const subscriberHash = this.getSubscriberHash(email);
      const response = await this.client.lists.getListMember(this.audienceId, subscriberHash);
      return response;
    } catch (error) {
      console.error('Error getting contact info:', error);
      throw error;
    }
  }
}
