import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { IMPORT_COLUMNS } from "@/lib/admin/import";
import { PageHeader } from "../../_components/ui";
import { ImportForm } from "./import-form";

export const metadata: Metadata = { title: "Import guests" };

export default async function ImportPage() {
  await requireAdmin();
  return (
    <>
      <PageHeader eyebrow="Guest list" title="Import from a spreadsheet">
        <a href="/api/admin/import-template" className="btn btn-ghost" download>
          Download template
        </a>
      </PageHeader>
      <section className="adm-panel adm-panel-parchment flex flex-col gap-2">
        <p>
          Save your spreadsheet as <strong>CSV</strong> with these columns in the first row:
        </p>
        <p className="adm-code adm-break bg-ivory px-3 py-2">{IMPORT_COLUMNS.join(",")}</p>
        <ul className="ml-5 list-disc adm-muted">
          <li>One row per guest. Rows with the same <em>household</em> become one invitation.</li>
          <li>
            <em>plus_one</em>: yes / true / 1 / y lets that household bring a guest.
          </li>
          <li>Households already on your list (same name) are skipped, so re-importing is safe.</li>
        </ul>
      </section>
      <ImportForm />
    </>
  );
}
