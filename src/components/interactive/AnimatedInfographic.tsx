"use client";

import { useState, useEffect, useRef } from "react";

export interface InfographicItem {
  icon?: string;
  title: string;
  value: string;
  description: string;
  color?: string;
}

type LayoutType = "horizontal" | "vertical" | "circular" | "timeline";

interface AnimatedInfographicProps {
  items: InfographicItem[];
  layout?: LayoutType;
  animated?: boolean;
  isPreview?: boolean;
}

// Animated counter component
function AnimatedCounter({ value, duration = 2 }: { value: string; duration?: number }) {
  const [displayValue, setDisplayValue] = useState("0");
  const [isVisible, setIsVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
        }
      },
      { threshold: 0.5 }
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Extract numeric value
    const numericValue = parseInt(value.replace(/\D/g, ""), 10);
    const suffix = value.replace(/\d/g, "");

    if (isNaN(numericValue)) {
      setDisplayValue(value);
      return;
    }

    let currentValue = 0;
    const increment = Math.ceil(numericValue / (duration * 60)); // 60 frames per second
    const startTime = Date.now();

    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / (duration * 1000), 1);

      currentValue = Math.floor(progress * numericValue);
      setDisplayValue(`${currentValue}${suffix}`);

      if (progress === 1) {
        clearInterval(interval);
      }
    }, 16);

    return () => clearInterval(interval);
  }, [isVisible, value, duration]);

  return <div ref={ref}>{displayValue}</div>;
}

// Horizontal Layout
function HorizontalLayout({
  items,
  animated,
}: {
  items: InfographicItem[];
  animated?: boolean;
}) {
  return (
    <div className="flex flex-row gap-6 justify-between items-stretch w-full">
      {items.map((item, idx) => (
        <div
          key={idx}
          className={`flex-1 p-4 rounded-lg border-2 border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 text-center transition-all duration-500 ${
            animated ? "opacity-0 animate-fadeIn" : ""
          }`}
          style={{
            animationDelay: animated ? `${idx * 0.15}s` : undefined,
          }}
        >
          {item.icon && (
            <div className="text-4xl mb-3 mx-auto">{item.icon}</div>
          )}
          <h3 className="text-gray-700 font-semibold text-sm mb-2">
            {item.title}
          </h3>
          <div
            className={`text-3xl font-bold mb-2 ${
              item.color ? `text-[${item.color}]` : "text-purple-600"
            }`}
          >
            {animated ? <AnimatedCounter value={item.value} /> : item.value}
          </div>
          <p className="text-gray-600 text-xs">{item.description}</p>
        </div>
      ))}
    </div>
  );
}

