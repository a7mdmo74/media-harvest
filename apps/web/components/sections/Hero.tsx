import { Download, Monitor } from "lucide-react";
import { Button, Input } from "@media-harvest/ui";

export default function Hero() {
  return (
    <section className="text-zinc-100">
      <nav className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
        <div className="text-xl font-bold tracking-tight">Media Harvest</div>
        <Button asChild className="shadow-lg hover:shadow-xl">
          <a href="#download">Download Free</a>
        </Button>
      </nav>

      <div className="mx-auto max-w-7xl px-6 py-20 text-center">
        <div className="mb-6 inline-flex items-center rounded-full border border-zinc-800 bg-zinc-900/80 px-3 py-1 text-sm text-zinc-300 backdrop-blur-sm">
          <span className="mr-2 h-2 w-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.55)]" />
          Free & Open Source · Built with yt-dlp
        </div>

        <h1 className="mb-6 text-5xl font-bold leading-tight tracking-tight md:text-6xl">
          Download any YouTube video at full quality
        </h1>

        <p className="mx-auto mb-8 max-w-2xl text-xl text-zinc-400">
          Fast, private, cross-platform desktop app. Free forever. No account required.
        </p>

        <div className="mb-12 flex flex-col justify-center gap-4 sm:flex-row">
          <Button asChild size="lg" className="shadow-xl hover:shadow-2xl">
            <a href="#download">Download Free</a>
          </Button>
        </div>

    

        <div className="mx-auto max-w-4xl">
          <div className="mh-promo-card-dark p-6">
            <div className="mb-4 flex items-center gap-2">
              <Monitor className="h-5 w-5 text-zinc-400" />
              <Input
                type="text"
                placeholder="https://youtube.com/watch?v=..."
                readOnly
                className="flex-1"
              />
              <Button size="icon">
                <Download className="h-4 w-4" />
              </Button>
            </div>
            <div className="rounded-xl border border-zinc-800/80 bg-zinc-800/50 p-3">
              <div className="mb-2 flex justify-between text-sm">
                <span className="text-zinc-400">video.mp4</span>
                <span className="text-zinc-400">75%</span>
              </div>
              <div className="h-2 w-full rounded-full bg-zinc-700">
                <div className="h-2 rounded-full bg-red-600" style={{ width: "75%" }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
