# Token Economy System - Gutcheck.AI

## Overview

This document outlines the implementation of the token-based feature unlock and credit system for the Gutcheck.AI dashboard. The system enables users to purchase tokens and unlock premium features instantly within the dashboard.

## Architecture

### Clean Architecture Implementation

The token system follows Clean Architecture principles with proper separation of concerns:

#### Domain Layer
- **TokenEntity**: Core token balance entity with business logic
- **FeatureAccessEntity**: Feature access management entity
- **TokenTransaction**: Transaction record entity
- **TokenPurchase**: Purchase record entity
- **ITokenRepository**: Repository interface for token operations

#### Application Layer
- **TokenService**: Business logic for token operations
- **PurchaseTokens**: Use case for token purchases
- **SpendTokensForFeature**: Use case for feature unlocks
- **GetUserTokenInfo**: Use case for retrieving token information

#### Infrastructure Layer
- **FirestoreTokenRepository**: Firestore implementation of token repository
- **Stripe Integration**: Payment processing via Stripe
- **Cloud Functions**: Serverless functions for webhook handling

#### Presentation Layer
- **TokenBalanceIndicator**: UI component for displaying token balance
- **TokenPurchaseModal**: Modal for purchasing tokens
- **FeatureCard**: Cards showing locked/unlocked features
- **TransactionHistory**: Component for viewing transaction history

## Features

### Token Purchase Flow
1. User clicks "Buy" button in token balance indicator
2. Token purchase modal opens with package options
3. User selects package and clicks "Purchase"
4. Stripe checkout session is created
5. User completes payment on Stripe
6. Webhook processes successful payment
7. Tokens are credited to user account instantly

### Feature Unlock Flow
1. User views feature cards in dashboard
2. User clicks "Unlock" on desired feature
3. System validates token balance
4. Tokens are deducted and feature is unlocked
5. UI updates to show unlocked state
6. Transaction is recorded

### Feature Costs

#### Retail Features
- **Pro Score Breakdown**: 5 tokens
- **AI Agent Pack (30 days)**: 10 tokens
- **Investor-Ready View**: 25 tokens

#### Institutional Features
- **Batch Scoring (20 entrepreneurs)**: 100 tokens
- **Analytics Module**: 250 tokens
- **Custom Model Evaluation**: 500 tokens

## Database Schema

### Firestore Collections

#### tokenBalances
```typescript
{
  userId: string;
  balance: number;
  lastUpdated: Timestamp;
  lastPurchaseAt?: Timestamp;
}
```

#### tokenTransactions
```typescript
{
  id: string;
  userId: string;
  type: 'purchase' | 'spend' | 'refund' | 'bonus';
  amount: number;
  featureName?: string;
  source?: 'stripe' | 'admin' | 'system';
  stripePaymentIntentId?: string;
  description: string;
  timestamp: Timestamp;
  balanceAfter: number;
}
```

#### tokenPurchases
```typescript
{
  id: string;
  userId: string;
  amount: number;
  price: number;
  currency: string;
  stripePaymentIntentId: string;
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  createdAt: Timestamp;
  completedAt?: Timestamp;
}
```

#### featureAccess
```typescript
{
  userId: string;
  features: {
    proBreakdown: boolean;
    aiAgent: boolean;
    investorReady: boolean;
    batchScoring: boolean;
    analyticsModule: boolean;
    customModelEval: boolean;
  };
  lastUpdated: Timestamp;
}
```

## Setup Instructions

### 1. Environment Variables

Add the following environment variables to your `.env.local` file:

```env
# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Base URL for redirects
NEXT_PUBLIC_BASE_URL=http://localhost:3000
```

### 2. Stripe Setup

1. Create a Stripe account and get your API keys
2. Set up webhook endpoints in Stripe dashboard
3. Configure webhook URL: `https://your-domain.com/api/webhooks/stripe`
4. Add webhook events: `checkout.session.completed`, `payment_intent.succeeded`, `payment_intent.payment_failed`

### 3. Firestore Rules

The Firestore rules have been updated to include token collections. Ensure the following rules are in place:

```javascript
// Token Balance - Users can only access their own token balance
match /tokenBalances/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}

// Token Transactions - Users can only access their own transactions
match /tokenTransactions/{transactionId} {
  allow read, write: if request.auth != null && 
    resource.data.userId == request.auth.uid;
}

// Token Purchases - Users can only access their own purchases
match /tokenPurchases/{purchaseId} {
  allow read, write: if request.auth != null && 
    resource.data.userId == request.auth.uid;
}

// Feature Access - Users can only access their own feature access
match /featureAccess/{userId} {
  allow read, write: if request.auth != null && request.auth.uid == userId;
}
```

### 4. Dependencies

Install the required dependencies:

```bash
npm install @stripe/stripe-js stripe
```

For Cloud Functions:
```bash
cd functions
npm install stripe
```

## Usage Examples

### Getting User Token Information

