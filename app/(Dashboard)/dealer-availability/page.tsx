// app/dealer/availability/page.tsx
'use client';

import { useState, useEffect, useCallback } from 'react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addDays, isWeekend } from 'date-fns';
import { ChevronLeft, ChevronRight, Calendar, Zap, Clock, CheckCircle, XCircle } from 'lucide-react';
import { apiClient } from '@/frontend-lib/api';

// Types
interface Availability {
  id: string;
  date: string;
  isAvailable: boolean;
  createdAt: string;
  updatedAt: string;
}

type BulkMode = 'week' | 'month' | 'custom';
type ViewMode = 'calendar' | 'bulk';

// UI Components
const Card = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`bg-white rounded-lg border border-gray-200 shadow-sm ${className}`}>
    {children}
  </div>
);

const CardHeader = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 border-b border-gray-200 ${className}`}>
    {children}
  </div>
);

const CardTitle = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <h3 className={`text-lg font-semibold text-gray-900 ${className}`}>
    {children}
  </h3>
);

const CardDescription = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <p className={`text-sm text-gray-600 mt-1 ${className}`}>
    {children}
  </p>
);

const CardContent = ({ children, className = '' }: { children: React.ReactNode; className?: string }) => (
  <div className={`p-6 ${className}`}>
    {children}
  </div>
);

const Button = ({ 
  children, 
  onClick, 
  variant = 'default', 
  size = 'default',
  disabled = false,
  className = '',
  type = 'button'
}: { 
  children: React.ReactNode; 
  onClick?: () => void;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive';
  size?: 'default' | 'sm' | 'lg';
  disabled?: boolean;
  className?: string;
  type?: 'button' | 'submit';
}) => {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2';
  
  const variants = {
    default: 'bg-green-600 text-white hover:bg-green-700',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    secondary: 'bg-gray-100 text-gray-900 hover:bg-gray-200',
    destructive: 'bg-red-600 text-white hover:bg-red-700'
  };

  const sizes = {
    default: 'px-4 py-2 text-sm',
    sm: 'px-3 py-1.5 text-xs',
    lg: 'px-6 py-3 text-base'
  };

  return (
    <button
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}
      onClick={onClick}
      disabled={disabled}
    >
      {children}
    </button>
  );
};

const Badge = ({ 
  children, 
  variant = 'default',
  className = ''
}: { 
  children: React.ReactNode;
  variant?: 'default' | 'secondary' | 'success' | 'warning' | 'error';
  className?: string;
}) => {
  const variants = {
    default: 'bg-green-100 text-blue-800',
    secondary: 'bg-gray-100 text-gray-800',
    success: 'bg-green-100 text-green-800',
    warning: 'bg-yellow-100 text-yellow-800',
    error: 'bg-red-100 text-red-800'
  };

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variants[variant]} ${className}`}>
      {children}
    </span>
  );
};

