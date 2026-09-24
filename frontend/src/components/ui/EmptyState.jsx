import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title = 'Nothing here yet', message, action, actionLabel }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
      <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
        <Icon className="w-7 h-7 text-gray-400" />
      </div>
      <h3 className="text-base font-semibold text-gray-900 mb-1">{title}</h3>
      {message && <p className="text-sm text-gray-500 max-w-sm mb-4">{message}</p>}
      {action && (
        <button onClick={action} className="btn-primary text-sm">
          {actionLabel || 'Get started'}
        </button>
      )}
    </div>
  );
}
