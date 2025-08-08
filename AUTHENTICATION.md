# Authentication System - Gutcheck Score™ MVP

## Overview

The authentication system provides secure user registration, login, and session management for the Gutcheck Score™ platform. It enables users to create accounts, link their anonymous assessments, and track their progress over time.

## Features

### ✅ Implemented Features

1. **User Registration & Login**
   - Email/password authentication using Firebase Auth
   - Form validation with React Hook Form + Zod
   - Error handling and user feedback
   - Secure password requirements

2. **Password Reset**
   - Email-based password reset flow
   - Firebase Auth integration
   - Success/error state management

3. **Session Management**
   - Automatic session persistence
   - Protected routes for authenticated users
   - User state management across the app

4. **Claim My Score**
   - Link anonymous assessments to user accounts
   - Modal-based claim flow
   - API endpoint for session linking

5. **User Dashboard**
   - Protected dashboard with user information
   - Assessment history display
   - Sign out functionality

## Architecture

### Components

- **AuthProvider**: Context provider for authentication state
- **useAuth**: Custom hook for authentication operations
- **AuthForm**: Reusable form component for login/register
- **PasswordResetForm**: Password reset form component
- **ClaimScoreModal**: Modal for claiming anonymous scores
- **ProtectedRoute**: Route wrapper for authenticated pages

### File Structure

```
src/
├── presentation/
│   ├── providers/
│   │   ├── AuthProvider.tsx          # Auth context provider
│   │   └── DependencyProvider.tsx    # DI container setup
│   └── hooks/
│       └── useAuth.ts                # Authentication hook
├── components/
│   └── auth/
│       ├── AuthForm.tsx              # Login/register form
│       ├── PasswordResetForm.tsx     # Password reset form
│       ├── ClaimScoreModal.tsx       # Score claiming modal
│       └── ProtectedRoute.tsx        # Route protection
├── app/
│   ├── auth/
│   │   └── page.tsx                  # Authentication page
│   ├── api/
│   │   └── auth/
│   │       └── claim-score/
│   │           └── route.ts          # Claim score API
│   └── dashboard/
│       └── page.tsx                  # Protected dashboard
└── lib/
    └── firebase.ts                   # Firebase configuration
```

## Usage

### Authentication Flow

1. **Anonymous Assessment**: Users can take assessments without an account
2. **Account Creation**: After assessment, users can create accounts
3. **Score Claiming**: Users can link their anonymous assessments to their account
4. **Dashboard Access**: Authenticated users can access their dashboard

### Protected Routes

```tsx
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export default function MyProtectedPage() {
  return (
    <ProtectedRoute>
      <MyPageContent />
    </ProtectedRoute>
  );
}
```

### Authentication Hook

```tsx
import { useAuthContext } from '@/presentation/providers/AuthProvider';

function MyComponent() {
  const { user, signIn, signUp, logout } = useAuthContext();
  
  // Use authentication functions
}
```

## Security

### Firebase Security Rules

- Users can only access their own data
- Anonymous sessions can be claimed by authenticated users
- Assessment sessions are publicly readable but only editable by owners

### Data Protection

- Passwords are handled securely by Firebase Auth
- User sessions are managed by Firebase
- No sensitive data stored in localStorage

## Configuration

### Environment Variables

Required Firebase configuration:

```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### Dependencies

```json
{
  "react-hook-form": "^7.x",
  "@hookform/resolvers": "^3.x",
  "zod": "^3.x",
  "firebase": "^10.x"
}
```

## Testing

### Manual Testing Checklist

- [ ] User registration with valid email/password
- [ ] User login with existing credentials
- [ ] Password reset flow
- [ ] Protected route access
- [ ] Anonymous assessment completion
- [ ] Score claiming functionality
- [ ] Dashboard access for authenticated users
- [ ] Sign out functionality

### Error Scenarios

- [ ] Invalid email format
- [ ] Weak password
- [ ] Non-existent user login
- [ ] Wrong password
- [ ] Network errors
- [ ] Firebase service unavailability

## Future Enhancements

### Planned Features

1. **Social Login**
   - Google OAuth integration
   - LinkedIn authentication
   - Apple Sign In

2. **Email Verification**
   - Mandatory email verification
   - Verification reminder emails

3. **Multi-Factor Authentication**
   - SMS-based 2FA
   - Authenticator app support

4. **Account Management**
   - Profile editing
   - Password change
   - Account deletion

5. **Advanced Security**
   - Session management
   - Device tracking
   - Suspicious activity detection

## Troubleshooting

### Common Issues

1. **Firebase Configuration**
   - Ensure all environment variables are set
   - Verify Firebase project settings
   - Check authentication providers are enabled

2. **Form Validation**
   - Verify Zod schemas are correct
   - Check React Hook Form setup
   - Ensure proper error handling

3. **Protected Routes**
   - Verify AuthProvider is wrapping the app
   - Check user state management
   - Ensure proper redirect logic

### Debug Mode

Enable debug logging by setting:

```env
NEXT_PUBLIC_DEBUG_AUTH=true
```

This will log authentication events to the console for debugging purposes. 