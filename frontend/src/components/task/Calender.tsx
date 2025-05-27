import { useEffect, useState, useRef } from "react";
import useTaskStore from "../../store/taskStore";
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventDropArg, EventClickArg } from '@fullcalendar/core';
import TaskModal from "./TaskModal";
import Select from 'react-select';
import { ChevronLeftIcon, ChevronRightIcon, CalendarDaysIcon } from '@heroicons/react/24/outline';

const CALENDAR_VIEW_STORAGE_KEY = 'calendarView';

// Month options for dropdown
const MONTHS = [
  { value: 0, label: 'January' },
  { value: 1, label: 'February' },
  { value: 2, label: 'March' },
  { value: 3, label: 'April' },
  { value: 4, label: 'May' },
  { value: 5, label: 'June' },
  { value: 6, label: 'July' },
  { value: 7, label: 'August' },
  { value: 8, label: 'September' },
  { value: 9, label: 'October' },
  { value: 10, label: 'November' },
  { value: 11, label: 'December' }
];

// Generate year options (5 years back and 5 years forward)
const generateYearOptions = () => {
  const currentYear = new Date().getFullYear();
  const years = [];
  for (let year = currentYear - 5; year <= currentYear + 5; year++) {
    years.push({ value: year, label: year.toString() });
  }
  return years;
};

// Modern custom styles for react-select
const selectStyles = {
  control: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: state.isFocused ? '0 0 0 3px rgba(99, 102, 241, 0.1)' : '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
    '&:hover': {
      borderColor: '#6366f1'
    },
    minHeight: '40px',
    fontSize: '14px',
    fontWeight: '500',
    transition: 'all 0.2s ease-in-out'
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: 'white',
    border: '2px solid #e5e7eb',
    borderRadius: '12px',
    boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    zIndex: 9999,
    overflow: 'hidden'
  }),
  menuPortal: (provided: any) => ({
    ...provided,
    zIndex: 9999
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected 
      ? '#6366f1' 
      : state.isFocused 
        ? '#f8fafc' 
        : 'white',
    color: state.isSelected ? 'white' : '#374151',
    fontWeight: state.isSelected ? '600' : '500',
    padding: '12px 16px',
    '&:hover': {
      backgroundColor: state.isSelected ? '#6366f1' : '#f8fafc'
    },
    transition: 'all 0.1s ease-in-out'
  }),
  singleValue: (provided: any) => ({
    ...provided,
    color: '#374151',
    fontWeight: '500'
  }),
  placeholder: (provided: any) => ({
    ...provided,
    color: '#9ca3af',
    fontWeight: '400'
  })
};

// Helper function to get task initials
const getTaskInitials = (title: string) => {
  return title
    .split(' ')
    .map(word => word.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2);
};

