import { TrashIcon, XMarkIcon } from '@heroicons/react/24/outline';

interface ConfirmationDialogProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmButtonText?: string;
  confirmButtonClass?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isLoading?: boolean;
  icon?: React.ReactNode;
}

const ConfirmationDialog = ({
  isOpen,
  title,
  message,
  confirmButtonText = 'Confirm',
  confirmButtonClass = 'bg-red-500 hover:bg-red-600',
  onConfirm,
  onCancel,
  isLoading = false,
  icon
}: ConfirmationDialogProps) => {
  if (!isOpen) return null;

  const defaultIcon = <TrashIcon className="h-8 w-8 text-red-600" />;

  return (
    <div className="fixed inset-0 bg-slate-600/60 backdrop-blur-sm overflow-y-auto h-full w-full z-50 flex justify-center items-center p-4">
      <div className="relative mx-auto border border-slate-200 w-full max-w-md shadow-2xl rounded-2xl bg-white">
        <div className="p-6 text-center">
          <div className="mx-auto flex items-center justify-center h-16 w-16 rounded-full bg-red-100 mb-4">
            {icon || defaultIcon}
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">{title}</h3>
          <div className="mb-6">
            <p className="text-slate-600">{message}</p>
          </div>
          <div className="flex items-center justify-center space-x-3">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={`px-6 py-3 ${confirmButtonClass} disabled:bg-red-300 text-white text-sm font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-md disabled:cursor-not-allowed`}
            >
              {isLoading ? 'Processing...' : confirmButtonText}
            </button>
            <button
              onClick={onCancel}
              disabled={isLoading}
              className="px-6 py-3 bg-slate-100 hover:bg-slate-200 disabled:bg-slate-50 text-slate-700 text-sm font-medium rounded-xl transition-all duration-200 disabled:cursor-not-allowed"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ConfirmationDialog; 