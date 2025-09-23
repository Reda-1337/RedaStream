export default function HomeHowItWorks() {
  const steps = [
    {
      title: 'Search & filter',
      body: 'Use Discover to filter by genre, language, year, or popularity. Combine filters to zero in on what you want.'
    },
    {
      title: 'Open official providers',
      body: 'Each detail page shows where a title is streaming. We link straight to the provider—no shady mirrors.'
    },
    {
      title: 'Save for later',
      body: 'Use the Watchlist to bookmark movies & series you want to return to. We keep your picks front and center.'
    }
  ] as const

  return (
    <section className="mx-auto w-full max-w-6xl px-6">
      <div className="grid gap-6 rounded-[32px] border border-slate-800/60 bg-slate-950/80 p-8 shadow-[0_25px_70px_rgba(8,47,73,0.28)] md:grid-cols-[1.15fr_1fr]">
        <div className="space-y-4">
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-300">How RedaStream Works</p>
          <h2 className="text-2xl font-semibold text-white">Find something to watch in three simple steps</h2>
          <p className="text-sm text-slate-300">
            RedaStream is a catalog and watch-guide. We show what’s popular, help you narrow it down, and point you to the legal provider that streams it.
          </p>
        </div>
        <ul className="flex flex-col gap-4">
          {steps.map((step, index) => (
            <li key={step.title} className="rounded-2xl border border-slate-800/60 bg-slate-950/70 p-4">
              <span className="text-xs uppercase tracking-[0.35em] text-cyan-300">Step {index + 1}</span>
              <h3 className="mt-2 text-lg font-semibold text-white">{step.title}</h3>
              <p className="mt-2 text-sm text-slate-300">{step.body}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  )
}
