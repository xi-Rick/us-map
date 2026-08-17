"use client"

import { USAStateAbbreviation } from "@mirawision/usa-map-react"
import type { StateData } from "@/data/states-data"
import { AlertCircle, CheckCircle, Database, FileText, Link, Upload, X } from "lucide-react"
import { useCallback, useRef, useState } from "react"
import * as XLSX from "xlsx"

interface DataLoaderProps {
    onDataLoaded: (data: StateData[]) => void
    className?: string
}

const STATE_NAMES: Record<string, string> = {
    'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas',
    'CA': 'California', 'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware',
    'DC': 'District of Columbia', 'FL': 'Florida', 'GA': 'Georgia', 'HI': 'Hawaii',
    'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
    'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine',
    'MD': 'Maryland', 'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota',
    'MS': 'Mississippi', 'MO': 'Missouri', 'MT': 'Montana', 'NE': 'Nebraska',
    'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey', 'NM': 'New Mexico',
    'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
    'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island',
    'SC': 'South Carolina', 'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas',
    'UT': 'Utah', 'VT': 'Vermont', 'VA': 'Virginia', 'WA': 'Washington',
    'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
}

const FIPS_TO_ABBR: Record<string, string> = {
    '01': 'AL', '02': 'AK', '04': 'AZ', '05': 'AR', '06': 'CA',
    '08': 'CO', '09': 'CT', '10': 'DE', '11': 'DC', '12': 'FL',
    '13': 'GA', '15': 'HI', '16': 'ID', '17': 'IL', '18': 'IN',
    '19': 'IA', '20': 'KS', '21': 'KY', '22': 'LA', '23': 'ME',
    '24': 'MD', '25': 'MA', '26': 'MI', '27': 'MN', '28': 'MS',
    '29': 'MO', '30': 'MT', '31': 'NE', '32': 'NV', '33': 'NH',
    '34': 'NJ', '35': 'NM', '36': 'NY', '37': 'NC', '38': 'ND',
    '39': 'OH', '40': 'OK', '41': 'OR', '42': 'PA', '44': 'RI',
    '45': 'SC', '46': 'SD', '47': 'TN', '48': 'TX', '49': 'UT',
    '50': 'VT', '51': 'VA', '53': 'WA', '54': 'WV', '55': 'WI',
    '56': 'WY',
}

