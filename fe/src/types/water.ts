export interface SensorData {
    Temp: number;
    Turbidity: number;
    DO: number;
    BOD: number;
    CO2: number;
    pH: number;
    Alkalinity: number;
    Hardness: number;
    Calcium: number;
    Ammonia: number;
    Nitrite: number;
    Phosphorus: number;
    H2S: number;
    Plankton: number;
}

export interface HistoryData {
    _id: string;
    quality_label?: number;
    quality_name?: string;
    solution?: string;
    sensor_data?: SensorData;
    status?: string;
}
