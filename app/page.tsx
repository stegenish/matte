import Link from "next/link";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-yellow-100 py-16">
      <h1
        className="text-center px-6 leading-tight font-black tracking-wide"
        style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive" }}
      >
        <span className="block text-6xl md:text-8xl text-pink-500 drop-shadow-md mb-2">
          Hei
        </span>
        <span className="block text-7xl md:text-9xl text-green-500 drop-shadow-lg">
          Lineus<span className="text-orange-400">,</span>
        </span>
        <span className="block text-7xl md:text-9xl text-pink-400 drop-shadow-lg">
          Lily
        </span>
        <span className="block text-6xl md:text-8xl text-blue-500 drop-shadow-lg mt-1">
          og Kian!
        </span>
      </h1>
      <p className="mt-10 text-5xl">🌟🎉✨</p>
      <Link
        href="/oppgaver"
        className="mt-12 bg-green-500 hover:bg-green-600 active:bg-green-700 text-white text-3xl font-black px-12 py-5 rounded-3xl border-4 border-green-700 transition-colors shadow-lg"
        style={{ fontFamily: "'Comic Sans MS', 'Chalkboard SE', cursive" }}
      >
        Start!
      </Link>
    </main>
  );
}
