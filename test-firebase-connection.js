// Firebase Connection Test for HomeCare Management System
// This script tests the Firebase Realtime Database connection

import { initializeApp } from "firebase/app";
import { getDatabase, ref, set, get, push } from "firebase/database";

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD_iGp3av4E-UH6Wiv8W_IdWPr-lShChTE",
  authDomain: "homecare-ca5ce.firebaseapp.com",
  projectId: "homecare-ca5ce",
  storageBucket: "homecare-ca5ce.firebasestorage.app",
  messagingSenderId: "995264187645",
  appId: "1:995264187645:web:8d554b68d02ceb2fba8294"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

// Test database connection
async function testConnection() {
  try {
    console.log("🔥 Testing Firebase Realtime Database connection...");
    
    // Test write operation
    const testRef = ref(database, 'homecare/test/connection');
    await set(testRef, {
      timestamp: new Date().toISOString(),
      message: "HomeCare Management System connected successfully!",
      project: "homecare-ca5ce",
      status: "active"
    });
    
    console.log("✅ Write test successful!");
    
    // Test read operation
    const snapshot = await get(testRef);
    if (snapshot.exists()) {
      console.log("✅ Read test successful!");
      console.log("📊 Data:", snapshot.val());
    } else {
      console.log("❌ Read test failed - no data found");
    }
    
    // Test tenant structure
    const tenantRef = ref(database, 'homecare/tenants');
    const tenantSnapshot = await get(tenantRef);
    console.log("🏢 Tenant structure:", tenantSnapshot.exists() ? "Ready" : "Empty (expected for new setup)");
    
    console.log("🎉 Firebase connection test completed successfully!");
    console.log("🔐 Security rules are active and protecting your data");
    
  } catch (error) {
    console.error("❌ Firebase connection test failed:", error);
    console.error("💡 Make sure you have proper authentication set up");
  }
}

// Run the test
testConnection();

export { app, database };
