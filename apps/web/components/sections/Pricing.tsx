import { Check } from "lucide-react";

export default function Pricing() {
  return (
    <section id="pricing" className="py-24 text-zinc-100">
      <div className="mx-auto max-w-2xl space-y-8 px-6 text-center">
        <div className="space-y-3">
          <h2 className="text-3xl font-semibold tracking-tight text-zinc-100">100% free. No catch.</h2>
          <p className="text-zinc-400">
            Media Harvest is completely free to use. No account, no subscription, no limits.
          </p>
        </div>

        <div className="mh-app-card-dark space-y-6 p-10">
          <div>
            <span className="text-6xl font-bold text-zinc-100">$0</span>
            <p className="mt-2 text-zinc-500">forever</p>
          </div>

          <ul className="mx-auto max-w-xs space-y-3 text-left">
            {[
              "Unlimited downloads",
              "4K / 1080p / any quality",
              "Playlist support",
              "No account required",
              "No tracking, no ads",
              "Windows, macOS, Linux",
            ].map((f) => (
              <li key={f} className="flex items-center gap-2 text-sm text-zinc-400">
                <Check className="h-4 w-4 shrink-0 text-green-500" />
                {f}
              </li>
            ))}
          </ul>

          <a
            href="#download"
            className="inline-block w-full rounded-xl bg-red-600 py-3 text-center text-sm font-semibold text-white transition-colors hover:bg-red-700"
          >
            Download Free
          </a>
        </div>

        <p className="text-xs text-zinc-600">
          Open source · Built with yt-dlp · No data collected
        </p>
      </div>
    </section>
  );
}
