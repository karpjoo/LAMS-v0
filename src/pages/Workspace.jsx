import React, { useState, useEffect } from 'react';
import { signOut } from 'firebase/auth';
import { useNavigate } from 'react-router-dom';
import { 
  collection, 
  query, 
  onSnapshot,
  orderBy,
  doc,
  getDoc,
  runTransaction,
  getDocs
} from 'firebase/firestore';
import { auth, db } from '../firebase';
import EvaluationForm from '../components/EvaluationForm';
import { solveConsensus } from '../utils/consensusSolver';
import { logAction } from '../utils/auditLogger';

export default function Workspace() {
  const [conversations, setConversations] = useState([]);
  const [selectedCallId, setSelectedCallId] = useState(null);
  const [selectedConversation, setSelectedConversation] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  
  const [userProfile, setUserProfile] = useState(null);
  const [userLabel, setUserLabel] = useState(null);
  const [allLabels, setAllLabels] = useState([]);
  const [submitLoading, setSubmitLoading] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Load current user profile from db
  useEffect(() => {
    const fetchProfile = async () => {
      if (auth.currentUser) {
        try {
          const userRef = doc(db, 'users', auth.currentUser.uid);
          const snap = await getDoc(userRef);
          if (snap.exists()) {
            setUserProfile(snap.data());
          }
        } catch (err) {
          console.error("Failed to fetch user profile:", err);
        }
      }
    };
    fetchProfile();
  }, []);

  // Fetch user label when selectedCallId changes
  useEffect(() => {
    const fetchUserLabel = async () => {
      if (selectedCallId && auth.currentUser) {
        try {
          const labelRef = doc(db, 'conversations', selectedCallId, 'labels', auth.currentUser.uid);
          const snap = await getDoc(labelRef);
          if (snap.exists()) {
            setUserLabel(snap.data());
          } else {
            setUserLabel(null);
          }
        } catch (err) {
          console.error("Failed to fetch evaluator label:", err);
          setUserLabel(null);
        }
      } else {
        setUserLabel(null);
      }
    };
    fetchUserLabel();
  }, [selectedCallId]);

  // Fetch all labels if conversation status is not Round 1 Active
  useEffect(() => {
    const fetchAllLabels = async () => {
      if (selectedCallId && selectedConversation && selectedConversation.status !== 'Round 1 Active') {
        try {
          const labelsRef = collection(db, 'conversations', selectedCallId, 'labels');
          const snap = await getDocs(labelsRef);
          const list = [];
          snap.forEach((doc) => {
            list.push({ id: doc.id, ...doc.data() });
          });
          setAllLabels(list);
        } catch (err) {
          console.error("Failed to fetch all labels:", err);
          setAllLabels([]);
        }
      } else {
        setAllLabels([]);
      }
    };
    fetchAllLabels();
  }, [selectedCallId, selectedConversation]);
  
  const navigate = useNavigate();

  // Load conversations from database in real-time
  useEffect(() => {
    const q = query(collection(db, 'conversations'), orderBy('created_at', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list = [];
      snapshot.forEach((doc) => {
        list.push({ id: doc.id, ...doc.data() });
      });
      setConversations(list);
    }, (error) => {
      console.error("Failed to load conversations:", error);
    });

    return () => unsubscribe();
  }, []);

  // Update selected conversation when selection or collection changes
  useEffect(() => {
    if (selectedCallId) {
      const found = conversations.find(c => c.id === selectedCallId);
      setSelectedConversation(found || null);
    } else {
      setSelectedConversation(null);
    }
  }, [selectedCallId, conversations]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (err) {
      console.error("Logout failed:", err);
    }
  };

  const handleFormSubmit = async (formData) => {
    if (!selectedCallId || !auth.currentUser) return;
    setSubmitLoading(true);
    setSubmitError('');

    try {
      // 1. Check if Adjudicator is submitting in Round 3 Active
      if (selectedConversation.status === 'Round 3 Active') {
        const isUserAdj = userProfile?.is_adjudicator === true || userProfile?.role === 'Admin';
        if (!isUserAdj) {
          throw new Error("Only an Adjudicator can submit evaluations during Round 3 Active.");
        }

        // Direct Adjudicator submission to gold standard
        await runTransaction(db, async (transaction) => {
          const convRef = doc(db, 'conversations', selectedCallId);
          const goldRef = doc(db, 'conversations', selectedCallId, 'gold_standard', 'verdict');

          // Write gold standard
          transaction.set(goldRef, {
            call_id: selectedCallId,
            toxicity: formData.toxicity,
            category_id: formData.category_id,
            risk_level: formData.risk_level,
            evidence_phrases: formData.evidence_phrases,
            finalized_at: new Date(),
            determined_by: 'adjudicator',
            adjudicator_id: auth.currentUser.uid
          });

          // Update parent conversation status
          transaction.update(convRef, { status: 'Consensus Reached' });

          // Log action
          await logAction(db, 'Save Adjudicator Label', selectedCallId, {
            summary: `Adjudicator finalized verdict for ${selectedCallId} to Consensus Reached`,
            meta: { ...formData }
          }, { transaction });
        });

        alert("Adjudication verdict saved successfully!");
        setSubmitLoading(false);
        // Refresh conversation state locally
        setSelectedConversation(prev => prev ? { ...prev, status: 'Consensus Reached' } : null);
        return;
      }

      // 2. Evaluator submission in Round 1 Active or Round 2 Active
      let newCount = 0;
      let nextStatus = selectedConversation.status;
      await runTransaction(db, async (transaction) => {
        const convRef = doc(db, 'conversations', selectedCallId);
        const convSnap = await transaction.get(convRef);
        if (!convSnap.exists()) {
          throw new Error("Conversation does not exist.");
        }

        const convData = convSnap.data();
        if (convData.status === 'Consensus Reached') {
          throw new Error("This conversation evaluation is locked (Consensus Reached).");
        }

        // Load settings to check skip_round2
        const settingsRef = doc(db, 'dashboard', 'settings');
        const settingsSnap = await transaction.get(settingsRef);
        const skipRound2 = settingsSnap.exists() ? settingsSnap.data().skip_round2 : false;

        const myLabelRef = doc(db, 'conversations', selectedCallId, 'labels', auth.currentUser.uid);
        const myLabelSnap = await transaction.get(myLabelRef);

        const currentRoundNo = convData.status === 'Round 2 Active' ? 2 : 1;

        // Calculate count increments
        let incrementCount = 0;
        if (!myLabelSnap.exists()) {
          incrementCount = 1;
        } else {
          const oldLabel = myLabelSnap.data();
          if (oldLabel.round_no !== currentRoundNo) {
            incrementCount = 1;
          }
        }

        newCount = (convData.label_completion_count || 0) + incrementCount;

        if (currentRoundNo === 1 && newCount === 3) {
          nextStatus = skipRound2 ? 'Round 3 Active' : 'Round 2 Active';
        } else if (currentRoundNo === 2 && newCount === 6) {
          nextStatus = 'Round 3 Active';
        }

        const newLabelData = {
          call_id: selectedCallId,
          user_id: auth.currentUser.uid,
          round_no: currentRoundNo,
          toxicity: formData.toxicity,
          category_id: formData.category_id,
          risk_level: formData.risk_level,
          evidence_phrases: formData.evidence_phrases,
          submitted_at: new Date()
        };

        transaction.set(myLabelRef, newLabelData, { merge: true });

        transaction.update(convRef, {
          label_completion_count: newCount,
          status: nextStatus
        });

        await logAction(db, 'Save Evaluator Label', selectedCallId, {
          summary: `Evaluator submitted label for ${selectedCallId} in Round ${currentRoundNo}`,
          meta: { round_no: currentRoundNo, ...formData }
        }, { transaction });
      });

      // 3. Post-Transaction: Check for consensus if round just completed
      if (newCount === 3 || newCount === 6) {
        const labelsRef = collection(db, 'conversations', selectedCallId, 'labels');
        const labelsSnap = await getDocs(labelsRef);
        const labelsList = [];
        labelsSnap.forEach((ldoc) => {
          labelsList.push({ id: ldoc.id, ...ldoc.data() });
        });

        const currentRound = newCount === 3 ? 1 : 2;
        const currentRoundLabels = labelsList.filter(l => l.round_no === currentRound);

        const consensusResult = solveConsensus(currentRoundLabels);
        if (consensusResult.isConsensus && consensusResult.resolvedLabel) {
          const resolved = consensusResult.resolvedLabel;

          await runTransaction(db, async (transaction) => {
            const convRef = doc(db, 'conversations', selectedCallId);
            const goldRef = doc(db, 'conversations', selectedCallId, 'gold_standard', 'verdict');

            transaction.set(goldRef, {
              call_id: selectedCallId,
              toxicity: resolved.toxicity,
              category_id: resolved.category_id,
              risk_level: resolved.risk_level,
              evidence_phrases: resolved.evidence_phrases,
              finalized_at: new Date(),
              determined_by: currentRound === 1 ? 'consensus_r1' : 'consensus_r2',
              adjudicator_id: null
            });

            transaction.update(convRef, { status: 'Consensus Reached' });

            await logAction(db, 'Establish Gold Standard', selectedCallId, {
              summary: `Consensus reached for ${selectedCallId} in Round ${currentRound}`,
              meta: { determined_by: currentRound === 1 ? 'consensus_r1' : 'consensus_r2', ...resolved }
            }, { transaction });
          });

          alert("Consensus reached! Gold standard saved automatically.");
        } else {
          alert(`Round ${currentRound} complete. Opinions mismatch! Transitioned to ${nextStatus}.`);
        }
      } else {
        alert("Evaluation saved successfully!");
      }

      setUserLabel({
        call_id: selectedCallId,
        user_id: auth.currentUser.uid,
        toxicity: formData.toxicity,
        category_id: formData.category_id,
        risk_level: formData.risk_level,
        evidence_phrases: formData.evidence_phrases
      });

    } catch (err) {
      console.error("Submission failed:", err);
      setSubmitError(err.message);
      alert("Submission failed: " + err.message);
    } finally {
      setSubmitLoading(false);
    }
  };

  const filteredConversations = conversations.filter(c => 
    c.call_id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusStyle = (status) => {
    switch(status) {
      case 'Consensus Reached':
        return { background: 'var(--color-toxic-absent-bg)', color: 'var(--color-toxic-absent)', border: '1px solid var(--color-toxic-absent-border)' };
      case 'Round 2 Active':
      case 'Round 3 Active':
        return { background: 'hsla(27, 96%, 52%, 0.15)', color: 'var(--color-risk-2)', border: '1px solid hsla(27, 96%, 52%, 0.4)' };
      case 'Round 1 Active':
      default:
        return { background: 'var(--accent-bg)', color: 'var(--accent-color)', border: '1px solid var(--accent-border)' };
    }
  };

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      height: '100vh',
      background: 'var(--bg-primary)',
      boxSizing: 'border-box',
      overflow: 'hidden'
    }}>
      {/* Navigation Header */}
      <header className="glass-panel" style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '12px 24px',
        margin: '16px 24px 0 24px',
        flexShrink: 0
      }}>
        <h2 style={{ fontSize: '20px' }}>Evaluator Workspace</h2>
        <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
          <button onClick={() => navigate('/admin')} style={{ padding: '8px 16px', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            Admin Panel
          </button>
          <button onClick={() => navigate('/dashboard')} style={{ padding: '8px 16px', background: 'var(--bg-hover)', border: '1px solid var(--border-color)', color: 'var(--text-primary)' }}>
            Dashboard
          </button>
          <span style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>
            {auth.currentUser?.email}
          </span>
          <button onClick={handleLogout} style={{ padding: '6px 12px', background: 'transparent', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '13px' }}>
            Log Out
          </button>
        </div>
      </header>

      {/* 3-Pane Workspace Area */}
      <div style={{
        display: 'flex',
        flex: 1,
        padding: '24px',
        gap: '24px',
        overflow: 'hidden'
      }}>
        {/* Pane 1: Conversations List Sidebar (Width 320px) */}
        <aside className="glass-panel" style={{
          width: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px',
          padding: '20px',
          flexShrink: 0,
          overflow: 'hidden'
        }}>
          <h3>Conversations</h3>
          <input
            type="text"
            placeholder="Search Call ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ padding: '10px 14px' }}
          />
          <div style={{
            flex: 1,
            overflowY: 'auto',
            display: 'flex',
            flexDirection: 'column',
            gap: '10px'
          }}>
            {filteredConversations.length === 0 ? (
              <p style={{ color: 'var(--text-muted)', fontSize: '13px', textAlign: 'center', marginTop: '20px' }}>
                No conversations found.
              </p>
            ) : (
              filteredConversations.map((c) => (
                <div
                  key={c.id}
                  onClick={() => setSelectedCallId(c.id)}
                  style={{
                    padding: '14px',
                    borderRadius: 'var(--border-radius-sm)',
                    background: selectedCallId === c.id ? 'var(--bg-hover)' : 'rgba(255,255,255,0.02)',
                    border: '1px solid ' + (selectedCallId === c.id ? 'var(--accent-color)' : 'var(--glass-border)'),
                    cursor: 'pointer',
                    transition: 'all var(--transition-normal)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600, fontSize: '14px' }}>{c.call_id}</span>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      Labels: {c.label_completion_count || 0}/3
                    </span>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'flex-start' }}>
                    <span style={{
                      padding: '3px 8px',
                      borderRadius: 'var(--border-radius-sm)',
                      fontSize: '11px',
                      fontWeight: 600,
                      ...getStatusStyle(c.status)
                    }}>
                      {c.status}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </aside>

        {/* Pane 2: Conversation Turns Stream (Center) */}
        <main className="glass-panel" style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          padding: '24px',
          overflow: 'hidden'
        }}>
          {selectedConversation ? (
            <div style={{ display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
              <div style={{ borderBottom: '1px solid var(--glass-border)', paddingBottom: '16px', marginBottom: '16px', flexShrink: 0 }}>
                <h3 style={{ fontSize: '20px' }}>{selectedConversation.call_id}</h3>
                <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                  Status: {selectedConversation.status} | Total turns: {selectedConversation.turns?.length || 0}
                </span>
              </div>
              
              {/* Chronological turns bubbles container */}
              <div 
                id="dialogue-turns-container"
                style={{
                  flex: 1,
                  overflowY: 'auto',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '16px',
                  paddingRight: '10px',
                  paddingBottom: '20px'
                }}
              >
                {selectedConversation.turns
                  ? [...selectedConversation.turns]
                      .sort((a, b) => a.sequence_no - b.sequence_no)
                      .map((turn) => {
                        const isCustomer = turn.speaker === 'customer';
                        return (
                          <div
                            key={turn.sequence_no}
                            style={{
                              display: 'flex',
                              justifyContent: isCustomer ? 'flex-start' : 'flex-end',
                              width: '100%'
                            }}
                          >
                            <div style={{
                              maxWidth: '70%',
                              display: 'flex',
                              flexDirection: 'column',
                              alignItems: isCustomer ? 'flex-start' : 'flex-end',
                              gap: '6px'
                            }}>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 500 }}>
                                {isCustomer ? 'Customer' : 'Agent'} (Turn #{turn.sequence_no})
                              </span>
                              <div style={{
                                padding: '14px 18px',
                                borderRadius: 'var(--border-radius-md)',
                                borderTopLeftRadius: isCustomer ? '4px' : 'var(--border-radius-md)',
                                borderTopRightRadius: isCustomer ? 'var(--border-radius-md)' : '4px',
                                background: isCustomer ? 'rgba(255, 255, 255, 0.05)' : 'var(--accent-bg)',
                                border: '1px solid ' + (isCustomer ? 'var(--glass-border)' : 'var(--accent-border)'),
                                color: 'var(--text-primary)',
                                fontSize: '14px',
                                lineHeight: '1.5',
                                wordBreak: 'break-word',
                                textAlign: 'left'
                              }}>
                                {turn.text}
                              </div>
                            </div>
                          </div>
                        );
                      })
                  : null}
              </div>
            </div>
          ) : (
            <div style={{
              display: 'flex',
              flex: 1,
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--text-muted)'
            }}>
              <p>Select a conversation from the sidebar list to start labeling.</p>
            </div>
          )}
        </main>

        {/* Pane 3: Label Entry Form (Width 360px) */}
        <section className="glass-panel" style={{
          width: '360px',
          padding: '24px',
          flexShrink: 0,
          overflowY: 'auto'
        }}>
          <h3>Toxicity Label</h3>
          <p style={{ color: 'var(--text-muted)', fontSize: '12px', marginBottom: '20px' }}>
            Assess toxicity presence and input relevant details.
          </p>
          
          {selectedConversation ? (
            <>
              {/* Adjudicator info banner */}
              {selectedConversation.status === 'Round 3 Active' && (userProfile?.is_adjudicator || userProfile?.role === 'Admin') && (
                <div style={{
                  background: 'hsla(27, 96%, 52%, 0.1)',
                  border: '1px solid hsla(27, 96%, 52%, 0.4)',
                  color: 'var(--color-risk-2)',
                  padding: '10px',
                  borderRadius: 'var(--border-radius-sm)',
                  fontSize: '12px',
                  marginBottom: '16px',
                  fontWeight: 500
                }}>
                  <strong>Adjudicator Mode Active:</strong> You are submitting the final consensus verdict directly to the Gold Standard database.
                </div>
              )}

              {/* Other evaluators' submissions list */}
              {allLabels.length > 0 && (
                <div style={{
                  background: 'rgba(255,255,255,0.02)',
                  border: '1px solid var(--glass-border)',
                  borderRadius: 'var(--border-radius-sm)',
                  padding: '12px',
                  marginBottom: '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '10px'
                }}>
                  <h5 style={{ margin: 0, fontSize: '13px', color: 'var(--accent-color)' }}>
                    이전 차수 평가 결과 (Other Evaluations)
                  </h5>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto' }}>
                    {allLabels
                      .filter(l => l.user_id !== auth.currentUser?.uid)
                      .map((l, i) => (
                        <div key={i} style={{ fontSize: '12px', borderBottom: i < allLabels.length - 2 ? '1px solid rgba(255,255,255,0.05)' : 'none', paddingBottom: '6px' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)' }}>
                            <strong>Evaluator (Round {l.round_no})</strong>
                            <span style={{ fontWeight: 600, color: l.toxicity === 'Present' ? 'var(--color-toxic-present)' : 'var(--color-toxic-absent)' }}>
                              {l.toxicity}
                            </span>
                          </div>
                          {l.toxicity === 'Present' && (
                            <div style={{ color: 'var(--text-muted)', marginTop: '4px' }}>
                              <div>Category: {l.category_id} | Risk: L{l.risk_level}</div>
                              {l.evidence_phrases && l.evidence_phrases.length > 0 && (
                                <div style={{ fontStyle: 'italic', marginTop: '2px', wordBreak: 'break-word' }}>
                                  "{l.evidence_phrases.join(', ')}"
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                  </div>
                </div>
              )}

              <EvaluationForm
                selectedCallId={selectedCallId}
                initialData={userLabel}
                onSubmit={handleFormSubmit}
                disabled={selectedConversation.status === 'Consensus Reached' || submitLoading}
              />
            </>
          ) : (
            <div style={{ color: 'var(--text-muted)', textAlign: 'center', marginTop: '40px', fontSize: '13px' }}>
              Select a conversation to enable evaluation form.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
