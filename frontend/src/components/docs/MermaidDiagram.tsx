'use client';

import { useEffect, useRef, useState } from 'react';
import mermaid from 'mermaid';

interface MermaidDiagramProps {
  chart: string;
  title?: string;
}

export default function MermaidDiagram({ chart, title }: MermaidDiagramProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isMounted, setIsMounted] = useState(false);
  const chartRef = useRef(chart);

  // Update chart ref when chart prop changes
  useEffect(() => {
    chartRef.current = chart;
  }, [chart]);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (!isMounted || !ref.current) return;

    // Clear any previous content
    const currentChart = chartRef.current;
    ref.current.innerHTML = currentChart;

    mermaid.initialize({
      startOnLoad: true,
      theme: 'default',
      securityLevel: 'loose',
      fontFamily: 'inherit',
      themeVariables: {
        primaryColor: '#00A9CE',
        primaryTextColor: '#ffffff',
        primaryBorderColor: '#007A99',
        lineColor: '#00A9CE',
        secondaryColor: '#E3F2FD',
        tertiaryColor: '#F5F5F5',
      },
    });

    const id = `mermaid-${Math.random().toString(36).substr(2, 9)}`;
    ref.current.id = id;
    ref.current.className = 'mermaid flex justify-center overflow-x-auto';

    mermaid.run({
      nodes: [ref.current],
    }).catch((error) => {
      console.error('Mermaid rendering error:', error);
    });
  }, [chart, isMounted]);

  return (
    <div className="my-4 overflow-hidden rounded-lg border border-gray-200 bg-white p-3 shadow-sm sm:my-6 sm:p-4 md:my-8 md:p-6">
      {title && (
        <h3 className="mb-2 px-1 text-sm font-semibold text-gray-900 sm:mb-3 sm:text-base md:mb-4 md:text-lg">
          {title}
        </h3>
      )}
      {!isMounted ? (
        <div className="h-48 w-full animate-pulse rounded bg-gray-100 sm:h-56 md:h-64" />
      ) : (
        <div className="-mx-3 overflow-x-auto px-3 sm:-mx-4 sm:px-4 md:-mx-6 md:px-6">
          <div
            ref={ref}
            className="mermaid flex min-w-max justify-center"
            suppressHydrationWarning
          />
        </div>
      )}
    </div>
  );
}


