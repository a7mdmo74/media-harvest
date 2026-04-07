"use client";

import { Monitor, Apple, Terminal } from "lucide-react";
import { VERSION, GITHUB_REPO } from "@/lib/version";
import { useState, useEffect } from "react";

export default function Download() {
  const version = VERSION;
  const githubRepoUrl = `https://github.com/${GITHUB_REPO}`;
  const [latestBuildUrl, setLatestBuildUrl] = useState<string>("");
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch latest successful build artifacts
  useEffect(() => {
    const fetchLatestBuild = async () => {
      try {
        const response = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/actions/runs?branch=main&status=success&per_page=1`);
        const data = await response.json();
        
        if (data.workflow_runs && data.workflow_runs.length > 0) {
          const latestRun = data.workflow_runs[0];
          setLatestBuildUrl(`${latestRun.html_url}#artifacts`);
        } else {
          // Fallback to releases if no successful workflow runs
          const releasesResponse = await fetch(`https://api.github.com/repos/${GITHUB_REPO}/releases/latest`);
          const releasesData = await releasesResponse.json();
          setLatestBuildUrl(releasesData.html_url || githubRepoUrl);
        }
      } catch (error) {
        console.error('Failed to fetch latest build:', error);
        // Fallback to repo URL
        setLatestBuildUrl(githubRepoUrl);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLatestBuild();
  }, [githubRepoUrl]);
  
  const downloads = [
    {
      platform: "Windows",
      icon: Monitor,
      url: latestBuildUrl || githubRepoUrl,
      extension: ".exe",
      description: "Windows 10/11",
      artifact: "windows-installer",
      size: "85.7 MB",
      sha256: "bce907858c57ebf2c26beb81aca096ccbbd7b243e1a623536842b502d317ccc9",
    },
    {
      platform: "macOS",
      icon: Apple,
      url: latestBuildUrl || githubRepoUrl,
      extension: ".dmg",
      description: "macOS 10.15+",
      artifact: "macos-installer",
      size: "215 MB",
      sha256: "217b6307714d984effd509754f2afdd963d3f433e1696d5380f2232a2cdae6e0",
    },
    {
      platform: "Linux",
      icon: Terminal,
      url: latestBuildUrl || githubRepoUrl,
      extension: ".AppImage",
      description: "Ubuntu, Fedora, etc.",
      artifact: "linux-installer",
      size: "116 MB",
      sha256: "0b468d5ec8132fd4203e64f82b8c05740bbc2aaea6c27fa37eda45a5d30b4283",
    },
  ];

  return (
    <section id="download" className="mh-section-band border-y py-20 text-zinc-100">
      <div className="mx-auto max-w-7xl px-6">
        <h2 className="mb-4 text-center text-3xl font-bold tracking-tight md:text-4xl">
          Download Media Harvest
        </h2>
        <p className="mb-12 text-center text-zinc-400">
          Available for Windows, macOS, and Linux. Choose your platform below.
        </p>

        <div className="mb-12 grid grid-cols-1 gap-6 md:grid-cols-3">
          {downloads.map((download) => {
            const Icon = download.icon;
            return (
              <a
                key={download.platform}
                href={download.url}
                className="group flex items-center gap-4 rounded-xl border border-zinc-700/90 bg-zinc-900/40 px-6 py-4 transition-all hover:border-zinc-600 hover:bg-zinc-900/70 hover:scale-105"
              >
                <div className="rounded-lg bg-zinc-800 p-3 group-hover:bg-zinc-700">
                  <Icon className="h-6 w-6 text-zinc-300 group-hover:text-white" />
                </div>
                <div className="text-left flex-1">
                  <div className="font-medium text-white">{download.platform}</div>
                  <div className="text-sm text-zinc-400">{download.extension} · v{version} · {download.size}</div>
                  <div className="text-xs text-zinc-500">{download.description}</div>
                  {isLoading && (
                    <div className="text-xs text-blue-400 mt-1">Loading latest build...</div>
                  )}
                </div>
              </a>
            );
          })}
        </div>

        <div className="text-center text-zinc-400">
          <p className="mb-2">
            Current version: v{version}
          </p>
          <div className="mb-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <p className="text-sm mb-3">
              📦 <strong>Download Options:</strong>
            </p>
            <div className="space-y-2 text-left max-w-md mx-auto">
              <p className="text-sm">
                1. <strong>GitHub Actions Artifacts:</strong> Click any platform above to download the latest build
              </p>
              <p className="text-sm">
                2. <strong>Build from source:</strong> Clone repo and run{" "}
                <code className="bg-zinc-700 px-2 py-1 rounded text-xs">bun run build</code>
              </p>
            </div>
          </div>
          <div className="mb-4 p-4 bg-zinc-800/50 rounded-lg border border-zinc-700">
            <p className="text-sm mb-3">
              🔐 <strong>SHA256 Checksums:</strong>
            </p>
            <div className="space-y-1 text-left max-w-2xl mx-auto">
              {downloads.map((download) => (
                <div key={download.platform} className="text-xs">
                  <code className="text-zinc-300">{download.platform}:</code>
                  <code className="text-zinc-500 ml-2 break-all">{download.sha256}</code>
                </div>
              ))}
            </div>
          </div>
          <p className="text-sm">
            ℹ️ <strong>Note:</strong> Installers are built automatically when code is pushed to main branch.
          </p>
          <p className="text-sm mt-4">yt-dlp is bundled in the desktop app.</p>
        </div>
      </div>
    </section>
  );
}
