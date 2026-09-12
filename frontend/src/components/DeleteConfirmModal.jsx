import React from 'react';

export default function DeleteConfirmModal({ show, title, onConfirm, onCancel }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end p-6 pointer-events-none">
      {/* Background overlay that is transparent but allows clicking outside to cancel */}
      <div 
        className="fixed inset-0 bg-transparent pointer-events-auto" 
        onClick={onCancel}
      />
      
      {/* The confirmation card positioned in the top-right corner */}
      <div className="relative bg-paper border border-hair rounded-2xl p-5 shadow-2xl w-80 max-w-sm border-l-4 border-l-red-500 pointer-events-auto animate-slide-in">
        <style>{`
          @keyframes slideInRight {
            from {
              transform: translateX(120%);
              opacity: 0;
            }
            to {
              transform: translateX(0);
              opacity: 1;
            }
          }
          .animate-slide-in {
            animation: slideInRight 0.3s cubic-bezier(0.16, 1, 0.3, 1) forwards;
          }
        `}</style>

        <div className="flex items-start gap-3">
          <div className="h-8 w-8 rounded-full bg-red-50 text-red-500 flex items-center justify-center shrink-0 font-bold text-lg font-mono">
            !
          </div>
          <div>
            <h4 className="font-display font-bold text-ink text-md">Confirm Deletion</h4>
            <p className="text-muted text-xs mt-1.5 leading-relaxed">
              Are you sure you want to delete <span className="font-semibold text-ink">"{title || 'this item'}"</span>? This action cannot be undone.
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 mt-5 pt-3 border-t border-hair">
          <button
            type="button"
            onClick={onCancel}
            className="px-3.5 py-1.5 rounded-full border border-hair text-muted hover:text-ink hover:bg-teal-light/20 text-xs font-semibold transition-colors"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-1.5 rounded-full bg-red-600 text-white hover:bg-red-700 text-xs font-semibold transition-colors shadow-sm"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
