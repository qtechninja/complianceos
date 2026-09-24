export function LoadingSpinner({ size = 'md' }) {
  const s = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  return (
    <div className={`animate-spin rounded-full border-2 border-gray-200 border-t-primary-600 ${s}`} />
  );
}

export function LoadingPage() {
  return (
    <div className="flex items-center justify-center py-24">
      <LoadingSpinner size="lg" />
    </div>
  );
}

export function SkeletonCard() {
  return (
    <div className="card animate-pulse">
      <div className="card-body space-y-3">
        <div className="h-4 bg-gray-200 rounded w-1/3" />
        <div className="h-8 bg-gray-200 rounded w-1/2" />
        <div className="h-3 bg-gray-200 rounded w-2/3" />
      </div>
    </div>
  );
}
