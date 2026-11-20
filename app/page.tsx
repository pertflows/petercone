import { getSettings } from "@/lib/settings";
import { Site } from "@/components/Site";

export const dynamic = "force-dynamic";

export default async function Home() {
  const s = await getSettings();
  return <Site s={s} invitation={null} />;
}
