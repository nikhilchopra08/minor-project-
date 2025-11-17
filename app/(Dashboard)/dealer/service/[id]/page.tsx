'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Calendar, Save, RefreshCw, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '@/frontend-lib/api';

interface Availability {
  id: string;
  date: string;
  isAvailable: boolean;
}

export default function DealerAvailabilityPage() {
  const router = useRouter();
  const [availability, setAvailability] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [selectedMonth, setSelectedMonth] = useState(new Date());

  // Get current month dates
  const getMonthDates = () => {
    const year = selectedMonth.getFullYear();
    const month = selectedMonth.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    
    const dates = [];
    const currentDate = new Date(firstDay);
    
    while (currentDate <= lastDay) {
      dates.push(new Date(currentDate));
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    return dates;
  };

  const monthDates = getMonthDates();

  // Fetch availability for the current month
  const fetchAvailability = async () => {
    try {
      setLoading(true);
      const startDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), 1);
      const endDate = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1, 0);

      // Use apiClient to call the availability API
      const response = await apiClient.get(
        `/api/dealer/availability?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`
      );
      
      const data = await response.json();
      setAvailability(data.availability || []);
    } catch (error: any) {
      console.error('Error fetching availability:', error);
      if (error.message === 'Unauthorized') {
        setMessage({ type: 'error', text: 'Please log in to manage availability' });
      } else {
        setMessage({ type: 'error', text: 'Failed to load availability' });
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAvailability();
  }, [selectedMonth]);

  const toggleAvailability = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const existing = availability.find(a => a.date.split('T')[0] === dateString);
    
    const newAvailability = existing 
      ? availability.map(a => 
          a.date.split('T')[0] === dateString 
            ? { ...a, isAvailable: !a.isAvailable }
            : a
        )
      : [...availability, { 
          id: `temp-${dateString}`, 
          date: dateString, 
          isAvailable: true 
        }];

    setAvailability(newAvailability);
    setMessage(null);
  };

  const saveAvailability = async () => {
    try {
      setSaving(true);
      
      // Get dates that changed
      const changes = availability.filter(avail => {
        const original = availability.find(a => a.date === avail.date);
        return !original || original.isAvailable !== avail.isAvailable;
      });

      if (changes.length === 0) {
        setMessage({ type: 'success', text: 'No changes to save' });
        return;
      }

      // Update each changed date individually using POST
      for (const change of changes) {
        const response = await apiClient.post('/api/dealer/availability', {
          date: change.date,
          isAvailable: change.isAvailable,
        });
        
        if (!response.ok) {
          throw new Error('Failed to save availability');
        }
      }

      setMessage({ type: 'success', text: `Updated ${changes.length} date(s) successfully!` });
      await fetchAvailability(); // Refresh data
    } catch (error: any) {
      console.error('Error saving availability:', error);
      if (error.message === 'Unauthorized') {
        setMessage({ type: 'error', text: 'Session expired. Please log in again.' });
      } else {
        setMessage({ type: 'error', text: 'Failed to save availability' });
      }
    } finally {
      setSaving(false);
    }
  };

  const bulkUpdateAvailability = async (dates: Date[], isAvailable: boolean) => {
    try {
      setSaving(true);
      
      const dateStrings = dates.map(date => date.toISOString().split('T')[0]);
      
      const response = await apiClient.put('/api/dealer/availability', {
        dates: dateStrings,
        isAvailable,
      });

      if (!response.ok) {
        throw new Error('Failed to update availability');
      }

      setMessage({ type: 'success', text: `Updated ${dateStrings.length} dates successfully!` });
      await fetchAvailability(); // Refresh data
    } catch (error: any) {
      console.error('Error bulk updating availability:', error);
      setMessage({ type: 'error', text: 'Failed to update availability' });
    } finally {
      setSaving(false);
    }
  };

  const isDateAvailable = (date: Date) => {
    const dateString = date.toISOString().split('T')[0];
    const avail = availability.find(a => a.date.split('T')[0] === dateString);
    return avail ? avail.isAvailable : false;
  };

  const isPastDate = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newMonth = new Date(selectedMonth);
    newMonth.setMonth(selectedMonth.getMonth() + (direction === 'next' ? 1 : -1));
    setSelectedMonth(newMonth);
  };

  const getDayName = (date: Date) => {
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  // Quick action handlers
  const markWeekdaysAvailable = () => {
    const weekdays = monthDates.filter(date => 
      date.getDay() !== 0 && date.getDay() !== 6 && !isPastDate(date)
    );
    bulkUpdateAvailability(weekdays, true);
  };

  const markAllAvailable = () => {
    const allDates = monthDates.filter(date => !isPastDate(date));
    bulkUpdateAvailability(allDates, true);
  };

  const markAllUnavailable = () => {
    const allDates = monthDates.filter(date => !isPastDate(date));
    bulkUpdateAvailability(allDates, false);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto"></div>
            <p className="mt-4 text-green-700">Loading availability...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Manage Your Availability
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Toggle dates on/off to control when customers can book your services
          </p>
          
          {/* Month Navigation */}
          <div className="flex items-center justify-between max-w-md mx-auto mb-8">
            <button
              onClick={() => navigateMonth('prev')}
              className="p-2 rounded-full bg-green-50 shadow-md hover:bg-green-50 transition-colors"
            >
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            
            <h2 className="text-2xl font-semibold text-green-800">
              {selectedMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
            </h2>
            
            <button
              onClick={() => navigateMonth('next')}
              className="p-2 rounded-full bg-green-50 shadow-md hover:bg-green-50 transition-colors"
            >
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>

        {/* Legend */}
        <div className="flex justify-center mb-8">
          <div className="bg-green-50 rounded-2xl shadow-md p-4 flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-500 rounded"></div>
              <span className="text-sm text-gray-700">Available</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-300 rounded"></div>
              <span className="text-sm text-gray-700">Unavailable</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-gray-100 border border-gray-300 rounded"></div>
              <span className="text-sm text-gray-700">Past Date</span>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-4 h-4 bg-green-300 border-2 border-green-600 rounded"></div>
              <span className="text-sm text-gray-700">Today</span>
            </div>
          </div>
        </div>

        {/* Calendar Grid */}
        <div className="bg-green-50 rounded-2xl shadow-lg p-6 mb-6">
          <div className="grid grid-cols-7 gap-4">
            {/* Day headers */}
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center font-semibold text-green-700 py-2">
                {day}
              </div>
            ))}
            
            {/* Calendar dates */}
            {monthDates.map((date) => {
              const available = isDateAvailable(date);
              const pastDate = isPastDate(date);
              const today = isToday(date);
              const dayName = getDayName(date);
              
              return (
                <div
                  key={date.toISOString()}
                  className={`relative p-2 rounded-xl border-2 transition-all cursor-pointer ${
                    pastDate
                      ? 'bg-gray-100 border-gray-300 cursor-not-allowed'
                      : today
                      ? 'bg-green-300 border-green-600 hover:bg-green-400'
                      : available
                      ? 'bg-green-100 border-green-500 hover:bg-green-200'
                      : 'bg-gray-50 border-gray-300 hover:bg-gray-100'
                  }`}
                  onClick={() => !pastDate && toggleAvailability(date)}
                >
                  <div className="text-center">
                    <div className={`text-lg font-semibold ${
                      pastDate ? 'text-gray-400' : 'text-gray-700'
                    }`}>
                      {date.getDate()}
                    </div>
                    <div className={`text-xs mt-1 ${
                      pastDate ? 'text-gray-400' : 'text-gray-500'
                    }`}>
                      {dayName}
                    </div>
                  </div>
                  
                  {/* Status indicator */}
                  {!pastDate && (
                    <div className="absolute top-1 right-1">
                      {available ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <XCircle className="h-4 w-4 text-gray-400" />
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex justify-center space-x-4 mb-6">
          <button
            onClick={saveAvailability}
            disabled={saving}
            className="flex items-center px-8 py-4 bg-green-600 text-white rounded-xl hover:bg-green-700 disabled:bg-green-400 disabled:cursor-not-allowed transition-colors font-semibold text-lg"
          >
            {saving ? (
              <>
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-5 w-5 mr-2" />
                Save Changes
              </>
            )}
          </button>
          
          <button
            onClick={fetchAvailability}
            disabled={loading}
            className="flex items-center px-6 py-4 bg-green-50 text-green-600 border border-green-600 rounded-xl hover:bg-green-50 transition-colors font-semibold"
          >
            <RefreshCw className="h-5 w-5 mr-2" />
            Refresh
          </button>
        </div>

        {/* Message */}
        {message && (
          <div className={`text-center p-4 rounded-xl ${
            message.type === 'success' 
              ? 'bg-green-100 text-green-800 border border-green-200' 
              : 'bg-red-100 text-red-800 border border-red-200'
          }`}>
            {message.text}
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-green-50 rounded-2xl shadow-lg p-6 mt-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={markWeekdaysAvailable}
              disabled={saving}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
            >
              Available on Weekdays
            </button>
            <button
              onClick={markAllAvailable}
              disabled={saving}
              className="px-4 py-2 bg-green-100 text-green-700 rounded-lg hover:bg-green-200 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
            >
              Mark All Available
            </button>
            <button
              onClick={markAllUnavailable}
              disabled={saving}
              className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 disabled:bg-gray-100 disabled:text-gray-400 transition-colors"
            >
              Mark All Unavailable
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}