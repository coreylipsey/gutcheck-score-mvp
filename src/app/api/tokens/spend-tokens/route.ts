import { NextRequest, NextResponse } from 'next/server';
import { Container } from '@/infrastructure/di/container';
import { SpendTokensForFeature } from '@/application/use-cases/SpendTokensForFeature';

export async function POST(request: NextRequest) {
  try {
    const { userId, featureName } = await request.json();

    if (!userId || !featureName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Use Clean Architecture - get use case from DI container
    const spendTokensForFeature = Container.getInstance().resolve<SpendTokensForFeature>('SpendTokensForFeature');
    
    const result = await spendTokensForFeature.execute({
      userId,
      featureName
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        newBalance: result.newBalance,
        featureUnlocked: result.featureUnlocked
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Failed to unlock feature',
          newBalance: result.newBalance
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error spending tokens:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 