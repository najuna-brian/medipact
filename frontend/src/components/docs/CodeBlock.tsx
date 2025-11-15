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
    <div className="my-4 overflow-hidden rounded-lg border border-gray-200 bg-gray-900 shadow-sm sm:my-5 md:my-6">
      {title && (
        <div className="border-b border-gray-700 bg-gray-800 px-2 py-1.5 sm:px-3 sm:py-2 md:px-4">
          <span className="text-xs font-medium text-gray-300 sm:text-sm">{title}</span>
        </div>
      )}
      <div className="overflow-x-auto">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          customStyle={{
            margin: 0,
            borderRadius: 0,
            padding: '0.75rem',
            fontSize: '0.75rem',
          }}
          codeTagProps={{
            style: {
              fontSize: '0.75rem',
            },
          }}
          showLineNumbers
        >
          {code}
        </SyntaxHighlighter>
      </div>
    </div>
  );
}


