import React from 'react';
import Markdown from 'react-markdown';
import remarkBreaks from 'remark-breaks';

export const renderContentWithLinks = (content: string | undefined | null) => {
  if (!content) return null;

  // Filter out unwanted bottom metadata lines (발행 정보, 카테고리, 검수)
  const cleaned = content
    .split('\n')
    .filter(line => {
      const trimmed = line.trim();
      if (
        trimmed.startsWith('- **발행 정보') ||
        trimmed.startsWith('- 발행 정보') ||
        trimmed.startsWith('**발행 정보') ||
        trimmed.startsWith('- **카테고리') ||
        trimmed.startsWith('- 카테고리') ||
        trimmed.startsWith('**카테고리') ||
        trimmed.startsWith('- **검수') ||
        trimmed.startsWith('- 검수') ||
        trimmed.startsWith('**검수')
      ) {
        return false;
      }
      return true;
    })
    .join('\n');

  return (
    <div className="article-markdown-body text-slate-800 leading-[1.85] break-keep">
      <Markdown
        remarkPlugins={[remarkBreaks]}
        components={{
          h1: ({ children }) => (
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-slate-900 mt-8 mb-5 leading-snug">
              {children}
            </h1>
          ),
          h2: ({ children }) => (
            <h2 className="text-xl sm:text-2xl font-serif font-bold text-slate-900 mt-10 mb-4 pt-6 border-t border-slate-200/80 flex items-center gap-2">
              {children}
            </h2>
          ),
          h3: ({ children }) => (
            <h3 className="text-lg sm:text-xl font-bold text-slate-800 mt-7 mb-3 flex items-center gap-1.5 text-emerald-900">
              {children}
            </h3>
          ),
          h4: ({ children }) => (
            <h4 className="text-base sm:text-lg font-bold text-slate-800 mt-5 mb-2">
              {children}
            </h4>
          ),
          p: ({ children }) => (
            <p className="text-slate-700 leading-relaxed sm:leading-[1.9] text-base sm:text-[17px] mb-4">
              {children}
            </p>
          ),
          blockquote: ({ children }) => (
            <div className="my-6 p-5 sm:p-6 bg-slate-50 border-l-4 border-emerald-600 rounded-r-xl shadow-xs text-slate-800">
              {children}
            </div>
          ),
          ul: ({ children }) => (
            <ul className="list-disc list-inside space-y-2.5 my-5 text-slate-700 pl-2">
              {children}
            </ul>
          ),
          ol: ({ children }) => (
            <ol className="list-decimal list-inside space-y-2.5 my-5 text-slate-700 pl-2">
              {children}
            </ol>
          ),
          li: ({ children }) => (
            <li className="leading-relaxed text-slate-700">
              {children}
            </li>
          ),
          hr: () => (
            <hr className="my-8 border-slate-200" />
          ),
          strong: ({ children }) => (
            <strong className="font-bold text-slate-900 bg-emerald-50 text-emerald-950 px-1 py-0.5 rounded">
              {children}
            </strong>
          ),
          a: ({ href, children }) => {
            const cleanUrl = href?.replace(/[.,!?:;]+$/, '') || '#';
            const targetUrl = cleanUrl.toLowerCase().startsWith('www.') ? `https://${cleanUrl}` : cleanUrl;
            return (
              <a
                href={targetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-emerald-600 font-semibold underline hover:text-emerald-800 transition-colors inline-flex items-center gap-0.5 mx-0.5 break-all"
                onClick={(e) => e.stopPropagation()}
              >
                {children}
              </a>
            );
          },
        }}
      >
        {cleaned}
      </Markdown>
    </div>
  );
};
