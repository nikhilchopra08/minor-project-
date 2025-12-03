"use client"
import React, { useState, useEffect, useRef } from 'react';
import { Thermometer, Droplets, Sun, Wifi, WifiOff, Activity } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface SensorData {
  temperature: number;
  humidity: number;
  adcValue: number;
  adcVoltage: number;
  lightVoltage: number;
  lightPercent: number;
  timestamp: number;
}

interface HistoricalData {
  temperature: number[];
  humidity: number[];
  lightPercent: number[];
  timestamps: number[];
}

const GaugeSpeedometer = ({ value, max, min = 0, label, unit }: {
  value: number;
  max: number;
  min?: number;
  label: string;
  unit: string;
}) => {
  const percentage = ((value - min) / (max - min)) * 100;
  const angle = (percentage / 100) * 180 - 90;
  
  return (
    <div className="relative w-full">
      <svg className="w-full" viewBox="0 0 200 130">
        {/* Outer ring */}
        <path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke="#d1fae5"
          strokeWidth="16"
          strokeLinecap="round"
        />
        
        {/* Colored segments */}
        <path
          d="M 20 110 A 80 80 0 0 1 100 30"
          fill="none"
          stroke="#10b981"
          strokeWidth="16"
          strokeLinecap="round"
          opacity="0.3"
        />
        <path
          d="M 100 30 A 80 80 0 0 1 180 110"
          fill="none"
          stroke="#059669"
          strokeWidth="16"
          strokeLinecap="round"
          opacity="0.5"
        />
        
        {/* Progress indicator */}
        <path
          d="M 20 110 A 80 80 0 0 1 180 110"
          fill="none"
          stroke="#10b981"
          strokeWidth="16"
          strokeLinecap="round"
          strokeDasharray={`${percentage * 2.51} 251`}
          className="transition-all duration-700"
        />
        
        {/* Center dot */}
        <circle cx="100" cy="110" r="10" fill="#10b981" />
        
        {/* Needle */}
        <line
          x1="100"
          y1="110"
          x2="100"
          y2="45"
          stroke="#059669"
          strokeWidth="4"
          strokeLinecap="round"
          transform={`rotate(${angle} 100 110)`}
          className="transition-all duration-700"
          filter="drop-shadow(0 0 4px rgba(16, 185, 129, 0.6))"
        />
        
        {/* Tick marks and labels */}
        {[0, 25, 50, 75, 100].map((tick) => {
          const tickAngle = (tick / 100) * 180 - 90;
          const tickValue = min + ((max - min) * tick) / 100;
          const startX = 100 + 70 * Math.cos((tickAngle * Math.PI) / 180);
          const startY = 110 + 70 * Math.sin((tickAngle * Math.PI) / 180);
          const endX = 100 + 62 * Math.cos((tickAngle * Math.PI) / 180);
          const endY = 110 + 62 * Math.sin((tickAngle * Math.PI) / 180);
          const labelX = 100 + 85 * Math.cos((tickAngle * Math.PI) / 180);
          const labelY = 110 + 85 * Math.sin((tickAngle * Math.PI) / 180);
          
          return (
            <g key={tick}>
              <line
                x1={startX}
                y1={startY}
                x2={endX}
                y2={endY}
                stroke="#64748b"
                strokeWidth="2"
              />
              <text
                x={labelX}
                y={labelY}
                textAnchor="middle"
                dominantBaseline="middle"
                fill="#475569"
                fontSize="10"
                fontWeight="600"
              >
                {Math.round(tickValue)}
              </text>
            </g>
          );
        })}
      </svg>
      
      <div className="absolute bottom-14 left-1/2 transform -translate-x-1/2 text-center">
        <div className="text-4xl font-bold text-emerald-600">{value.toFixed(value < 10 ? 2 : 1)}</div>
        <div className="text-xs text-gray-600 mt-1">{unit}</div>
      </div>
    </div>
  );
};

