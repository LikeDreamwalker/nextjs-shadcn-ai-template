import { marked } from "marked";
import { memo, ReactNode, useMemo } from "react";
import ReactMarkdown from "react-markdown";

function parseMarkdownIntoBlocks(markdown: string): string[] {
  const tokens = marked.lexer(markdown);
  return tokens.map((token) => token.raw);
}

const QuoteRenderer = ({ children }: { children: ReactNode }) => (
  <blockquote className="border-l-4 border-gray-300 pl-4 italic bg-gray-100 py-2 my-2">
    {children}
  </blockquote>
);

const MemoizedMarkdownBlock = memo(
  ({ content }: { content: string }) => {
    return (
      <ReactMarkdown
        components={{
          blockquote: QuoteRenderer,
        }}
      >
        {content}
      </ReactMarkdown>
    );
  },
  (prevProps, nextProps) => prevProps.content === nextProps.content
);

MemoizedMarkdownBlock.displayName = "MemoizedMarkdownBlock";

export const MemoizedMarkdown = memo(
  ({ content, id }: { content: string; id: string }) => {
    const blocks = useMemo(() => parseMarkdownIntoBlocks(content), [content]);

    return blocks.map((block, index) => (
      <MemoizedMarkdownBlock content={block} key={`${id}-block_${index}`} />
    ));
  }
);

MemoizedMarkdown.displayName = "MemoizedMarkdown";
