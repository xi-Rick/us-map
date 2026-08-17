import AccurateUSMap from "@/components/accurate-us-map"
import { FeatureSection } from "@/components/feature-section"
import { Footer } from "@/components/footer"
import { HeroSection } from "@/components/hero-section"
import { Navbar } from "@/components/navbar"

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <HeroSection />

      <section id="demo" className="py-24 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/10 to-background" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted/60 border border-border/60 text-xs text-muted-foreground mb-4">
              Interactive Demo
            </div>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">Interactive US Map Demo</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Experience smooth interactions and accurate state boundaries. Click any state to see detailed
              information, or load your own data.
            </p>
          </div>

          <div className="map-container rounded-2xl p-1 shadow-xl shadow-black/5 dark:shadow-black/20">
            <div className="bg-card rounded-[15px] border border-border/30 p-6 md:p-8">
              <AccurateUSMap />
            </div>
          </div>
        </div>
      </section>

      <FeatureSection />
      <Footer />
    </div>
  )
}
