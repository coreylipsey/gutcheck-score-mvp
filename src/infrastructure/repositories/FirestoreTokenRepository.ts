import { 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  collection, 
  query, 
  where, 
  orderBy, 
  limit, 
  getDocs,
  writeBatch,
  serverTimestamp,
  Timestamp
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { ITokenRepository } from '../../domain/repositories/ITokenRepository';
import { 
  TokenBalance, 
  TokenTransaction, 
  TokenPurchase, 
  FeatureAccess 
} from '../../domain/entities/Token';
import { 
  FirestoreTokenBalance, 
  FirestoreFeatureAccess, 
  FirestoreTokenTransaction, 
  FirestoreTokenPurchase 
} from '../../types/firestore';

export class FirestoreTokenRepository implements ITokenRepository {
  // Token Balance Operations
  async getTokenBalance(userId: string): Promise<TokenBalance | null> {
    const balanceRef = doc(db, 'tokenBalances', userId);
    const balanceDoc = await getDoc(balanceRef);
    
    if (!balanceDoc.exists()) {
      return null;
    }
    
    const data = balanceDoc.data() as FirestoreTokenBalance;
    return {
      userId: data.userId,
      balance: data.balance,
      lastUpdated: data.lastUpdated.toDate(),
      lastPurchaseAt: data.lastPurchaseAt ? data.lastPurchaseAt.toDate() : null
    };
  }

  async updateTokenBalance(tokenBalance: TokenBalance): Promise<void> {
    const balanceRef = doc(db, 'tokenBalances', tokenBalance.userId);
    const firestoreBalance: FirestoreTokenBalance = {
      userId: tokenBalance.userId,
      balance: tokenBalance.balance,
      lastUpdated: Timestamp.fromDate(tokenBalance.lastUpdated),
      ...(tokenBalance.lastPurchaseAt && { lastPurchaseAt: Timestamp.fromDate(tokenBalance.lastPurchaseAt) })
    };
    
    await setDoc(balanceRef, firestoreBalance, { merge: true });
  }

  async createTokenBalance(tokenBalance: TokenBalance): Promise<void> {
    const balanceRef = doc(db, 'tokenBalances', tokenBalance.userId);
    const firestoreBalance: FirestoreTokenBalance = {
      userId: tokenBalance.userId,
      balance: tokenBalance.balance,
      lastUpdated: Timestamp.fromDate(tokenBalance.lastUpdated),
      ...(tokenBalance.lastPurchaseAt && { lastPurchaseAt: Timestamp.fromDate(tokenBalance.lastPurchaseAt) })
    };
    
    await setDoc(balanceRef, firestoreBalance);
  }

  // Token Transactions
  async createTransaction(transaction: TokenTransaction): Promise<void> {
    const transactionRef = doc(collection(db, 'tokenTransactions'));
    const firestoreTransaction: FirestoreTokenTransaction = {
      id: transaction.id,
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      featureName: transaction.featureName,
      source: transaction.source,
      stripePaymentIntentId: transaction.stripePaymentIntentId,
      description: transaction.description,
      timestamp: Timestamp.fromDate(transaction.timestamp),
      balanceAfter: transaction.balanceAfter
    };
    
    await setDoc(transactionRef, firestoreTransaction);
  }

  async getTransactionHistory(userId: string, limitCount: number = 50): Promise<TokenTransaction[]> {
    const transactionsRef = collection(db, 'tokenTransactions');
    const q = query(
      transactionsRef,
      where('userId', '==', userId),
      orderBy('timestamp', 'desc'),
      limit(limitCount)
    );
    
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => {
      const data = doc.data() as FirestoreTokenTransaction;
      return {
        id: data.id,
        userId: data.userId,
        type: data.type,
        amount: data.amount,
        featureName: data.featureName,
        source: data.source,
        stripePaymentIntentId: data.stripePaymentIntentId,
        description: data.description,
        timestamp: data.timestamp.toDate(),
        balanceAfter: data.balanceAfter
      };
    });
  }

  async getTransactionById(transactionId: string): Promise<TokenTransaction | null> {
    const transactionsRef = collection(db, 'tokenTransactions');
    const q = query(transactionsRef, where('id', '==', transactionId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const data = querySnapshot.docs[0].data() as FirestoreTokenTransaction;
    return {
      id: data.id,
      userId: data.userId,
      type: data.type,
      amount: data.amount,
      featureName: data.featureName,
      source: data.source,
      stripePaymentIntentId: data.stripePaymentIntentId,
      description: data.description,
      timestamp: data.timestamp.toDate(),
      balanceAfter: data.balanceAfter
    };
  }

  // Token Purchases
  async createPurchase(purchase: TokenPurchase): Promise<void> {
    const purchaseRef = doc(collection(db, 'tokenPurchases'));
    const firestorePurchase: FirestoreTokenPurchase = {
      id: purchaseRef.id,
      userId: purchase.userId,
      amount: purchase.amount,
      price: purchase.price,
      currency: purchase.currency,
      stripePaymentIntentId: purchase.stripePaymentIntentId,
      status: purchase.status,
      createdAt: Timestamp.fromDate(purchase.createdAt),
      completedAt: purchase.completedAt ? Timestamp.fromDate(purchase.completedAt) : undefined
    };
    
    await setDoc(purchaseRef, firestorePurchase);
  }

  async updatePurchaseStatus(purchaseId: string, status: TokenPurchase['status']): Promise<void> {
    const purchasesRef = collection(db, 'tokenPurchases');
    const q = query(purchasesRef, where('id', '==', purchaseId));
    const querySnapshot = await getDocs(q);
    
    if (!querySnapshot.empty) {
      const purchaseRef = querySnapshot.docs[0].ref;
      await updateDoc(purchaseRef, {
        status,
        completedAt: status === 'completed' ? serverTimestamp() : undefined
      });
    }
  }

  async getPurchaseByStripeIntent(stripePaymentIntentId: string): Promise<TokenPurchase | null> {
    const purchasesRef = collection(db, 'tokenPurchases');
    const q = query(purchasesRef, where('stripePaymentIntentId', '==', stripePaymentIntentId));
    const querySnapshot = await getDocs(q);
    
    if (querySnapshot.empty) {
      return null;
    }
    
    const data = querySnapshot.docs[0].data() as FirestoreTokenPurchase;
    return {
      userId: data.userId,
      amount: data.amount,
      price: data.price,
      currency: data.currency,
      stripePaymentIntentId: data.stripePaymentIntentId,
      status: data.status,
      createdAt: data.createdAt.toDate(),
      completedAt: data.completedAt?.toDate()
    };
  }

  // Feature Access
  async getFeatureAccess(userId: string): Promise<FeatureAccess | null> {
    const accessRef = doc(db, 'featureAccess', userId);
    const accessDoc = await getDoc(accessRef);
    
    if (!accessDoc.exists()) {
      return null;
    }
    
    const data = accessDoc.data() as FirestoreFeatureAccess;
    return {
      userId: data.userId,
      features: data.features,
      lastUpdated: data.lastUpdated.toDate()
    };
  }

  async updateFeatureAccess(featureAccess: FeatureAccess): Promise<void> {
    const accessRef = doc(db, 'featureAccess', featureAccess.userId);
    const firestoreAccess: FirestoreFeatureAccess = {
      userId: featureAccess.userId,
      features: featureAccess.features,
      lastUpdated: Timestamp.fromDate(featureAccess.lastUpdated)
    };
    
    await setDoc(accessRef, firestoreAccess, { merge: true });
  }

  async createFeatureAccess(featureAccess: FeatureAccess): Promise<void> {
    const accessRef = doc(db, 'featureAccess', featureAccess.userId);
    const firestoreAccess: FirestoreFeatureAccess = {
      userId: featureAccess.userId,
      features: featureAccess.features,
      lastUpdated: Timestamp.fromDate(featureAccess.lastUpdated)
    };
    
    await setDoc(accessRef, firestoreAccess);
  }

  // Batch Operations
  async updateTokenBalanceAndCreateTransaction(
    tokenBalance: TokenBalance, 
    transaction: TokenTransaction
  ): Promise<void> {
    const batch = writeBatch(db);
    
    // Update token balance
    const balanceRef = doc(db, 'tokenBalances', tokenBalance.userId);
    const firestoreBalance: FirestoreTokenBalance = {
      userId: tokenBalance.userId,
      balance: tokenBalance.balance,
      lastUpdated: Timestamp.fromDate(tokenBalance.lastUpdated),
      ...(tokenBalance.lastPurchaseAt && { lastPurchaseAt: Timestamp.fromDate(tokenBalance.lastPurchaseAt) })
    };
    batch.set(balanceRef, firestoreBalance, { merge: true });
    
    // Create transaction
    const transactionRef = doc(collection(db, 'tokenTransactions'));
    const firestoreTransaction: FirestoreTokenTransaction = {
      id: transaction.id,
      userId: transaction.userId,
      type: transaction.type,
      amount: transaction.amount,
      featureName: transaction.featureName,
      source: transaction.source,
      stripePaymentIntentId: transaction.stripePaymentIntentId,
      description: transaction.description,
      timestamp: Timestamp.fromDate(transaction.timestamp),
      balanceAfter: transaction.balanceAfter
    };
    batch.set(transactionRef, firestoreTransaction);
    
    await batch.commit();
  }
} 