// Vertical Layout
function VerticalLayout({
  items,
  animated,
}: {
  items: InfographicItem[];
  animated?: boolean;
}) {
  return (
    <div className="flex flex-col gap-4 w-full max-w-md mx-auto">
      {items.map((item, idx) => {
        const percentage = parseInt(item.value.replace(/\D/g, ""), 10);

        return (
          <div
            key={idx}
            className={`space-y-2 transition-all duration-500 ${
              animated ? "opacity-0 animate-slideRight" : ""
            }`}
            style={{
              animationDelay: animated ? `${idx * 0.15}s` : undefined,
            }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                {item.icon && (
                  <span className="text-2xl">{item.icon}</span>
                )}
                <div>
                  <h3 className="font-semibold text-gray-800 text-sm">
                    {item.title}
                  </h3>
                  <p className="text-gray-600 text-xs">{item.description}</p>
                </div>
              </div>
              <span className="text-lg font-bold text-purple-600">
                {item.value}
              </span>
            </div>
            {!isNaN(percentage) && (
              <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-1000 ${
                    item.color
                      ? `bg-[${item.color}]`
                      : "bg-gradient-to-r from-purple-400 to-purple-600"
                  }`}
                  style={{
                    width: animated ? `${percentage}%` : "0%",
                  }}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// Circular Layout
function CircularLayout({
  items,
  animated,
}: {
  items: InfographicItem[];
  animated?: boolean;
}) {
  const radius = 120;
  const angleSlice = (2 * Math.PI) / items.length;

  return (
    <div className="relative w-80 h-80 mx-auto">
      {/* Center circle */}
      <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-24 h-24 rounded-full bg-gradient-to-br from-purple-600 to-purple-700 flex items-center justify-center text-white font-bold text-center p-4">
        <div className="text-sm">
          {items.length} Itens
        </div>
      </div>

      {/* Items in circle */}
      {items.map((item, idx) => {
        const angle = angleSlice * idx - Math.PI / 2;
        const x = Math.cos(angle) * radius;
        const y = Math.sin(angle) * radius;

        return (
          <div
            key={idx}
            className={`absolute w-20 transform -translate-x-1/2 -translate-y-1/2 transition-all duration-500 ${
              animated ? "opacity-0 animate-zoomIn" : ""
            }`}
            style={{
              left: `calc(50% + ${x}px)`,
              top: `calc(50% + ${y}px)`,
              animationDelay: animated ? `${idx * 0.1}s` : undefined,
            }}
          >
            <div className={`p-3 rounded-lg bg-white border-2 border-purple-300 shadow-lg text-center`}>
              {item.icon && (
                <div className="text-2xl mb-1">{item.icon}</div>
              )}
              <p className="text-gray-700 font-bold text-sm">
                {animated ? (
                  <AnimatedCounter value={item.value} duration={1.5} />
                ) : (
                  item.value
                )}
              </p>
              <p className="text-gray-600 text-xs truncate">{item.title}</p>
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Timeline Layout
function TimelineLayout({
  items,
  animated,
}: {
  items: InfographicItem[];
  animated?: boolean;
}) {
  return (
    <div className="relative space-y-6 max-w-2xl mx-auto">
      {/* Timeline line */}
      <div className="absolute left-8 top-0 bottom-0 w-1 bg-gradient-to-b from-purple-400 to-purple-600" />

      {items.map((item, idx) => (
        <div
          key={idx}
          className={`ml-24 transition-all duration-500 ${
            animated ? "opacity-0 animate-slideRight" : ""
          }`}
          style={{
            animationDelay: animated ? `${idx * 0.15}s` : undefined,
          }}
        >
          {/* Timeline dot */}
          <div className="absolute left-2 -translate-x-1/2 w-12 h-12 rounded-full bg-white border-4 border-purple-600 flex items-center justify-center text-xl font-bold text-purple-600 shadow-lg">
            {item.icon || idx + 1}
          </div>

          {/* Content */}
          <div className="p-4 rounded-lg bg-gradient-to-r from-purple-50 to-purple-100 border-l-4 border-purple-600">
            <h3 className="font-bold text-gray-900 text-base">{item.title}</h3>
            <p className="text-purple-600 font-semibold text-sm">
              {animated ? (
                <AnimatedCounter value={item.value} duration={1.5} />
              ) : (
                item.value
              )}
            </p>
            <p className="text-gray-600 text-sm mt-1">{item.description}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

export function AnimatedInfographic({
  items,
  layout = "horizontal",
  animated = true,
  isPreview = false,
}: AnimatedInfographicProps) {
  if (items.length === 0) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-lg">
        <p className="text-gray-500">Nenhum item para exibir</p>
      </div>
    );
  }

  return (
    <div className="w-full py-8 px-4">
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes slideRight {
          from { opacity: 0; transform: translateX(-20px); }
          to { opacity: 1; transform: translateX(0); }
        }
        @keyframes zoomIn {
          from { opacity: 0; transform: scale(0.8); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fadeIn {
          animation: fadeIn 0.6s ease-out forwards;
        }
        .animate-slideRight {
          animation: slideRight 0.6s ease-out forwards;
        }
        .animate-zoomIn {
          animation: zoomIn 0.6s ease-out forwards;
        }
      `}</style>

      {layout === "horizontal" && (
        <HorizontalLayout items={items} animated={animated} />
      )}

      {layout === "vertical" && (
        <VerticalLayout items={items} animated={animated} />
      )}

      {layout === "circular" && (
        <CircularLayout items={items} animated={animated} />
      )}

      {layout === "timeline" && (
        <TimelineLayout items={items} animated={animated} />
      )}
    </div>
  );
}
