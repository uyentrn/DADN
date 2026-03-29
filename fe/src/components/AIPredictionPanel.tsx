import { Brain, TrendingUp, AlertTriangle } from 'lucide-react';

export function AIPredictionPanel() {
    return (
        <div className="bg-gradient-to-br from-indigo-50 to-purple-50 rounded-2xl shadow-lg p-6 border border-indigo-100">
            <div className="flex items-center gap-3 mb-6">
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 shadow-md">
                    <Brain className="w-6 h-6 text-white" />
                </div>
                <h2 className="text-gray-900">AI Prediction Module</h2>
            </div>

            <div className="space-y-6">
                {/* Water Quality Index */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-gray-600">
                            Water Quality Index (WQI)
                        </span>
                        <div className="px-3 py-1 rounded-full bg-green-100 text-green-700 text-xs">
                            Excellent
                        </div>
                    </div>
                    <div className="flex items-baseline gap-2 mb-4">
                        <span className="text-indigo-600 text-5xl">92</span>
                        <span className="text-gray-500">/100</span>
                    </div>
                    <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="absolute inset-y-0 left-0 w-[92%] bg-gradient-to-r from-green-400 via-blue-400 to-indigo-500 rounded-full"></div>
                    </div>
                    <div className="flex justify-between mt-2 text-xs text-gray-400">
                        <span>Unsafe</span>
                        <span>Poor</span>
                        <span>Moderate</span>
                        <span>Good</span>
                        <span>Excellent</span>
                    </div>
                </div>

                {/* AI Contamination Alert */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-5 h-5 text-yellow-500" />
                        <span className="text-gray-900">
                            Contamination Risk
                        </span>
                    </div>
                    <div className="flex items-center justify-between">
                        <span className="text-gray-600">Current Status</span>
                        <span className="text-green-600">Low Risk</span>
                    </div>
                    <div className="mt-3 flex gap-2">
                        <div className="flex-1 h-2 bg-green-400 rounded-full"></div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
                        <div className="flex-1 h-2 bg-gray-200 rounded-full"></div>
                    </div>
                </div>

                {/* 24h Forecast */}
                <div className="bg-white rounded-xl p-5 shadow-sm">
                    <div className="flex items-center gap-2 mb-4">
                        <TrendingUp className="w-5 h-5 text-indigo-500" />
                        <span className="text-gray-900">24h Forecast</span>
                    </div>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-sm">
                                Quality Trend
                            </span>
                            <span className="text-green-600 text-sm flex items-center gap-1">
                                <TrendingUp className="w-4 h-4" />
                                Stable
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-sm">
                                Predicted WQI
                            </span>
                            <span className="text-indigo-600">90-94</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-gray-600 text-sm">
                                Confidence
                            </span>
                            <span className="text-gray-900">94.5%</span>
                        </div>
                    </div>
                </div>

                {/* ML Model Info */}
                <div className="bg-indigo-100 rounded-xl p-4 border border-indigo-200">
                    <div className="flex items-center justify-between text-sm">
                        <span className="text-indigo-700">
                            Model: Random Forest
                        </span>
                        <span className="text-indigo-600">Accuracy: 96.2%</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
