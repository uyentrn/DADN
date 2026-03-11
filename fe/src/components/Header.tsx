import { Droplets } from 'lucide-react';

export function Header() {
  return (
    <header className="bg-gradient-to-r from-cyan-600 via-blue-600 to-blue-700 text-white shadow-lg">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h1 className="text-white mb-2">
              AI-Based Water Quality Prediction & Contamination Alert System
            </h1>
            <p className="text-cyan-100 text-lg">
              Real-Time IoT + AI Monitoring
            </p>
          </div>
          <div className="flex flex-col items-center gap-2">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
              <Droplets className="w-12 h-12 text-cyan-200" />
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
