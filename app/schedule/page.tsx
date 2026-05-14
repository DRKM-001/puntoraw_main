export default function SchedulePage() {
  const schedule = [
    {
      month: "May 2026",
      date: "May 21, 2026",
      episodeNumber: 1,
      speaker: "Greg Anthony",
      topic: "Exposing Raw Intentions",
      status: "scheduled",
    },
    {
      month: "June 2026",
      date: "June 21, 2026",
      episodeNumber: 2,
      speaker: "Rafa",
      topic: "Systems Thinking and Scalability",
      status: "upcoming",
    },
    {
      month: "July 2026",
      date: "July 21, 2026",
      episodeNumber: 3,
      speaker: "RJ",
      topic: "Creative Expression and Data",
      status: "upcoming",
    },
    {
      month: "August 2026",
      date: "August 21, 2026",
      episodeNumber: 4,
      speaker: "TBD",
      topic: "To be announced",
      status: "upcoming",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <section className="max-w-4xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
          Speaker Schedule
        </h1>
        <p className="text-lg text-slate-400 mb-8">
          Monthly episodes featuring raw conversations about intentions, growth, and accountability.
        </p>
      </section>

      {/* Schedule Timeline */}
      <section className="max-w-4xl mx-auto px-6 pb-20">
        <div className="space-y-8">
          {schedule.map((episode, index) => (
            <div
              key={index}
              className="border border-slate-800 rounded-lg p-6 hover:border-slate-600 transition bg-slate-900/50"
            >
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div className="flex-1">
                  <p className="text-xs font-semibold text-slate-400 uppercase tracking-wide mb-2">
                    Episode {episode.episodeNumber} • {episode.month}
                  </p>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {episode.topic}
                  </h3>
                  <p className="text-lg text-slate-300 font-medium mb-3">
                    {episode.speaker}
                  </p>
                  <p className="text-slate-400">
                    {new Date(episode.date).toLocaleDateString("en-US", {
                      weekday: "long",
                      year: "numeric",
                      month: "long",
                      day: "numeric",
                    })}{" "}
                    • 7:00 PM PST
                  </p>
                </div>
                <div className="flex-shrink-0">
                  <span
                    className={`inline-block px-4 py-2 rounded text-sm font-semibold ${
                      episode.status === "scheduled"
                        ? "bg-green-900 text-green-100"
                        : "bg-slate-800 text-slate-300"
                    }`}
                  >
                    {episode.status === "scheduled" ? "🔴 Live" : "Upcoming"}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pass System Info */}
        <div className="mt-16 p-8 border border-slate-800 rounded-lg bg-slate-900/50">
          <h3 className="text-2xl font-bold text-white mb-4">The Pass System</h3>
          <p className="text-slate-300 mb-4">
            If a scheduled speaker needs to pass for any reason:
          </p>
          <ul className="space-y-2 text-slate-300 list-disc list-inside">
            <li>They can pass, and the next person in rotation steps up</li>
            <li>Or they can bring a guest speaker for that month</li>
            <li>This keeps momentum flowing without forcing talks</li>
          </ul>
        </div>
      </section>
    </div>
  );
}
