import axios from 'axios';
import { HistoryData } from '../types/water';

const API_URL = 'http://localhost:8000';

const api = axios.create({
    baseURL: API_URL,
    timeout: 5000,
});

export const getHistory = async (): Promise<HistoryData[]> => {
    const res = await api.get('/history');
    return res.data;
};

export const getLatestSensor = async (): Promise<HistoryData> => {
    const res = await api.get('/latest');
    return res.data;
};

export const getDeviceStatus = async (): Promise<any> => {
    const res = await api.get('/device-status');
    return res.data;
};

export const predictWater = async (data: any) => {
    const res = await api.post('/predict', data);
    return res.data;
};