export function DataLoader({ onDataLoaded, className = "" }: DataLoaderProps) {
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState<string | null>(null)
    const [apiUrl, setApiUrl] = useState('')
    const fileInputRef = useRef<HTMLInputElement>(null)

    const generateColor = (value: number, min: number, max: number): string => {
        const normalized = max === min ? 0.5 : (value - min) / (max - min)
        if (normalized > 0.8) return '#ef4444'
        if (normalized > 0.6) return '#f59e0b'
        if (normalized > 0.4) return '#10b981'
        return '#3b82f6'
    }

    const normalizeStateId = (id: string): string | null => {
        const trimmed = id.trim()
        const upperID = trimmed.toUpperCase()

        if (STATE_NAMES[upperID]) return upperID

        if (FIPS_TO_ABBR[trimmed]) return FIPS_TO_ABBR[trimmed]
        if (FIPS_TO_ABBR[upperID]) return FIPS_TO_ABBR[upperID]

        const lower = trimmed.toLowerCase()
        for (const [abbr, name] of Object.entries(STATE_NAMES)) {
            if (name.toLowerCase() === lower) return abbr
        }

        return null
    }

    const parseCSV = (csvText: string, delimiter: string = ','): any[] => {
        const lines = csvText.trim().split('\n')
        const headers = lines[0].split(delimiter).map(h => h.trim().replace(/"/g, ''))
        return lines.slice(1).map(line => {
            const values = line.split(delimiter).map(v => v.trim().replace(/"/g, ''))
            const obj: any = {}
            headers.forEach((header, index) => { obj[header] = values[index] || '' })
            return obj
        })
    }

    const parseXLSX = (buffer: ArrayBuffer): any[] => {
        const workbook = XLSX.read(buffer, { type: 'array' })
        const firstSheet = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[firstSheet]
        return XLSX.utils.sheet_to_json(worksheet)
    }

    const extractValue = (item: any): number => {
        const directFields = ['value', 'data', 'count', 'amount', 'total', 'score']
        for (const field of directFields) {
            const val = parseFloat(item[field])
            if (!isNaN(val)) return val
        }
        const searchNested = (obj: any, depth = 0): number | null => {
            if (depth > 2) return null
            for (const [, value] of Object.entries(obj)) {
                if (typeof value === 'number') return value
                if (typeof value === 'string') {
                    const parsed = parseFloat(value)
                    if (!isNaN(parsed)) return parsed
                }
                if (typeof value === 'object' && value !== null) {
                    const nested = searchNested(value, depth + 1)
                    if (nested !== null) return nested
                }
            }
            return null
        }
        return searchNested(item) || 0
    }

    const flattenObject = (obj: any, prefix = ''): any => {
        const flattened: any = {}
        for (const [key, value] of Object.entries(obj)) {
            const newKey = prefix ? `${prefix}_${key}` : key
            if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
                Object.assign(flattened, flattenObject(value, newKey))
            } else {
                flattened[newKey] = value
            }
        }
        return flattened
    }

    const processData = (rawData: any[]): StateData[] => {
        if (!Array.isArray(rawData) || rawData.length === 0) {
            throw new Error('Invalid data format. Expected an array of objects.')
        }

        const processedStates: StateData[] = []
        const values: number[] = []

        rawData.forEach(item => {
            const value = extractValue(item)
            if (!isNaN(value)) values.push(value)
        })

        if (values.length === 0) {
            throw new Error('No numeric values found in the data.')
        }

        const minValue = Math.min(...values)
        const maxValue = Math.max(...values)

        rawData.forEach(item => {
            const stateId = normalizeStateId(
                item.state || item.abbreviation || item.id || item.code || item.State || item.Abbreviation || ''
            )
            if (!stateId) return

            const value = extractValue(item)
            if (isNaN(value)) return

            const color = generateColor(value, minValue, maxValue)
            const flattenedItem = flattenObject(item)

            processedStates.push({
                id: stateId,
                name: item.name || STATE_NAMES[stateId] || stateId,
                abbreviation: stateId as USAStateAbbreviation,
                value,
                color,
                population: item.population ? parseInt(item.population) : undefined,
                capital: item.capital || undefined,
                ...Object.fromEntries(
                    Object.entries(flattenedItem).filter(([key]) =>
                        !['state', 'abbreviation', 'id', 'code', 'name', 'State', 'Abbreviation'].includes(key)
                    )
                )
            })
        })

        if (processedStates.length === 0) {
            throw new Error('No valid state data found. Ensure your data contains state identifiers (e.g., "CA", "California", "state": "CA").')
        }

        return processedStates
    }

    const handleFileUpload = useCallback(async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0]
        if (!file) return

        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            let rawData: any[]

            if (file.name.toLowerCase().endsWith('.xlsx') || file.name.toLowerCase().endsWith('.xls')) {
                const buffer = await file.arrayBuffer()
                rawData = parseXLSX(buffer)
            } else {
                const text = await file.text()
                if (file.name.toLowerCase().endsWith('.csv')) {
                    rawData = parseCSV(text, ',')
                } else if (file.name.toLowerCase().endsWith('.tsv')) {
                    rawData = parseCSV(text, '\t')
                } else if (file.name.toLowerCase().endsWith('.json')) {
                    const parsed = JSON.parse(text)
                    if (parsed.states && Array.isArray(parsed.states)) {
                        rawData = parsed.states
                    } else if (parsed.data && Array.isArray(parsed.data)) {
                        rawData = parsed.data
                    } else if (Array.isArray(parsed)) {
                        rawData = parsed
                    } else {
                        rawData = [parsed]
                    }
                } else {
                    throw new Error('Unsupported file format. Please use CSV, TSV, JSON, or XLSX files.')
                }
            }

            const processedData = processData(rawData)
            onDataLoaded(processedData)
            setSuccess(`Loaded ${processedData.length} states from ${file.name}`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process file')
        } finally {
            setLoading(false)
            if (fileInputRef.current) fileInputRef.current.value = ''
        }
    }, [onDataLoaded])

    const handleApiLoad = async () => {
        if (!apiUrl.trim()) {
            setError('Please enter a valid API URL')
            return
        }

        setLoading(true)
        setError(null)
        setSuccess(null)

        try {
            const response = await fetch(apiUrl)
            if (!response.ok) {
                throw new Error(`API request failed: ${response.status} ${response.statusText}`)
            }

            const data = await response.json()
            let rawData: any[]
            if (data.states && Array.isArray(data.states)) {
                rawData = data.states
            } else if (data.data && Array.isArray(data.data)) {
                rawData = data.data
            } else if (Array.isArray(data)) {
                rawData = data
            } else {
                rawData = [data]
            }
            const processedData = processData(rawData)
            onDataLoaded(processedData)
            setSuccess(`Loaded ${processedData.length} states from API`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load API data')
        } finally {
            setLoading(false)
        }
    }

    const loadSampleData = async () => {
        setLoading(true)
        setError(null)
        setSuccess(null)
        try {
            const response = await fetch('/sample-data.json')
            const raw = await response.json()
            const processedData = processData(raw)
            onDataLoaded(processedData)
            setSuccess(`Loaded ${processedData.length} states from sample data`)
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load sample data')
        } finally {
            setLoading(false)
        }
    }

    const clearMessages = () => {
        setError(null)
        setSuccess(null)
    }

    return (
        <div className={`space-y-5 ${className}`}>
            <div className="text-center">
                <h3 className="text-base font-semibold mb-1">Load Your Data</h3>
                <p className="text-xs text-muted-foreground">
                    Upload CSV/JSON files or connect to an API to visualize your data
                </p>
            </div>

            {error && (
                <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm">
                    <AlertCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{error}</span>
                    <button onClick={clearMessages} className="flex-shrink-0 hover:opacity-70">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            {success && (
                <div className="flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg text-green-600 dark:text-green-400 text-sm">
                    <CheckCircle className="w-4 h-4 flex-shrink-0" />
                    <span className="flex-1">{success}</span>
                    <button onClick={clearMessages} className="flex-shrink-0 hover:opacity-70">
                        <X className="w-3.5 h-3.5" />
                    </button>
                </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                <div className="p-4 border border-border/50 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <Upload className="w-4 h-4 text-muted-foreground" />
                        <h4 className="font-medium text-sm">Upload File</h4>
                    </div>
                    <input
                        ref={fileInputRef}
                        type="file"
                        accept=".csv,.json,.xlsx,.tsv"
                        onChange={handleFileUpload}
                        className="hidden"
                    />
                    <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={loading}
                        className="w-full py-2 px-3 bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-medium transition-opacity"
                    >
                        {loading ? 'Loading...' : 'Choose File'}
                    </button>
                    <p className="text-[11px] text-muted-foreground mt-2">CSV, TSV, JSON, or XLSX</p>
                </div>

                <div className="p-4 border border-border/50 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <Link className="w-4 h-4 text-muted-foreground" />
                        <h4 className="font-medium text-sm">API Data</h4>
                    </div>
                    <input
                        type="url"
                        placeholder="https://api.example.com/data"
                        value={apiUrl}
                        onChange={(e) => setApiUrl(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-border/50 rounded-lg bg-background mb-2 focus:outline-none focus:ring-1 focus:ring-ring placeholder:text-muted-foreground/50"
                    />
                    <button
                        onClick={handleApiLoad}
                        disabled={loading || !apiUrl.trim()}
                        className="w-full py-2 px-3 bg-foreground text-background rounded-lg hover:opacity-90 disabled:opacity-50 text-sm font-medium transition-opacity"
                    >
                        {loading ? 'Loading...' : 'Load from API'}
                    </button>
                </div>

                <div className="p-4 border border-border/50 rounded-xl bg-muted/20 hover:bg-muted/30 transition-colors">
                    <div className="flex items-center gap-2 mb-3">
                        <Database className="w-4 h-4 text-muted-foreground" />
                        <h4 className="font-medium text-sm">Sample Data</h4>
                    </div>
                    <button
                        onClick={loadSampleData}
                        disabled={loading}
                        className="w-full py-2 px-3 bg-muted text-muted-foreground border border-border/50 rounded-lg hover:bg-muted/80 disabled:opacity-50 text-sm font-medium transition-colors"
                    >
                        {loading ? 'Loading...' : 'Load Sample Data'}
                    </button>
                    <p className="text-[11px] text-muted-foreground mt-2">Tech industry data, all 50 states</p>
                </div>
            </div>

            <div className="bg-muted/30 border border-border/30 p-4 rounded-xl">
                <div className="flex items-center gap-2 mb-2">
                    <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                    <h4 className="font-medium text-xs text-muted-foreground">Supported Data Formats</h4>
                </div>
                <div className="text-[11px] text-muted-foreground space-y-1">
                    <p><span className="font-medium">JSON:</span> Direct arrays, {'{ states: [...] }'}, or {'{ data: [...] }'}</p>
                    <p><span className="font-medium">Excel:</span> XLSX files (first sheet used)</p>
                    <p><span className="font-medium">Required:</span> state/abbreviation/id field + any numeric field</p>
                    <p><span className="font-medium">Nested:</span> Auto-flattened (e.g., book_sales.revenue {'->'} book_sales_revenue)</p>
                    <p><span className="font-medium">IDs:</span> 2-letter codes (CA, TX), FIPS codes (06, 48), or full names (California, Texas)</p>
                </div>
            </div>
        </div>
    )
}
