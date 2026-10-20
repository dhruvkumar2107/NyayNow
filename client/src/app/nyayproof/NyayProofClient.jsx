'use client';

import React, { useMemo, useState } from 'react';
import { Copy, Check, Download, ShieldAlert, FileText } from 'lucide-react';
import TEMPLATE from '../../data/bsa63-certificate.json';

const DEFAULT_FIELDS = {
  caseTitle: '',
  court: '',
  recordDescription: '',
  deviceDescription: '',
  producedBy: '',
  dateOfProduction: '',
  certifierName: '',
  certifierDesignation: '',
  expertName: '',
  expertDesignation: '',
  hashAlgorithm: 'SHA-256',
  hashValue: '',
  place: '',
  date: new Date().toISOString().slice(0, 10),
};

function fill(text, fields) {
  return String(text).replace(/\{\{(\w+)\}\}/g, (_, key) => {
    const value = fields[key];
    return value && String(value).trim() ? String(value) : `[${key}]`;
  });
}

function buildCertificate(fields) {
  const [partA, partB] = TEMPLATE.parts;
  const lines = [];
  lines.push('CERTIFICATE UNDER SECTION 63 OF THE BHARATIYA SAKSHYA ADHINIYAM, 2023');
  lines.push('(Read with the Second Schedule)');
  lines.push('');
  lines.push(`IN THE MATTER OF: ${fields.caseTitle || '[caseTitle]'}`);
  lines.push(`BEFORE: ${fields.court || '[court]'}`);
  lines.push('');
  lines.push('1. Description of the electronic record:');
  lines.push(`   ${fields.recordDescription || '[recordDescription]'}`);
  lines.push('');
  lines.push('2. Description of the computer or communication device:');
  lines.push(`   ${fields.deviceDescription || '[deviceDescription]'}`);
  lines.push('');
  lines.push('3. Details of production:');
  lines.push(`   Produced by: ${fields.producedBy || '[producedBy]'}`);
  lines.push(`   Date of production: ${fields.dateOfProduction || '[dateOfProduction]'}`);
  lines.push('');
  lines.push(`PART ${partA.id} - ${partA.title}`);
  partA.clauses.forEach((clause, i) => {
    lines.push(`  ${i + 1}. ${fill(clause, fields)}`);
  });
  lines.push('');
  lines.push(`PART ${partB.id} - ${partB.title}`);
  partB.clauses.forEach((clause, i) => {
    lines.push(`  ${i + 1}. ${fill(clause, fields)}`);
  });
  lines.push('');
  lines.push(`Place: ${fields.place || '[place]'}`);
  lines.push(`Date: ${fields.date || '[date]'}`);
  lines.push('');
  lines.push('Signature: __________________________');
  lines.push(`${fields.certifierName || '[certifierName]'}, ${fields.certifierDesignation || '[certifierDesignation]'}`);
  lines.push('');
  lines.push(`Source: ${TEMPLATE.instrument.source.name}`);
  lines.push('');
  lines.push('DRAFT - NOT A VALID CERTIFICATE.');
  lines.push(TEMPLATE.disclaimer);
  return lines.join('\n');
}

const INPUTS = [
  { key: 'caseTitle', label: 'Case / matter title' },
  { key: 'court', label: 'Court / forum' },
  { key: 'recordDescription', label: 'Description of the electronic record', textarea: true },
  { key: 'deviceDescription', label: 'Description of the computer / device', textarea: true },
  { key: 'producedBy', label: 'Produced by (name, designation)' },
  { key: 'dateOfProduction', label: 'Date of production', type: 'date' },
  { key: 'certifierName', label: 'Part A certifier name' },
  { key: 'certifierDesignation', label: 'Part A certifier designation' },
  { key: 'expertName', label: 'Part B expert name' },
  { key: 'expertDesignation', label: 'Part B expert designation' },
  { key: 'hashAlgorithm', label: 'Hash algorithm' },
  { key: 'hashValue', label: 'Hash value' },
  { key: 'place', label: 'Place' },
  { key: 'date', label: 'Date', type: 'date' },
];

export default function NyayProofClient() {
  const [fields, setFields] = useState(DEFAULT_FIELDS);
  const [copied, setCopied] = useState(false);

  const certificate = useMemo(() => buildCertificate(fields), [fields]);

  const set = (key, value) => setFields((prev) => ({ ...prev, [key]: value }));

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(certificate);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard unavailable */
    }
  };

  const download = () => {
    const blob = new Blob([certificate], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'NyayProof_BSA63_Certificate_DRAFT.txt';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <form
        className="mi-glass-card p-5 space-y-4"
        onSubmit={(e) => e.preventDefault()}
        aria-label="Certificate details"
      >
        {INPUTS.map((input) => (
          <div key={input.key}>
            <label htmlFor={`np-${input.key}`} className="block text-xs text-[var(--text-muted)] mb-1">
              {input.label}
            </label>
            {input.textarea ? (
              <textarea
                id={`np-${input.key}`}
                rows={2}
                value={fields[input.key]}
                onChange={(e) => set(input.key, e.target.value)}
                className="mi-focus w-full bg-transparent border border-[var(--gold-hairline)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text)] outline-none"
              />
            ) : (
              <input
                id={`np-${input.key}`}
                type={input.type || 'text'}
                value={fields[input.key]}
                onChange={(e) => set(input.key, e.target.value)}
                className="mi-focus w-full bg-transparent border border-[var(--gold-hairline)] rounded-[var(--radius-sm)] px-3 py-2 text-sm text-[var(--text)] outline-none"
              />
            )}
          </div>
        ))}
      </form>

      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <FileText size={16} className="text-[var(--gold)]" />
          <span className="text-xs uppercase tracking-widest text-[var(--text-muted)]">
            Draft preview
          </span>
        </div>
        <pre className="mi-glass-card p-5 text-xs leading-6 whitespace-pre-wrap text-[var(--text)] max-h-[520px] overflow-auto">
          {certificate}
        </pre>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={copy}
            className="mi-tap mi-focus inline-flex items-center gap-2 rounded-[var(--radius-md)] bg-[var(--gold)] px-4 py-2.5 text-sm font-semibold text-[#0B1220]"
          >
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied' : 'Copy draft'}
          </button>
          <button
            type="button"
            onClick={download}
            className="mi-tap mi-focus inline-flex items-center gap-2 rounded-[var(--radius-md)] border border-[var(--gold-hairline)] px-4 py-2.5 text-sm font-semibold text-[var(--text)]"
          >
            <Download size={16} />
            Download draft
          </button>
        </div>
        <p className="flex items-start gap-2 text-xs text-[var(--text-muted)]">
          <ShieldAlert size={14} className="mt-0.5 shrink-0 text-[var(--warn)]" />
          <span>{TEMPLATE.disclaimer}</span>
        </p>
      </div>
    </div>
  );
}
