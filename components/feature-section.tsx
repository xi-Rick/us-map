"use client"

import { BarChart3, Check, Database, Map, Palette, Zap } from "lucide-react"

const features = [
    {
        icon: Database,
        title: "Plug & Play Data Loading",
        description: "Drop in your own CSV, TSV, JSON, or Excel files and watch them automatically populate the map. No complex configuration required."
    },
    {
        icon: Zap,
        title: "API Data Loading",
        description: "Fetch JSON data from any API endpoint and instantly visualize it on the map. Great for dashboards and real-time reporting."
    },
    {
        icon: Map,
        title: "Flexible Data Formats",
        description: "Supports CSV, TSV, JSON, and XLSX. Accepts state abbreviations, FIPS codes, and full state names for maximum flexibility."
    },
    {
        icon: Palette,
        title: "Dynamic Color Mapping",
        description: "Automatically generates color scales based on your data values, or define custom color schemes to match your brand."
    },
    {
        icon: BarChart3,
        title: "Interactive Data Explorer",
        description: "Built-in tooltips, legends, and data panels that automatically adapt to your dataset structure."
    },
    {
        icon: Check,
        title: "Zero Configuration",
        description: "Works out of the box with sensible defaults, but every aspect is customizable when you need more control."
    }
]

export function FeatureSection() {
    return (
        <section id="features" className="py-24 bg-background">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <div className="inline-flex items-center px-3 py-1 rounded-full bg-muted/60 border border-border/60 text-xs text-muted-foreground mb-4">
                        Features
                    </div>
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 tracking-tight">
                        Built for Developers
                    </h2>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                        Everything you need to integrate interactive US maps into your React applications.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((feature, index) => (
                        <div
                            key={index}
                            className="group p-6 rounded-xl border border-border/50 bg-card/50 hover:bg-card card-glow transition-all duration-300"
                        >
                            <div className="flex items-center mb-4">
                                <div className="p-2.5 rounded-xl bg-gradient-to-br from-blue-500/10 to-violet-500/10 text-blue-600 dark:text-blue-400 group-hover:from-blue-500/20 group-hover:to-violet-500/20 transition-all duration-300">
                                    <feature.icon className="w-5 h-5" />
                                </div>
                            </div>
                            <h3 className="text-base font-semibold mb-2">{feature.title}</h3>
                            <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    )
}
