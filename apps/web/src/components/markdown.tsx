import Link from 'next/link';
import React, { memo } from 'react';
import ReactMarkdown, { type Components } from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CodeBlock } from './code-block';

// @ts-ignore
const components: (disableHighlight: boolean) => Partial<Components> = (disableHighlight: boolean) => ({
  // @ts-ignore
  code: (props) => <CodeBlock {...props} disableHighlight={disableHighlight} />,
  pre: ({ children }) => <>{children}</>,
  ol: ({ node, children, ...props }) => {
    return <ol {...props}>{children}</ol>;
  },
  li: ({ node, children, ...props }) => {
    return <li {...props}>{children}</li>;
  },
  ul: ({ node, children, ...props }) => {
    return <ul {...props}>{children}</ul>;
  },
  strong: ({ node, children, ...props }) => {
    return <span {...props}>{children}</span>;
  },
  a: ({ node, children, ...props }) => {
    return (
      // @ts-expect-error
      <Link className="text-blue-500 hover:underline" target="_blank" rel="noreferrer" {...props}>
        {children}
      </Link>
    );
  },
  h1: ({ node, children, ...props }) => {
    return (
      <h1 className="text-3xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h1>
    );
  },
  h2: ({ node, children, ...props }) => {
    return (
      <h2 className="text-2xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h2>
    );
  },
  h3: ({ node, children, ...props }) => {
    return (
      <h3 className="text-xl font-semibold mt-6 mb-2" {...props}>
        {children}
      </h3>
    );
  },
  h4: ({ node, children, ...props }) => {
    return (
      <h4 className="text-lg font-semibold mt-6 mb-2" {...props}>
        {children}
      </h4>
    );
  },
  h5: ({ node, children, ...props }) => {
    return (
      <h5 className="text-base font-semibold mt-6 mb-2" {...props}>
        {children}
      </h5>
    );
  },
  h6: ({ node, children, ...props }) => {
    return (
      <h6 className="text-sm font-semibold mt-6 mb-2" {...props}>
        {children}
      </h6>
    );
  },
});

const remarkPlugins = [remarkGfm];

function NonMemoizedMarkdown({ children, disableHighlight }: { children: string; disableHighlight?: boolean }) {
  return (
    <ReactMarkdown remarkPlugins={remarkPlugins} components={components(disableHighlight ?? false)}>
      {children}
    </ReactMarkdown>
  );
}

export const Markdown = memo(
  NonMemoizedMarkdown,
  (prevProps, nextProps) => prevProps.children === nextProps.children && prevProps.disableHighlight === nextProps.disableHighlight,
);
