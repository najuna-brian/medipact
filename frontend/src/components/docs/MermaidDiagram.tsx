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
    <div className="my-8 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
      {title && (
        <h3 className="mb-4 text-lg font-semibold text-gray-900">{title}</h3>
      )}
      {!isMounted ? (
        <div className="h-64 w-full animate-pulse rounded bg-gray-100" />
      ) : (
        <div
          ref={ref}
          className="mermaid flex justify-center overflow-x-auto"
          suppressHydrationWarning
        />
      )}
    </div>
  );
}


