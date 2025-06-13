'use client';

import { cn } from '@/lib/utils';
import { DownloadIcon, TextIcon, WrapTextIcon } from 'lucide-react';
import { useState, useEffect, useCallback } from 'react';
import { codeToHtml } from 'shiki';
import { toast } from 'sonner';
import { CopyToClipboard } from './copy-to-clipboard';
import { Button } from './ui/button';

interface CodeBlockProps {
  node: any;
  inline: boolean;
  className: string;
  children: any;
  disableHighlight?: boolean;
}

const extensionMap: Record<string, string> = {
  javascript: 'js',
  typescript: 'ts',
  python: 'py',
  java: 'java',
  cpp: 'cpp',
  csharp: 'cs',
  php: 'php',
  ruby: 'rb',
  go: 'go',
  rust: 'rs',
  swift: 'swift',
  kotlin: 'kt',
  html: 'html',
  css: 'css',
  json: 'json',
  yaml: 'yml',
  markdown: 'md',
  bash: 'sh',
  shell: 'sh',
  sql: 'sql',
  xml: 'xml',
};

export function CodeBlock({ node, className, children, disableHighlight, ...props }: CodeBlockProps) {
  const inline = !(children ?? '').includes('\n');
  const [html, setHtml] = useState<string | null>(null);
  const [wrap, setWrap] = useState(false);

  const language = className?.startsWith('language-') ? className.slice(9) : '';

  const getFileExtension = useCallback(() => {
    return extensionMap[language] || 'txt';
  }, [language]);

  const downloadCode = useCallback(() => {
    try {
      const extension = getFileExtension();
      const blob = new Blob([children], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `file.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('File downloaded successfully');
    } catch (err) {
      toast.error('Failed to download file');
    }
  }, [children, getFileExtension]);

  useEffect(() => {
    if (disableHighlight) {
      return;
    }

    codeToHtml(children, {
      lang: language,
      theme: 'github-light',
    })
      .then((html) => {
        setHtml(html);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [disableHighlight, children, language]);

  if (!inline) {
    return (
      <div className="not-prose relative mt-2 flex w-full flex-col pt-9">
        <div className="absolute inset-x-0 top-0 flex h-9 items-center justify-between rounded-t bg-secondary px-4 py-2 text-sm text-secondary-foreground">
          <span className="font-mono">{language}</span>
          <div>
            <Button variant="secondary" size="icon" onClick={downloadCode} aria-label="Download code">
              <DownloadIcon className="size-4" />
            </Button>
            <Button
              variant="secondary"
              size="icon"
              className="mr-6"
              aria-label="Enable text wrapping"
              onClick={() => setWrap((prev) => !prev)}
            >
              {wrap ? <WrapTextIcon className="size-4" /> : <TextIcon className="size-4" />}
            </Button>
          </div>
        </div>
        <div className="sticky left-auto z-[1] ml-auto h-1.5 w-8 transition-[top] top-[42px] max-1170:top-20">
          <div className="absolute -top-[calc(2rem+2px)] right-2 flex gap-1">
            <CopyToClipboard content={children} />
          </div>
        </div>
        <div className="-mb-1.5"></div>
        <pre
          {...props}
          className={cn(
            `overflow-auto not-prose relative bg-chat-accent text-sm font-[450] text-secondary-foreground [&_pre]:overflow-auto [&_pre]:!bg-transparent [&_pre]:px-[1em] [&_pre]:py-[1em]`,
            {
              'p-3.5': !html,
            },
          )}
        >
          {html ? (
            <div
              className={cn(`break-words`, {
                '[&_pre]:whitespace-pre-wrap': wrap,
              })}
              dangerouslySetInnerHTML={{ __html: html }}
            />
          ) : (
            <code
              className={cn(`break-words`, {
                'whitespace-pre-wrap': wrap,
              })}
            >
              {children}
            </code>
          )}
        </pre>
      </div>
    );
  } else {
    return (
      <code
        className={`${className} mx-0.5 overflow-auto rounded-md bg-secondary/50 px-[7px] py-1 group-[:is(pre)]:flex group-[:is(pre)]:w-full`}
        {...props}
      >
        {children}
      </code>
    );
  }
}
