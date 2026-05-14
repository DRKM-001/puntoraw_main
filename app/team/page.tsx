import Image from "next/image";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  imageUrl?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Greg Anthony",
    role: "Founder & Speaker",
    bio: "Strategic thinker and founder of Dark Matter Systems. Passionate about authentic connection, systems design, and building with intention.",
    imageUrl: "/team/greg.jpg",
  },
  {
    name: "Rafa",
    role: "Systems Architect & Co-Host",
    bio: "Engineering visionary and systems architect. Specializes in backend architecture, scalability, and turning complex systems into elegant solutions.",
    imageUrl: "/team/rafa.jpg",
  },
  {
    name: "RJ",
    role: "Audio Engineer & Creative Force",
    bio: "Audio engineer and data analyst with a passion for creative expression. Jack of all trades with both left and right-brained expertise.",
    imageUrl: "/team/rj.jpg",
  },
  {
    name: "Markus Corvus",
    role: "Organizer & Documentarian",
    bio: "Strategic wingman and blueprint architect. Custodian of the vision, keeper of notes, and compiler of raw conversations into lasting records.",
    imageUrl: "/team/markus.jpg",
  },
];

export default function TeamPage() {
  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <h1 className="text-4xl md:text-5xl font-bold mb-4 text-white">
          Our Team
        </h1>
        <p className="text-lg text-slate-400">
          The people behind Punto Raw, committed to authentic conversations and growth.
        </p>
      </section>

      {/* Team Grid */}
      <section className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {teamMembers.map((member, index) => (
            <div
              key={index}
              className="border border-slate-800 rounded-lg overflow-hidden hover:border-slate-600 transition bg-slate-900/50 flex flex-col h-full"
            >
              {/* Image */}
              {member.imageUrl ? (
                <div className="relative w-full h-40 bg-slate-800">
                  <Image
                    src={member.imageUrl}
                    alt={member.name}
                    fill
                    className="object-cover"
                  />
                </div>
              ) : (
                <div className="w-full h-40 bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center">
                  <span className="text-4xl font-bold text-slate-600">
                    {member.name.charAt(0)}
                  </span>
                </div>
              )}

              {/* Info */}
              <div className="p-6 flex flex-col flex-1">
                <h3 className="text-lg font-bold text-white mb-1">
                  {member.name}
                </h3>
                <p className="text-sm font-semibold text-slate-400 uppercase tracking-wide mb-4">
                  {member.role}
                </p>
                <p className="text-sm text-slate-300 flex-1">{member.bio}</p>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
