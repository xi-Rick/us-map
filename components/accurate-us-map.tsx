"use client"

import { StateAbbreviations, USAMap, USAStateAbbreviation } from '@mirawision/usa-map-react'
import { useTheme } from 'next-themes'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { StateData, statesData } from '../data/states-data'
import { DataLoader } from './data-loader'

function formatFieldValue(key: string, value: any): { label: string; formatted: string } {
  const label = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())

  if (value == null) return { label, formatted: '' }
  if (Array.isArray(value)) {
    if (value.length === 0) return { label, formatted: '' }
    let formatted = value.join(', ')
    if (formatted.length > 50) {
      formatted = value.slice(0, 3).join(', ') + ` (+${value.length - 3} more)`
    }
    return { label, formatted }
  }
  if (typeof value === 'boolean') return { label, formatted: value ? 'Yes' : 'No' }
  if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)) && value.match(/^\d{4}-\d{2}-\d{2}/))) {
    return { label, formatted: new Date(value).toLocaleDateString() }
  }
  if (typeof value === 'number') {
    if (key.includes('rate') || key.includes('percentage') || key.includes('percent')) {
      return { label, formatted: `${value}%` }
    }
    if (key.includes('salary') || key.includes('gdp') || key.includes('revenue') || key.includes('income') || key.includes('cost')) {
      if (key.includes('billions') || key.includes('billion')) return { label, formatted: `$${value}B` }
      if (key.includes('millions') || key.includes('million')) return { label, formatted: `$${value}M` }
      if (key.includes('thousands') || key.includes('thousand')) return { label, formatted: `$${value}K` }
      if (value >= 1e9) return { label, formatted: `$${(value / 1e9).toFixed(1)}B` }
      if (value >= 1e6) return { label, formatted: `$${(value / 1e6).toFixed(1)}M` }
      if (value >= 1000) return { label, formatted: `$${value.toLocaleString()}` }
      return { label, formatted: `$${value}` }
    }
    if (key.includes('count')) return { label, formatted: value.toLocaleString() }
    if (value >= 1000) return { label, formatted: value.toLocaleString() }
  }
  return { label, formatted: String(value) }
}

const SKIPPED_FIELDS = ['id', 'name', 'abbreviation', 'value', 'color', 'population', 'capital']

function getCustomFields(data: StateData) {
  return Object.entries(data)
    .filter(([key, value]) => !SKIPPED_FIELDS.includes(key) && value != null)
    .filter(([, value]) => !Array.isArray(value) || value.length > 0)
}

function getIntensityColor(value: number, isDark: boolean): string {
  const intensity = value / 100
  if (intensity > 0.8) return isDark ? '#dc2626' : '#ef4444'
  if (intensity > 0.6) return isDark ? '#d97706' : '#f59e0b'
  if (intensity > 0.4) return isDark ? '#059669' : '#10b981'
  return isDark ? '#2563eb' : '#3b82f6'
}

