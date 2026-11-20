import type { Metadata } from "next";
import Link from "next/link";
import { requireAdmin } from "@/lib/auth";
import { HouseholdForm } from "../../../_components/household-form";
import { PageHeader } from "../../../_components/ui";

export const metadata: Metadata = { title: "Add household" };

export default async function NewHouseholdPage() {
  await requireAdmin();
  return (
    <>
      <p>
        <Link href="/admin/guests">← All households</Link>
      </p>
      <PageHeader eyebrow="Guest list" title="Add a household" />
      <section className="adm-panel">
        <HouseholdForm initial={{ name: "", email: "", notes: "", plusOneAllowed: false, guests: [] }} />
      </section>
    </>
  );
}
