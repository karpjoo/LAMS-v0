import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';

export default function AuthGuard({ children, requiredRole }) {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (!currentUser) {
        setUser(null);
        setLoading(false);
        navigate('/login');
        return;
      }

      setUser(currentUser);

      try {
        // Retrieve user document to inspect role claims
        const userRef = doc(db, 'users', currentUser.uid);
        const userDoc = await getDoc(userRef);
        
        if (userDoc.exists()) {
          const profile = userDoc.data();
          
          if (requiredRole && profile.role !== requiredRole) {
            // Redirect based on role mismatch
            if (profile.role === 'Admin') {
              navigate('/admin');
            } else {
              navigate('/workspace');
            }
          }
        } else {
          // Fallback if profile is not provisioned (e.g. testing)
          console.warn("User profile does not exist inside Firestore '/users' collection.");
        }
      } catch (err) {
        console.error("Failed to query user profile:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [navigate, requiredRole]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'var(--bg-primary)',
        color: 'var(--text-secondary)'
      }}>
        <div style={{ textAlign: 'center' }}>
          <p>Verifying authentication session...</p>
        </div>
      </div>
    );
  }

  return user ? children : null;
}
