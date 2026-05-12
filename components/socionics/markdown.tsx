import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";

type Props = {
  children: string;
  className?: string;
};

export function Markdown({ children, className }: Props) {
  return (
    <div
      className={cn(
        "prose prose-neutral dark:prose-invert max-w-none",
        "prose-headings:font-heading prose-headings:tracking-tight",
        "prose-a:underline prose-a:underline-offset-2 prose-a:decoration-muted-foreground hover:prose-a:decoration-foreground",
        "prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:before:content-none prose-code:after:content-none prose-code:text-[0.9em]",
        "prose-pre:bg-muted prose-pre:border prose-pre:border-border",
        "prose-blockquote:border-l-foreground/40 prose-blockquote:not-italic",
        "prose-img:rounded-md",
        "prose-p:leading-relaxed",
        className,
      )}
    >
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          a: ({ href, children: ch, ...rest }) => (
            <a
              href={href}
              target={
                href && /^https?:\/\//.test(href) ? "_blank" : undefined
              }
              rel={
                href && /^https?:\/\//.test(href)
                  ? "noopener noreferrer"
                  : undefined
              }
              {...rest}
            >
              {ch}
            </a>
          ),
        }}
      >
        {children}
      </ReactMarkdown>
    </div>
  );
}
