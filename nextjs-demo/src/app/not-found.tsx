import Link from "next/link";

export default function NotFound() {
  return (
    <div className="min-h-dvh flex flex-col items-center justify-center gap-4 px-4 text-center">
      <h1 className="text-6xl font-extrabold text-slate-900 dark:text-white">404</h1>
      <p className="text-lg text-slate-500 dark:text-slate-400">Page not found</p>
      <Link
        href="/"
        className="mt-2 bg-indigo-600 text-white hover:bg-indigo-700 px-6 py-2.5 rounded-lg font-medium transition-colors"
      >
        Go home
      </Link>
    </div>
  );
}
