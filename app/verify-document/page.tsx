import DocumentFactChecker from '../../components/DocumentFactChecker';
import Link from 'next/link';

export default function VerifyDocument() {
  return (
    <div className="flex flex-col min-h-screen z-0 relative w-full">
      {/* Texture Overlay */}
      <div className="bg-grain absolute inset-0 pointer-events-none opacity-50 mix-blend-multiply"></div>

      <div className="flex justify-between items-center w-full max-w-5xl mx-auto pt-8 px-6 opacity-0 animate-fade-up">
        <div className="text-sm font-bold tracking-widest uppercase text-gray-400">
          Document Verification
        </div>
        <Link href="/" className="text-white font-medium bg-gray-900 hover:bg-gray-800 hover:-translate-y-0.5 px-6 py-2.5 rounded-xl transition-all flex items-center gap-2 text-sm shadow-sm group">
          <span className="group-hover:-translate-x-1 transition-transform inline-block">←</span> Back to Home
        </Link>
      </div>

      <div className="w-full max-w-5xl mx-auto pt-20 pb-12 px-6 opacity-0 animate-fade-up [animation-delay:200ms]">
        <h1 className="text-5xl md:text-7xl font-black tracking-tighter text-gray-900 mb-4">
          Truth<span className="font-light font-serif italic text-gray-500">Lens.</span>
        </h1>
        <p className="text-2xl md:text-3xl font-serif text-gray-400 max-w-2xl leading-snug">
          Verify against <span className="italic">your own documents.</span>
        </p>
      </div>

      <main className="flex flex-col flex-grow w-full max-w-5xl mx-auto px-6">
        <DocumentFactChecker />
      </main>

      <footer className="w-full max-w-5xl mx-auto px-6 py-12 text-xs text-gray-500 mt-auto opacity-0 animate-fade-up [animation-delay:800ms] flex flex-col md:flex-row justify-between items-start md:items-center border-t border-gray-900">
        <p className="mb-2 md:mb-0">TruthLens © 2026</p>
        <p>Engine: <code className="bg-[#141414] border border-gray-800 text-gray-400 px-2 py-1 rounded-md font-mono text-[10px]">nli-distilroberta-base</code></p>
      </footer>
    </div>
  );
}
