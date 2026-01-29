import React from 'react'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'

// Simple markdown renderer tailored for chat bubbles
export default function MarkdownMessage({ text }) {
  return (
    <div className="prose prose-slate dark:prose-invert max-w-none text-sm">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ node, ...props }) => (
            <a {...props} target="_blank" rel="noopener noreferrer" className="underline text-indigo-600 hover:text-indigo-700" />
          ),
          code: ({ inline, className, children, ...props }) => {
            const match = /language-(\w+)/.exec(className || '')
            return !inline ? (
              <pre className="bg-slate-900 text-slate-100 rounded-md p-3 overflow-x-auto text-xs">
                <code className={className} {...props}>{children}</code>
              </pre>
            ) : (
              <code className="bg-slate-100 rounded px-1.5 py-0.5 text-[0.85em]" {...props}>{children}</code>
            )
          },
          p: ({ node, ...props }) => <p className="mb-2 leading-relaxed" {...props} />,
          ul: ({ node, ...props }) => <ul className="list-disc pl-5 my-2" {...props} />,
          ol: ({ node, ...props }) => <ol className="list-decimal pl-5 my-2" {...props} />,
          li: ({ node, ...props }) => <li className="my-0.5" {...props} />,
          blockquote: ({ node, ...props }) => <blockquote className="border-l-4 border-slate-300 pl-3 italic my-2" {...props} />,
          table: ({ node, ...props }) => <div className="overflow-x-auto"><table className="my-2 w-full text-left border-collapse" {...props} /></div>,
          th: ({ node, ...props }) => <th className="border-b border-slate-300 font-semibold px-2 py-1" {...props} />,
          td: ({ node, ...props }) => <td className="border-b border-slate-200 px-2 py-1 align-top" {...props} />,
        }}
      >
        {text}
      </ReactMarkdown>
    </div>
  )
}
