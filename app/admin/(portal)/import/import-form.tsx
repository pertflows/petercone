"use client";

import { useActionState, useState } from "react";
import { confirmImportAction, previewImportAction, type ImportState } from "../../actions";
import { Flash } from "../../_components/ui";
import { SubmitButton, submitWithoutReset } from "../../_components/submit-button";

const MAX_BYTES = 500_000;
// Browsers submit textarea newlines as CRLF, so compare normalised text.
const norm = (s: string) => s.replace(/\r\n?/g, "\n");

export function ImportForm() {
  const [preview, previewAction, previewPending] = useActionState<ImportState, FormData>(previewImportAction, { csv: "", result: null });
  const [confirmState, confirmAction, confirmPending] = useActionState<ImportState, FormData>(confirmImportAction, { csv: "", result: null });
  const [text, setText] = useState("");
  const [fileError, setFileError] = useState<string | null>(null);

  // The latest result from whichever step ran last.
  const view = confirmState.result && confirmState.csv === preview.csv ? confirmState : preview;
  const r = view.result;
  const stale = r !== null && norm(preview.csv) !== norm(text);
  const toCreate = r ? r.households.filter((h) => !h.duplicate) : [];
  const dupes = r ? r.households.filter((h) => h.duplicate) : [];

  function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    setFileError(null);
    const f = e.target.files?.[0];
    if (!f) return;
    if (f.size > MAX_BYTES) {
      setFileError("That file is larger than 500 KB. Please split it.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => setText(String(reader.result ?? ""));
    reader.onerror = () => setFileError("Couldn’t read that file.");
    reader.readAsText(f);
  }

  return (
    <div className="flex flex-col gap-6">
      <form action={previewAction} onSubmit={submitWithoutReset(previewAction)} className="adm-panel flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label htmlFor="csv-file" className="adm-label">
            Choose a CSV file
          </label>
          <input id="csv-file" type="file" accept=".csv,text/csv,text/plain" onChange={onFile} className="adm-input py-2 text-base file:mr-3 file:border-0 file:bg-transparent file:font-serif file:text-olive-deep" />
          {fileError && <p className="adm-error">{fileError}</p>}
        </div>
        <div className="flex flex-col gap-1">
          <label htmlFor="csv" className="adm-label">
            …or paste it here
          </label>
          <textarea
            id="csv"
            name="csv"
            value={text}
            onChange={(e) => setText(e.target.value)}
            rows={8}
            spellCheck={false}
            placeholder={"household,first_name,last_name,plus_one,email,notes\nThe Rossi Family,Maria,Rossi,no,maria@example.com,"}
            className="adm-textarea adm-code text-base"
          />
        </div>
        {preview.error && <Flash tone="error">{preview.error}</Flash>}
        <div>
          <SubmitButton busy={previewPending} pendingLabel="Reading…" className="btn btn-ghost">
            Preview import
          </SubmitButton>
        </div>
      </form>

      {r && (
        <section aria-label="Import preview" className="adm-panel flex flex-col gap-5">
          <div className="flex flex-col gap-1">
            <h2>Preview</h2>
            <p>
              {toCreate.length} new household{toCreate.length === 1 ? "" : "s"} · {toCreate.reduce((n, h) => n + h.guests.length, 0)} guest
              {toCreate.reduce((n, h) => n + h.guests.length, 0) === 1 ? "" : "s"}
              {dupes.length > 0 && <span className="adm-muted"> · {dupes.length} already on your list (skipped)</span>}
            </p>
          </div>
          {stale && <Flash tone="error">The text has changed since this preview — preview again before importing.</Flash>}
          {r.errors.length > 0 && (
            <Flash tone="error">
              <p className="font-semibold">Please fix these before importing:</p>
              <ul className="ml-5 list-disc">
                {r.errors.map((e, i) => (
                  <li key={i}>{e}</li>
                ))}
              </ul>
            </Flash>
          )}
          {r.warnings.length > 0 && (
            <div className="adm-flash" style={{ borderLeftColor: "var(--color-gold)" }}>
              <p className="font-semibold">Notes</p>
              <ul className="ml-5 list-disc">
                {r.warnings.slice(0, 30).map((w, i) => (
                  <li key={i}>{w}</li>
                ))}
                {r.warnings.length > 30 && <li>…and {r.warnings.length - 30} more.</li>}
              </ul>
            </div>
          )}

          {r.households.length > 0 && (
            <table className="adm-table">
              <thead>
                <tr>
                  <th scope="col">Household</th>
                  <th scope="col">Guests</th>
                  <th scope="col">Plus-one</th>
                  <th scope="col">Email &amp; notes</th>
                </tr>
              </thead>
              <tbody>
                {r.households.map((h, i) => (
                  <tr key={i} className={h.duplicate ? "opacity-60" : undefined}>
                    <td>
                      <span className="font-display text-lg text-olive-deep adm-break">{h.name}</span>
                      {h.duplicate && (
                        <div>
                          <span className="adm-tag">Already listed · skipped</span>
                        </div>
                      )}
                    </td>
                    <td data-label="Guests" className="adm-break">
                      {h.guests.map((g) => `${g.firstName} ${g.lastName}`.trim()).join(", ")}
                    </td>
                    <td data-label="Plus-one" className="adm-td-inline">
                      {h.plusOneAllowed ? "Yes" : "No"}
                    </td>
                    <td data-label="Email & notes" className="adm-break">
                      {h.email ?? <span className="adm-muted">—</span>}
                      {h.notes && <div className="adm-muted text-base italic">{h.notes}</div>}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}

          <form action={confirmAction} onSubmit={submitWithoutReset(confirmAction)} className="flex flex-col gap-3 border-t border-[var(--rule)] pt-4">
            <input type="hidden" name="csv" value={preview.csv} />
            {confirmState.error && <Flash tone="error">{confirmState.error}</Flash>}
            <div>
              <SubmitButton busy={confirmPending} pendingLabel="Importing…" disabled={stale || r.errors.length > 0 || toCreate.length === 0}>
                Import {toCreate.length} household{toCreate.length === 1 ? "" : "s"}
              </SubmitButton>
            </div>
          </form>
        </section>
      )}
    </div>
  );
}
