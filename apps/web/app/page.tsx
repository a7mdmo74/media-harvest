import Hero from "@/components/sections/Hero";
import Features from "@/components/sections/Features";
import Pricing from "@/components/sections/Pricing";
import Download from "@/components/sections/Download";
import DownloadAnalytics from "@/components/DownloadAnalytics";
import Footer from "@/components/sections/Footer";

export default function HomePage() {
  return (
    <main>
      <Hero />
      <Features />
      <Pricing />
      <Download />
      
      {/* Download Analytics Section */}
      <section className="mh-section-band border-y py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="mb-4 text-center text-3xl font-bold tracking-tight md:text-4xl">
              Download Statistics
            </h2>
            <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
              Join thousands of users worldwide who trust Media Harvest for their media needs
            </p>
          </div>
          <DownloadAnalytics />
        </div>
      </section>
      
      <Footer />
    </main>
  );
}
