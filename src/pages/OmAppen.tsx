import omAppenInnhold from '../../OM-APPEN.md?raw'
import { Markdown } from '../lib/markdown'

export function OmAppen() {
  return (
    <div className="flex-1 flex flex-col bg-slate-50">
      <main className="flex-1 px-4 pt-6 pb-10 max-w-2xl mx-auto w-full">
        <article className="bg-white rounded-2xl border border-slate-200 shadow-sm px-5 py-6">
          <Markdown source={omAppenInnhold} />
        </article>
      </main>
    </div>
  )
}
