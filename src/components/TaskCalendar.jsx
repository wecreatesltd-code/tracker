import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon } from 'lucide-react';

export default function TaskCalendar({ tasks }) {
    const [currentDate, setCurrentDate] = useState(new Date());

    const getDaysInMonth = (year, month) => {
        return new Date(year, month + 1, 0).getDate();
    };

    const getFirstDayOfMonth = (year, month) => {
        return new Date(year, month, 1).getDay();
    };

    const handlePrevMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
    };

    const handleNextMonth = () => {
        setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
    };

    const renderCalendar = () => {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = getDaysInMonth(year, month);
        const firstDay = getFirstDayOfMonth(year, month);
        const days = [];

        // Month names
        const monthNames = [
            "January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"
        ];

        // Weekday headers
        const weekDays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
        const weekDaysShort = ["S", "M", "T", "W", "T", "F", "S"];

        // Add empty cells for days before the 1st of the month
        for (let i = 0; i < firstDay; i++) {
            days.push(<div key={`empty-${i}`} className="h-16 sm:h-24 md:h-32 border border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/30"></div>);
        }

        // Add cells for each day of the month
        for (let day = 1; day <= daysInMonth; day++) {
            const dayString = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayTasks = tasks.filter(task => task.deadline === dayString);
            const isToday = new Date().toDateString() === new Date(year, month, day).toDateString();

            days.push(
                <div key={day} className={`h-16 sm:h-24 md:h-32 border border-slate-100 dark:border-slate-800 p-1 sm:p-2 overflow-y-auto custom-scrollbar hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors ${isToday ? 'bg-primary/5' : 'bg-white dark:bg-slate-900'}`}>
                    <div className="flex justify-between items-start mb-0.5 sm:mb-2">
                        <span className={`text-[10px] sm:text-sm font-bold w-5 h-5 sm:w-7 sm:h-7 flex items-center justify-center rounded-full ${isToday ? 'bg-primary text-white shadow-lg shadow-primary/30' : 'text-slate-700 dark:text-slate-300'}`}>
                            {day}
                        </span>
                        {dayTasks.length > 0 && (
                            <span className="text-[8px] sm:text-[10px] font-black bg-slate-100 dark:bg-slate-800 text-slate-500 px-1 sm:px-1.5 py-0.5 rounded-md">
                                {dayTasks.length}
                            </span>
                        )}
                    </div>
                    <div className="space-y-0.5 sm:space-y-1">
                        {dayTasks.slice(0, window.innerWidth < 640 ? 1 : 3).map(task => (
                            <div
                                key={task.id}
                                className={`text-[8px] sm:text-[10px] p-0.5 sm:p-1.5 rounded-md sm:rounded-lg border truncate font-medium cursor-help transition-all hover:scale-105 ${task.status === 'done'
                                    ? 'bg-green-50 text-green-700 border-green-100 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30 opacity-70'
                                    : task.priority === 'High'
                                        ? 'bg-red-50 text-red-700 border-red-100 dark:bg-red-900/20 dark:text-red-400 dark:border-red-900/30'
                                        : 'bg-white text-slate-700 border-slate-100 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700 shadow-sm'
                                    }`}
                                title={`${task.title} - ${task.projectName}`}
                            >
                                {task.title}
                            </div>
                        ))}
                        {dayTasks.length > (window.innerWidth < 640 ? 1 : 3) && (
                            <div className="text-[8px] sm:text-[10px] text-slate-400 font-bold text-center">
                                +{dayTasks.length - (window.innerWidth < 640 ? 1 : 3)} more
                            </div>
                        )}
                    </div>
                </div>
            );
        }

        return (
            <div className="bg-white dark:bg-slate-900 rounded-2xl sm:rounded-[2.5rem] border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden animate-in fade-in duration-500">
                <div className="p-3 sm:p-6 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2 sm:gap-4">
                        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-primary/10 dark:bg-primary/20 rounded-xl sm:rounded-2xl flex items-center justify-center text-primary">
                            <CalendarIcon size={18} className="sm:hidden" />
                            <CalendarIcon size={24} className="hidden sm:block" />
                        </div>
                        <div>
                            <h2 className="text-base sm:text-xl font-bold text-slate-900 dark:text-white capitalize transition-colors">
                                {monthNames[month]} {year}
                            </h2>
                            <p className="text-slate-500 dark:text-slate-400 text-xs sm:text-sm font-medium transition-colors">
                                {tasks.filter(t => t.deadline?.startsWith(`${year}-${String(month + 1).padStart(2, '0')}`)).length} deadlines this month
                            </p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1 sm:gap-2 bg-slate-100 dark:bg-slate-800 p-1 sm:p-1.5 rounded-lg sm:rounded-xl">
                        <button onClick={handlePrevMonth} className="p-1.5 sm:p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md sm:rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-all shadow-sm">
                            <ChevronLeft size={18} className="sm:hidden" />
                            <ChevronLeft size={20} className="hidden sm:block" />
                        </button>
                        <button onClick={handleNextMonth} className="p-1.5 sm:p-2 hover:bg-white dark:hover:bg-slate-700 rounded-md sm:rounded-lg text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white transition-all shadow-sm">
                            <ChevronRight size={18} className="sm:hidden" />
                            <ChevronRight size={20} className="hidden sm:block" />
                        </button>
                    </div>
                </div>

                {/* Full weekday names on sm+, single letter on mobile */}
                <div className="grid grid-cols-7 bg-slate-50/50 dark:bg-slate-800/50 border-b border-slate-100 dark:border-slate-800">
                    {weekDays.map((day, idx) => (
                        <div key={day} className="py-2 sm:py-3 text-center text-[10px] sm:text-xs font-black uppercase tracking-widest text-slate-400">
                            <span className="sm:hidden">{weekDaysShort[idx]}</span>
                            <span className="hidden sm:inline">{day}</span>
                        </div>
                    ))}
                </div>

                <div className="grid grid-cols-7 bg-slate-100 dark:bg-slate-800 gap-[1px]">
                    {days}
                </div>
            </div>
        );
    };

    return renderCalendar();
}
