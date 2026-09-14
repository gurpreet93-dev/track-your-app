import Link from 'next/link';
import Logo from './Logo';

export default function LegalPage({ title, updated, children }) {
  return (
    <main className="min-h-screen bg-white">
      <nav className="border-b border-gray-100">
        <div className="flex justify-between items-center px-6 sm:px-10 lg:px-16 py-4">
          <Link href="/">
            <Logo size={28} />
          </Link>
          <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-gray-900">
            Log in
          </Link>
        </div>
      </nav>

      <article className="max-w-2xl mx-auto px-6 py-16">
        <h1 className="text-3xl font-semibold text-gray-900 mb-2">{title}</h1>
        {updated && <p className="text-sm text-gray-400 mb-10">Last updated {updated}</p>}
        <div className="space-y-6 text-sm text-gray-700 leading-relaxed [&_h2]:text-base [&_h2]:font-semibold [&_h2]:text-gray-900 [&_h2]:mt-8 [&_h2]:mb-2 [&_a]:text-orange-600 [&_a]:hover:text-orange-700 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1">
          {children}
        </div>

        <Link href="/" className="inline-block text-sm text-gray-500 hover:text-gray-700 mt-12">
          ← Back to home
        </Link>
      </article>
    </main>
  );
}
