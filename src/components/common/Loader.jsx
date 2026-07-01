// src/components/common/Loader.jsx
export default function Loader({ fullscreen = false, size = 'md' }) {
  const sizes = { sm: 'w-5 h-5', md: 'w-8 h-8', lg: 'w-12 h-12' };

  const spinner = (
    <div className={`${sizes[size]} rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin`} />
  );

  if (fullscreen) {
    return (
      <div className="fixed inset-0 bg-surface flex items-center justify-center z-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full border-2 border-primary-500/20 border-t-primary-500 animate-spin" />
          <p className="text-slate-400 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return spinner;
}
