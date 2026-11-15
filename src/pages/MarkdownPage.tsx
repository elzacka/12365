import { Markdown } from '../lib/markdown'

// «Om» and «Personvern»: a markdown file from the repo root, rendered in a card.
export function MarkdownPage({ source }: { source: string }) {
  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <main className="flex-1 px-4 pt-6 pb-10 max-w-2xl mx-auto w-full">
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-6 [&_.markdown>:first-child]:mt-0">
          <Markdown source={source} />
        </article>
      </main>
    </div>
  )
}