const Switch = ({ 
  checked, 
  onCheckedChange,
  disabled = false
}: { 
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  disabled?: boolean;
}) => {
  return (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
        checked ? 'bg-green-600' : 'bg-gray-200'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      onClick={() => !disabled && onCheckedChange(!checked)}
      disabled={disabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
};

const Input = ({
  type = 'text',
  value,
  onChange,
  placeholder,
  className = '',
  min,
  max
}: {
  type?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  min?: string;
  max?: string;
}) => {
  return (
    <input
      type={type}
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={placeholder}
      min={min}
      max={max}
      className={`block w-full rounded-md border border-gray-300 px-3 py-2 text-sm placeholder-gray-400 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${className}`}
    />
  );
};

const Label = ({ children, htmlFor, className = '' }: { children: React.ReactNode; htmlFor?: string; className?: string }) => (
  <label htmlFor={htmlFor} className={`block text-sm font-medium text-gray-700 ${className}`}>
    {children}
  </label>
);

// Toast function (simplified)
const toast = {
  success: (message: string) => {
    console.log('Success:', message);
    alert(`✅ ${message}`);
  },
  error: (message: string) => {
    console.error('Error:', message);
    alert(`❌ ${message}`);
  }
};

// Main Component
export default function DealerAvailabilityPage() {
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [availabilities, setAvailabilities] = useState<Availability[]>([]);
  const [loading, setLoading] = useState(false);
  const [view, setView] = useState<ViewMode>('calendar');
  const [currentMonth, setCurrentMonth] = useState(new Date());

  // Bulk management state
  const [bulkMode, setBulkMode] = useState<BulkMode>('week');
  const [bulkAvailability, setBulkAvailability] = useState(true);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const fetchAvailabilities = async (startDate: Date, endDate: Date) => {
    try {
      setLoading(true);
      const start = format(startDate, 'yyyy-MM-dd');
      const end = format(endDate, 'yyyy-MM-dd');
      
      const response = await apiClient.get(`/api/dealer/availability?startDate=${start}&endDate=${end}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch availabilities');
      }
      
      const data = await response.json();
      setAvailabilities(data.data || []);
    } catch (error) {
      toast.error('Failed to load availabilities');
      console.error('Error fetching availabilities:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const startDate = new Date();
    const endDate = new Date();
    endDate.setMonth(endDate.getMonth() + 1);
    fetchAvailabilities(startDate, endDate);
  }, []);

  const getAvailabilityForDate = useCallback((date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return availabilities.find(avail => avail.date === dateStr);
  }, [availabilities]);

  const handleMonthChange = (date: Date) => {
    setCurrentMonth(date);
    const start = startOfMonth(date);
    const end = endOfMonth(date);
    fetchAvailabilities(start, end);
  };

  const handlePreviousMonth = () => {
    const previousMonth = new Date(currentMonth);
    previousMonth.setMonth(previousMonth.getMonth() - 1);
    handleMonthChange(previousMonth);
  };

  const handleNextMonth = () => {
    const nextMonth = new Date(currentMonth);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    handleMonthChange(nextMonth);
  };

  const handleAvailabilityToggle = async (date: Date, isAvailable: boolean) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Debug: log what we're sending
      console.log('Sending request with:', { date: dateStr, isAvailable });
      
      const response = await apiClient.post('/api/dealer/availability', {
        date: dateStr,
        isAvailable,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Server response error:', errorText);
        throw new Error('Failed to update availability');
      }

      const result = await response.json();
      
      // Update local state
      setAvailabilities(prev => {
        const filtered = prev.filter(avail => avail.date !== dateStr);
        return [...filtered, result.data];
      });

      toast.success(isAvailable ? 'Marked as available' : 'Marked as unavailable');
    } catch (error) {
      toast.error('Failed to update availability');
      console.error('Error updating availability:', error);
    }
  };

  const handleBulkUpdate = async (updates: { date: string; isAvailable: boolean }[]) => {
    try {
      const response = await apiClient.post('/api/dealer/availability', {
        availabilities: updates,
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Bulk update error:', errorText);
        throw new Error('Failed to update availabilities');
      }

      const result = await response.json();
      
      // Refresh availabilities
      const startDate = new Date();
      const endDate = new Date();
      endDate.setMonth(endDate.getMonth() + 1);
      fetchAvailabilities(startDate, endDate);

      toast.success(`Updated ${result.data.length} dates`);
    } catch (error) {
      toast.error('Failed to update availabilities');
      console.error('Error in bulk update:', error);
    }
  };

  // Bulk management functions
  const getWeekDates = () => {
    const start = new Date();
    const end = addDays(start, 6);
    return eachDayOfInterval({ start, end });
  };

  const getMonthDates = () => {
    const start = new Date();
    const end = addDays(start, 30);
    return eachDayOfInterval({ start, end });
  };

  const getCustomDates = () => {
    if (!customStartDate || !customEndDate) return [];
    const start = new Date(customStartDate);
    const end = new Date(customEndDate);
    return eachDayOfInterval({ start, end });
  };

  const getBulkDates = () => {
    switch (bulkMode) {
      case 'week':
        return getWeekDates();
      case 'month':
        return getMonthDates();
      case 'custom':
        return getCustomDates();
      default:
        return [];
    }
  };

  const executeBulkUpdate = async () => {
    const dates = getBulkDates();
    
    if (dates.length === 0) {
      toast.error('No dates selected');
      return;
    }

    if (bulkMode === 'custom' && dates.length > 60) {
      toast.error('Cannot update more than 60 days at once');
      return;
    }

    setLoading(true);
    try {
      const updates = dates.map(date => ({
        date: format(date, 'yyyy-MM-dd'),
        isAvailable: bulkAvailability,
      }));

      await handleBulkUpdate(updates);
    } finally {
      setLoading(false);
    }
  };

  // Stats calculation
  const availableCount = availabilities.filter(a => a.isAvailable).length;
  const unavailableCount = availabilities.filter(a => !a.isAvailable).length;
  const totalCount = availabilities.length;

  const monthDays = eachDayOfInterval({
    start: startOfMonth(currentMonth),
    end: endOfMonth(currentMonth),
  });

  const selectedAvailability = selectedDate ? getAvailabilityForDate(selectedDate) : null;
  const bulkDates = getBulkDates();
  const existingDatesMap = new Map(
    availabilities.map(avail => [avail.date, avail.isAvailable])
  );

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div className="mb-4 sm:mb-0">
            <h1 className="text-3xl font-bold text-gray-900">Availability Management</h1>
            <p className="text-gray-600 mt-2">
              Manage your availability for appointments and bookings
            </p>
          </div>
          
          <div className="flex gap-2">
            <Button
              variant={view === 'calendar' ? 'default' : 'outline'}
              onClick={() => setView('calendar')}
            >
              <Calendar className="w-4 h-4 mr-2" />
              Calendar View
            </Button>
            <Button
              variant={view === 'bulk' ? 'default' : 'outline'}
              onClick={() => setView('bulk')}
            >
              <Zap className="w-4 h-4 mr-2" />
              Bulk Update
            </Button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Available Days</p>
                  <p className="text-2xl font-semibold text-gray-900">{availableCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <XCircle className="h-8 w-8 text-red-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Unavailable Days</p>
                  <p className="text-2xl font-semibold text-gray-900">{unavailableCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="flex-shrink-0">
                  <Clock className="h-8 w-8 text-blue-500" />
                </div>
                <div className="ml-4">
                  <p className="text-sm font-medium text-gray-600">Total Managed</p>
                  <p className="text-2xl font-semibold text-gray-900">{totalCount}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {view === 'calendar' ? (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar View */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>Calendar View</CardTitle>
                  <div className="flex items-center gap-2">
                    <Button variant="outline" size="sm" onClick={handlePreviousMonth}>
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <span className="font-semibold text-gray-900">
                      {format(currentMonth, 'MMMM yyyy')}
                    </span>
                    <Button variant="outline" size="sm" onClick={handleNextMonth}>
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <CardDescription>
                  Click on a date to manage availability
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-7 gap-1 mb-4">
                  {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                    <div key={day} className="text-center font-medium text-sm py-2 text-gray-700">
                      {day}
                    </div>
                  ))}
                </div>

                <div className="grid grid-cols-7 gap-1">
                  {monthDays.map(day => {
                    const availability = getAvailabilityForDate(day);
                    const isSelected = selectedDate && isSameDay(day, selectedDate);
                    const isToday = isSameDay(day, new Date());
                    
                    return (
                      <Button
                        key={day.toISOString()}
                        variant={isSelected ? "default" : "outline"}
                        className={`h-12 relative ${
                          isToday ? 'ring-2 ring-blue-500' : ''
                        } ${
                          availability?.isAvailable 
                            ? 'bg-green-50 border-green-200 hover:bg-green-100 text-green-900' 
                            : availability 
                              ? 'bg-red-50 border-red-200 hover:bg-red-100 text-red-900'
                              : ''
                        }`}
                        onClick={() => setSelectedDate(day)}
                      >
                        <div className="flex flex-col items-center">
                          <span className="text-sm">{format(day, 'd')}</span>
                          {availability && (
                            <div className={`w-2 h-2 rounded-full mt-1 ${
                              availability.isAvailable ? 'bg-green-500' : 'bg-red-500'
                            }`} />
                          )}
                        </div>
                      </Button>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            {/* Availability Management Panel */}
            <Card>
              <CardHeader>
                <CardTitle>Manage Availability</CardTitle>
                <CardDescription>
                  {selectedDate ? format(selectedDate, 'MMMM d, yyyy') : 'Select a date'}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {selectedDate ? (
                  <>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="availability-toggle">Available for bookings</Label>
                      <Switch
                        checked={selectedAvailability?.isAvailable ?? false}
                        onCheckedChange={(checked) => 
                          handleAvailabilityToggle(selectedDate, checked)
                        }
                        disabled={loading}
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full" />
                        <span className="text-sm text-gray-700">Available</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-red-500 rounded-full" />
                        <span className="text-sm text-gray-700">Unavailable</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-gray-300 rounded-full" />
                        <span className="text-sm text-gray-700">Not set</span>
                      </div>
                    </div>

                    {selectedDate < new Date() && (
                      <Badge variant="secondary" className="w-full justify-center">
                        Past Date
                      </Badge>
                    )}
                  </>
                ) : (
                  <p className="text-gray-500 text-center py-8">
                    Select a date to manage availability
                  </p>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          /* Bulk Management View */
          <Card>
            <CardHeader>
              <CardTitle>Bulk Availability Management</CardTitle>
              <CardDescription>
                Update availability for multiple dates at once
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Mode Selection */}
              <div className="space-y-4">
                <Label>Select Range</Label>
                <div className="flex gap-2">
                  {(['week', 'month', 'custom'] as BulkMode[]).map(mode => (
                    <Button
                      key={mode}
                      variant={bulkMode === mode ? 'default' : 'outline'}
                      onClick={() => setBulkMode(mode)}
                      className="capitalize"
                    >
                      {mode}
                    </Button>
                  ))}
                </div>
              </div>

              {/* Custom Date Range */}
              {bulkMode === 'custom' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="start-date">Start Date</Label>
                    <Input
                      id="start-date"
                      type="date"
                      value={customStartDate}
                      onChange={setCustomStartDate}
                      min={format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="end-date">End Date</Label>
                    <Input
                      id="end-date"
                      type="date"
                      value={customEndDate}
                      onChange={setCustomEndDate}
                      min={customStartDate || format(new Date(), 'yyyy-MM-dd')}
                    />
                  </div>
                </div>
              )}

              {/* Availability Toggle */}
              <div className="flex items-center justify-between p-4 border border-gray-200 rounded-lg">
                <div>
                  <Label className="text-base font-medium text-gray-900">Set Availability</Label>
                  <p className="text-sm text-gray-600">
                    {bulkAvailability ? 'Available for bookings' : 'Unavailable for bookings'}
                  </p>
                </div>
                <Switch
                  checked={bulkAvailability}
                  onCheckedChange={setBulkAvailability}
                />
              </div>

              {/* Preview */}
              {bulkDates.length > 0 && (
                <div className="space-y-3">
                  <Label>Preview ({bulkDates.length} days)</Label>
                  <div className="max-h-48 overflow-y-auto border border-gray-200 rounded-lg p-4">
                    <div className="grid grid-cols-7 gap-1 text-xs">
                      {bulkDates.map(date => {
                        const dateStr = format(date, 'yyyy-MM-dd');
                        const existing = existingDatesMap.get(dateStr);
                        const isWeekendDay = isWeekend(date);
                        
                        return (
                          <div
                            key={dateStr}
                            className={`p-2 rounded text-center ${
                              isWeekendDay ? 'bg-gray-50' : 'bg-white'
                            } border ${
                              existing === true 
                                ? 'border-green-200 bg-green-50' 
                                : existing === false 
                                  ? 'border-red-200 bg-red-50'
                                  : 'border-gray-200'
                            }`}
                          >
                            <div className="font-medium">{format(date, 'd')}</div>
                            <div className="text-gray-500">{format(date, 'MMM')}</div>
                            {existing !== undefined && (
                              <div className={`w-2 h-2 mx-auto mt-1 rounded-full ${
                                existing ? 'bg-green-500' : 'bg-red-500'
                              }`} />
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* Action Button */}
              <Button
                onClick={executeBulkUpdate}
                disabled={loading || bulkDates.length === 0}
                className="w-full"
                size="lg"
              >
                {loading ? 'Updating...' : `Update ${bulkDates.length} Days`}
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}