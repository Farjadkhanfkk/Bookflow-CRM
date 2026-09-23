'use client';
export default function ErrorPage({reset}:{reset:()=>void}){return <main className="mx-auto max-w-xl p-10 space-y-6"><h1 className="text-4xl font-serif">Something went wrong</h1><p>Please try again in a moment.</p><button className="action-button" onClick={reset}>Try again</button></main>;}