function brighten(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.min(255, ((num >> 16) & 0xff) + amount)
  const g = Math.min(255, ((num >> 8) & 0xff) + amount)
  const b = Math.min(255, (num & 0xff) + amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

function darken(hex: string, amount: number): string {
  const num = parseInt(hex.replace('#', ''), 16)
  const r = Math.max(0, ((num >> 16) & 0xff) - amount)
  const g = Math.max(0, ((num >> 8) & 0xff) - amount)
  const b = Math.max(0, (num & 0xff) - amount)
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}

export default function AccurateUSMap() {
  const { theme } = useTheme()
  const [mounted, setMounted] = useState(false)
  const [customData, setCustomData] = useState<StateData[] | null>(null)
  const [showDataLoader, setShowDataLoader] = useState(false)
  const [selectedState, setSelectedState] = useState<USAStateAbbreviation | null>(null)
  const [hoveredState, setHoveredState] = useState<USAStateAbbreviation | null>(null)

  // Refs for stable callback access without causing re-renders
  const selectedRef = useRef<USAStateAbbreviation | null>(null)
  const hoveredRef = useRef<USAStateAbbreviation | null>(null)

  useEffect(() => { setMounted(true) }, [])

  const isDark = mounted ? theme === 'dark' : false

  const activeData = customData || statesData
  const activeDataMap = useMemo(() => {
    return activeData.reduce((acc, state) => {
      acc[state.abbreviation as USAStateAbbreviation] = state
      return acc
    }, {} as Record<USAStateAbbreviation, StateData>)
  }, [activeData])

  // Stable callbacks - these never change reference
  const handleStateClick = useCallback((stateAbbr: USAStateAbbreviation) => {
    setSelectedState(prev => {
      const next = prev === stateAbbr ? null : stateAbbr
      selectedRef.current = next
      return next
    })
  }, [])

  const handleStateHover = useCallback((stateAbbr: USAStateAbbreviation) => {
    hoveredRef.current = stateAbbr
    setHoveredState(stateAbbr)
  }, [])

  const handleStateLeave = useCallback(() => {
    hoveredRef.current = null
    setHoveredState(null)
  }, [])

  const customStates = useMemo(() => {
    const settings: Record<USAStateAbbreviation, any> = {}

    StateAbbreviations.forEach((stateAbbr) => {
      const stateData = activeDataMap[stateAbbr]
      if (!stateData) return

      const baseColor = getIntensityColor(stateData.value, isDark)
      const isSelected = selectedState === stateAbbr
      const isHovered = hoveredState === stateAbbr

      let fill = baseColor
      let stroke = isDark ? '#525252' : '#d4d4d4'
      let strokeWidth = 1

      if (isSelected) {
        fill = isDark ? '#818cf8' : '#6366f1'
        stroke = isDark ? '#a5b4fc' : '#818cf8'
        strokeWidth = 2
      } else if (isHovered) {
        fill = brighten(baseColor, 30)
        stroke = isDark ? '#737373' : '#a3a3a3'
        strokeWidth = 1.5
      }

      settings[stateAbbr] = {
        fill,
        stroke,
        strokeWidth,
        onClick: () => handleStateClick(stateAbbr),
        onHover: () => handleStateHover(stateAbbr),
        onLeave: () => handleStateLeave(),
        label: {
          enabled: true,
          render: (state: USAStateAbbreviation) => (
            <text
              fontSize="11"
              fill={isDark ? '#e5e5e5' : '#404040'}
              fontWeight="600"
              textAnchor="middle"
              className="pointer-events-none select-none"
            >
              {state}
            </text>
          ),
        },
        tooltip: {
          enabled: true,
          render: (state: USAStateAbbreviation) => {
            const data = activeDataMap[state]
            if (!data) return null
            const customFields = getCustomFields(data)
            const fillColor = getIntensityColor(data.value, isDark)

            return (
              <div className="p-3.5 min-w-[200px]">
                <div className="flex items-center gap-2.5 mb-2.5 pb-2.5" style={{ borderBottom: `1px solid ${isDark ? '#333' : '#eee'}` }}>
                  <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: fillColor }} />
                  <div className="min-w-0">
                    <h4 className="font-semibold text-sm truncate" style={{ color: isDark ? '#f5f5f5' : '#171717' }}>{data.name}</h4>
                    <span className="text-[10px] font-medium" style={{ color: isDark ? '#737373' : '#a3a3a3' }}>{state}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-xs" style={{ color: isDark ? '#a3a3a3' : '#737373' }}>Value</span>
                    <span className="text-sm font-bold" style={{ color: isDark ? '#f5f5f5' : '#171717' }}>{data.value}</span>
                  </div>
                  {data.capital && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs" style={{ color: isDark ? '#a3a3a3' : '#737373' }}>Capital</span>
                      <span className="text-xs font-medium" style={{ color: isDark ? '#d4d4d4' : '#404040' }}>{data.capital}</span>
                    </div>
                  )}
                  {data.population && (
                    <div className="flex justify-between items-center">
                      <span className="text-xs" style={{ color: isDark ? '#a3a3a3' : '#737373' }}>Population</span>
                      <span className="text-xs font-medium" style={{ color: isDark ? '#d4d4d4' : '#404040' }}>{data.population.toLocaleString()}</span>
                    </div>
                  )}
                  {customFields.slice(0, 5).map(([key, value]) => {
                    const { label, formatted } = formatFieldValue(key, value)
                    if (!formatted) return null
                    return (
                      <div key={key} className="flex justify-between items-center">
                        <span className="text-xs" style={{ color: isDark ? '#a3a3a3' : '#737373' }}>{label}</span>
                        <span className="text-xs font-medium" style={{ color: isDark ? '#d4d4d4' : '#404040' }} title={Array.isArray(value) ? value.join(', ') : formatted}>
                          {formatted}
                        </span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )
          },
        },
      }
    })

    return settings
  }, [hoveredState, selectedState, isDark, mounted, activeDataMap, handleStateClick, handleStateHover, handleStateLeave])

  const currentStateData = selectedState ? activeDataMap[selectedState] : null

  const handleDataLoaded = (newData: StateData[]) => {
    setCustomData(newData)
    setShowDataLoader(false)
  }

  const loadSampleData = async () => {
    try {
      const response = await fetch('/sample-data.json')
      const sampleData = await response.json()
      const transformedData: StateData[] = sampleData.map((item: any) => ({
        id: item.abbreviation,
        name: item.state,
        abbreviation: item.abbreviation,
        value: item.value,
        ...Object.fromEntries(
          Object.entries(item).filter(([key]) => !['state', 'abbreviation', 'value'].includes(key))
        )
      }))
      setCustomData(transformedData)
    } catch (error) {
      console.error('Failed to load sample data:', error)
    }
  }

  const customFields = currentStateData ? getCustomFields(currentStateData) : []

  return (
    <div className="w-full max-w-6xl mx-auto">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6">
        <div>
          <h2 className="text-xl font-bold text-foreground tracking-tight">Interactive US Map</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            {customData
              ? `Showing ${customData.length} regions with custom data`
              : 'Hover or click states to explore data'}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowDataLoader(!showDataLoader)}
            className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 text-sm flex items-center gap-2 ${
              showDataLoader
                ? 'bg-muted text-muted-foreground hover:bg-muted/80'
                : 'bg-foreground text-background hover:opacity-90 shadow-sm'
            }`}
          >
            <div className={`w-1.5 h-1.5 rounded-full ${showDataLoader ? 'bg-muted-foreground/60' : 'bg-background/60'}`} />
            {showDataLoader ? 'Hide Panel' : 'Load Your Data'}
          </button>
          <button
            onClick={loadSampleData}
            className="px-4 py-2 bg-muted text-muted-foreground rounded-lg hover:bg-muted/80 transition-all duration-200 text-sm font-medium border border-border/50"
          >
            Load Sample
          </button>
          {customData && (
            <button
              onClick={() => {
                setCustomData(null)
                setSelectedState(null)
                selectedRef.current = null
                setHoveredState(null)
                hoveredRef.current = null
              }}
              className="px-4 py-2 bg-destructive/10 text-destructive rounded-lg hover:bg-destructive/20 transition-all duration-200 text-sm font-medium"
            >
              Reset
            </button>
          )}
        </div>
      </div>

      {showDataLoader && (
        <div className="mb-6 rounded-xl border border-border/50 bg-card/50 overflow-hidden animate-slide-up">
          <div className="px-5 py-4 border-b border-border/50 bg-muted/30">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-blue-500/20 to-violet-500/20 flex items-center justify-center">
                <div className="w-3.5 h-3.5 rounded bg-gradient-to-br from-blue-500 to-violet-500" />
              </div>
              <div>
                <h3 className="font-semibold text-sm">Data Import Center</h3>
                <p className="text-xs text-muted-foreground">Upload files or connect to APIs</p>
              </div>
            </div>
          </div>
          <div className="p-5">
            <DataLoader onDataLoaded={handleDataLoaded} />
          </div>
        </div>
      )}

      {customData && (
        <div className="mb-6 p-3.5 rounded-xl bg-green-500/5 border border-green-500/10 flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-full bg-green-500/10 flex items-center justify-center flex-shrink-0">
            <div className="w-2 h-2 rounded-full bg-green-500" />
          </div>
          <div>
            <p className="text-sm font-medium text-green-700 dark:text-green-400">
              Custom data active
              <span className="ml-2 text-xs font-normal text-green-600/70 dark:text-green-400/60">{customData.length} regions loaded</span>
            </p>
          </div>
        </div>
      )}

      <div className="mb-6 rounded-xl overflow-hidden border border-border/30 bg-background/50">
        <USAMap
          customStates={customStates}
          className="w-full h-auto"
          mapSettings={{ width: "100%", height: "auto" }}
        />
      </div>

      {currentStateData && (
        <div className="rounded-xl border border-border/50 bg-card/50 overflow-hidden animate-fade-in" key={currentStateData.abbreviation}>
          <div className="px-5 py-4 border-b border-border/50 bg-muted/20">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: getIntensityColor(currentStateData.value, isDark) }}
                />
                <div>
                  <h3 className="font-semibold text-sm tracking-tight">{currentStateData.name}</h3>
                  <p className="text-xs text-muted-foreground">{currentStateData.abbreviation}</p>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm">
                {currentStateData.capital && (
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Capital</p>
                    <p className="text-sm font-medium">{currentStateData.capital}</p>
                  </div>
                )}
                {currentStateData.population && (
                  <div className="text-right">
                    <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Population</p>
                    <p className="text-sm font-medium">{currentStateData.population.toLocaleString()}</p>
                  </div>
                )}
                <div className="text-right">
                  <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium">Value</p>
                  <p className="text-sm font-bold">{currentStateData.value}</p>
                </div>
              </div>
            </div>
          </div>

          {customFields.length > 0 && (
            <div className="px-5 py-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-2.5">
                {customFields.map(([key, value]) => {
                  const { label, formatted } = formatFieldValue(key, value)
                  if (!formatted) return null
                  return (
                    <div key={key} title={Array.isArray(value) ? value.join(', ') : formatted}>
                      <p className="text-[10px] uppercase tracking-wider text-muted-foreground font-medium mb-0.5">{label}</p>
                      <p className="text-sm font-medium truncate">{formatted}</p>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
