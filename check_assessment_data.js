const { initializeApp } = require('firebase/app');
const { getFirestore, collection, query, where, getDocs } = require('firebase/firestore');

// Initialize Firebase
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

async function checkAssessmentData() {
  try {
    console.log('🔍 Checking for assessment data for coreylipsey@gutcheckaiapp.com...');
    
    // First, let's check if there's a user with this email
    const userRolesRef = collection(db, 'userRoles');
    const userQuery = query(userRolesRef, where('email', '==', 'coreylipsey@gutcheckaiapp.com'));
    const userSnapshot = await getDocs(userQuery);
    
    if (!userSnapshot.empty) {
      console.log('✅ Found user account for coreylipsey@gutcheckaiapp.com');
      const userData = userSnapshot.docs[0].data();
      console.log('User ID:', userSnapshot.docs[0].id);
      console.log('User roles:', userData.roles);
      console.log('Partner data:', userData.partnerData);
      
      // Now check for assessment sessions
      const sessionsRef = collection(db, 'assessmentSessions');
      const sessionsQuery = query(sessionsRef, where('userId', '==', userSnapshot.docs[0].id));
      const sessionsSnapshot = await getDocs(sessionsQuery);
      
      if (!sessionsSnapshot.empty) {
        console.log(`✅ Found ${sessionsSnapshot.size} assessment session(s) for this user`);
        sessionsSnapshot.forEach((doc, index) => {
          const sessionData = doc.data();
          console.log(`Session ${index + 1}:`);
          console.log('  - Session ID:', doc.id);
          console.log('  - Created:', sessionData.createdAt?.toDate?.() || 'Unknown');
          console.log('  - Completed:', sessionData.completedAt?.toDate?.() || 'Not completed');
          console.log('  - Overall Score:', sessionData.scores?.overallScore || 'No score');
          console.log('  - Star Rating:', sessionData.starRating || 'No rating');
        });
      } else {
        console.log('❌ No assessment sessions found for this user');
      }
    } else {
      console.log('❌ No user account found for coreylipsey@gutcheckaiapp.com');
    }
    
    // Also check for any assessment sessions with this email as userId
    const emailSessionsRef = collection(db, 'assessmentSessions');
    const emailSessionsQuery = query(emailSessionsRef, where('userId', '==', 'coreylipsey@gutcheckaiapp.com'));
    const emailSessionsSnapshot = await getDocs(emailSessionsQuery);
    
    if (!emailSessionsSnapshot.empty) {
      console.log(`✅ Found ${emailSessionsSnapshot.size} assessment session(s) with email as userId`);
      emailSessionsSnapshot.forEach((doc, index) => {
        const sessionData = doc.data();
        console.log(`Email Session ${index + 1}:`);
        console.log('  - Session ID:', doc.id);
        console.log('  - Created:', sessionData.createdAt?.toDate?.() || 'Unknown');
        console.log('  - Completed:', sessionData.completedAt?.toDate?.() || 'Not completed');
        console.log('  - Overall Score:', sessionData.scores?.overallScore || 'No score');
        console.log('  - Star Rating:', sessionData.starRating || 'No rating');
      });
    } else {
      console.log('❌ No assessment sessions found with email as userId');
    }
    
  } catch (error) {
    console.error('Error checking assessment data:', error);
  }
}

checkAssessmentData();
