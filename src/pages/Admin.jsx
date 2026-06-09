import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  writeBatch, 
  doc, 
  setDoc,
  getDocs, 
  query, 
  orderBy, 
  limit, 
  onSnapshot 
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import { parseDataset } from '../utils/datasetParser';
import { parseLLMPredictions } from '../utils/llmParser';
import { parseStatistics } from '../utils/statsParser';
import { logAction } from '../utils/auditLogger';
import PIIWarningModal from '../components/PIIWarningModal';
import DeleteConfirmationModal from '../components/DeleteConfirmationModal';

export default function Admin() {
  const [loading, setLoading] = useState(false);

  // Dataset Upload State
  const [fileContent, setFileContent] = useState('');
  const [parsedResult, setParsedResult] = useState(null);
  const [uploadError, setUploadError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');
  
  // LLM Ingestion State
  const [llmFileContent, setLlmFileContent] = useState('');
  const [llmParsedResult, setLlmParsedResult] = useState(null);
  const [llmUploadError, setLlmUploadError] = useState('');
  const [llmSuccessMsg, setLlmSuccessMsg] = useState('');

  // Stats Ingestion State
  const [statsFileContent, setStatsFileContent] = useState('');
  const [statsParsedResult, setStatsParsedResult] = useState(null);
  const [statsUploadError, setStatsUploadError] = useState('');
  const [statsSuccessMsg, setStatsSuccessMsg] = useState('');

  // Modals state
  const [piiModalOpen, setPiiModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  const [skipRound2, setSkipRound2] = useState(false);
  const [settingsSaving, setSettingsSaving] = useState(false);
  const [settingsSavedMsg, setSettingsSavedMsg] = useState('');
  const [auditLogs, setAuditLogs] = useState([]);
  const navigate = useNavigate();

  // Load skip_round2 setting in real-time
  useEffect(() => {
    const settingsRef = doc(db, 'dashboard', 'settings');
    const unsubscribe = onSnapshot(settingsRef, (snap) => {
      if (snap.exists()) {
        setSkipRound2(snap.data().skip_round2 || false);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleSkipRound2Toggle = async (e) => {
    const checked = e.target.checked;
    setSkipRound2(checked);
    setSettingsSaving(true);
    setSettingsSavedMsg('');
    try {
      const settingsRef = doc(db, 'dashboard', 'settings');
      await setDoc(settingsRef, { skip_round2: checked }, { merge: true });
      await logAction(db, 'Update Process Settings', 'settings', {
        summary: `Changed skip_round2 setting to ${checked}`,
        meta: { skip_round2: checked }
      });
      setSettingsSavedMsg('Settings saved successfully!');
    } catch (err) {
      console.error("Failed to update skip_round2 configuration:", err);
      alert("Failed to save setting: " + err.message);
    } finally {
      setSettingsSaving(false);
    }
  };

  // Load audit logs in real-time
  useEffect(() => {
    const logsRef = collection(db, 'audit_logs');
    const q = query(logsRef, orderBy('timestamp', 'desc'), limit(10));
    
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = [];
      snapshot.forEach((doc) => {
        const data = doc.data();
        logs.push({
          id: doc.id,
          ...data,
          formattedTime: data.timestamp ? new Date(data.timestamp.seconds * 1000).toLocaleString() : 'Pending...'
        });
      });
      setAuditLogs(logs);
    }, (error) => {
      console.error("Failed to sync audit logs:", error);
    });

    return () => unsubscribe();
  }, []);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  // Conversations Dataset Parser Handlers
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setUploadError('');
    setSuccessMsg('');
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setFileContent(text);
      
      const validation = parseDataset(text);
      if (!validation.isValid) {
        setUploadError(`Schema Error: ${validation.errors.join(' | ')}`);
        setParsedResult(null);
      } else {
        setParsedResult(validation);
      }
    };
    reader.onerror = () => {
      setUploadError('Failed to read selected file.');
    };
    reader.readAsText(file);
  };

  const executeUpload = async (datasetData) => {
    setLoading(true);
    try {
      const batch = writeBatch(db);
      
      datasetData.forEach((record) => {
        const convRef = doc(db, 'conversations', record.call_id);
        batch.set(convRef, {
          call_id: record.call_id,
          status: record.status,
          label_completion_count: record.label_completion_count,
          turns: record.turns,
          created_at: new Date()
        });
      });

      await batch.commit();

      // Log the action (Append-only audit log)
      await logAction(db, 'Ingest Dataset', 'ALL_DATASETS', {
        summary: `Imported dataset containing ${datasetData.length} conversation records.`,
        meta: { recordCount: datasetData.length }
      });

      setSuccessMsg(`Dataset upload complete! Successfully loaded ${datasetData.length} records.`);
      setParsedResult(null);
      setFileContent('');
    } catch (err) {
      console.error("Bulk upload transaction failure:", err);
      setUploadError(`Database upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleUploadClick = () => {
    if (!parsedResult) return;

    if (parsedResult.warnings.length > 0) {
      setPiiModalOpen(true);
    } else {
      executeUpload(parsedResult.data);
    }
  };

  const handleConfirmPIIUpload = () => {
    setPiiModalOpen(false);
    if (parsedResult) {
      executeUpload(parsedResult.data);
    }
  };

  // LLM Results Parser Handlers
  const handleLlmFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setLlmUploadError('');
    setLlmSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setLlmFileContent(text);

      const validation = parseLLMPredictions(text);
      if (!validation.isValid) {
        setLlmUploadError(`Schema Error: ${validation.errors.join(' | ')}`);
        setLlmParsedResult(null);
      } else {
        setLlmParsedResult(validation);
      }
    };
    reader.onerror = () => {
      setLlmUploadError('Failed to read selected file.');
    };
    reader.readAsText(file);
  };

  const executeLlmUpload = async () => {
    if (!llmParsedResult) return;
    setLoading(true);
    setLlmUploadError('');
    setLlmSuccessMsg('');

    try {
      // 1. Fetch all existing conversation call_ids from database
      const convSnap = await getDocs(collection(db, 'conversations'));
      const registeredIds = new Set(convSnap.docs.map(doc => doc.id));

      // 2. Validate all call_ids match registered ones
      const missingIds = [];
      llmParsedResult.data.forEach(record => {
        if (!registeredIds.has(record.call_id)) {
          missingIds.push(record.call_id);
        }
      });

      if (missingIds.length > 0) {
        setLlmUploadError(`Validation Error: The following call_ids do not exist in the database: ${missingIds.slice(0, 10).join(', ')}${missingIds.length > 10 ? ' ... and others' : ''}. Please upload the dataset containing these conversations first.`);
        setLoading(false);
        return;
      }

      // 3. Perform chunked batch write (500 limit)
      const data = llmParsedResult.data;
      let batch = writeBatch(db);
      let count = 0;

      for (let i = 0; i < data.length; i++) {
        const record = data[i];
        const docRef = doc(db, `conversations/${record.call_id}/llm_results`, 'verdict');
        batch.set(docRef, {
          call_id: record.call_id,
          model_verdicts: record.model_verdicts
        });
        count++;

        if (count === 400) {
          await batch.commit();
          batch = writeBatch(db);
          count = 0;
        }
      }

      if (count > 0) {
        await batch.commit();
      }

      // 4. Log audit log action
      await logAction(db, 'Ingest LLM Predictions', 'ALL_DATASETS', {
        summary: `Imported LLM predictions for ${data.length} conversation records.`,
        meta: { recordCount: data.length }
      });

      setLlmSuccessMsg(`LLM predictions upload complete! Successfully loaded verdicts for ${data.length} records.`);
      setLlmParsedResult(null);
      setLlmFileContent('');
    } catch (err) {
      console.error("LLM predictions upload failure:", err);
      setLlmUploadError(`Database upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Stats Ingestion Handlers
  const handleStatsFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    setStatsUploadError('');
    setStatsSuccessMsg('');

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setStatsFileContent(text);

      const validation = parseStatistics(text);
      if (!validation.isValid) {
        setStatsUploadError(`Schema Error: ${validation.errors.join(' | ')}`);
        setStatsParsedResult(null);
      } else {
        setStatsParsedResult(validation);
      }
    };
    reader.onerror = () => {
      setStatsUploadError('Failed to read selected file.');
    };
    reader.readAsText(file);
  };

  const executeStatsUpload = async () => {
    if (!statsParsedResult) return;
    setLoading(true);
    setStatsUploadError('');
    setStatsSuccessMsg('');

    try {
      // 1. Store values into /dashboard/statistics
      const statsRef = doc(db, 'dashboard', 'statistics');
      const statsData = {
        updated_at: new Date(),
        updated_by: auth.currentUser?.uid || 'system',
        ...statsParsedResult.data
      };
      await setDoc(statsRef, statsData);

      // 2. Log action
      await logAction(db, 'Ingest Statistics', 'dashboard', {
        summary: `Imported dashboard agreement statistics.`,
        meta: { stats: statsParsedResult.data }
      });

      setStatsSuccessMsg(`Statistics metrics upload complete!`);
      setStatsParsedResult(null);
      setStatsFileContent('');
    } catch (err) {
      console.error("Statistics metrics upload failure:", err);
      setStatsUploadError(`Database upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const executeClearDataset = async () => {
    setDeleteModalOpen(false);
    setLoading(true);
    setUploadError('');
    setSuccessMsg('');

    try {
      // 1. Fetch all conversation documents
      const convSnap = await getDocs(collection(db, 'conversations'));
      
      if (convSnap.empty) {
        setSuccessMsg("Database is already empty. No records to delete.");
        setLoading(false);
        return;
      }

      // 2. Perform cascade deletions for each conversation
      for (const convDoc of convSnap.docs) {
        const callId = convDoc.id;
        const batch = writeBatch(db);

        // Fetch subcollections nested records
        const labelsRef = collection(db, `conversations/${callId}/labels`);
        const labelsSnap = await getDocs(labelsRef);
        labelsSnap.forEach((ldoc) => {
          batch.delete(doc(db, `conversations/${callId}/labels/${ldoc.id}`));
        });

        const llmRef = collection(db, `conversations/${callId}/llm_results`);
        const llmSnap = await getDocs(llmRef);
        llmSnap.forEach((ldoc) => {
          batch.delete(doc(db, `conversations/${callId}/llm_results/${ldoc.id}`));
        });

        const goldRef = collection(db, `conversations/${callId}/gold_standard`);
        const goldSnap = await getDocs(goldRef);
        goldSnap.forEach((ldoc) => {
          batch.delete(doc(db, `conversations/${callId}/gold_standard/${ldoc.id}`));
        });

        // Delete parent conversation doc
        batch.delete(doc(db, 'conversations', callId));
        await batch.commit();
      }

      // Also try to delete statistics and settings documents if any
      const statsBatch = writeBatch(db);
      statsBatch.delete(doc(db, 'dashboard', 'statistics'));
      statsBatch.delete(doc(db, 'dashboard', 'settings'));
      await statsBatch.commit();

      // Log deletion action
      await logAction(db, 'Clear All Datasets', 'ALL_DATASETS', {
        summary: `Cleared all conversations, evaluators labels, llm results, and gold standards.`,
        meta: { deletedCount: convSnap.size }
      });

      setSuccessMsg(`Database cleared successfully! Wiped ${convSnap.size} conversation records and annotations.`);
    } catch (err) {
      console.error("Clean dataset failure:", err);
      setUploadError(`Failed to wipe database: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '24px', background: 'var(--bg-primary)', minHeight: '100vh', boxSizing: 'border-box' }}>
      {/* Navigation Header */}
      <header className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '16px 24px',
        marginBottom: '24px'
      }}>
        <h2>Admin Management Panel</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={() => navigate('/workspace')} style={{ padding: '8px 16px', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            Workspace
          </button>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            Dashboard
          </button>
          <button onClick={handleLogout} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            Log Out
          </button>
        </div>
      </header>

      {/* Main Grid View */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: '1.2fr 1fr',
        gap: '24px',
        alignItems: 'start'
      }}>
        {/* Left Side: Upload Operations Stack */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          
          {/* Card 1: Import Conversations */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3>Import Dataset Conversations</h3>
            
            {uploadError && (
              <div className="tag-present" style={{ padding: '12px 16px', borderRadius: 'var(--border-radius-sm)', lineHeight: '1.4' }}>
                {uploadError}
              </div>
            )}

            {successMsg && (
              <div className="tag-absent" style={{ padding: '12px 16px', borderRadius: 'var(--border-radius-sm)', lineHeight: '1.4' }}>
                {successMsg}
              </div>
            )}

            <div style={{
              border: '2px dashed var(--glass-border)',
              borderRadius: 'var(--border-radius-md)',
              padding: '30px 20px',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.15)',
              cursor: 'pointer',
              transition: 'border-color var(--transition-normal)'
            }}
            onClick={() => document.getElementById('json-file-input').click()}>
              <input
                type="file"
                id="json-file-input"
                accept=".json"
                onChange={handleFileChange}
                style={{ display: 'none' }}
                disabled={loading}
              />
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Click to browse or drag and drop a <strong>dataset JSON file</strong> here
              </p>
            </div>

            {parsedResult && (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--glass-border)',
                padding: '12px',
                borderRadius: 'var(--border-radius-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <p style={{ fontWeight: 600, fontSize: '13px' }}>File Ready: Dataset</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                    Parsed {parsedResult.data.length} records. PII warnings flagged: {parsedResult.warnings.length}
                  </p>
                </div>
                <button
                  id="upload-submit-btn"
                  onClick={handleUploadClick}
                  disabled={loading}
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                >
                  {loading ? 'Uploading...' : 'Commit Upload'}
                </button>
              </div>
            )}

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: '4px' }}>
              <h4 style={{ marginBottom: '8px', fontSize: '15px' }}>Process Settings</h4>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '13px', color: 'var(--text-secondary)' }}>
                  <input 
                    type="checkbox" 
                    id="skip-round2-checkbox"
                    checked={skipRound2} 
                    onChange={handleSkipRound2Toggle} 
                    disabled={settingsSaving}
                    style={{ width: '15px', height: '15px', accentColor: 'var(--accent-color)' }}
                  />
                  2차 평가 생략 및 즉시 3차 이송 (Skip Round 2 on Mismatch)
                </label>
                {settingsSaving && (
                  <span id="settings-status" style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                    Saving...
                  </span>
                )}
                {settingsSavedMsg && (
                  <span id="settings-status" style={{ color: 'var(--color-toxic-absent)', fontSize: '11px', fontWeight: 500 }}>
                    {settingsSavedMsg}
                  </span>
                )}
              </div>
            </div>

            <div style={{ borderTop: '1px solid var(--glass-border)', paddingTop: '20px', marginTop: '4px' }}>
              <h4 style={{ color: 'var(--color-toxic-present)', marginBottom: '6px', fontSize: '15px' }}>Danger Zone</h4>
              <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '12px' }}>
                Clear all evaluation dialogues, annotations, and statistics from the database.
              </p>
              <button
                id="delete-dataset-btn"
                onClick={() => setDeleteModalOpen(true)}
                disabled={loading}
                style={{
                  background: 'var(--color-toxic-present)',
                  border: 'none',
                  fontWeight: 600,
                  padding: '8px 16px',
                  fontSize: '13px'
                }}
              >
                Clear Database Records
              </button>
            </div>
          </div>

          {/* Card 2: Import LLM Predictions */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3>Import LLM Predictions</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '-10px' }}>
              Upload JSON predictions matching model specifications. Every call_id must exist.
            </p>

            {llmUploadError && (
              <div className="tag-present" style={{ padding: '12px 16px', borderRadius: 'var(--border-radius-sm)', lineHeight: '1.4' }}>
                {llmUploadError}
              </div>
            )}

            {llmSuccessMsg && (
              <div className="tag-absent" style={{ padding: '12px 16px', borderRadius: 'var(--border-radius-sm)', lineHeight: '1.4' }}>
                {llmSuccessMsg}
              </div>
            )}

            <div style={{
              border: '2px dashed var(--glass-border)',
              borderRadius: 'var(--border-radius-md)',
              padding: '30px 20px',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.15)',
              cursor: 'pointer',
              transition: 'border-color var(--transition-normal)'
            }}
            onClick={() => document.getElementById('llm-file-input').click()}>
              <input
                type="file"
                id="llm-file-input"
                accept=".json"
                onChange={handleLlmFileChange}
                style={{ display: 'none' }}
                disabled={loading}
              />
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Click to browse or drag and drop a <strong>predictions JSON file</strong> here
              </p>
            </div>

            {llmParsedResult && (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--glass-border)',
                padding: '12px',
                borderRadius: 'var(--border-radius-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <p style={{ fontWeight: 600, fontSize: '13px' }}>File Ready: LLM Predictions</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                    Parsed {llmParsedResult.data.length} unique conversation mapping groups.
                  </p>
                </div>
                <button
                  id="upload-llm-btn"
                  onClick={executeLlmUpload}
                  disabled={loading}
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                >
                  {loading ? 'Uploading...' : 'Commit LLM Upload'}
                </button>
              </div>
            )}
          </div>

          {/* Card 3: Import Agreement Statistics */}
          <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3>Import Agreement Statistics</h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '-10px' }}>
              Upload precalculated Fleiss' Kappa and F1 accuracy ratings. Overwrites previous stats.
            </p>

            {statsUploadError && (
              <div className="tag-present" style={{ padding: '12px 16px', borderRadius: 'var(--border-radius-sm)', lineHeight: '1.4' }}>
                {statsUploadError}
              </div>
            )}

            {statsSuccessMsg && (
              <div className="tag-absent" style={{ padding: '12px 16px', borderRadius: 'var(--border-radius-sm)', lineHeight: '1.4' }}>
                {statsSuccessMsg}
              </div>
            )}

            <div style={{
              border: '2px dashed var(--glass-border)',
              borderRadius: 'var(--border-radius-md)',
              padding: '30px 20px',
              textAlign: 'center',
              background: 'rgba(0,0,0,0.15)',
              cursor: 'pointer',
              transition: 'border-color var(--transition-normal)'
            }}
            onClick={() => document.getElementById('stats-file-input').click()}>
              <input
                type="file"
                id="stats-file-input"
                accept=".json"
                onChange={handleStatsFileChange}
                style={{ display: 'none' }}
                disabled={loading}
              />
              <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                Click to browse or drag and drop a <strong>statistics JSON file</strong> here
              </p>
            </div>

            {statsParsedResult && (
              <div style={{
                background: 'rgba(255,255,255,0.02)',
                border: '1px solid var(--glass-border)',
                padding: '12px',
                borderRadius: 'var(--border-radius-sm)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                  <p style={{ fontWeight: 600, fontSize: '13px' }}>File Ready: Agreement Stats</p>
                  <p style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
                    Successfully validated statistics format constraints.
                  </p>
                </div>
                <button
                  id="upload-stats-btn"
                  onClick={executeStatsUpload}
                  disabled={loading}
                  style={{ padding: '6px 12px', fontSize: '13px' }}
                >
                  {loading ? 'Uploading...' : 'Commit Stats Upload'}
                </button>
              </div>
            )}
          </div>

        </div>

        {/* Right Side: Real-Time Audit Logs */}
        <div className="glass-panel" style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px', height: '100%' }}>
          <h3>System Audit Trail</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '13px' }}>
            Append-only logs of dataset and annotations actions.
          </p>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '12px',
            maxHeight: '800px',
            overflowY: 'auto'
          }}>
            {auditLogs.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', padding: '24px' }}>
                No events recorded in the system audit trail yet.
              </p>
            ) : (
              auditLogs.map((log) => (
                <div key={log.id} style={{
                  background: 'rgba(0, 0, 0, 0.2)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '12px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px' }}>
                    <span style={{ fontWeight: 600, color: 'var(--accent-color)' }}>
                      {log.action_type}
                    </span>
                    <span style={{ color: 'var(--text-muted)' }}>
                      {log.formattedTime}
                    </span>
                  </div>
                  <div style={{ fontSize: '13px', color: 'var(--text-primary)' }}>
                    {log.details?.summary}
                  </div>
                  <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                    Actor: {log.actor_email} ({log.actor_id.substring(0, 6)}...)
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Modal Dialogs */}
      <PIIWarningModal
        isOpen={piiModalOpen}
        warnings={parsedResult?.warnings || []}
        onCancel={() => setPiiModalOpen(false)}
        onConfirm={handleConfirmPIIUpload}
      />

      <DeleteConfirmationModal
        isOpen={deleteModalOpen}
        onCancel={() => setDeleteModalOpen(false)}
        onConfirm={executeClearDataset}
      />
    </div>
  );
}
