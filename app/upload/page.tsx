"use client";

import { useState, useEffect, useRef, type FormEvent, type DragEvent } from "react";

interface UploadForm {
  title: string;
  description: string;
  speaker: string;
  season: string;
  episodeNumber: string;
  spotifyId: string;
}

const speakers = ["Punto Raw", "Greg Anthony", "Rafa", "RJ"];

export default function UploadPage() {
  const [form, setForm] = useState<UploadForm>({
    title: "",
    description: "",
    speaker: "",
    season: "",
    episodeNumber: "",
    spotifyId: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [loading, setLoading] = useState(true);
  const [lastEpisode, setLastEpisode] = useState<string | null>(null);
  const [result, setResult] = useState<{
    ok: boolean;
    message: string;
  } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Auto-fill season/episode from the latest upload
  useEffect(() => {
    fetch("/api/episodes/next")
      .then((r) => r.json())
      .then((data) => {
        setForm((prev) => ({
          ...prev,
          season: String(data.season),
          episodeNumber: String(data.episodeNumber),
        }));
        setLastEpisode(data.lastEpisode || null);
      })
      .catch(() => {
        // Fallback — leave fields empty for manual entry
      })
      .finally(() => setLoading(false));
  }, []);

  // When user changes the season, reset episode to 1
  const handleSeasonChange = (newSeason: string) => {
    const currentSeason = form.season;
    setForm({
      ...form,
      season: newSeason,
      // Reset episode to 1 only if the season actually changed
      episodeNumber: newSeason !== currentSeason ? "1" : form.episodeNumber,
    });
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const dropped = e.dataTransfer.files[0];
    if (dropped && isAudioFile(dropped)) {
      setFile(dropped);
    }
  };

  const isAudioFile = (f: File) =>
    ["audio/mpeg", "audio/wav", "audio/mp4", "audio/ogg", "audio/x-m4a"].includes(f.type) ||
    /\.(mp3|wav|m4a|ogg)$/i.test(f.name);

  const formatFileSize = (bytes: number) => {
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file || !form.title || !form.speaker || !form.season || !form.episodeNumber) return;

    setUploading(true);
    setResult(null);

    try {
      // Step 1: Upload audio file
      const uploadData = new FormData();
      uploadData.append("file", file);
      uploadData.append("season", form.season);
      uploadData.append("episode", form.episodeNumber);

      const uploadRes = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      });

      if (!uploadRes.ok) {
        const err = await uploadRes.json().catch(() => ({ error: "Upload failed" }));
        throw new Error(err.error || "Failed to upload audio file");
      }

      const { audioUrl } = await uploadRes.json();

      // Step 2: Save episode metadata
      const metaRes = await fetch("/api/episodes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          description: form.description,
          speaker: form.speaker,
          season: parseInt(form.season),
          seasonEpisode: parseInt(form.episodeNumber),
          spotifyId: form.spotifyId || null,
          audioUrl,
        }),
      });

      if (!metaRes.ok) {
        const err = await metaRes.json().catch(() => ({ error: "Save failed" }));
        throw new Error(err.error || "Failed to save episode metadata");
      }

      setResult({ ok: true, message: "Episode uploaded and published successfully!" });
      setFile(null);

      // Re-fetch next episode number so it auto-increments for the next upload
      const nextRes = await fetch("/api/episodes/next").then((r) => r.json()).catch(() => null);
      if (nextRes) {
        setForm({
          title: "",
          description: "",
          speaker: "",
          season: String(nextRes.season),
          episodeNumber: String(nextRes.episodeNumber),
          spotifyId: "",
        });
        setLastEpisode(nextRes.lastEpisode || null);
      } else {
        setForm({ title: "", description: "", speaker: "", season: "", episodeNumber: "", spotifyId: "" });
      }
    } catch (err) {
      setResult({
        ok: false,
        message: err instanceof Error ? err.message : "Something went wrong",
      });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 py-12 md:py-16">
      <div className="mb-10">
        <p className="text-sm font-semibold text-red-600 uppercase tracking-wide mb-2">
          Panel del Equipo
        </p>
        <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
          Subir Episodio
        </h1>
        <p className="text-gray-500">
          Sube el audio y los detalles del episodio. Se publicará automáticamente en el sitio.
        </p>
      </div>

      {result && (
        <div
          className={`mb-8 p-4 rounded-xl text-sm font-medium ${
            result.ok
              ? "bg-green-50 text-green-800 border border-green-200"
              : "bg-red-50 text-red-800 border border-red-200"
          }`}
        >
          {result.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Audio File Drop Zone */}
        <div>
          <label className="block text-sm font-semibold text-gray-900 mb-2">
            Archivo de Audio <span className="text-red-500">*</span>
          </label>
          <div
            onDragOver={(e) => {
              e.preventDefault();
              setDragOver(true);
            }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`relative cursor-pointer rounded-xl border-2 border-dashed transition-colors p-10 text-center ${
              dragOver
                ? "border-red-400 bg-red-50"
                : file
                ? "border-green-300 bg-green-50"
                : "border-gray-200 bg-gray-50 hover:border-gray-300 hover:bg-gray-100"
            }`}
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp3,.wav,.m4a,.ogg,audio/*"
              onChange={(e) => {
                const f = e.target.files?.[0];
                if (f) setFile(f);
              }}
              className="hidden"
            />

            {file ? (
              <div className="flex items-center justify-center gap-3">
                <svg className="w-8 h-8 text-green-500 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <div className="text-left">
                  <p className="font-medium text-gray-900 text-sm">{file.name}</p>
                  <p className="text-xs text-gray-500">{formatFileSize(file.size)}</p>
                </div>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                  }}
                  className="ml-2 text-gray-400 hover:text-red-500 transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ) : (
              <>
                <svg className="mx-auto w-10 h-10 text-gray-300 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
                <p className="text-sm text-gray-600 font-medium">
                  Haz clic o arrastra el archivo aquí
                </p>
                <p className="text-xs text-gray-400 mt-1">
                  MP3, WAV, M4A, o OGG (máx. 500MB)
                </p>
              </>
            )}
          </div>
        </div>

        {/* Season & Episode Number */}
        {lastEpisode && (
          <div className="flex items-center gap-2 text-xs text-gray-500 bg-gray-50 rounded-lg px-3 py-2">
            <svg className="w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            Último episodio: <span className="font-semibold text-gray-700">{lastEpisode}</span>
          </div>
        )}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label htmlFor="season" className="block text-sm font-semibold text-gray-900 mb-2">
              Temporada <span className="text-red-500">*</span>
            </label>
            <input
              id="season"
              type="number"
              min="1"
              placeholder="2"
              value={form.season}
              onChange={(e) => handleSeasonChange(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
            />
          </div>
          <div>
            <label htmlFor="episodeNumber" className="block text-sm font-semibold text-gray-900 mb-2">
              Episodio <span className="text-red-500">*</span>
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-sm font-mono select-none">
                EP
              </span>
              <input
                id="episodeNumber"
                type="number"
                min="1"
                placeholder="5"
                value={form.episodeNumber}
                onChange={(e) => setForm({ ...form, episodeNumber: e.target.value })}
                className="w-full pl-11 pr-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
              />
            </div>
          </div>
        </div>

        {/* Episode Title */}
        <div>
          <label htmlFor="title" className="block text-sm font-semibold text-gray-900 mb-2">
            Título del Episodio <span className="text-red-500">*</span>
          </label>
          <input
            id="title"
            type="text"
            placeholder="Algo tiene que morir"
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
          />
        </div>

        {/* Description */}
        <div>
          <label htmlFor="description" className="block text-sm font-semibold text-gray-900 mb-2">
            Descripción
          </label>
          <textarea
            id="description"
            rows={4}
            placeholder="Resumen del episodio (opcional — se puede generar automáticamente después)"
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition resize-none"
          />
        </div>

        {/* Speaker */}
        <div>
          <label htmlFor="speaker" className="block text-sm font-semibold text-gray-900 mb-2">
            Speaker <span className="text-red-500">*</span>
          </label>
          <select
            id="speaker"
            value={form.speaker}
            onChange={(e) => setForm({ ...form, speaker: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition appearance-none"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%239ca3af' stroke-width='2'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
              backgroundPosition: "right 12px center",
              backgroundSize: "20px",
              backgroundRepeat: "no-repeat",
            }}
          >
            <option value="">Selecciona un speaker...</option>
            {speakers.map((s) => (
              <option key={s} value={s}>
                {s}
              </option>
            ))}
          </select>
        </div>

        {/* Spotify ID (optional) */}
        <div>
          <label htmlFor="spotifyId" className="block text-sm font-semibold text-gray-900 mb-2">
            Spotify Episode ID
            <span className="text-gray-400 font-normal ml-1">(opcional)</span>
          </label>
          <input
            id="spotifyId"
            type="text"
            placeholder="7d7Sc1iNzC1Hz1kJqVlWt7"
            value={form.spotifyId}
            onChange={(e) => setForm({ ...form, spotifyId: e.target.value })}
            className="w-full px-4 py-3 rounded-xl border border-gray-200 bg-white text-gray-900 text-sm font-mono placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-red-500/20 focus:border-red-500 transition"
          />
          <p className="text-xs text-gray-400 mt-1.5">
            Copia el ID desde la URL del episodio en Spotify (open.spotify.com/episode/<strong>ID</strong>)
          </p>
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={uploading || !file || !form.title || !form.speaker || !form.season || !form.episodeNumber}
          className="w-full py-3.5 px-6 rounded-xl bg-red-600 text-white font-semibold text-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500/30 focus:ring-offset-2 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          {uploading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Subiendo...
            </span>
          ) : (
            "Publicar Episodio"
          )}
        </button>
      </form>
    </div>
  );
}
