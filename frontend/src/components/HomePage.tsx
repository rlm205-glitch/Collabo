// HomePage.tsx
type HomePageProps = {
  onGetStarted: () => void;
  onLogin?: () => void;
};

export function HomePage({ onGetStarted, onLogin }: HomePageProps) {
  return (
    <div className="min-h-screen bg-blue-50 text-slate-900">
      {/* Top nav */}
      <header className="sticky top-0 z-10 border-b border-blue-100 bg-blue-50/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-2">
            <div className="grid h-9 w-9 place-items-center rounded-xl bg-blue-600 text-white font-bold">
              C
            </div>
            <div className="leading-tight">
              <div className="font-semibold">CWRU Collaboration</div>
              <div className="text-xs text-slate-600">Campus-wide project matching</div>
            </div>
          </div>

          <nav className="flex items-center gap-3">
            {onLogin ? (
              <button
                onClick={onLogin}
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white/70"
              >
                Login
              </button>
            ) : (
              <a
                href="/login"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 hover:bg-white/70"
              >
                Login
              </a>
            )}

            <button
              onClick={onGetStarted}
              className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
            >
              Get Started
            </button>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <main className="mx-auto max-w-5xl px-6 py-14">
        <div className="grid gap-10 md:grid-cols-2 md:items-center">
          <section className="space-y-5">
            <div className="inline-flex items-center gap-2 rounded-full bg-white px-3 py-1 text-xs font-medium text-slate-700 shadow-sm">
              <span className="h-2 w-2 rounded-full bg-blue-600" />
              Verified CWRU students only
            </div>

            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              Find the right teammates.
              <span className="text-blue-700"> Build what matters.</span>
            </h1>

            <p className="text-base leading-relaxed text-slate-700">
              CWRU Collaboration helps Case Western students find partners for research,
              startups, and passion ideas - based on skills, interests,
              and availability.
            </p>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <button
                onClick={onGetStarted}
                className="rounded-lg bg-blue-600 px-6 py-3 text-sm font-semibold text-white hover:bg-blue-700"
              >
                Get Started
              </button>

              {/* removed: "Sign in with your CWRU email..." */}
            </div>

            <div className="grid grid-cols-3 gap-3 pt-3 text-xs text-slate-600">
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="font-semibold text-slate-900">Post projects</div>
                <div>Recruit collaborators</div>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="font-semibold text-slate-900">Browse & filter</div>
                <div>Match by fit</div>
              </div>
              <div className="rounded-lg bg-white p-3 shadow-sm">
                <div className="font-semibold text-slate-900">Simple contact</div>
                <div>No built-in chat</div>
              </div>
            </div>
          </section>

          {/* Right-side card */}
          <aside className="rounded-2xl border border-blue-100 bg-white p-6 shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">How it works</h2>
            <ol className="mt-4 space-y-4 text-sm text-slate-700">
              <li className="flex gap-3">
                <div className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-blue-600 text-white font-bold">
                  1
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Create a profile</div>
                  <div className="text-slate-600">
                    List your skills, interests, and availability.
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-blue-600 text-white font-bold">
                  2
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Find a project and request to join</div>
                  <div className="text-slate-600">
                    Search and filter, then submit a join request.
                  </div>
                </div>
              </li>
              <li className="flex gap-3">
                <div className="grid h-7 w-7 flex-none place-items-center rounded-lg bg-blue-600 text-white font-bold">
                  3
                </div>
                <div>
                  <div className="font-semibold text-slate-900">Hear back and collaborate via email</div>
                  <div className="text-slate-600">
                    Project owners accept or reject requests, and you’ll be notified. If accepted, you’ll coordinate through email.
                  </div>
                </div>
              </li>
            </ol>

            {/* removed: "Keeps listings fresh" section */}
          </aside>
        </div>

        {/* Footer */}
        <footer className="mt-14 border-t border-blue-100 pt-6 text-xs text-slate-600">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>© {new Date().getFullYear()} CWRU Collaboration Team</div>
            <div className="flex gap-4">
              <span>Moderated for safety</span>
              <span>Students-only access</span>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}