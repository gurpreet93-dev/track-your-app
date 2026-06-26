export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950">
      
      {/* Glowing background orbs - purely decorative */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500 opacity-20 rounded-full blur-3xl"></div>
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-600 opacity-15 rounded-full blur-3xl"></div>

      <div className="max-w-xl w-full text-center relative z-10">
        
        <h1 className="text-4xl sm:text-5xl font-semibold text-white mb-4">
          Track Your App
        </h1>

        <p className="text-lg text-slate-400 mb-8">
          We monitor your app's Google Play and App Store reviews every day,
          flag critical bugs using AI, and send you a digest before they
          spiral out of control.
        </p>

        <form className="flex flex-col sm:flex-row gap-3 justify-center">
          <input
            type="email"
            placeholder="you@example.com"
            className="bg-slate-900 border border-slate-700 rounded-lg px-4 py-3 w-full sm:w-80 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          />
          <button
            type="submit"
            className="bg-orange-600 hover:bg-orange-700 text-white font-medium px-6 py-3 rounded-lg transition-colors"
          >
            Get early access
          </button>
        </form>

        <p className="text-sm text-slate-500 mt-4">
          No spam. Just the reviews that matter.
        </p>

      </div>
    </main>
  );
}
