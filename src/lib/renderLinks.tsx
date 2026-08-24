import React from 'react';

export const renderContentWithLinks = (content: string | undefined | null) => {
  if (!content) return null;

  // Regex to match URLs starting with http://, https://, or www.
  const urlRegex = /(https?:\/\/[^\s]+|www\.[^\s]+)/gi;

  const lines = content.split('\n');
  return lines.map((line, lineIdx) => {
    const parts = line.split(urlRegex);
    return (
      <React.Fragment key={lineIdx}>
        {parts.map((part, partIdx) => {
          if (part && part.match(/^(https?:\/\/|www\.)/i)) {
            const cleanUrl = part.replace(/[.,!?:;]+$/, '');
            const punctuation = part.slice(cleanUrl.length);
            const href = cleanUrl.toLowerCase().startsWith('www.') ? `https://${cleanUrl}` : cleanUrl;

            return (
              <React.Fragment key={partIdx}>
                <a
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-600 font-semibold underline hover:text-emerald-800 break-all inline-flex items-center gap-0.5 mx-0.5 transition-colors"
                  onClick={(e) => e.stopPropagation()}
                >
                  {cleanUrl}
                </a>
                {punctuation}
              </React.Fragment>
            );
          }
          return part;
        })}
        {lineIdx < lines.length - 1 && <br />}
      </React.Fragment>
    );
  });
};