```typescript
import { Container } from '@/infrastructure/di/container';
import { GetUserTokenInfo } from '@/application/use-cases/GetUserTokenInfo';

const getUserTokenInfo = Container.getInstance().resolve<GetUserTokenInfo>('GetUserTokenInfo');
const result = await getUserTokenInfo.execute({
  userId: 'user123',
  includeTransactionHistory: true,
  transactionLimit: 20
});

console.log('Token Balance:', result.tokenBalance);
console.log('Feature Access:', result.featureAccess);
```

### Spending Tokens for Feature

```typescript
import { Container } from '@/infrastructure/di/container';
import { SpendTokensForFeature } from '@/application/use-cases/SpendTokensForFeature';

const spendTokensForFeature = Container.getInstance().resolve<SpendTokensForFeature>('SpendTokensForFeature');
const result = await spendTokensForFeature.execute({
  userId: 'user123',
  featureName: 'proBreakdown'
});

if (result.success) {
  console.log('Feature unlocked! New balance:', result.newBalance);
} else {
  console.log('Failed to unlock feature:', result.error);
}
```

### Creating Token Purchase

```typescript
import { Container } from '@/infrastructure/di/container';
import { PurchaseTokens } from '@/application/use-cases/PurchaseTokens';

const purchaseTokens = Container.getInstance().resolve<PurchaseTokens>('PurchaseTokens');
const result = await purchaseTokens.execute({
  userId: 'user123',
  amount: 100,
  price: 29.99,
  currency: 'usd',
  stripePaymentIntentId: 'pi_1234567890'
});

if (result.success) {
  console.log('Purchase successful! New balance:', result.newBalance);
}
```

## API Endpoints

### POST /api/tokens/create-checkout-session
Creates a Stripe checkout session for token purchase.

**Request Body:**
```json
{
  "packageId": "pro",
  "tokens": 100,
  "price": 29.99,
  "userId": "user123"
}
```

**Response:**
```json
{
  "sessionId": "cs_1234567890"
}
```

### POST /api/tokens/spend-tokens
Spends tokens to unlock a feature.

**Request Body:**
```json
{
  "userId": "user123",
  "featureName": "proBreakdown"
}
```

**Response:**
```json
{
  "success": true,
  "newBalance": 95,
  "featureUnlocked": true
}
```

### GET /api/tokens/user-info?userId=user123
Gets user token information.

**Response:**
```json
{
  "success": true,
  "tokenBalance": 100,
  "featureAccess": {
    "proBreakdown": true,
    "aiAgent": false,
    "investorReady": false,
    "batchScoring": false,
    "analyticsModule": false,
    "customModelEval": false
  },
  "transactionHistory": [...]
}
```

## Cloud Functions

### createTokenCheckoutSession
Creates a Stripe checkout session for token purchases.

### processStripeWebhook
Processes Stripe webhooks for payment events.

## Security Considerations

1. **Authentication**: All token operations require user authentication
2. **Authorization**: Users can only access their own token data
3. **Webhook Verification**: Stripe webhooks are verified using signatures
4. **Input Validation**: All inputs are validated before processing
5. **Transaction Atomicity**: Token balance updates and transaction creation are atomic

## Testing

### Manual Testing Checklist

- [ ] Token balance displays correctly in dashboard
- [ ] Purchase modal opens and displays packages
- [ ] Stripe checkout flow works end-to-end
- [ ] Tokens are credited after successful payment
- [ ] Feature cards show correct locked/unlocked states
- [ ] Feature unlock flow works correctly
- [ ] Transaction history displays properly
- [ ] Insufficient balance prevents feature unlock
- [ ] Webhook processing works correctly

### Unit Testing

Run the test suite:
```bash
npm test
```

## Monitoring and Analytics

### Key Metrics to Track

1. **Token Purchase Conversion Rate**: Percentage of users who purchase tokens
2. **Feature Unlock Rate**: Percentage of users who unlock features
3. **Average Token Spend**: Average tokens spent per user
4. **Popular Features**: Most frequently unlocked features
5. **Revenue per User**: Average revenue generated per user

### Logging

The system logs all token operations for audit purposes:
- Token purchases
- Feature unlocks
- Failed transactions
- Webhook processing

## Troubleshooting

### Common Issues

1. **Stripe Webhook Failures**
   - Verify webhook endpoint URL
   - Check webhook signature verification
   - Ensure environment variables are set correctly

2. **Token Balance Not Updating**
   - Check Firestore rules
   - Verify user authentication
   - Check transaction logs

3. **Feature Unlock Failures**
   - Verify token balance
   - Check feature access permissions
   - Review transaction logs

### Debug Mode

Enable debug logging by setting:
```env
DEBUG=tokens:*
```

## Future Enhancements

1. **Token Expiration**: Add expiration dates to tokens
2. **Bulk Purchases**: Discounts for larger token packages
3. **Referral System**: Token rewards for referrals
4. **Subscription Model**: Monthly token subscriptions
5. **Admin Panel**: Admin interface for token management
6. **Analytics Dashboard**: Detailed token usage analytics

## Support

For technical issues or questions about the token system, refer to:
- Firebase documentation
- Stripe documentation
- Clean Architecture principles
- Gutcheck.AI development guidelines 