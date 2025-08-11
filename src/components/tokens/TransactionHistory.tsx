'use client';

import { useState, useEffect } from 'react';
import { useAuthContext } from '@/presentation/providers/AuthProvider';
import { Container } from '@/infrastructure/di/container';
import { GetUserTokenInfo } from '@/application/use-cases/GetUserTokenInfo';
import { TokenTransaction } from '@/domain/entities/Token';
import { Coins, TrendingUp, TrendingDown, Clock, CheckCircle, XCircle } from 'lucide-react';

interface TransactionHistoryProps {
  className?: string;
}

export function TransactionHistory({ className = '' }: TransactionHistoryProps) {
  const { user } = useAuthContext();
  const [transactions, setTransactions] = useState<TokenTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user?.uid) {
      loadTransactionHistory();
    }
  }, [user?.uid]);

  const loadTransactionHistory = async () => {
    if (!user?.uid) return;

    try {
      setLoading(true);
      setError(null);
      
      const getUserTokenInfo = Container.getInstance().resolve<GetUserTokenInfo>('GetUserTokenInfo');
      const result = await getUserTokenInfo.execute({
        userId: user.uid,
        includeTransactionHistory: true,
        transactionLimit: 20
      });

      if (result.success && result.transactionHistory) {
        setTransactions(result.transactionHistory);
      } else {
        setError(result.error || 'Failed to load transaction history');
      }
    } catch (err) {
      console.error('Error loading transaction history:', err);
      setError('Failed to load transaction history');
    } finally {
      setLoading(false);
    }
  };

  const getTransactionIcon = (type: TokenTransaction['type']) => {
    switch (type) {
      case 'purchase':
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case 'spend':
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      case 'refund':
        return <CheckCircle className="h-4 w-4 text-blue-600" />;
      case 'bonus':
        return <Coins className="h-4 w-4 text-yellow-600" />;
      default:
        return <Clock className="h-4 w-4 text-gray-600" />;
    }
  };

  const getTransactionColor = (type: TokenTransaction['type']) => {
    switch (type) {
      case 'purchase':
        return 'text-green-600';
      case 'spend':
        return 'text-red-600';
      case 'refund':
        return 'text-blue-600';
      case 'bonus':
        return 'text-yellow-600';
      default:
        return 'text-gray-600';
    }
  };

  const formatAmount = (amount: number) => {
    const sign = amount >= 0 ? '+' : '';
    return `${sign}${amount}`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  if (!user) {
    return null;
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg ${className}`}>
      <div className="p-6 border-b border-gray-200">
        <h3 className="text-lg font-semibold text-gray-900">Transaction History</h3>
        <p className="text-sm text-gray-600 mt-1">Your recent token transactions</p>
      </div>

      <div className="p-6">
        {loading ? (
          <div className="space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gray-200 rounded-full"></div>
                  <div className="flex-1">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          <div className="text-center py-8">
            <XCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
            <p className="text-red-600">{error}</p>
            <button
              onClick={loadTransactionHistory}
              className="mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : transactions.length === 0 ? (
          <div className="text-center py-8">
            <Coins className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No transactions yet</p>
            <p className="text-sm text-gray-500 mt-1">Your token transactions will appear here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {transactions.map((transaction) => (
              <div key={transaction.id} className="flex items-center space-x-3 p-3 rounded-lg hover:bg-gray-50 transition-colors">
                <div className="flex-shrink-0">
                  {getTransactionIcon(transaction.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {transaction.description}
                    </p>
                    <span className={`text-sm font-semibold ${getTransactionColor(transaction.type)}`}>
                      {formatAmount(transaction.amount)}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between mt-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs text-gray-500">
                        {formatDate(transaction.timestamp)}
                      </span>
                      {transaction.featureName && (
                        <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          {transaction.featureName}
                        </span>
                      )}
                    </div>
                    
                    <span className="text-xs text-gray-500">
                      Balance: {transaction.balanceAfter}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 