'use client';

import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

interface CodeBlockProps {
  code: string;
  language?: string;
  title?: string;
}

export default function CodeBlock({ code, language = 'bash', title }: CodeBlockProps) {
  return (
    <div className="my-6 rounded-lg border border-gray-200 bg-gray-900 shadow-sm">
      {title && (
        <div className="border-b border-gray-700 bg-gray-800 px-4 py-2">
          <span className="text-sm font-medium text-gray-300">{title}</span>
        </div>
      )}
      <SyntaxHighlighter
        language={language}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          borderRadius: '0.5rem',
          padding: '1rem',
        }}
        showLineNumbers
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}


