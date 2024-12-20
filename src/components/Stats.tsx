import { useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { ApexOptions } from "apexcharts";
import { Inter } from "next/font/google";
import useAuthStore from "@/store/auth_store";

const ReactApexChart = dynamic(() => import('react-apexcharts'), { ssr: false });

const inter = Inter({
    weight: ['500'],
    subsets: ['latin'],
});
interface SensorData {
    createdAt: Date;
    temperature: number;
    humidity: number;
}

export default function Stats() {

    const [timeRange, setTimeRange] = useState({ start: "", end: "" });
    const [analogSensorsData, setAnalogSensorsData] = useState<any[]>([]);
    const [I2CSensorData, setI2CSensorData] = useState<any>();
    const [loading, setLoading] = useState<boolean>(true);
    const userInfo = useAuthStore(state => state.user);

    useEffect(() => {
        const getDataHistories = async () => {
            setLoading(true);
            try {
                const response = await fetch(`/api/sensor?user_id=${String("673204dd29690e9b4a7b9b90")}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json', 
                    },
                });
                if (!response.ok) throw new Error("Failed to fetch data");

                const res = await response.json();
                setI2CSensorData(res?.data?.i2c);
                setAnalogSensorsData(res?.data?.analog);
            } catch (error) {
                console.error("Error fetching data:", error);
            } finally {
                setLoading(false);
            }
        };

        getDataHistories();
    }, [userInfo?.id]);

    const generateChartSeries = (data: SensorData[]) => ({
        temperatureSeries: [
            { name: "Temperature", data: data.map(d => ({ x: d.createdAt, y: d.temperature })) },
        ],
        humiditySeries: [
            { name: "Humidity", data: data.map(d => ({ x: d.createdAt, y: d.humidity })) },
        ],
    });

    const chartOptions: ApexOptions = {
        chart: { 
            type: "line", 
            height: 350,
            toolbar: {
                show: false
            }, 
            animations: {
                enabled: true,
            },
            foreColor: 'purple'
        },
        title: {
            align: 'left',
            style: {
              fontFamily: inter.style.fontFamily,
              fontSize: '24px',
              fontWeight: '800',
              color: '#4E3A9D'
            },
        },
        xaxis: { type: "datetime" },
        colors: ['purple', 'purple'],
        yaxis: {
            min: 0,
            max: 100
        }
    };

    const { temperatureSeries: i2cTemperatureSeries, humiditySeries: i2cHumiditySeries } = I2CSensorData?.data ? generateChartSeries(I2CSensorData.data) : { temperatureSeries: [], humiditySeries: [] };

    return (
        <div className="flex flex-col gap-3 p-1 mt-48">
            {loading ? (
                <div className="text-center text-lg font-semibold text-gray-500">Loading...</div>
            ) : (
                <div className="grid grid-cols-2 gap-10">
                    {analogSensorsData?.map((s, index) => {
                        const { temperatureSeries, humiditySeries } = s.data ? generateChartSeries(s.data) : { temperatureSeries: [], humiditySeries: [] };

                        return (
                            <div className="flex flex-col gap-1 p-3 rounded-lg bg-white" key={index}>
                                <p className="font-semibold text-lg text-center">Stats Sensor {index+1}</p>
                                <div className="flex flex-col gap-3">
                                    <div className="bg-gray-50 p-2 rounded-lg">
                                        <ReactApexChart 
                                            options={{ ...chartOptions, title: { 
                                                text: "Temperature History",       
                                                style: {
                                                    fontFamily: inter.style.fontFamily,
                                                    fontSize: '12px',
                                                    fontWeight: '800',
                                                    color: '#4E3A9D'
                                                }, 
                                            }}}
                                            series={temperatureSeries}
                                            height={350}
                                            type="line"
                                        />
                                    </div>
                                    <div className="bg-gray-50 p-2 rounded-lg">
                                        <ReactApexChart 
                                            options={{ ...chartOptions, title: { 
                                                text: "Humidity History",       
                                                style: {
                                                    fontFamily: inter.style.fontFamily,
                                                    fontSize: '12px',
                                                    fontWeight: '800',
                                                    color: '#4E3A9D'
                                                }, 
                                            }}}                                
                                            series={humiditySeries}
                                            height={350}
                                            type="line"
                                        />
                                    </div>
                                </div>
                                <div className="flex flex-col gap-3 p-2">
                                    <div className="flex justify-between">
                                        <div className="flex flex-col gap-2 items-center m-2">
                                            <p className="text-sm">Min Temp</p>
                                            <p>{s?.stats.min_temp}°C</p>
                                        </div>
                                        <div className="flex flex-col gap-2 items-center m-2">
                                            <p className="text-sm">Max Temp</p>
                                            <p>{s?.stats.max_temp}°C</p>
                                        </div>
                                        <div className="flex flex-col gap-2 items-center m-2">
                                            <p className="text-sm">Average Temp</p>
                                            <p>{s?.stats.avg_temp}°C</p>
                                        </div>
                                    </div>
                                    <div className="flex justify-between">
                                        <div className="flex flex-col gap-2 items-center m-2">
                                            <p className="text-sm">Min Hum</p>
                                            <p>{s?.stats.min_hum}%</p>
                                        </div>
                                        <div className="flex flex-col gap-2 items-center m-2">
                                            <p className="text-sm">Max Hum</p>
                                            <p>{s?.stats.max_hum}%</p>
                                        </div>
                                        <div className="flex flex-col gap-2 items-center m-2">
                                            <p className="text-sm">Average Hum</p>
                                            <p>{s?.stats.avg_hum}%</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
