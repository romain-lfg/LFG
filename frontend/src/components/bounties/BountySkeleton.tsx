export default function BountySkeleton() {
  return (
    <div className="flex flex-col p-6 rounded-xl border border-indigo-900/50 bg-gradient-to-b from-indigo-950/50 to-transparent min-h-[24rem] animate-pulse">
      <div className="flex-1">
        <div className="flex justify-between items-start mb-4">
          <div className="h-7 bg-indigo-900/50 rounded w-2/3"></div>
          <div className="h-6 w-24 bg-indigo-900/50 rounded-full"></div>
        </div>
        <div className="space-y-2 mb-4">
          <div className="h-4 bg-indigo-900/50 rounded w-full"></div>
          <div className="h-4 bg-indigo-900/50 rounded w-5/6"></div>
        </div>
        <div className="flex flex-wrap gap-2 mb-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-6 w-20 bg-indigo-900/50 rounded-full"></div>
          ))}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-indigo-900/50">
        <div className="flex justify-between items-center">
          <div className="h-5 w-24 bg-indigo-900/50 rounded"></div>
          <div className="h-5 w-32 bg-indigo-900/50 rounded"></div>
        </div>
      </div>
    </div>
  );
}