export default function ESP32Dashboard() {
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [history, setHistory] = useState<HistoricalData>({
    temperature: [],
    humidity: [],
    lightPercent: [],
    timestamps: []
  });
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();

  const connectWebSocket = () => {
    try {
      const ws = new WebSocket('ws://10.59.208.169:81');
      
      ws.onopen = () => {
        console.log('WebSocket Connected');
        setIsConnected(true);
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          const timestamp = Date.now();
          
          setSensorData({
            ...data,
            timestamp
          });

          setHistory(prev => {
            const maxPoints = 20;
            const newHistory = {
              temperature: [...prev.temperature, data.temperature].slice(-maxPoints),
              humidity: [...prev.humidity, data.humidity].slice(-maxPoints),
              lightPercent: [...prev.lightPercent, data.lightPercent].slice(-maxPoints),
              timestamps: [...prev.timestamps, timestamp].slice(-maxPoints)
            };
            return newHistory;
          });
        } catch (error) {
          console.error('Error parsing data:', error);
        }
      };

      ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };

      ws.onclose = () => {
        console.log('WebSocket Disconnected');
        setIsConnected(false);
        
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('Attempting to reconnect...');
          connectWebSocket();
        }, 3000);
      };

      wsRef.current = ws;
    } catch (error) {
      console.error('Connection error:', error);
      setIsConnected(false);
    }
  };

  useEffect(() => {
    connectWebSocket();

    return () => {
      if (reconnectTimeoutRef.current) {
        clearTimeout(reconnectTimeoutRef.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, []);

  // Prepare chart data
  const chartData = history.timestamps.map((timestamp, index) => ({
    time: new Date(timestamp).toLocaleTimeString(),
    temperature: history.temperature[index],
    humidity: history.humidity[index],
    light: history.lightPercent[index]
  }));

  return (
    <div className="min-h-screen bg-[#F0FDF4] p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-green-600 mb-2">
              ESP32 Sensor Dashboard
            </h1>
            {/* <p className="text-emerald-700/70">Real-time environmental monitoring system</p> */}
          </div>
          <div className="flex items-center gap-2 px-5 py-3 rounded-lg bg-white border border-emerald-300 shadow-md">
            {isConnected ? (
              <>
                <Wifi className="w-5 h-5 text-emerald-600" />
                <span className="text-emerald-600 font-medium">Connected</span>
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse ml-2"></div>
              </>
            ) : (
              <>
                <WifiOff className="w-5 h-5 text-red-600" />
                <span className="text-red-600 font-medium">Disconnected</span>
              </>
            )}
          </div>
        </div>

        {/* Main Sensor Cards with Graphs */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Temperature */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <Thermometer className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Temperature</h2>
            </div>
            <div className="text-4xl font-bold text-emerald-600 text-center mb-4">
              {sensorData ? sensorData.temperature.toFixed(1) : '--'}°C
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10, fill: '#059669' }}
                  hide
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fontSize: 10, fill: '#059669' }}
                  width={30}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="temperature" 
                  stroke="#10b981" 
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Humidity */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <Droplets className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Humidity</h2>
            </div>
            <div className="text-4xl font-bold text-emerald-600 text-center mb-4">
              {sensorData ? sensorData.humidity.toFixed(1) : '--'}%
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10, fill: '#059669' }}
                  hide
                />
                <YAxis 
                  domain={['dataMin - 5', 'dataMax + 5']}
                  tick={{ fontSize: 10, fill: '#059669' }}
                  width={30}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="humidity" 
                  stroke="#059669" 
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Light Level */}
          <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-lg">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                <Sun className="w-6 h-6 text-emerald-600" />
              </div>
              <h2 className="text-xl font-semibold text-gray-800">Light Level</h2>
            </div>
            <div className="text-4xl font-bold text-emerald-600 text-center mb-4">
              {sensorData ? sensorData.lightPercent : '--'}%
            </div>
            <ResponsiveContainer width="100%" height={120}>
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#d1fae5" />
                <XAxis 
                  dataKey="time" 
                  tick={{ fontSize: 10, fill: '#059669' }}
                  hide
                />
                <YAxis 
                  domain={[0, 100]}
                  tick={{ fontSize: 10, fill: '#059669' }}
                  width={30}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#ffffff', 
                    border: '1px solid #a7f3d0',
                    borderRadius: '8px',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="light" 
                  stroke="#22c55e" 
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Detailed ADC Readings with Speedometers */}
        <div className="bg-white rounded-2xl p-6 border border-emerald-200 shadow-lg">
          <div className="flex items-center gap-3 mb-6">
            <Activity className="w-6 h-6 text-emerald-600" />
            <h2 className="text-2xl font-semibold text-gray-800">Detailed ADC Readings</h2>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ADC Raw Value */}
            <div className="bg-emerald-50/50 rounded-xl p-6 border border-emerald-200">
              <div className="text-sm text-emerald-700 mb-4 font-medium">ADC Raw Value</div>
              <GaugeSpeedometer
                value={sensorData?.adcValue || 0}
                max={4095}
                min={0}
                label="ADC Raw"
                unit="0-4095 range"
              />
            </div>

            {/* ADC Voltage */}
            <div className="bg-emerald-50/50 rounded-xl p-6 border border-emerald-200">
              <div className="text-sm text-emerald-700 mb-4 font-medium">ADC Voltage</div>
              <GaugeSpeedometer
                value={sensorData?.adcVoltage || 0}
                max={3.3}
                min={0}
                label="ADC Voltage"
                unit="Sensor reading"
              />
            </div>

            {/* Light Voltage */}
            <div className="bg-emerald-50/50 rounded-xl p-6 border border-emerald-200">
              <div className="text-sm text-emerald-700 mb-4 font-medium">Light Voltage</div>
              <GaugeSpeedometer
                value={sensorData?.lightVoltage || 0}
                max={3.3}
                min={0}
                label="Light Voltage"
                unit="Inverted reading"
              />
            </div>
          </div>

          {sensorData && (
            <div className="mt-6 pt-6 border-t border-emerald-200 text-sm text-emerald-700 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-600 rounded-full animate-pulse"></div>
                <span>Live Data Stream Active</span>
              </div>
              <span>Last updated: {new Date(sensorData.timestamp).toLocaleTimeString()}</span>
            </div>
          )}
        </div>

        {/* Connection Info */}
        {!isConnected && (
          <div className="mt-6 bg-red-50 border border-red-300 rounded-xl p-4 text-center">
            <p className="text-red-700 flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-red-600 rounded-full animate-ping"></div>
              Attempting to connect to ESP32 at ws://10.59.208.169:81...
            </p>
          </div>
        )}
      </div>
    </div>
  );
}