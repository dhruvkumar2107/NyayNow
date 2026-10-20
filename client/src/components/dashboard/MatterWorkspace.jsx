'use client';

// client/src/components/dashboard/MatterWorkspace.jsx
// Matter Intelligence workspace — the first safe vertical slice:
// create matter → confirm intake → upload evidence → retrieve sources →
// source-linked draft → request authorised review → record review decision.
// Every verification state shown here comes from the server's deterministic
// pipeline; nothing on this screen predicts outcomes or claims "verified".

import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Panel,
  Pill,
  GoldButton,
  GhostButton,
  EmptySlot,
} from "./mi/MIPrimitives";
import {
  FolderPlus,
  Scale,
  Upload,
  BookOpen,
  PenLine,
  ShieldQuestion,
  Search,
  CheckCircle2,
  AlertTriangle,
  Link2,
} from "lucide-react";

const STATE_TONES = {
  "source-linked": "emerald",
  "support-uncertain": "warn",
  "source-unavailable": "muted",
  "facts-required": "warn",
  "lawyer-review-required": "gold",
};

const KIND_TONES = {
  allegation: "gold",
  "document-extract": "emerald",
  "source-text": "muted",
  "ai-inference": "warn",
  "lawyer-conclusion": "emerald",
};

function StateBadge({ state, definition }) {
  return (
    <span className="inline-flex flex-col gap-1">
      <Pill tone={STATE_TONES[state] || "muted"}>{state}</Pill>
      {definition && (
        <span className="text-[10px] leading-snug text-[var(--text-muted)]">{definition}</span>
      )}
    </span>
  );
}

