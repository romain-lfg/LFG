interface BountyErrorProps {
  message?: string;
  onRetry: () => void;
}

export default function BountyError({ message = 'Failed to load bounties', onRetry }: BountyErrorProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 rounded-xl border border-red-900/50 bg-gradient-to-b from-red-950/50 to-transparent text-center">
      <svg
        className="w-12 h-12 text-red-500 mb-4"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth="2"
          d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
        />
      </svg>
      <h3 className="text-xl font-bold text-red-500 mb-2">Oops! Something went wrong</h3>
      <p className="text-gray-300 mb-4">{message}</p>
      <button
        onClick={onRetry}
        className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors"
      >
        Try Again
      </button>
    </div>
  );
}