const Calendar = () => {
  const { calendarTasks, fetchCalendarTasks, updateTaskDueDate } = useTaskStore();
  const calendarRef = useRef<FullCalendar>(null);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [selectedTaskIdForEdit, setSelectedTaskIdForEdit] = useState<number | null>(null);
  const [selectedMonth, setSelectedMonth] = useState<{ value: number; label: string } | null>(null);
  const [selectedYear, setSelectedYear] = useState<{ value: number; label: string } | null>(null);

  const getInitialView = () => {
    return localStorage.getItem(CALENDAR_VIEW_STORAGE_KEY) || 'dayGridMonth';
  };

  const [currentView, setCurrentView] = useState('dayGridMonth');
  const [events, setEvents] = useState(calendarTasks.map(task => {
    const dueDate = task.due_date || new Date().toISOString().split('T')[0];
    // Remove time data and make all events all-day
    const eventDate = dueDate.split('T')[0];
    
    return {
      id: task.id.toString(),
      title: task.title,
      start: eventDate,
      allDay: true,
      extendedProps: {
        initials: getTaskInitials(task.title)
      }
    };
  }));

  // Update calendar date selection when month/year dropdowns change
  useEffect(() => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi && selectedMonth !== null && selectedYear !== null) {
      const newDate = new Date(selectedYear.value, selectedMonth.value, 1);
      calendarApi.gotoDate(newDate);
    }
  }, [selectedMonth, selectedYear]);

  // Initialize month/year based on current date
  useEffect(() => {
    const currentDate = new Date();
    setSelectedMonth(MONTHS[currentDate.getMonth()]);
    setSelectedYear({ 
      value: currentDate.getFullYear(), 
      label: currentDate.getFullYear().toString() 
    });
  }, []);

  useEffect(() => {
    fetchCalendarTasks();
  }, [fetchCalendarTasks]);

  // Update events whenever calendarTasks changes
  useEffect(() => {
    setEvents(calendarTasks.map(task => {
      const dueDate = task.due_date || new Date().toISOString().split('T')[0];
      // Remove time data and make all events all-day
      const eventDate = dueDate.split('T')[0];
      
      return {
        id: task.id.toString(),
        title: task.title,
        start: eventDate,
        allDay: true,
        extendedProps: {
          initials: getTaskInitials(task.title)
        }
      };
    }));
  }, [calendarTasks]);

  const handleEventDrop = (info: EventDropArg) => {
    const task = calendarTasks.find(task => task.id.toString() === info.event.id);
    if (task) {
      const updatedTask = {
        ...task,
        due_date: info.event.startStr,
      };
      updateTaskDueDate(updatedTask);
    }
  };

  const handleEventClick = (clickInfo: EventClickArg) => {
    const taskId = parseInt(clickInfo.event.id, 10);
    setSelectedTaskIdForEdit(taskId);
    setIsTaskModalOpen(true);
  };

  const closeTaskModal = () => {
    setIsTaskModalOpen(false);
    setSelectedTaskIdForEdit(null);
    // Make sure to fetch tasks to reflect any due date changes
    fetchCalendarTasks();
  };

  // Navigation methods
  const goToToday = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.today();
      
      // Update month/year dropdowns
      const currentDate = calendarApi.getDate();
      setSelectedMonth(MONTHS[currentDate.getMonth()]);
      setSelectedYear({ 
        value: currentDate.getFullYear(), 
        label: currentDate.getFullYear().toString() 
      });
    }
  };

  const goToPrev = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.prev();
      
      // Update month/year dropdowns
      const currentDate = calendarApi.getDate();
      setSelectedMonth(MONTHS[currentDate.getMonth()]);
      setSelectedYear({ 
        value: currentDate.getFullYear(), 
        label: currentDate.getFullYear().toString() 
      });
    }
  };

  const goToNext = () => {
    const calendarApi = calendarRef.current?.getApi();
    if (calendarApi) {
      calendarApi.next();
      
      // Update month/year dropdowns
      const currentDate = calendarApi.getDate();
      setSelectedMonth(MONTHS[currentDate.getMonth()]);
      setSelectedYear({ 
        value: currentDate.getFullYear(), 
        label: currentDate.getFullYear().toString() 
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50 p-2 sm:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header Section */}
        <div className="flex flex-wrap justify-between items-center mb-4 sm:mb-8">
          <div className="flex items-center space-x-3">
            <div className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-xl shadow-lg">
              <CalendarDaysIcon className="w-5 h-5 sm:w-6 sm:h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl sm:text-3xl font-bold text-gray-900">Calendar</h1>
              <p className="text-sm sm:text-base text-gray-600 mt-1 hidden sm:block">Manage your tasks and deadlines</p>
            </div>
          </div>
        </div>

        {/* Modern Navigation and Controls */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 p-3 sm:p-6 mb-4 sm:mb-8">
          <div className="flex flex-col sm:flex-row justify-between items-center space-y-3 sm:space-y-0">
            {/* Navigation Controls */}
            <div className="flex items-center space-x-2 sm:space-x-3">
              <button 
                onClick={goToPrev}
                className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                aria-label="Previous"
              >
                <ChevronLeftIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
              
              <button 
                onClick={goToToday}
                className="px-4 py-2 sm:px-6 sm:py-3 rounded-lg sm:rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold hover:from-indigo-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105 text-sm sm:text-base"
              >
                Today
              </button>
              
              <button 
                onClick={goToNext}
                className="flex items-center justify-center w-10 h-10 sm:w-12 sm:h-12 rounded-lg sm:rounded-xl bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:text-indigo-700 transition-all duration-200 shadow-sm hover:shadow-md transform hover:scale-105"
                aria-label="Next"
              >
                <ChevronRightIcon className="h-4 w-4 sm:h-5 sm:w-5" />
              </button>
            </div>

            {/* Date Selection */}
            <div className="flex items-center space-x-2 sm:space-x-4 w-full sm:w-auto">
              <div className="flex-1 sm:flex-none sm:w-40 lg:w-48">
                <Select
                  value={selectedMonth}
                  onChange={(option) => setSelectedMonth(option)}
                  options={MONTHS}
                  placeholder="Month"
                  isSearchable={true}
                  styles={selectStyles}
                  classNamePrefix="react-select"
                  menuPlacement="auto"
                  menuPortalTarget={document.body}
                />
              </div>
              <div className="flex-1 sm:flex-none sm:w-28 lg:w-36">
                <Select
                  value={selectedYear}
                  onChange={(option) => setSelectedYear(option)}
                  options={generateYearOptions()}
                  placeholder="Year"
                  isSearchable={true}
                  styles={selectStyles}
                  classNamePrefix="react-select"
                  menuPlacement="auto"
                  menuPortalTarget={document.body}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Calendar Container */}
        <div className="bg-white rounded-xl sm:rounded-2xl shadow-xl border border-gray-200/50 overflow-hidden">
          <div className="p-2 sm:p-8">
            <FullCalendar
              ref={calendarRef}
              plugins={[dayGridPlugin, interactionPlugin]}
              initialView="dayGridMonth"
              headerToolbar={false}
              events={events}
              editable={true}
              droppable={true}
              eventDrop={handleEventDrop}
              eventClick={handleEventClick}
              height="auto"
              aspectRatio={window.innerWidth < 768 ? 1 : 1.8}
              dayMaxEvents={window.innerWidth < 768 ? 2 : 3}
              moreLinkClick="popover"
              eventDisplay="block"
              eventBackgroundColor="#6366f1"
              eventBorderColor="#6366f1"
              eventTextColor="#ffffff"
              dayCellClassNames="hover:bg-gray-50 transition-colors duration-200 cursor-pointer border-gray-100"
              eventClassNames="rounded-lg shadow-sm hover:shadow-md transition-shadow duration-200 font-medium text-xs sm:text-sm px-1 sm:px-2 py-1"
              eventContent={(eventInfo) => {
                const isMobile = window.innerWidth < 768;
                return {
                  html: `<div class="task-event-content">${isMobile ? eventInfo.event.extendedProps.initials : eventInfo.event.title}</div>`
                };
              }}
            />
          </div>
        </div>

        {/* Task Modal */}
        {isTaskModalOpen && selectedTaskIdForEdit && (
          <TaskModal
            taskId={selectedTaskIdForEdit}
            onClose={closeTaskModal}
          />
        )}
      </div>

      {/* Custom CSS for FullCalendar styling */}
      <style>{`
        .fc {
          font-family: 'Inter', sans-serif;
        }
        
        .fc-theme-standard .fc-scrollgrid {
          border: none;
        }
        
        .fc-theme-standard td, 
        .fc-theme-standard th {
          border-color: #f1f5f9;
          border-width: 1px;
        }
        
        .fc-col-header-cell {
          background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
          font-weight: 600;
          color: #475569;
          padding: 8px 4px;
          text-transform: uppercase;
          font-size: 10px;
          letter-spacing: 0.05em;
        }
        
        @media (min-width: 640px) {
          .fc-col-header-cell {
            padding: 16px 8px;
            font-size: 12px;
          }
        }
        
        .fc-daygrid-day {
          min-height: 80px;
          background: white;
          position: relative;
        }
        
        @media (min-width: 640px) {
          .fc-daygrid-day {
            min-height: 120px;
          }
        }
        
        .fc-daygrid-day-number {
          font-weight: 600;
          color: #374151;
          padding: 6px;
          font-size: 14px;
        }
        
        @media (min-width: 640px) {
          .fc-daygrid-day-number {
            padding: 12px;
            font-size: 16px;
          }
        }
        
        .fc-day-today {
          background: linear-gradient(135deg, #eef2ff 0%, #e0e7ff 100%) !important;
        }
        
        .fc-day-today .fc-daygrid-day-number {
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
          color: white;
          border-radius: 8px;
          width: 24px;
          height: 24px;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 4px;
        }
        
        @media (min-width: 640px) {
          .fc-day-today .fc-daygrid-day-number {
            border-radius: 10px;
            width: 32px;
            height: 32px;
            margin: 8px;
          }
        }
        
        .fc-event {
          border-radius: 6px !important;
          border: none !important;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1) !important;
          font-weight: 500 !important;
          margin: 1px 2px !important;
          padding: 2px 4px !important;
          background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%) !important;
          font-size: 10px !important;
        }
        
        @media (min-width: 640px) {
          .fc-event {
            border-radius: 8px !important;
            margin: 2px 4px !important;
            padding: 4px 8px !important;
            font-size: 13px !important;
          }
        }
        
        .fc-event:hover {
          box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
          transform: translateY(-1px);
          transition: all 0.2s ease;
        }
        
        .task-event-content {
          font-weight: 500;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
        }
        
        .fc-more-link {
          color: #6366f1 !important;
          font-weight: 600 !important;
          text-decoration: none !important;
          padding: 2px 4px !important;
          border-radius: 4px !important;
          background: #f0f9ff !important;
          margin: 1px 2px !important;
          font-size: 10px !important;
        }
        
        @media (min-width: 640px) {
          .fc-more-link {
            padding: 4px 8px !important;
            border-radius: 6px !important;
            margin: 2px 4px !important;
            font-size: 12px !important;
          }
        }
        
        .fc-more-link:hover {
          background: #e0f2fe !important;
          transform: translateY(-1px);
        }
        
        .fc-daygrid-day:hover {
          background: #fafbfc !important;
        }
        
        .fc-day-other .fc-daygrid-day-number {
          color: #9ca3af !important;
        }
        
        .fc-scrollgrid-sync-table {
          border-radius: 8px;
          overflow: hidden;
        }
        
        @media (min-width: 640px) {
          .fc-scrollgrid-sync-table {
            border-radius: 12px;
          }
        }
      `}</style>
    </div>
  );
};

export default Calendar;