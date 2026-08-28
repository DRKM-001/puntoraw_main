// Cloudflare Pages Function — handles audio file uploads to R2
interface Env {
  AUDIO_BUCKET: R2Bucket;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  try {
    const formData = await context.request.formData();
    const file = formData.get("file") as File | null;
    const season = formData.get("season") as string;
    const episode = formData.get("episode") as string;

    if (!file || !season || !episode) {
      return Response.json(
        { error: "Missing required fields: file, season, episode" },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ["audio/mpeg", "audio/wav", "audio/mp4", "audio/ogg", "audio/x-m4a"];
    const allowedExts = [".mp3", ".wav", ".m4a", ".ogg"];
    const ext = file.name.substring(file.name.lastIndexOf(".")).toLowerCase();

    if (!allowedTypes.includes(file.type) && !allowedExts.includes(ext)) {
      return Response.json(
        { error: "Invalid file type. Accepted: MP3, WAV, M4A, OGG" },
        { status: 400 }
      );
    }

    // 500MB limit
    if (file.size > 500 * 1024 * 1024) {
      return Response.json(
        { error: "File too large. Maximum size is 500MB." },
        { status: 400 }
      );
    }

    // Store in R2 with structured key: audio/s{season}/ep{episode}.{ext}
    const key = `audio/s${season}/ep${episode}${ext}`;

    await context.env.AUDIO_BUCKET.put(key, file.stream(), {
      httpMetadata: {
        contentType: file.type || "audio/mpeg",
      },
      customMetadata: {
        originalName: file.name,
        season,
        episode,
        uploadedAt: new Date().toISOString(),
      },
    });

    return Response.json({
      ok: true,
      audioUrl: `/audio/${key}`,
      key,
    });
  } catch (err) {
    console.error("Upload error:", err);
    return Response.json(
      { error: "Internal server error during upload" },
      { status: 500 }
    );
  }
};
