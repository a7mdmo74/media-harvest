export default function Footer() {
  return (
    <footer className="mh-section-band border-t border-zinc-800/50 py-12 text-zinc-500">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div className="mb-6 md:mb-0">
            <div className="mb-2 text-xl font-bold tracking-tight text-zinc-100">Media Harvest</div>
            <div className="text-sm">© {new Date().getFullYear()}</div>
          </div>

          <div className="mb-6 flex flex-wrap justify-center gap-6 md:mb-0">
            <a href="#features" className="transition-colors hover:text-zinc-300">
              Features
            </a>
            <a href="#download" className="transition-colors hover:text-zinc-300">
              Download
            </a>
            <a href="#" className="transition-colors hover:text-zinc-300">
              GitHub
            </a>
          </div>

          <div className="text-center text-sm md:text-right">Made with Electron, React & yt-dlp</div>
        </div>
      </div>
    </footer>
  );
}
