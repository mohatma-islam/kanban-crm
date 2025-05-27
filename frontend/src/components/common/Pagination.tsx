import React from 'react';
import { ChevronLeftIcon, ChevronRightIcon, EllipsisHorizontalIcon } from '@heroicons/react/24/outline';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
  onPageChange: (page: number) => void;
  onItemsPerPageChange: (itemsPerPage: number) => void;
  showItemsPerPage?: boolean;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  totalItems,
  itemsPerPage,
  onPageChange,
  onItemsPerPageChange,
  showItemsPerPage = true,
}) => {
  const indexOfFirstItem = (currentPage - 1) * itemsPerPage + 1;
  const indexOfLastItem = Math.min(currentPage * itemsPerPage, totalItems);

  const generatePageNumbers = () => {
    const pageNumbers = [];
    const maxVisiblePages = 5;
    
    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pageNumbers.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pageNumbers.push(1);
        pageNumbers.push('ellipsis');
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pageNumbers.push(i);
        }
      } else {
        pageNumbers.push(1);
        pageNumbers.push('ellipsis');
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pageNumbers.push(i);
        }
        pageNumbers.push('ellipsis');
        pageNumbers.push(totalPages);
      }
    }
    
    return pageNumbers;
  };

  if (totalPages <= 1 && !showItemsPerPage) {
    return null;
  }

  return (
    <div className="bg-white/80 backdrop-blur-sm border border-slate-200/60 rounded-2xl p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between space-y-4 sm:space-y-0">
        {/* Items info and per page selector */}
        <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-6">
          <div className="text-sm text-slate-600">
            Showing <span className="font-medium text-slate-900">{indexOfFirstItem}</span> to{' '}
            <span className="font-medium text-slate-900">{indexOfLastItem}</span> of{' '}
            <span className="font-medium text-slate-900">{totalItems}</span> results
          </div>
          
          {showItemsPerPage && (
            <div className="flex items-center space-x-2">
              <label htmlFor="itemsPerPage" className="text-sm text-slate-600">
                Show:
              </label>
              <select
                id="itemsPerPage"
                value={itemsPerPage}
                onChange={(e) => onItemsPerPageChange(parseInt(e.target.value))}
                className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white/50 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
                <option value={50}>50</option>
              </select>
            </div>
          )}
        </div>

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="flex items-center space-x-2">
            {/* Previous button */}
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <ChevronLeftIcon className="w-4 h-4 mr-1" />
              Previous
            </button>

            {/* Page numbers */}
            <div className="flex items-center space-x-1">
              {generatePageNumbers().map((page, index) => (
                <React.Fragment key={index}>
                  {page === 'ellipsis' ? (
                    <span className="px-3 py-2 text-slate-400">
                      <EllipsisHorizontalIcon className="w-5 h-5" />
                    </span>
                  ) : (
                    <button
                      onClick={() => onPageChange(page as number)}
                      className={`px-3 py-2 text-sm font-medium rounded-lg transition-all duration-200 shadow-sm hover:shadow-md ${
                        currentPage === page
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-600 text-white shadow-md'
                          : 'text-slate-600 bg-white/80 backdrop-blur-sm border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {page}
                    </button>
                  )}
                </React.Fragment>
              ))}
            </div>

            {/* Next button */}
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="inline-flex items-center px-3 py-2 text-sm font-medium text-slate-600 bg-white/80 backdrop-blur-sm border border-slate-200 rounded-lg hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              Next
              <ChevronRightIcon className="w-4 h-4 ml-1" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Pagination; 