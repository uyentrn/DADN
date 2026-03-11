import { ReactNode } from 'react';

interface SensorCardProps {
    icon: ReactNode;
    title: string;
    value: string | number;
    unit: string;
    range: string;
    status: string;
    statusColor: string;
    bgColor: string;
    iconColor: string;
}

export function SensorCard({
    icon,
    title,
    value,
    unit,
    range,
    status,
    statusColor,
    bgColor,
    iconColor,
}: SensorCardProps) {
    return (
        <div className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow duration-300 p-6 border border-gray-100">
            <div className="flex items-start justify-between mb-4">
                <div
                    className={`${iconColor} bg-gradient-to-br from-white to-gray-50 rounded-xl p-3 shadow-sm`}
                >
                    {icon}
                </div>
                <div
                    className={`px-3 py-1 rounded-full ${bgColor} ${statusColor} text-xs`}
                >
                    {status}
                </div>
            </div>

            <h3 className="text-gray-600 mb-2 text-sm">{title}</h3>

            <div className="flex items-baseline gap-2 mb-3">
                <span className="text-gray-900 text-4xl">{value}</span>
                <span className="text-gray-500 text-lg">{unit}</span>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <span className="text-gray-400 text-xs">Range: {range}</span>
                <div className="flex gap-1">
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse delay-75"></div>
                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-pulse delay-150"></div>
                </div>
            </div>
        </div>
    );
}
