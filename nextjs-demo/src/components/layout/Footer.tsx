export function Footer() {
  return (
    <footer className="border-t border-slate-200 dark:border-slate-700 py-6 px-4 md:px-6 text-center text-sm text-slate-500 dark:text-slate-400">
      <p>
        Built with{" "}
        <a
          href="https://www.npmjs.com/package/quick-chat-react"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline"
        >
          quick-chat-react
        </a>{" "}
        ·{" "}
        <a
          href="https://nextjs.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline"
        >
          Next.js 15
        </a>{" "}
        ·{" "}
        <a
          href="https://supabase.com"
          target="_blank"
          rel="noopener noreferrer"
          className="text-indigo-600 hover:underline"
        >
          Supabase
        </a>
      </p>
    </footer>
  );
}
