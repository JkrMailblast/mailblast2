import React, { useState, useRef } from 'react';
import {
  createCampaign, uploadRecipients, pasteRecipients,
  uploadAttachment, deleteAttachment, scheduleCampaign, sendNow, sendTestEmail
} from '../api';

const TABS = ['paste', 'upload', 'manual'];

const EMAIL_TEMPLATES = [
  {
    name: '📣 Announcement',
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#6366f1,#8b5cf6);padding:40px;text-align:center">
    <h1 style="color:#fff;margin:0;font-size:28px">Big Announcement!</h1>
    <p style="color:rgba(255,255,255,0.8);margin-top:8px">We have something exciting to share</p>
  </div>
  <div style="padding:32px">
    <p style="color:#374151;font-size:16px;line-height:1.7">Hi {{name}},</p>
    <p style="color:#374151;font-size:16px;line-height:1.7">We're thrilled to announce something big. Add your message here.</p>
    <div style="text-align:center;margin:32px 0">
      <a href="#" style="background:#6366f1;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600;font-size:16px">Learn More →</a>
    </div>
  </div>
  <div style="background:#f9fafb;padding:20px;text-align:center;color:#9ca3af;font-size:12px">
    <p>You received this because you're subscribed. <a href="#" style="color:#6366f1">Unsubscribe</a></p>
  </div>
</div>`
  },
  {
    name: '🛍️ Promotion',
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
  <div style="background:linear-gradient(135deg,#f59e0b,#ef4444);padding:40px;text-align:center">
    <p style="color:#fff;font-size:14px;letter-spacing:2px;text-transform:uppercase;margin:0">Limited Time Offer</p>
    <h1 style="color:#fff;margin:8px 0;font-size:48px;font-weight:900">50% OFF</h1>
    <p style="color:rgba(255,255,255,0.9);margin:0">Use code: SAVE50</p>
  </div>
  <div style="padding:32px;text-align:center">
    <p style="color:#374151;font-size:16px;line-height:1.7">Hi {{name}}, don't miss this exclusive deal just for you!</p>
    <p style="color:#374151;font-size:16px;line-height:1.7">Add your product details and offer information here.</p>
    <a href="#" style="display:inline-block;background:#ef4444;color:#fff;padding:16px 40px;border-radius:8px;text-decoration:none;font-weight:700;font-size:18px;margin-top:16px">Shop Now →</a>
    <p style="color:#9ca3af;font-size:12px;margin-top:24px">Offer expires soon. Terms apply.</p>
  </div>
</div>`
  },
  {
    name: '📰 Newsletter',
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff">
  <div style="border-bottom:3px solid #6366f1;padding:24px;display:flex;align-items:center;justify-content:space-between">
    <h1 style="margin:0;font-size:22px;color:#1f2937">Your Newsletter</h1>
    <span style="color:#6b7280;font-size:13px">Monthly Edition</span>
  </div>
  <div style="padding:32px">
    <p style="color:#374151;font-size:16px">Hi {{name}},</p>
    <h2 style="color:#1f2937;font-size:20px;border-left:4px solid #6366f1;padding-left:12px">This Month's Highlights</h2>
    <p style="color:#4b5563;line-height:1.8">Add your newsletter content here. Share updates, news, tips, and more.</p>
    <div style="background:#f3f4f6;border-radius:8px;padding:20px;margin:20px 0">
      <h3 style="color:#1f2937;margin:0 0 8px">Featured Article</h3>
      <p style="color:#6b7280;margin:0">Add your featured content here...</p>
    </div>
  </div>
  <div style="background:#1f2937;padding:24px;text-align:center;color:#9ca3af;font-size:12px">
    <p style="margin:0">© 2026 Your Company · <a href="#" style="color:#6366f1">Unsubscribe</a></p>
  </div>
</div>`
  },
  {
    name: '👋 Welcome',
    html: `<div style="font-family:sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden">
  <div style="background:#0f1117;padding:48px;text-align:center">
    <div style="font-size:48px">👋</div>
    <h1 style="color:#fff;margin:16px 0 8px;font-size:28px">Welcome aboard!</h1>
    <p style="color:#94a3b8;margin:0">We're glad you're here</p>
  </div>
  <div style="padding:40px">
    <p style="color:#374151;font-size:16px;line-height:1.8">Hi {{name}},</p>
    <p style="color:#374151;font-size:16px;line-height:1.8">Welcome! We're excited to have you. Here's what you can expect:</p>
    <ul style="color:#4b5563;line-height:2;font-size:15px">
      <li>✅ Benefit one</li>
      <li>✅ Benefit two</li>
      <li>✅ Benefit three</li>
    </ul>
    <div style="text-align:center;margin:32px 0">
      <a href="#" style="background:#6366f1;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:600">Get Started →</a>
    </div>
  </div>
</div>`
  }
];

export default function Compose({ onSaved, onBack }) {
  const [step, setStep] = useState(1);
  const [campaignId, setCampaignId] = useState(null);

  // Step 1
  const [recipientTab, setRecipientTab] = useState('paste');
  const [pasteText, setPasteText] = useState('');
  const [manualEmail, setManualEmail] = useState('');
  const [recipients, setRecipients] = useState([]);
  const [uploadMsg, setUploadMsg] = useState('');

  // Step 2
  const [fromName, setFromName] = useState('');
  const [fromEmail, setFromEmail] = useState('');
  const [subject, setSubject] = useState('');
  const [subjectB, setSubjectB] = useState('');
  const [abTest, setAbTest] = useState(false);
  const [bodyHtml, setBodyHtml] = useState('');
  const [trackOpens, setTrackOpens] = useState(true);
  const [attachments, setAttachments] = useState([]);
  const [campaignName, setCampaignName] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editorTab, setEditorTab] = useState('visual');
  const [previewMode, setPreviewMode] = useState(false);

  // Step 3
  const [scheduleEnabled, setScheduleEnabled] = useState(false);
  const [scheduleDate, setScheduleDate] = useState('');
  const [scheduleTime, setScheduleTime] = useState('');
  const [sending, setSending] = useState(false);
  const [progress, setProgress] = useState([]);
  const [progressStats, setProgressStats] = useState(null);
  const [done, setDone] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testSent, setTestSent] = useState(false);

  const fileRef = useRef();
  const pdfRef = useRef();
  const editorRef = useRef();

  // ── Recipients ──
  const handleParse = () => {
    const lines = pasteText.split(/[\n\r,;\t]+/).map(t => t.trim()).filter(Boolean);
    const valid = lines.filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e));
    const unique = [...new Set(valid.map(e => e.toLowerCase()))].map(e => ({ email: e, name: '' }));
    setRecipients(unique);
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setUploadMsg(`✅ File ready: ${file.name}`);
    fileRef._pendingFile = file;
  };

  const addManual = () => {
    const e = manualEmail.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(e)) return;
    if (recipients.find(r => r.email === e)) return;
    setRecipients([...recipients, { email: e, name: '' }]);
    setManualEmail('');
  };

  const removeRecipient = (email) => setRecipients(r => r.filter(x => x.email !== email));

  // ── Template picker ──
  const applyTemplate = (tpl) => {
    setBodyHtml(tpl.html);
    setSelectedTemplate(tpl.name);
    if (editorRef.current) editorRef.current.innerHTML = tpl.html;
  };

  // ── Attachments ──
  const handlePdfUpload = async (e) => {
    if (!campaignId) return;
    const file = e.target.files[0];
    if (!file) return;
    try {
      const att = await uploadAttachment(campaignId, file);
      setAttachments(prev => [...prev, att]);
    } catch (err) {
      alert('Upload failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const removeAtt = async (attId) => {
    if (!campaignId) return;
    await deleteAttachment(campaignId, attId);
    setAttachments(prev => prev.filter(a => a.id !== attId));
  };

  // ── Navigation ──
  const goToStep2 = () => {
    if (recipients.length === 0 && !fileRef._pendingFile) {
      alert('Please add at least one recipient.');
      return;
    }
    setStep(2);
  };

  const goToStep3 = async () => {
    if (!campaignName) { alert('Enter a campaign name.'); return; }
    if (!subject) { alert('Enter a subject line.'); return; }
    const html = bodyHtml || editorRef.current?.innerHTML || '';
    if (!html || html === '<br>') { alert('Write your message.'); return; }
    try {
      const { id } = await createCampaign({
        name: campaignName,
        subject: abTest ? `${subject} ||| ${subjectB}` : subject,
        body_html: html,
        from_name: fromName,
        from_email: fromEmail,
        track_opens: trackOpens
      });
      setCampaignId(id);
      if (fileRef._pendingFile) {
        await uploadRecipients(id, fileRef._pendingFile);
      } else if (recipients.length > 0) {
        await pasteRecipients(id, recipients.map(r => r.email).join('\n'));
      }
      setStep(3);
    } catch (err) {
      alert('Error: ' + (err.response?.data?.error || err.message));
    }
  };

  // ── Send ──
  const handleTestSend = async () => {
    if (!testEmail) { alert('Enter a test email.'); return; }
    if (!campaignId) { alert('Complete step 2 first.'); return; }
    try {
      await sendTestEmail(campaignId, testEmail);
      setTestSent(true);
      setTimeout(() => setTestSent(false), 3000);
    } catch (err) {
      alert('Test failed: ' + err.message);
    }
  };

  const handleSend = async () => {
    if (!campaignId) return;
    if (scheduleEnabled) {
      if (!scheduleDate || !scheduleTime) { alert('Set date and time.'); return; }
      const isoStr = new Date(`${scheduleDate}T${scheduleTime}:00`).toISOString();
      if (new Date(isoStr) < new Date()) { alert('Choose a future time.'); return; }
      await scheduleCampaign(campaignId, isoStr);
      setDone(true);
      setProgress([{ msg: `📅 Scheduled for ${scheduleDate} at ${scheduleTime}`, status: 'ok' }]);
      return;
    }
    setSending(true);
    setProgress([]);
    const es = sendNow(campaignId);
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.done) {
        es.close(); setSending(false); setDone(true);
        setProgressStats({ sent: data.sentCount, failed: data.failedCount, total: data.total });
      } else {
        setProgress(p => [...p, {
          msg: (data.status === 'sent' ? '✓ ' : '✗ ') + data.email,
          status: data.status
        }]);
        setProgressStats({ sent: data.sentCount, failed: data.failedCount, total: data.total });
      }
    };
    es.onerror = () => { es.close(); setSending(false); };
  };

  // ── Render ──
  return (
    <div className="page">
      <div className="page-header">
        <button className="btn-ghost" onClick={onBack}>← Back</button>
        <h2>✉️ New Campaign</h2>
        <div className="step-indicators">
          {[1, 2, 3].map(s => (
            <React.Fragment key={s}>
              <span className={`step-dot ${step === s ? 'active' : step > s ? 'done' : ''}`}>
                {step > s ? '✓' : s}
              </span>
              {s < 3 && <div className="step-line" />}
            </React.Fragment>
          ))}
        </div>
      </div>

      {/* STEP 1 */}
      {step === 1 && (
        <div className="card">
          <h3>Step 1 — Add Recipients</h3>
          <div className="tab-bar">
            {TABS.map(t => (
              <button key={t} className={`tab ${recipientTab === t ? 'on' : ''}`}
                onClick={() => setRecipientTab(t)}>
                {t === 'paste' ? '📋 Paste / Type' : t === 'upload' ? '📂 Upload File' : '✏️ Add One by One'}
              </button>
            ))}
          </div>

          {recipientTab === 'paste' && (
            <div>
              <label>Paste emails — one per line, comma or space separated</label>
              <textarea rows={7} value={pasteText} onChange={e => setPasteText(e.target.value)}
                placeholder={'john@example.com\nsarah@firm.com\nravi@startup.in'} />
              <button className="btn-primary mt-sm" onClick={handleParse}>Parse Emails</button>
            </div>
          )}

          {recipientTab === 'upload' && (
            <div>
              <label>Upload .csv, .xlsx, or .txt — email column auto-detected</label>
              <div className="drop-zone" onClick={() => document.getElementById('list-file').click()}>
                <span style={{ fontSize: 32 }}>📂</span>
                <span>Click to choose file</span>
                <span className="muted small">CSV, Excel, or plain text — one email per row</span>
              </div>
              <input id="list-file" type="file" accept=".csv,.xlsx,.txt"
                style={{ display: 'none' }} onChange={handleFileUpload} />
              {uploadMsg && <div className="success-msg">{uploadMsg}</div>}
            </div>
          )}

          {recipientTab === 'manual' && (
            <div>
              <label>Type an email and press Add or Enter</label>
              <div className="input-row">
                <input type="email" value={manualEmail} onChange={e => setManualEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addManual()} placeholder="someone@example.com" />
                <button className="btn-primary" onClick={addManual}>Add</button>
              </div>
            </div>
          )}

          {recipients.length > 0 && (
            <div className="recipient-preview">
              <div className="recipient-count">✅ {recipients.length} recipient{recipients.length > 1 ? 's' : ''} ready</div>
              <div className="chip-list">
                {recipients.slice(0, 40).map(r => (
                  <span key={r.email} className="chip">
                    {r.email} <span className="chip-rm" onClick={() => removeRecipient(r.email)}>×</span>
                  </span>
                ))}
                {recipients.length > 40 && <span className="chip chip-more">+{recipients.length - 40} more</span>}
              </div>
            </div>
          )}

          <div className="step-actions">
            <button className="btn-primary" onClick={goToStep2}>Next: Write Message →</button>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="card">
          <h3>Step 2 — Compose Message</h3>

          {/* Templates */}
          <div className="form-group">
            <label>🎨 Start with a template (optional)</label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 6 }}>
              {EMAIL_TEMPLATES.map(t => (
                <button key={t.name}
                  className={`btn-outline ${selectedTemplate === t.name ? 'active' : ''}`}
                  style={selectedTemplate === t.name ? { borderColor: '#6366f1', color: '#a5b4fc' } : {}}
                  onClick={() => applyTemplate(t)}>
                  {t.name}
                </button>
              ))}
              {selectedTemplate && (
                <button className="btn-ghost" onClick={() => { setSelectedTemplate(null); setBodyHtml(''); if (editorRef.current) editorRef.current.innerHTML = ''; }}>
                  ✕ Clear
                </button>
              )}
            </div>
          </div>

          <div className="divider" />

          <div className="form-group">
            <label>Campaign Name (internal)</label>
            <input type="text" value={campaignName} onChange={e => setCampaignName(e.target.value)}
              placeholder="e.g. June newsletter" />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>From Name</label>
              <input type="text" value={fromName} onChange={e => setFromName(e.target.value)}
                placeholder="Your Name" />
            </div>
            <div className="form-group">
              <label>From Email (must match Gmail)</label>
              <input type="email" value={fromEmail} onChange={e => setFromEmail(e.target.value)}
                placeholder="you@gmail.com" />
            </div>
          </div>

          {/* A/B Test Subject */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ margin: 0 }}>Subject Line</label>
              <div className="check-row" style={{ margin: 0 }}>
                <input type="checkbox" id="ab" checked={abTest} onChange={e => setAbTest(e.target.checked)} />
                <label htmlFor="ab" style={{ margin: 0, cursor: 'pointer' }}>
                  🧪 A/B Test Subjects
                </label>
              </div>
            </div>
            <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
              placeholder={abTest ? 'Subject A — sent to 50%' : 'Enter subject line...'} />
            {abTest && (
              <input type="text" value={subjectB} onChange={e => setSubjectB(e.target.value)}
                placeholder="Subject B — sent to other 50%" style={{ marginTop: 8 }} />
            )}
            {abTest && (
              <div className="muted small" style={{ marginTop: 6 }}>
                💡 Recipients will be split 50/50 between the two subjects
              </div>
            )}
          </div>

          {/* Email Body */}
          <div className="form-group">
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <label style={{ margin: 0 }}>Message Body — use {'{{name}}'} and {'{{email}}'} for personalization</label>
              <div style={{ display: 'flex', gap: 6 }}>
                <button className={`btn-outline ${editorTab === 'visual' ? 'active' : ''}`}
                  style={editorTab === 'visual' ? { borderColor: '#6366f1', color: '#a5b4fc' } : {}}
                  onClick={() => setEditorTab('visual')}>Visual</button>
                <button className={`btn-outline ${editorTab === 'html' ? 'active' : ''}`}
                  style={editorTab === 'html' ? { borderColor: '#6366f1', color: '#a5b4fc' } : {}}
                  onClick={() => setEditorTab('html')}>HTML</button>
                <button className={`btn-outline ${previewMode ? 'active' : ''}`}
                  style={previewMode ? { borderColor: '#10b981', color: '#34d399' } : {}}
                  onClick={() => setPreviewMode(!previewMode)}>
                  {previewMode ? '✕ Preview' : '👁 Preview'}
                </button>
              </div>
            </div>

            {previewMode ? (
              <div className="email-preview" dangerouslySetInnerHTML={{ __html: bodyHtml }} />
            ) : editorTab === 'visual' ? (
              <>
                <div className="editor-toolbar">
                  <button className="tbtn" onMouseDown={e => { e.preventDefault(); document.execCommand('bold'); }}><b>B</b></button>
                  <button className="tbtn" onMouseDown={e => { e.preventDefault(); document.execCommand('italic'); }}><i>I</i></button>
                  <button className="tbtn" onMouseDown={e => { e.preventDefault(); document.execCommand('underline'); }}><u>U</u></button>
                  <button className="tbtn" onMouseDown={e => { e.preventDefault(); document.execCommand('strikeThrough'); }}>S̶</button>
                  <span className="tb-sep" />
                  <button className="tbtn" onMouseDown={e => { e.preventDefault(); document.execCommand('justifyLeft'); }}>≡L</button>
                  <button className="tbtn" onMouseDown={e => { e.preventDefault(); document.execCommand('justifyCenter'); }}>≡C</button>
                  <button className="tbtn" onMouseDown={e => { e.preventDefault(); document.execCommand('justifyRight'); }}>≡R</button>
                  <span className="tb-sep" />
                  <button className="tbtn" onMouseDown={e => {
                    e.preventDefault();
                    const url = window.prompt('URL:');
                    if (url) document.execCommand('createLink', false, url);
                  }}>🔗 Link</button>
                  <button className="tbtn" onMouseDown={e => { e.preventDefault(); document.execCommand('insertUnorderedList'); }}>• List</button>
                  <span className="tb-sep" />
                  <button className="tbtn" onMouseDown={e => {
                    e.preventDefault();
                    const el = document.getElementById('body-editor2');
                    document.execCommand('insertText', false, ' {{name}}');
                  }}>+ name</button>
                  <button className="tbtn" onMouseDown={e => {
                    e.preventDefault();
                    document.execCommand('insertText', false, ' {{email}}');
                  }}>+ email</button>
                  <span className="tb-sep" />
                  <select style={{ width: 'auto', padding: '2px 8px', fontSize: 12 }}
                    onChange={e => { document.execCommand('fontSize', false, e.target.value); e.target.value = ''; }}>
                    <option value="">Size</option>
                    <option value="1">Small</option>
                    <option value="3">Normal</option>
                    <option value="5">Large</option>
                    <option value="7">Huge</option>
                  </select>
                  <input type="color" title="Text color" style={{ width: 28, height: 28, padding: 2, border: 'none', background: 'none', cursor: 'pointer' }}
                    onChange={e => document.execCommand('foreColor', false, e.target.value)} />
                </div>
                <div
                  id="body-editor2"
                  ref={editorRef}
                  className="rich-editor"
                  contentEditable
                  suppressContentEditableWarning
                  onInput={e => setBodyHtml(e.currentTarget.innerHTML)}
                  dangerouslySetInnerHTML={bodyHtml && !editorRef.current ? { __html: bodyHtml } : undefined}
                  data-placeholder="Write your message here... or pick a template above"
                />
              </>
            ) : (
              <textarea rows={12} value={bodyHtml} onChange={e => setBodyHtml(e.target.value)}
                style={{ fontFamily: 'monospace', fontSize: 12 }}
                placeholder="<p>Your HTML here...</p>" />
            )}
          </div>

          {/* Attachments */}
          <div className="form-group">
            <label>📎 Attachments — PDF or images (optional)</label>
            <button className="btn-outline" onClick={() => pdfRef.current.click()}>
              📎 Attach PDF or Image
            </button>
            <input ref={pdfRef} type="file" accept=".pdf,image/*"
              style={{ display: 'none' }} onChange={handlePdfUpload} />
            {attachments.map(a => (
              <div key={a.id} className="attachment-row">
                <span>📄 {a.filename} ({Math.round(a.size / 1024)} KB)</span>
                <button className="btn-ghost danger" onClick={() => removeAtt(a.id)}>Remove</button>
              </div>
            ))}
            {!campaignId && <div className="muted small" style={{ marginTop: 6 }}>Attachments upload after campaign is saved in step 3</div>}
          </div>

          <div className="check-row">
            <input type="checkbox" id="track" checked={trackOpens} onChange={e => setTrackOpens(e.target.checked)} />
            <label htmlFor="track">📊 Track email opens</label>
          </div>

          <div className="step-actions">
            <button className="btn-ghost" onClick={() => setStep(1)}>← Back</button>
            <button className="btn-primary" onClick={goToStep3}>Next: Review & Send →</button>
          </div>
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="card">
          <h3>Step 3 — Review & Send</h3>

          <div className="summary-box">
            <div className="summary-row"><span>Campaign</span><strong>{campaignName}</strong></div>
            <div className="summary-row"><span>Subject</span><strong>{subject}{abTest ? ` / ${subjectB}` : ''}</strong></div>
            {abTest && <div className="summary-row"><span>A/B Test</span><strong style={{ color: '#a5b4fc' }}>🧪 Active — 50/50 split</strong></div>}
            <div className="summary-row"><span>Recipients</span><strong>{recipients.length || '(from file)'}</strong></div>
            <div className="summary-row"><span>Attachments</span><strong>{attachments.length > 0 ? attachments.map(a => a.filename).join(', ') : 'None'}</strong></div>
            <div className="summary-row"><span>Track Opens</span><strong>{trackOpens ? '✅ Yes' : 'No'}</strong></div>
          </div>

          {/* Test Email */}
          <div className="form-group mt-md">
            <label>🧪 Send Test Email First (recommended)</label>
            <div className="input-row">
              <input type="email" value={testEmail} onChange={e => setTestEmail(e.target.value)}
                placeholder="test@example.com" />
              <button className="btn-outline" onClick={handleTestSend}>
                {testSent ? '✅ Sent!' : 'Send Test'}
              </button>
            </div>
          </div>

          <div className="divider" />

          {/* Schedule */}
          <div className="check-row">
            <input type="checkbox" id="schedule" checked={scheduleEnabled}
              onChange={e => setScheduleEnabled(e.target.checked)} />
            <label htmlFor="schedule">📅 Schedule for later</label>
          </div>

          {scheduleEnabled && (
            <div className="form-row mt-sm">
              <div className="form-group">
                <label>Date</label>
                <input type="date" value={scheduleDate} onChange={e => setScheduleDate(e.target.value)} />
              </div>
              <div className="form-group">
                <label>Time (your local time)</label>
                <input type="time" value={scheduleTime} onChange={e => setScheduleTime(e.target.value)} />
              </div>
            </div>
          )}

          {!done && (
            <div className="step-actions">
              <button className="btn-ghost" onClick={() => setStep(2)}>← Back</button>
              <button className="btn-primary large" onClick={handleSend} disabled={sending}>
                {sending ? '⏳ Sending...' : scheduleEnabled ? '📅 Schedule Send' : '🚀 Send to All Now'}
              </button>
            </div>
          )}

          {/* Progress */}
          {(progress.length > 0 || progressStats) && (
            <div className="progress-section">
              {progressStats && (
                <>
                  <div className="progress-stats">
                    <span className="stat-ok">✓ {progressStats.sent} sent</span>
                    {progressStats.failed > 0 && <span className="stat-fail">✗ {progressStats.failed} failed</span>}
                    <span className="muted">of {progressStats.total}</span>
                  </div>
                  {progressStats.total > 0 && (
                    <div className="progress-bar-wrap">
                      <div className="progress-bar"
                        style={{ width: `${Math.round(((progressStats.sent + progressStats.failed) / progressStats.total) * 100)}%` }} />
                    </div>
                  )}
                </>
              )}
              <div className="send-log">
                {progress.map((p, i) => (
                  <div key={i} className={`log-line ${p.status === 'sent' ? 'ok' : p.status === 'fail' ? 'fail' : ''}`}>
                    {p.msg}
                  </div>
                ))}
              </div>
            </div>
          )}

          {done && !scheduleEnabled && (
            <div className="done-banner">
              🎉 Campaign sent successfully!
              <br />
              <button className="btn-primary green mt-sm" onClick={() => onSaved(campaignId)}>
                View Campaign Analytics →
              </button>
            </div>
          )}
          {done && scheduleEnabled && (
            <div className="done-banner">
              📅 Campaign scheduled! It will send automatically at the chosen time.
              <br />
              <button className="btn-primary mt-sm" onClick={() => onSaved(campaignId)}>
                View Campaign →
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}