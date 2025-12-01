'use client'
import { useState } from 'react'

interface HeatDebugUIProps {
    heatIntensity: number
    bubbleRadius: number
    chromaticStrength: number
    heatSpeed: number
    onUpdate: (params: {
        heatIntensity: number
        bubbleRadius: number
        chromaticStrength: number
        heatSpeed: number
    }) => void
}

export default function HeatDebugUI({
    heatIntensity,
    bubbleRadius,
    chromaticStrength,
    heatSpeed,
    onUpdate,
}: HeatDebugUIProps) {
    const [isOpen, setIsOpen] = useState(true)

    const handleChange = (key: string, value: number) => {
        onUpdate({
            heatIntensity,
            bubbleRadius,
            chromaticStrength,
            heatSpeed,
            [key]: value,
        })
    }

    return (
        <div className="fixed bottom-4 right-4 z-50 pointer-events-auto">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="bg-void/90 text-paper px-4 py-2 rounded-lg font-mono text-xs backdrop-blur-sm border border-signal/30 hover:border-signal transition-colors"
            >
                {isOpen ? '✕ Hide' : '⚙ Heat Debug'}
            </button>

            {isOpen && (
                <div className="mt-2 bg-void/95 backdrop-blur-md rounded-lg p-4 border border-signal/30 w-72">
                    <h3 className="font-mono text-signal text-xs uppercase tracking-wider mb-4">
                        Heat Shader Controls
                    </h3>

                    <div className="space-y-4">
                        {/* Heat Intensity */}
                        <div>
                            <label className="font-mono text-paper/70 text-[10px] uppercase tracking-wide block mb-1">
                                Heat Intensity: {heatIntensity.toFixed(3)}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="0.1"
                                step="0.001"
                                value={heatIntensity}
                                onChange={(e) => handleChange('heatIntensity', parseFloat(e.target.value))}
                                className="w-full h-1 bg-concrete/30 rounded-lg appearance-none cursor-pointer accent-signal"
                            />
                        </div>

                        {/* Bubble Radius */}
                        <div>
                            <label className="font-mono text-paper/70 text-[10px] uppercase tracking-wide block mb-1">
                                Bubble Radius: {bubbleRadius.toFixed(2)}
                            </label>
                            <input
                                type="range"
                                min="0.1"
                                max="1.0"
                                step="0.01"
                                value={bubbleRadius}
                                onChange={(e) => handleChange('bubbleRadius', parseFloat(e.target.value))}
                                className="w-full h-1 bg-concrete/30 rounded-lg appearance-none cursor-pointer accent-signal"
                            />
                        </div>

                        {/* Chromatic Strength */}
                        <div>
                            <label className="font-mono text-paper/70 text-[10px] uppercase tracking-wide block mb-1">
                                Chromatic: {chromaticStrength.toFixed(3)}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="0.05"
                                step="0.001"
                                value={chromaticStrength}
                                onChange={(e) => handleChange('chromaticStrength', parseFloat(e.target.value))}
                                className="w-full h-1 bg-concrete/30 rounded-lg appearance-none cursor-pointer accent-signal"
                            />
                        </div>

                        {/* Heat Speed */}
                        <div>
                            <label className="font-mono text-paper/70 text-[10px] uppercase tracking-wide block mb-1">
                                Heat Speed: {heatSpeed.toFixed(2)}
                            </label>
                            <input
                                type="range"
                                min="0"
                                max="1.0"
                                step="0.01"
                                value={heatSpeed}
                                onChange={(e) => handleChange('heatSpeed', parseFloat(e.target.value))}
                                className="w-full h-1 bg-concrete/30 rounded-lg appearance-none cursor-pointer accent-signal"
                            />
                        </div>
                    </div>

                    {/* Copy Values Button */}
                    <button
                        onClick={() => {
                            const values = `heatIntensity={${heatIntensity}}
bubbleRadius={${bubbleRadius}}
chromaticStrength={${chromaticStrength}}
heatSpeed={${heatSpeed}}`
                            navigator.clipboard.writeText(values)
                        }}
                        className="mt-4 w-full bg-signal/10 hover:bg-signal/20 text-signal px-3 py-2 rounded font-mono text-[10px] uppercase tracking-wider transition-colors border border-signal/30"
                    >
                        📋 Copy Values
                    </button>
                </div>
            )}
        </div>
    )
}