function useMatter(selectedId, setSelectedId) {
  const [matters, setMatters] = useState([]);
  const [matter, setMatter] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadList = useCallback(async () => {
    try {
      const res = await axios.get("/api/matters");
      setMatters(res.data || []);
    } catch {
      toast.error("Could not load matters");
    } finally {
      setLoading(false);
    }
  }, []);

  const loadOne = useCallback(async (id) => {
    if (!id) return setMatter(null);
    try {
      const res = await axios.get(`/api/matters/${id}`);
      setMatter(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not load matter");
    }
  }, []);

  useEffect(() => {
    loadList();
  }, [loadList]);

  useEffect(() => {
    loadOne(selectedId);
  }, [selectedId, loadOne]);

  return { matters, matter, setMatter, loading, loadList, loadOne, setSelectedId };
}

function Field({ label, children }) {
  return (
    <label className="block">
      <span className="mb-1 block text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">
        {label}
      </span>
      {children}
    </label>
  );
}

const inputCls =
  "w-full rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/50 px-3 py-2 text-sm text-[var(--text)] outline-none focus:border-[var(--gold)]";

/* ═══════════════════════ CLIENT PANEL ═══════════════════════ */

export function ClientMattersPanel() {
  const { matters, matter, loading, loadOne, loadList, setSelectedId } = useMatter();
  const [form, setForm] = useState({ title: "", matterType: "general", jurisdiction: "" });
  const [statementText, setStatementText] = useState("");
  const [statementConfirmed, setStatementConfirmed] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [researchForm, setResearchForm] = useState({ title: "", passage: "", jurisdiction: "", url: "" });
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResult, setSearchResult] = useState(null);
  const [draft, setDraft] = useState({ name: "", body: "" });
  const [claimForm, setClaimForm] = useState({ text: "", type: "legal", sourceId: "", quote: "", statementIds: [] });
  const [verification, setVerification] = useState(null);

  const createMatter = async () => {
    if (!form.title.trim()) return toast.error("Title is required");
    try {
      const res = await axios.post("/api/matters", form);
      toast.success("Matter created");
      setForm({ title: "", matterType: "general", jurisdiction: "" });
      await loadList();
      setSelectedId(res.data._id);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to create matter");
    }
  };

  const updateIntake = async (action) => {
    try {
      await axios.post(`/api/matters/${matter._id}/intake`, { action });
      toast.success(action === "submit" ? "Intake submitted" : "Facts confirmed");
      loadOne(matter._id);
    } catch (err) {
      toast.error(err.response?.data?.error || "Intake update failed");
    }
  };

  const addStatement = async () => {
    if (!statementText.trim()) return toast.error("Statement text is required");
    try {
      await axios.post(`/api/matters/${matter._id}/statements`, {
        kind: "allegation",
        text: statementText,
        confirmed: statementConfirmed,
      });
      setStatementText("");
      loadOne(matter._id);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to add statement");
    }
  };

  const uploadEvidence = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append("file", file);
      const up = await axios.post("/api/uploads", fd);
      await axios.post(`/api/matters/${matter._id}/evidence`, {
        filename: up.data.original,
        path: up.data.path,
      });
      toast.success("Evidence attached to matter");
      loadOne(matter._id);
    } catch (err) {
      toast.error(err.response?.data?.error || "Upload failed");
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const runSearch = async () => {
    try {
      const res = await axios.post(`/api/matters/${matter._id}/research/search`, { query: searchQuery });
      setSearchResult(res.data);
    } catch {
      toast.error("Source search failed");
    }
  };

  const attachSource = async (src) => {
    try {
      await axios.post(`/api/matters/${matter._id}/research`, {
        title: src.title,
        sourceId: src.sourceId,
        url: src.url,
        jurisdiction: src.jurisdiction,
        court: src.court,
        date: src.date,
        passage: src.passage,
        synthetic: src.synthetic === true,
      });
      toast.success("Source attached");
      setSearchResult(null);
      loadOne(matter._id);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to attach source");
    }
  };

  const attachCustomSource = async () => {
    if (!researchForm.title.trim() || !researchForm.passage.trim()) {
      return toast.error("Title and passage are required");
    }
    try {
      await axios.post(`/api/matters/${matter._id}/research`, { ...researchForm, synthetic: false });
      setResearchForm({ title: "", passage: "", jurisdiction: "", url: "" });
      toast.success("Source attached");
      loadOne(matter._id);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to attach source");
    }
  };

  const saveDraft = async () => {
    if (!draft.name.trim()) return toast.error("Draft name is required");
    try {
      await axios.post(`/api/matters/${matter._id}/drafts`, draft);
      toast.success("Draft saved (versioned)");
      loadOne(matter._id);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to save draft");
    }
  };

  const requestReview = async () => {
    try {
      await axios.post(`/api/matters/${matter._id}/review-requests`, {});
      toast.success("Review requested");
      loadOne(matter._id);
    } catch (err) {
      toast.error(err.response?.data?.error || "Could not request review");
    }
  };

  const runVerify = async () => {
    if (!claimForm.text.trim()) return toast.error("Claim text is required");
    try {
      const res = await axios.post(`/api/matters/${matter._id}/verify`, {
        claims: [
          {
            id: "c1",
            text: claimForm.text,
            type: claimForm.type,
            sourceId: claimForm.sourceId || undefined,
            quote: claimForm.quote || undefined,
            statementIds: claimForm.statementIds,
            jurisdiction: matter.jurisdiction || undefined,
          },
        ],
      });
      setVerification(res.data);
    } catch (err) {
      toast.error(err.response?.data?.error || "Verification failed");
    }
  };

  if (loading) return <EmptySlot icon="⏳" title="Loading matters…" />;
  if (!matter) {
    return (
      <div className="grid gap-6 lg:grid-cols-12">
        <Panel
          title="New Matter"
          subtitle="Start a permissioned workspace"
          icon={<FolderPlus size={16} />}
          className="lg:col-span-5"
        >
          <div className="space-y-4">
            <Field label="Title">
              <input className={inputCls} value={form.title} placeholder="e.g. Deposit recovery dispute"
                onChange={(e) => setForm({ ...form, title: e.target.value })} />
            </Field>
            <Field label="Matter type">
              <input className={inputCls} value={form.matterType} placeholder="e.g. property"
                onChange={(e) => setForm({ ...form, matterType: e.target.value })} />
            </Field>
            <Field label="Jurisdiction">
              <input className={inputCls} value={form.jurisdiction} placeholder="e.g. IN-MH"
                onChange={(e) => setForm({ ...form, jurisdiction: e.target.value })} />
            </Field>
            <GoldButton onClick={createMatter}><FolderPlus size={14} /> Create Matter</GoldButton>
          </div>
        </Panel>
        <Panel title="Your Matters" subtitle={`${matters.length} open`} icon={<Scale size={16} />} className="lg:col-span-7">
          {matters.length === 0 ? (
            <EmptySlot icon="⚖️" title="No matters yet" hint="Create a matter to organise facts, evidence and research in one permissioned workspace." />
          ) : (
            <div className="space-y-2">
              {matters.map((m) => (
                <button key={m._id} type="button" onClick={() => setSelectedId(m._id)}
                  className="mi-card-hover flex w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-3 text-left">
                  <span className="font-medium text-[var(--text)]">{m.title}</span>
                  <Pill tone="muted">{m.intake?.status || "draft"}</Pill>
                </button>
              ))}
            </div>
          )}
        </Panel>
      </div>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Panel title={matter.title} subtitle={`${matter.jurisdiction || "No jurisdiction"} • intake ${matter.intake?.status || "draft"}`}
        icon={<Scale size={16} />}
        action={<GhostButton onClick={() => setSelectedId(null)}>← All matters</GhostButton>}
        className="lg:col-span-4">
        <div className="space-y-5 text-sm">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Intake</p>
            {matter.intake?.missingFields?.length > 0 && (
              <p className="mb-2 text-xs text-[var(--warn)]">
                Missing: {matter.intake.missingFields.join(", ")}
              </p>
            )}
            <div className="flex flex-wrap gap-2">
              {matter.intake?.status === "draft" && (
                <GoldButton onClick={() => updateIntake("submit")}>Submit intake</GoldButton>
              )}
              {matter.intake?.status === "submitted" && (
                <GoldButton onClick={() => updateIntake("confirm")}>
                  <CheckCircle2 size={14} /> Confirm facts
                </GoldButton>
              )}
              {matter.intake?.status === "confirmed" && <Pill tone="emerald">Facts confirmed</Pill>}
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Facts (statements)</p>
            <div className="space-y-2">
              {(matter.statements || []).map((s) => (
                <div key={s._id} className="rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-2.5">
                  <div className="mb-1 flex items-center gap-2">
                    <Pill tone={KIND_TONES[s.kind] || "muted"}>{s.kind}</Pill>
                    {s.confirmed ? <Pill tone="emerald">confirmed</Pill> : <Pill tone="warn">unconfirmed</Pill>}
                  </div>
                  <p className="text-xs text-[var(--text)]">{s.text}</p>
                </div>
              ))}
            </div>
            <div className="mt-3 space-y-2">
              <textarea className={inputCls} rows={2} placeholder="Describe a fact of your matter…"
                value={statementText} onChange={(e) => setStatementText(e.target.value)} />
              <label className="flex items-center gap-2 text-xs text-[var(--text-muted)]">
                <input type="checkbox" checked={statementConfirmed} onChange={(e) => setStatementConfirmed(e.target.checked)} />
                I confirm this statement is true to the best of my knowledge
              </label>
              <GhostButton onClick={addStatement}>Add statement</GhostButton>
            </div>
          </div>

          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Evidence</p>
            <div className="space-y-1.5">
              {(matter.evidence || []).map((ev) => (
                <div key={ev._id} className="flex items-center gap-2 text-xs text-[var(--text)]">
                  <Link2 size={12} className="text-[var(--gold)]" />
                  <a href={ev.path} target="_blank" rel="noreferrer" className="truncate hover:text-[var(--gold)]">{ev.filename}</a>
                  <Pill tone="muted">{ev.extractionStatus}</Pill>
                </div>
              ))}
              {matter.evidence?.length === 0 && <p className="text-xs text-[var(--text-muted)]">No evidence uploaded yet.</p>}
            </div>
            <label className="mt-3 inline-flex cursor-pointer items-center gap-2 rounded-[var(--radius-md)] border border-[var(--gold-hairline)] px-4 py-2.5 text-sm font-semibold text-[var(--text)] hover:bg-[var(--surface-2)]">
              <Upload size={14} /> {uploading ? "Uploading…" : "Upload evidence"}
              <input type="file" className="hidden" accept=".jpg,.jpeg,.png,.pdf,.doc,.docx" onChange={uploadEvidence} disabled={uploading} />
            </label>
          </div>
        </div>
      </Panel>

      <div className="space-y-6 lg:col-span-8">
        <Panel title="Research sources" subtitle="Attach passages before drafting" icon={<BookOpen size={16} />}>
          <div className="space-y-3">
            {(matter.research || []).map((r) => (
              <div key={r._id} className="rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-3">
                <div className="mb-1 flex flex-wrap items-center gap-2">
                  <span className="text-sm font-medium text-[var(--text)]">{r.title}</span>
                  {r.synthetic && <Pill tone="warn">synthetic fixture</Pill>}
                  <Pill tone="muted">{r.jurisdiction || "no jurisdiction"}</Pill>
                </div>
                <p className="text-xs text-[var(--text-muted)]">{r.passage.slice(0, 220)}{r.passage.length > 220 ? "…" : ""}</p>
              </div>
            ))}
            {matter.research?.length === 0 && (
              <p className="text-xs text-[var(--text-muted)]">No sources attached. Drafts should cite attached passages.</p>
            )}

            <div className="flex gap-2">
              <input className={inputCls} placeholder="Search legal sources…" value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)} />
              <GhostButton onClick={runSearch}><Search size={14} /> Search</GhostButton>
            </div>
            {searchResult && (
              <div className="rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] p-3">
                <p className="mb-2 text-xs text-[var(--text-muted)]">{searchResult.notice}</p>
                {(searchResult.sources || []).map((s) => (
                  <div key={s.sourceId} className="mb-2 flex items-center justify-between gap-2">
                    <span className="text-xs text-[var(--text)]">{s.title}</span>
                    <GhostButton onClick={() => attachSource(s)}>Attach</GhostButton>
                  </div>
                ))}
              </div>
            )}

            <div className="grid gap-2 sm:grid-cols-2">
              <input className={inputCls} placeholder="Source title" value={researchForm.title}
                onChange={(e) => setResearchForm({ ...researchForm, title: e.target.value })} />
              <input className={inputCls} placeholder="Jurisdiction (e.g. IN-MH)" value={researchForm.jurisdiction}
                onChange={(e) => setResearchForm({ ...researchForm, jurisdiction: e.target.value })} />
              <input className={inputCls} placeholder="URL (if online)" value={researchForm.url}
                onChange={(e) => setResearchForm({ ...researchForm, url: e.target.value })} />
              <textarea className={inputCls} rows={2} placeholder="Exact passage text (quote it, do not paraphrase)" value={researchForm.passage}
                onChange={(e) => setResearchForm({ ...researchForm, passage: e.target.value })} />
            </div>
            <GhostButton onClick={attachCustomSource}>Attach passage manually</GhostButton>
          </div>
        </Panel>

        <Panel title="Draft" subtitle="Versioned, source-linked" icon={<PenLine size={16} />}>
          <div className="space-y-3">
            {(matter.drafts || []).slice(-3).map((d) => (
              <div key={d._id} className="rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-3">
                <div className="mb-1 flex items-center justify-between">
                  <span className="text-sm font-medium text-[var(--text)]">{d.name} <span className="text-[var(--text-muted)]">v{d.version}</span></span>
                  <span className="text-[10px] text-[var(--text-muted)]">{new Date(d.savedAt).toLocaleString()}</span>
                </div>
                <p className="whitespace-pre-wrap text-xs text-[var(--text-muted)]">{d.body.slice(0, 400)}{d.body.length > 400 ? "…" : ""}</p>
              </div>
            ))}
            <input className={inputCls} placeholder="Draft name (e.g. Legal notice)" value={draft.name}
              onChange={(e) => setDraft({ ...draft, name: e.target.value })} />
            <textarea className={inputCls} rows={5} placeholder="Draft body — state which facts are confirmed and cite attached source passages…"
              value={draft.body} onChange={(e) => setDraft({ ...draft, body: e.target.value })} />
            <GoldButton onClick={saveDraft}><PenLine size={14} /> Save draft</GoldButton>
          </div>
        </Panel>

        <Panel title="Claim verification" subtitle="Deterministic document check — not legal advice or outcome prediction"
          icon={<ShieldQuestion size={16} />}>
          <div className="space-y-3">
            <textarea className={inputCls} rows={2} placeholder="Claim to check (paste from your draft)…"
              value={claimForm.text} onChange={(e) => setClaimForm({ ...claimForm, text: e.target.value })} />
            <div className="grid gap-2 sm:grid-cols-3">
              <select className={inputCls} value={claimForm.type} onChange={(e) => setClaimForm({ ...claimForm, type: e.target.value })}>
                <option value="legal">legal claim</option>
                <option value="factual">factual claim</option>
                <option value="legal-conclusion">legal conclusion</option>
              </select>
              <select className={inputCls} value={claimForm.sourceId} onChange={(e) => setClaimForm({ ...claimForm, sourceId: e.target.value })}>
                <option value="">— source (if legal) —</option>
                {(matter.research || []).map((r) => (
                  <option key={r._id} value={r._id}>{r.title.slice(0, 60)}</option>
                ))}
              </select>
              <input className={inputCls} placeholder="Exact quote from source (optional)" value={claimForm.quote}
                onChange={(e) => setClaimForm({ ...claimForm, quote: e.target.value })} />
            </div>
            {claimForm.type === "factual" && (
              <div className="space-y-1">
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Linked confirmed statements</p>
                {(matter.statements || []).map((s) => (
                  <label key={s._id} className="flex items-center gap-2 text-xs text-[var(--text)]">
                    <input type="checkbox" checked={claimForm.statementIds.includes(s._id)}
                      onChange={(e) => setClaimForm({
                        ...claimForm,
                        statementIds: e.target.checked
                          ? [...claimForm.statementIds, s._id]
                          : claimForm.statementIds.filter((x) => x !== s._id),
                      })} />
                    [{s.kind}{s.confirmed ? ", confirmed" : ", unconfirmed"}] {s.text.slice(0, 80)}
                  </label>
                ))}
              </div>
            )}
            <GoldButton onClick={runVerify}><ShieldQuestion size={14} /> Verify claim</GoldButton>

            {verification && (
              <div className="space-y-3 border-t border-[var(--gold-hairline)] pt-3">
                {verification.abstentions?.length > 0 && (
                  <div className="rounded-[var(--radius-sm)] border border-[var(--warn)]/40 bg-[var(--warn)]/10 p-3">
                    {verification.abstentions.map((a) => (
                      <p key={a.claimId} className="text-xs text-[var(--warn)]">Cannot assert: {a.explain}</p>
                    ))}
                  </div>
                )}
                {verification.results?.map((r) => (
                  <div key={r.claimId} className="rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] p-3">
                    <div className="mb-2 flex items-center justify-between gap-3">
                      <StateBadge state={r.state} definition={r.definition} />
                      {!r.modelAssisted && <Pill tone="muted">deterministic</Pill>}
                    </div>
                    <div className="space-y-1">
                      {r.checks.map((c, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          {c.status === "pass" && <CheckCircle2 size={12} className="mt-0.5 text-[var(--emerald)]" />}
                          {c.status === "warn" && <AlertTriangle size={12} className="mt-0.5 text-[var(--warn)]" />}
                          {c.status === "fail" && <AlertTriangle size={12} className="mt-0.5 text-[var(--sos)]" />}
                          <span className="text-[var(--text-muted)]"><span className="font-semibold text-[var(--text)]">{c.id}</span> — {c.detail}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Panel>

        <Panel title="Professional review" subtitle="Assigned professional only" icon={<ShieldQuestion size={16} />}>
          {!matter.lawyer ? (
            <div className="space-y-2">
              <p className="text-xs text-[var(--text-muted)]">
                No authorised professional is assigned to this matter yet. Review requests are unavailable until you grant a
                specific professional access — NyayNow never exposes your matter to the public lawyer pool.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {(matter.reviewRequests || []).map((rr) => (
                <div key={rr._id} className="flex items-center justify-between rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] p-3">
                  <span className="text-xs text-[var(--text)]">Requested {new Date(rr.requestedAt).toLocaleString()}</span>
                  <Pill tone={rr.status === "accepted" ? "emerald" : rr.status === "rejected" ? "sos" : rr.status === "edited" ? "warn" : "muted"}>{rr.status}</Pill>
                </div>
              ))}
              <GoldButton onClick={requestReview} disabled={!matter.lawyer}>
                <ShieldQuestion size={14} /> Request review
              </GoldButton>
            </div>
          )}
        </Panel>
      </div>
    </div>
  );
}

/* ═══════════════════════ LAWYER PANEL ═══════════════════════ */

export function LawyerMattersPanel() {
  const { matters, matter, loading, loadOne, setSelectedId } = useMatter();
  const [decision, setDecision] = useState({ rid: "", value: "accepted", reason: "" });

  const recordDecision = async (rr) => {
    const value = decision.rid === rr._id ? decision.value : "accepted";
    const reason = decision.rid === rr._id ? decision.reason : "";
    try {
      await axios.post(`/api/matters/${matter._id}/review-requests/${rr._id}/decision`, {
        decision: value,
        reason,
      });
      toast.success(`Review marked ${value}`);
      setDecision({ rid: "", value: "accepted", reason: "" });
      loadOne(matter._id);
    } catch (err) {
      toast.error(err.response?.data?.error || "Failed to record decision");
    }
  };

  if (loading) return <EmptySlot icon="⏳" title="Loading assigned matters…" />;

  if (!matter) {
    return (
      <Panel title="Matter Review" subtitle={`${matters.length} matters assigned to you`} icon={<Scale size={16} />}>
        {matters.length === 0 ? (
          <EmptySlot icon="📂" title="No matters assigned" hint="Clients assign you to a matter explicitly. Nothing in this workspace is visible to you until then." />
        ) : (
          <div className="space-y-2">
            {matters.map((m) => (
              <button key={m._id} type="button" onClick={() => setSelectedId(m._id)}
                className="mi-card-hover flex w-full items-center justify-between rounded-[var(--radius-md)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-3 text-left">
                <span className="font-medium text-[var(--text)]">{m.title}</span>
                <div className="flex gap-2">
                  <Pill tone="muted">{m.jurisdiction || "—"}</Pill>
                  <Pill tone={(m.reviewRequests || []).some((r) => r.status === "pending") ? "gold" : "emerald"}>
                    {(m.reviewRequests || []).filter((r) => r.status === "pending").length || "no"} pending
                  </Pill>
                </div>
              </button>
            ))}
          </div>
        )}
      </Panel>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <Panel title={matter.title} subtitle="Review workspace" icon={<Scale size={16} />}
        action={<GhostButton onClick={() => setSelectedId(null)}>← All</GhostButton>} className="lg:col-span-5">
        <div className="space-y-4 text-sm">
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Client statements</p>
            {(matter.statements || []).map((s) => (
              <div key={s._id} className="mb-2 rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] bg-[var(--surface-2)]/30 p-2.5">
                <div className="mb-1 flex gap-2">
                  <Pill tone={KIND_TONES[s.kind] || "muted"}>{s.kind}</Pill>
                  {s.confirmed && <Pill tone="emerald">client-confirmed</Pill>}
                </div>
                <p className="text-xs text-[var(--text)]">{s.text}</p>
              </div>
            ))}
          </div>
          <div>
            <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-[var(--text-muted)]">Evidence</p>
            {(matter.evidence || []).map((ev) => (
              <a key={ev._id} href={ev.path} target="_blank" rel="noreferrer"
                className="mb-1 flex items-center gap-2 text-xs text-[var(--text)] hover:text-[var(--gold)]">
                <Link2 size={12} className="text-[var(--gold)]" /> {ev.filename}
              </a>
            ))}
            {matter.evidence?.length === 0 && <p className="text-xs text-[var(--text-muted)]">None attached.</p>}
          </div>
        </div>
      </Panel>

      <div className="space-y-6 lg:col-span-7">
        <Panel title="Research & sources" icon={<BookOpen size={16} />}>
          {(matter.research || []).map((r) => (
            <div key={r._id} className="mb-2 rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] p-3">
              <div className="mb-1 flex items-center gap-2">
                <span className="text-sm font-medium text-[var(--text)]">{r.title}</span>
                {r.synthetic && <Pill tone="warn">synthetic fixture</Pill>}
              </div>
              <p className="text-xs text-[var(--text-muted)]">{r.passage.slice(0, 240)}</p>
            </div>
          ))}
          {matter.research?.length === 0 && <p className="text-xs text-[var(--text-muted)]">No sources attached.</p>}
        </Panel>

        <Panel title="Drafts" icon={<PenLine size={16} />}>
          {(matter.drafts || []).map((d) => (
            <div key={d._id} className="mb-2 rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] p-3">
              <p className="mb-1 text-sm font-medium text-[var(--text)]">{d.name} <span className="text-[var(--text-muted)]">v{d.version}</span></p>
              <p className="whitespace-pre-wrap text-xs text-[var(--text-muted)]">{d.body.slice(0, 500)}{d.body.length > 500 ? "…" : ""}</p>
            </div>
          ))}
          {matter.drafts?.length === 0 && <p className="text-xs text-[var(--text-muted)]">No drafts yet.</p>}
        </Panel>

        <Panel title="Review requests" subtitle="Record your decision — reasons are mandatory for edits and rejections"
          icon={<ShieldQuestion size={16} />}>
          {(matter.reviewRequests || []).length === 0 && (
            <p className="text-xs text-[var(--text-muted)]">No review requests on this matter.</p>
          )}
          {(matter.reviewRequests || []).map((rr) => (
            <div key={rr._id} className="mb-3 rounded-[var(--radius-sm)] border border-[var(--gold-hairline)] p-3">
              <div className="mb-2 flex items-center justify-between">
                <span className="text-xs text-[var(--text-muted)]">Requested {new Date(rr.requestedAt).toLocaleString()}</span>
                <Pill tone={rr.status === "accepted" ? "emerald" : rr.status === "rejected" ? "sos" : rr.status === "edited" ? "warn" : "muted"}>{rr.status}</Pill>
              </div>
              {rr.reason && <p className="mb-2 text-xs text-[var(--text)]">Reason: {rr.reason}</p>}
              {rr.status === "pending" && (
                <div className="space-y-2">
                  <div className="flex flex-wrap gap-2">
                    {["accepted", "edited", "rejected"].map((v) => (
                      <button key={v} type="button" onClick={() => setDecision({ ...decision, rid: rr._id, value: v })}
                        className={`rounded-[var(--radius-sm)] border px-3 py-1.5 text-xs font-semibold transition ${
                          (decision.rid === rr._id ? decision.value : "accepted") === v
                            ? "border-[var(--gold)] bg-[var(--gold)]/10 text-[var(--gold)]"
                            : "border-[var(--gold-hairline)] text-[var(--text-muted)] hover:text-[var(--text)]"
                        }`}>
                        {v}
                      </button>
                    ))}
                  </div>
                  <textarea className={inputCls} rows={2} placeholder="Reason (required for edited / rejected)"
                    value={decision.rid === rr._id ? decision.reason : ""}
                    onChange={(e) => setDecision({ ...decision, rid: rr._id, reason: e.target.value })} />
                  <GoldButton onClick={() => recordDecision(rr)}>Record decision</GoldButton>
                </div>
              )}
            </div>
          ))}
        </Panel>
      </div>
    </div>
  );
}
