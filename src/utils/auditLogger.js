import { collection, doc, addDoc, serverTimestamp } from 'firebase/firestore';
import { auth } from '../firebase';

/**
 * Inserts an append-only audit log entry into the Firestore '/audit_logs' collection.
 * 
 * @param {Firestore} db - Firestore database instance
 * @param {string} actionType - The type of action (e.g. 'Ingest Dataset', 'Clear All Datasets', 'Save Evaluator Label')
 * @param {string} targetId - ID of target entity (e.g. call_id, or 'ALL_DATASETS')
 * @param {Object} details - Metadata details about the action
 * @param {Object} [options] - Additional write options (e.g. { transaction, batch })
 */
export async function logAction(db, actionType, targetId, details = {}, options = {}) {
  const currentUser = auth.currentUser;
  
  if (!currentUser) {
    console.warn("Audit Logger: Attempted to log action without authenticated user session.");
    return null;
  }

  const logData = {
    timestamp: serverTimestamp(),
    actor_id: currentUser.uid,
    actor_email: currentUser.email || 'unknown',
    action_type: actionType,
    target_id: targetId,
    details: {
      summary: details.summary || `${actionType} performed on ${targetId}`,
      meta: details.meta || {}
    }
  };

  try {
    const logsRef = collection(db, 'audit_logs');
    
    if (options.transaction) {
      const logRef = doc(logsRef);
      options.transaction.set(logDocRefCheck(db, logRef), logData);
      return logRef.id;
    } else if (options.batch) {
      const logRef = doc(logsRef);
      options.batch.set(logRef, logData);
      return logRef.id;
    } else {
      const docRef = await addDoc(logsRef, logData);
      return docRef.id;
    }
  } catch (err) {
    console.error("Audit Logger failed to write log:", err);
    throw err;
  }
}

// Helper to ensure correct type for transaction sets
function logDocRefCheck(db, ref) {
  return ref;
}

