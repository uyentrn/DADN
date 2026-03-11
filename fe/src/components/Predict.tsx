import { useState, ChangeEvent } from 'react';
import { SensorData } from '../types/water';
import { predictWater } from '../services/api';

interface PredictResult {
    quality_name: string;
    solution: string;
}

function Predict() {
    const [data, setData] = useState<SensorData>({
        Temp: 0,
        Turbidity: 0,
        DO: 0,
        BOD: 0,
        CO2: 0,
        pH: 0,
        Alkalinity: 0,
        Hardness: 0,
        Calcium: 0,
        Ammonia: 0,
        Nitrite: 0,
        Phosphorus: 0,
        H2S: 0,
        Plankton: 0,
    });

    const [result, setResult] = useState<PredictResult | null>(null);

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        setData({
            ...data,
            [e.target.name]: Number(e.target.value),
        });
    };

    const predict = async () => {
        try {
            const res = await predictWater(data);
            setResult(res);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div style={{ padding: '40px' }}>
            <h1>AI Water Monitoring System</h1>

            <h3>Sensor Input</h3>

            {Object.keys(data).map((key) => (
                <div key={key}>
                    <label>{key}: </label>

                    <input
                        type="number"
                        name={key}
                        value={data[key as keyof SensorData]}
                        onChange={handleChange}
                    />
                </div>
            ))}

            <br />

            <button className="border border-gray-200" onClick={predict}>
                Predict Water Quality
            </button>

            {result && (
                <div style={{ marginTop: '30px' }}>
                    <h2>Result</h2>

                    <p>
                        Quality: <b>{result.quality_name}</b>
                    </p>

                    <p>Solution: {result.solution}</p>
                </div>
            )}
        </div>
    );
}

export default Predict;
