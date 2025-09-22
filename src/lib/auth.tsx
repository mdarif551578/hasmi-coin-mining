

'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  createUserWithEmailAndPassword,
  signOut as firebaseSignOut,
  sendPasswordResetEmail,
  updateProfile,
  User,
  sendEmailVerification,
} from 'firebase/auth';
import { auth, db } from './firebase';
import { doc, getDoc, setDoc, query, collection, where, getDocs, addDoc, serverTimestamp } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({ user: null, loading: true });

// Function to generate a unique referral code from UID
const generateReferralCode = async (uid: string) => {
    // Hash uid
    const enc = new TextEncoder();
    const hashBuffer = await crypto.subtle.digest("SHA-256", enc.encode(uid));
    const bytes = new Uint8Array(hashBuffer);

    // Base36 encode first 6 bytes
    let num = 0n;
    for (let i = 0; i < 6; i++) num = (num << 8n) + BigInt(bytes[i]);
    const base36 = num.toString(36).toUpperCase();

    // Format: HASMI-XXXXXXX
    return "HASMI-" + base36.slice(0, 7);
};


export const createUserDocument = async (user: User, referralCode?: string) => {
    if (!user) return;
    const userDocRef = doc(db, 'users', user.uid);
    const userDocSnap = await getDoc(userDocRef);

    let referredBy = null;
    let hasProcessedReferral = false;

    // --- Referral Logic ---
    // This block should run if a referral code is provided, even if the user document exists,
    // as long as the user hasn't been referred before.
    if (referralCode && !userDocSnap.data()?.referred_by) {
        const q = query(collection(db, "users"), where("referral_code", "==", referralCode.toUpperCase()));
        const querySnapshot = await getDocs(q);
        if (!querySnapshot.empty) {
            const referringUserDoc = querySnapshot.docs[0];
            referredBy = referringUserDoc.id;
            hasProcessedReferral = true; // Mark that we found a valid referrer

            // Create pending referral bonus document
            try {
                const settingsDocRef = doc(db, 'settings', 'exchangeRates');
                const settingsDoc = await getDoc(settingsDocRef);
                if (settingsDoc.exists()) {
                    const settingsData = settingsDoc.data();
                    const bonusConfig = settingsData.referral_bonus;
                    if (bonusConfig && bonusConfig.referrer_bonus > 0 && bonusConfig.referee_bonus > 0) {
                        await addDoc(collection(db, "referral_bonuses"), {
                            referrerId: referredBy,
                            refereeId: user.uid,
                            referrerBonus: bonusConfig.referrer_bonus,
                            refereeBonus: bonusConfig.referee_bonus,
                            status: 'pending',
                            createdAt: serverTimestamp(),
                        });
                    }
                }
            } catch (bonusError) {
                console.error("Error creating referral bonus document:", bonusError);
            }
        }
    }


    // --- User Document Creation/Update ---
    if (!userDocSnap.exists()) {
        const { email, displayName, uid } = user;
        const newReferralCode = await generateReferralCode(uid);
        
        try {
            await setDoc(userDocRef, {
                email,
                displayName: displayName || 'User',
                phone: '',
                wallet_balance: 0,
                usd_balance: 0,
                referral_code: newReferralCode,
                referred_by: referredBy, // Will be null if no valid code was used
                role: 'user',
                last_claim: new Date(0),
                createdAt: serverTimestamp(),
            });
        } catch (error) {
            console.error("Error creating user document:", error);
        }
    } else if (hasProcessedReferral) {
        // If the user document already exists but we just processed a referral,
        // update the `referred_by` field.
         try {
            await setDoc(userDocRef, { referred_by: referredBy }, { merge: true });
        } catch (error) {
            console.error("Error updating referred_by field:", error);
        }
    }
};

// We need a way to pass the referral code from signup to onAuthStateChanged.
let tempReferralCode: string | undefined = undefined;

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        // This function checks for existence and creates if needed
        createUserDocument(currentUser, tempReferralCode);
        tempReferralCode = undefined; // Clear the code after use
      }
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

export const signUp = async (name: string, email:string, password: string, referralCode?: string): Promise<{ error?: any }> => {
  try {
    // Store referral code to be picked up by onAuthStateChanged
    tempReferralCode = referralCode; 
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    await updateProfile(userCredential.user, { displayName: name });
    await sendEmailVerification(userCredential.user);
    // createUserDocument is now called by onAuthStateChanged.
    await firebaseSignOut(auth); // Sign out user until they verify email
    return {};
  } catch (error) {
    tempReferralCode = undefined; // Clear on error
    return { error };
  }
};


export const signOut = async (): Promise<{ error?: any }> => {
  try {
    await firebaseSignOut(auth);
    return {};
  } catch (error) {
    return { error };
  }
};

export const resetPassword = async (email: string): Promise<{ error?: any }> => {
    try {
        await sendPasswordResetEmail(auth, email);
        return {};
    } catch (error) {
        return { error };
    }
}
