import { Download, ListVideo, Shield, Monitor, Layers, Code2 } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@media-harvest/ui";

const features = [
  {
    icon: Download,
    title: "Any Quality",
    description: "4K, 1080p, 720p, or audio-only MP3",
  },
  {
    icon: ListVideo,
    title: "Playlist Support",
    description: "Download entire playlists in one click",
  },
  {
    icon: Shield,
    title: "No Account",
    description: "Fully local. No tracking, no login",
  },
  {
    icon: Monitor,
    title: "Cross-Platform",
    description: "Windows, macOS, and Linux supported",
  },
  {
    icon: Layers,
    title: "Download Queue",
    description: "Manage multiple downloads at once",
  },
  {
    icon: Code2,
    title: "Open Source",
    description: "Auditable code — use and share freely",
  },
];

export default function Features() {
  return (
    <section id="features" className="mh-section-band border-y py-20 text-zinc-100">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-16 text-center text-3xl font-bold tracking-tight md:text-4xl">
          Everything you need. Nothing you don&apos;t.
        </h2>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <Card key={feature.title} className="mh-promo-card-dark border-zinc-700 transition-colors hover:border-zinc-600">
              <CardHeader>
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-red-600 shadow-lg shadow-red-900/25">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-zinc-400">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
