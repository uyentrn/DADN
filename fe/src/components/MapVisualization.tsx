import { MapPin, Activity } from 'lucide-react';

const sensorLocations = [
  { id: 1, name: 'Sensor Node A', lat: '23.5%', lng: '25%', status: 'healthy', color: 'bg-green-500' },
  { id: 2, name: 'Sensor Node B', lat: '45.8%', lng: '65%', status: 'warning', color: 'bg-yellow-500' },
  { id: 3, name: 'Sensor Node C', lat: '67.2%', lng: '35%', status: 'healthy', color: 'bg-green-500' },
  { id: 4, name: 'Sensor Node D', lat: '35.5%', lng: '75%', status: 'critical', color: 'bg-red-500' },
  { id: 5, name: 'Sensor Node E', lat: '82.1%', lng: '55%', status: 'healthy', color: 'bg-green-500' }
];

export function MapVisualization() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-gray-900">Sensor Network Map</h2>
        <div className="flex items-center gap-2 text-gray-600">
          <Activity className="w-4 h-4" />
          <span className="text-sm">5 Active Nodes</span>
        </div>
      </div>
      
      {/* Map Container */}
      <div className="relative bg-gradient-to-br from-blue-50 to-cyan-50 rounded-xl h-96 border-2 border-blue-100 overflow-hidden">
        {/* Map Grid Lines */}
        <svg className="absolute inset-0 w-full h-full opacity-20">
          <defs>
            <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
              <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#3b82f6" strokeWidth="0.5"/>
            </pattern>
          </defs>
          <rect width="100%" height="100%" fill="url(#grid)" />
        </svg>

        {/* Water Flow Lines (decorative) */}
        <svg className="absolute inset-0 w-full h-full opacity-10">
          <path d="M 0 50 Q 150 30, 300 50 T 600 50" stroke="#06b6d4" strokeWidth="2" fill="none" />
          <path d="M 0 150 Q 200 130, 400 150 T 800 150" stroke="#0ea5e9" strokeWidth="2" fill="none" />
          <path d="M 0 250 Q 180 230, 360 250 T 720 250" stroke="#06b6d4" strokeWidth="2" fill="none" />
        </svg>

        {/* Sensor Markers */}
        {sensorLocations.map((sensor) => (
          <div
            key={sensor.id}
            className="absolute group cursor-pointer"
            style={{ top: sensor.lat, left: sensor.lng }}
          >
            {/* Pulsing Ring */}
            <div className={`absolute -top-4 -left-4 w-8 h-8 ${sensor.color} rounded-full opacity-20 animate-ping`}></div>
            
            {/* Marker */}
            <div className={`relative ${sensor.color} rounded-full p-2 shadow-lg border-2 border-white`}>
              <MapPin className="w-4 h-4 text-white" />
            </div>

            {/* Tooltip */}
            <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none">
              <div className="bg-gray-900 text-white text-xs rounded-lg px-3 py-2 whitespace-nowrap shadow-xl">
                <div>{sensor.name}</div>
                <div className="text-gray-300">Status: {sensor.status}</div>
                <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
              </div>
            </div>
          </div>
        ))}

        {/* Contamination Hotspot (Example) */}
        <div className="absolute" style={{ top: '35%', left: '72%' }}>
          <div className="relative">
            <div className="absolute w-16 h-16 bg-red-500 rounded-full opacity-20 animate-pulse"></div>
            <div className="absolute w-12 h-12 bg-red-500 rounded-full opacity-30 top-2 left-2"></div>
            <div className="absolute w-8 h-8 bg-red-600 rounded-full opacity-50 top-4 left-4"></div>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-center gap-6 mt-6 pt-6 border-t border-gray-100">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Healthy</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Warning</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-red-500 rounded-full"></div>
          <span className="text-sm text-gray-600">Critical</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 bg-red-500 rounded-full opacity-30"></div>
          <span className="text-sm text-gray-600">Contamination Zone</span>
        </div>
      </div>
    </div>
  );
}
