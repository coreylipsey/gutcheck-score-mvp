import { NextRequest, NextResponse } from 'next/server';
import { Container } from '@/infrastructure/di/container';
import { GetUserTokenInfo } from '@/application/use-cases/GetUserTokenInfo';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const includeTransactionHistory = searchParams.get('includeTransactionHistory') === 'true';
    const transactionLimit = searchParams.get('transactionLimit') 
      ? parseInt(searchParams.get('transactionLimit')!) 
      : undefined;

    if (!userId) {
      return NextResponse.json(
        { error: 'Missing userId parameter' },
        { status: 400 }
      );
    }

    // Use Clean Architecture - get use case from DI container
    const getUserTokenInfo = Container.getInstance().resolve<GetUserTokenInfo>('GetUserTokenInfo');
    
    const result = await getUserTokenInfo.execute({
      userId,
      includeTransactionHistory,
      transactionLimit
    });

    if (result.success) {
      return NextResponse.json({
        success: true,
        tokenBalance: result.tokenBalance,
        featureAccess: result.featureAccess,
        transactionHistory: result.transactionHistory
      });
    } else {
      return NextResponse.json(
        { 
          success: false,
          error: result.error || 'Failed to get user token info'
        },
        { status: 400 }
      );
    }
  } catch (error) {
    console.error('Error getting user token info:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 