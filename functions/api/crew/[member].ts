// GET /api/crew/:member — public living profile: the published profile, approved observations and test results.
// Evidence quotes, confidence and anything pending or hidden are never returned here.
import { CREW_SLUGS, type PublicObservation, type PublicProfile } from "../../../lib/crew";
import { json, rowToBaseline, type CrewEnv } from "../../../lib/crew-server";

export const onRequestGet: PagesFunction<CrewEnv, "member"> = async ({ params, env }) => {
  const member = String(params.member || "");
  if (!CREW_SLUGS.includes(member)) return json({ error: "No encontrado" }, 404);

  try {
    const [profileRow, obs, baselines] = await Promise.all([
      env.DB.prepare(
        "SELECT version, data, created_at FROM crew_profiles WHERE member = ? AND status = 'published' ORDER BY version DESC LIMIT 1"
      )
        .bind(member)
        .first<{ version: number; data: string; created_at: string }>(),
      env.DB.prepare(
        "SELECT id, kind, text, season, episode FROM crew_observations WHERE member = ? AND status = 'approved' ORDER BY season, episode, id"
      )
        .bind(member)
        .all<PublicObservation>(),
      env.DB.prepare("SELECT * FROM crew_baselines WHERE member = ? ORDER BY taken_on")
        .bind(member)
        .all<Record<string, unknown>>(),
    ]);

    let profile: PublicProfile["profile"] = null;
    if (profileRow) {
      try {
        profile = { ...JSON.parse(profileRow.data), version: profileRow.version, updatedAt: profileRow.created_at };
      } catch {
        profile = null;
      }
    }

    const body: PublicProfile = {
      member,
      profile,
      observations: obs.results ?? [],
      baselines: (baselines.results ?? []).map(rowToBaseline),
    };
    return json(body, 200, { "Cache-Control": "public, max-age=60, s-maxage=120" });
  } catch (e) {
    // Tables not created yet → empty profile instead of an error page
    console.error("crew profile error", e);
    return json({ member, profile: null, observations: [], baselines: [] } satisfies PublicProfile);
  }
};
