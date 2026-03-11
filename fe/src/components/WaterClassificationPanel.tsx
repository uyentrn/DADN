export function WaterClassificationPanel() {
  return (
    <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-100">
      <h2 className="text-gray-900 mb-6">Water Classification</h2>
      
      <div className="space-y-6">
        {/* Hard Water vs Soft Water */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Water Type</span>
            <span className="text-blue-600">Hard Water</span>
          </div>
          <div className="flex gap-2">
            <div className="flex-1 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-lg p-4 text-white text-center">
              <div className="text-xs mb-1">Hard Water</div>
              <div className="text-2xl">180 mg/L</div>
            </div>
            <div className="flex-1 bg-gray-100 rounded-lg p-4 text-gray-400 text-center">
              <div className="text-xs mb-1">Soft Water</div>
              <div className="text-2xl">--</div>
            </div>
          </div>
        </div>

        {/* Alkalinity Level Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Alkalinity Level</span>
            <span className="text-blue-600">Moderate</span>
          </div>
          <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-[60%] bg-gradient-to-r from-cyan-400 via-blue-400 to-indigo-400 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-gray-700 z-10">120 mg/L</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Low</span>
            <span>Moderate</span>
            <span>High</span>
          </div>
        </div>

        {/* Temperature Level Meter */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-gray-600">Temperature Level</span>
            <span className="text-green-600">Safe</span>
          </div>
          <div className="relative h-8 bg-gray-100 rounded-full overflow-hidden">
            <div className="absolute inset-y-0 left-0 w-[49%] bg-gradient-to-r from-blue-400 via-green-400 to-orange-400 rounded-full"></div>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-xs text-gray-700 z-10">24.5 °C</span>
            </div>
          </div>
          <div className="flex justify-between text-xs text-gray-400">
            <span>Cold</span>
            <span>Safe</span>
            <span>Hot</span>
          </div>
        </div>

        {/* Circular Gauges */}
        <div className="grid grid-cols-2 gap-4 pt-4">
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#gradientPH)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(7.2 / 14) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradientPH" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#06b6d4" />
                    <stop offset="100%" stopColor="#3b82f6" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-900 text-xl">7.2</span>
              </div>
            </div>
            <span className="text-gray-600 text-sm">pH Level</span>
          </div>
          
          <div className="text-center">
            <div className="relative w-24 h-24 mx-auto mb-2">
              <svg className="w-full h-full transform -rotate-90">
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="#e5e7eb"
                  strokeWidth="8"
                  fill="none"
                />
                <circle
                  cx="48"
                  cy="48"
                  r="40"
                  stroke="url(#gradientDO)"
                  strokeWidth="8"
                  fill="none"
                  strokeDasharray={`${(7.8 / 15) * 251.2} 251.2`}
                  strokeLinecap="round"
                />
                <defs>
                  <linearGradient id="gradientDO" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#10b981" />
                    <stop offset="100%" stopColor="#06b6d4" />
                  </linearGradient>
                </defs>
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span className="text-gray-900 text-xl">7.8</span>
              </div>
            </div>
            <span className="text-gray-600 text-sm">DO Level</span>
          </div>
        </div>
      </div>
    </div>
  );
}
