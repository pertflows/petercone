import type { Metadata } from "next";
import { requireAdmin } from "@/lib/auth";
import { getSettings } from "@/lib/settings";
import { placeholderFields } from "@/lib/admin/settings-form";
import { PageHeader } from "../../_components/ui";
import { SettingsForm } from "./settings-form";

export const metadata: Metadata = { title: "Settings" };

export default async function SettingsPage() {
  await requireAdmin();
  const settings = await getSettings();
  let zones: string[] = [];
  try {
    zones = Intl.supportedValuesOf("timeZone");
  } catch {
    zones = [];
  }
  if (!zones.includes(settings.timezone)) zones = [settings.timezone, ...zones];
  return (
    <>
      <PageHeader eyebrow="Website" title="Wedding details" />
      <p className="adm-muted -mt-4 max-w-2xl">
        Everything here appears on the website as soon as you save. Leave a field empty and guests will see a graceful “details to follow” in its place.
      </p>
      <SettingsForm settings={settings} placeholders={placeholderFields(settings)} zones={zones} />
    </>
  );
}
