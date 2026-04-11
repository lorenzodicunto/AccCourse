"use client";

import { useState, useRef, useEffect } from "react";
import { X } from "lucide-react";

export interface Hotspot {
  x: number;
  y: number;
  radius: number;
  label: string;
  content: string;
  icon?: string;
}

interface HotspotViewerProps {
  imageSrc: string;
  hotspots: Hotspot[];
  isPreview?: boolean;
}

export function HotspotViewer({
  imageSrc,
  hotspots,
  isPreview = false,
}: HotspotViewerProps) {
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);
  const [tooltipPos, setTooltipPos] = useState({ x: 0, y: 0 });
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  // Calculate tooltip position to avoid overflow
  const calculateTooltipPosition = (
    hotspotX: number,
    hotspotY: number,
    tooltipWidth: number,
    tooltipHeight: number
  ) => {
    if (!containerRef.current) return { x: hotspotX, y: hotspotY };

    const containerRect = containerRef.current.getBoundingClientRect();
    let x = hotspotX + 16;
    let y = hotspotY - tooltipHeight / 2;

    // Adjust if tooltip goes off-screen
    if (x + tooltipWidth > containerRect.width) {
      x = hotspotX - tooltipWidth - 16;
    }

    if (y < 0) {
      y = hotspotY;
    } else if (y + tooltipHeight > containerRect.height) {
      y = hotspotY - tooltipHeight;
    }

    return { x: Math.max(0, x), y: Math.max(0, y) };
  };

  // Handle hotspot click
  const handleHotspotClick = (hotspot: Hotspot, e: React.MouseEvent) => {
    e.stopPropagation();
    const rect = imageRef.current?.getBoundingClientRect();
    if (rect) {
      const tooltipPos = calculateTooltipPosition(hotspot.x, hotspot.y, 280, 120);
      setTooltipPos(tooltipPos);
    }
    setActiveHotspot(hotspot);
  };

  return (
    <div
      ref={containerRef}
      className="relative w-full h-full bg-gray-100 rounded-lg overflow-hidden cursor-pointer"
      onClick={() => setActiveHotspot(null)}
    >
      {/* Image */}
      <img
        ref={imageRef}
        src={imageSrc}
        alt="Imagem interativa com hotspots"
        className="w-full h-full object-contain"
      />

      {/* Hotspot markers */}
      {hotspots.map((hotspot, idx) => (
        <div key={idx} className="absolute" style={{ left: hotspot.x, top: hotspot.y }}>
          {/* Pulsing dot */}
          <button
            onClick={(e) => handleHotspotClick(hotspot, e)}
            className={`relative w-8 h-8 rounded-full -translate-x-1/2 -translate-y-1/2 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-purple-400 focus:ring-offset-2 ${
              activeHotspot === hotspot
                ? "bg-purple-600 scale-125"
                : "bg-purple-500 hover:bg-purple-600 hover:scale-110"
            }`}
            title={hotspot.label}
          >
            {/* Pulse animation */}
            <span className={`absolute inset-0 rounded-full bg-purple-500 opacity-75 ${
              activeHotspot !== hotspot ? "animate-pulse" : ""
            }`} />

            {/* Icon or number */}
            <span className="relative flex items-center justify-center w-full h-full text-white font-bold text-sm">
              {hotspot.icon || idx + 1}
            </span>
          </button>

          {/* Outer ring animation */}
          {activeHotspot !== hotspot && (
            <div className="absolute inset-0 -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full border-2 border-purple-400 animate-pulse" />
          )}
        </div>
      ))}

      {/* Tooltip */}
      {activeHotspot && (
        <div
          className="fixed bg-white rounded-lg shadow-xl border-l-4 border-purple-600 z-50 pointer-events-auto"
          style={{
            left: tooltipPos.x,
            top: tooltipPos.y,
            maxWidth: "300px",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-4">
            {/* Close button */}
            <button
              onClick={() => setActiveHotspot(null)}
              className="absolute top-2 right-2 p-1 rounded hover:bg-gray-100 text-gray-500 hover:text-gray-700 transition-colors"
              aria-label="Fechar"
            >
              <X size={16} />
            </button>

            {/* Content */}
            <div>
              <h3 className="font-bold text-gray-900 mb-2 pr-6">
                {activeHotspot.label}
              </h3>
              <p className="text-gray-700 text-sm leading-relaxed">
                {activeHotspot.content}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Legend */}
      {hotspots.length > 0 && (
        <div className="absolute bottom-4 left-4 bg-white rounded-lg p-3 shadow-lg">
          <p className="text-xs font-semibold text-gray-700 mb-2">
            Pontos de interesse:
          </p>
          <div className="space-y-1 max-h-32 overflow-y-auto">
            {hotspots.map((hotspot, idx) => (
              <button
                key={idx}
                onClick={() => {
                  const rect = imageRef.current?.getBoundingClientRect();
                  if (rect) {
                    const tooltipPos = calculateTooltipPosition(hotspot.x, hotspot.y, 280, 120);
                    setTooltipPos(tooltipPos);
                  }
                  setActiveHotspot(hotspot);
                }}
                className="w-full text-left px-2 py-1 rounded text-xs text-gray-700 hover:bg-purple-100 transition-colors flex items-center gap-2"
              >
                <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-purple-500 text-white text-xs font-bold flex-shrink-0">
                  {hotspot.icon || idx + 1}
                </span>
                <span>{hotspot.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
