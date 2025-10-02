import clsx from "clsx";

type MobileProseProps = {
  html: string;
  className?: string;
};

export function MobileProse({ html, className }: MobileProseProps) {
  return (
    <div
      className={clsx(
        "prose prose-sm mx-auto w-full max-w-[680px] text-base leading-7 text-neutral-900",
        "prose-headings:mt-6 prose-headings:font-semibold prose-headings:text-neutral-900",
        "prose-h1:text-3xl prose-h2:text-2xl prose-h3:text-xl prose-h4:text-lg",
        "prose-p:my-4 prose-p:leading-7",
        "prose-ul:my-4 prose-ol:my-4 prose-li:marker:text-neutral-400",
        "prose-img:my-5 prose-img:w-full prose-img:rounded-2xl",
        "prose-blockquote:my-6 prose-blockquote:border-l-2 prose-blockquote:border-primary prose-blockquote:bg-primary/5 prose-blockquote:px-4 prose-blockquote:py-3 prose-blockquote:text-neutral-800",
        "prose-code:rounded-md prose-code:bg-neutral-100 prose-code:px-1.5 prose-code:py-0.5 prose-code:text-sm prose-code:text-neutral-800",
        "prose-pre:rounded-2xl prose-pre:bg-neutral-900/95 prose-pre:p-4 prose-pre:text-sm prose-pre:text-neutral-100",
        "prose-a:rounded-md prose-a:px-1 prose-a:py-0.5 prose-a:text-primary prose-a:underline prose-a:underline-offset-4 prose-a:transition hover:prose-a:bg-primary/10",
        "prose-a:[&[target='_blank']]:after:ml-[0.35rem] prose-a:[&[target='_blank']]:after:text-xs prose-a:[&[target='_blank']]:after:content-['\\2197']",
        className,
      )}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

export default MobileProse;
