import { useState, useEffect } from "react";

function Weather() {
    const [city, setCity] = useState("");
    const [forecast, setForecast] = useState(null);
    const [selectedDay, setSelectedDay] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [unit, setUnit] = useState("C"); 

    const formatTemp = (temp) => {
        if (unit === "C") return Math.round(temp);
        return Math.round((temp * 9) / 5 + 32);
    };

    const getCityTime = (offset) => {
        const utctime = new Date().getTime() + (new Date().getTimezoneOffset() * 60000);
        const cityTime = new Date(utctime + (offset * 1000));
        return cityTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
    };

    useEffect(() => {
        if (!city) return;
        const fetchForecast = async () => {
            setLoading(true);
            setError(null);
            try {
                const res = await fetch(
                    `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=be934c63a0e8731f1903c6cff6dd02f8&units=metric`
                );
                if (!res.ok) throw new Error("City not found");
                const data = await res.json();
                const dailyData = data.list.filter((reading) => reading.dt_txt.includes("12:00:00"));

                setForecast({
                    cityName: data.city.name,
                    timezone: data.city.timezone,
                    sunrise: data.city.sunrise,
                    sunset: data.city.sunset,
                    fullList: data.list,
                    list: dailyData
                });
                setSelectedDay(data.list[0]);
            } catch (err) {
                setError(err.message);
                setForecast(null);
            }
            setLoading(false);
        };
        const delayDebounceFn = setTimeout(() => fetchForecast(), 1000);
        return () => clearTimeout(delayDebounceFn);
    }, [city]);

    const getHourlyData = () => {
        if (!forecast || !selectedDay) return [];
        const isToday = selectedDay.dt === forecast.fullList[0].dt;
        if (isToday) return forecast.fullList.slice(0, 8);
        const selectedDate = new Date(selectedDay.dt * 1000).getDate();
        return forecast.fullList.filter(item => new Date(item.dt * 1000).getDate() === selectedDate);
    };

    return (
        <div style={{ padding: '20px', maxWidth: '900px', margin: '0 auto', fontFamily: 'Arial, sans-serif', backgroundColor: '#65afd3a6', minHeight: '100vh' }}>
            
            <div style={{ display: 'flex', gap: '10px', marginBottom: '20px' }}>
                <input 
                    type="text" 
                    value={city} 
                    onChange={(e) => setCity(e.target.value)} 
                    placeholder="Search City..." 
                    style={{ flex: 1, padding: '15px', borderRadius: '10px', border: '1px solid #65afd3a6', fontSize: '1.1rem' }}
                />
                
                <button 
                    onClick={() => setUnit(unit === "C" ? "F" : "C")}
                    style={{ 
                        padding: '0 25px', 
                        borderRadius: '10px', 
                        border: 'none', 
                        backgroundColor: '#4682B4', 
                        color: 'white', 
                        cursor: 'pointer', 
                        fontWeight: 'bold',
                        boxShadow: '0 4px #87CEEB',
                        transition: '0.2s'
                    }}
                    onMouseDown={(e) => e.currentTarget.style.transform = 'translateY(2px)'}
                    onMouseUp={(e) => e.currentTarget.style.transform = 'translateY(0px)'}
                >
                    °{unit === "C" ? "F" : "C"}
                </button>
            </div>

            {loading && <p style={{textAlign: 'center'}}>Fetching...</p>}
            {error && <p style={{color: 'red', textAlign: 'center'}}>{error}</p>}

            {forecast && selectedDay && (
                <div>
                    <div style={{ background: 'linear-gradient(135deg, #2080d4, #87CEEB)', color: 'white', padding: '30px', borderRadius: '20px', marginBottom: '30px', boxShadow: '0 8px 16px rgba(0,0,0,0.1)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <div>
                                <h1 style={{ margin: 0 }}>{forecast.cityName}</h1>
                                <p style={{fontWeight: 'bold'}}>{selectedDay.dt === forecast.fullList[0].dt ? `Local Time: ${getCityTime(forecast.timezone)}` : "Forecast Day"}</p>
                                <p>{new Date(selectedDay.dt * 1000).toDateString()}</p>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                                <h2 style={{ fontSize: '4rem', margin: 0 }}>{formatTemp(selectedDay.main.temp)}°{unit}</h2>
                                <p>Feels like: {formatTemp(selectedDay.main.feels_like)}°{unit}</p>
                            </div>
                        </div>

                        {/* DATA FACTORS RESTORED HERE */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '15px', marginTop: '25px', borderTop: '1px solid rgba(255,255,255,0.3)', paddingTop: '20px' }}>
                            <div><small>HUMIDITY</small><p style={{fontSize: '1.1rem', margin: '5px 0'}}>💧 {selectedDay.main.humidity}%</p></div>
                            <div><small>WIND</small><p style={{fontSize: '1.1rem', margin: '5px 0'}}>🌬️ {selectedDay.wind.speed} m/s</p></div>
                            <div><small>VISIBILITY</small><p style={{fontSize: '1.1rem', margin: '5px 0'}}>👁️ {selectedDay.visibility / 1000} km</p></div>
                            <div><small>PRESSURE</small><p style={{fontSize: '1.1rem', margin: '5px 0'}}>⏲️ {selectedDay.main.pressure} hPa</p></div>
                            <div><small>SUNRISE</small><p style={{fontSize: '1.1rem', margin: '5px 0'}}>🌅 {new Date(forecast.sunrise * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p></div>
                            <div><small>SUNSET</small><p style={{fontSize: '1.1rem', margin: '5px 0'}}>🌇 {new Date(forecast.sunset * 1000).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</p></div>
                        </div>
                    </div>

                    <h3 style={{color: '#4682B4'}}>3-Hourly Forecast</h3>
                    <div style={{ display: 'flex', gap: '15px', overflowX: 'auto', marginBottom: '30px', paddingBottom: '10px' }}>
                        {getHourlyData().map((hour, i) => (
                            <div key={i} style={{ minWidth: '100px', backgroundColor: 'white', padding: '15px', borderRadius: '15px', textAlign: 'center', border: '1px solid #87CEEB' }}>
                                <p style={{fontSize: '0.8rem', color: '#666'}}>{new Date(hour.dt * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                                <img src={`http://openweathermap.org/img/wn/${hour.weather[0].icon}.png`} alt="icon" />
                                <p style={{ fontWeight: 'bold' }}>{formatTemp(hour.main.temp)}°</p>
                            </div>
                        ))}
                    </div>

                    <h3 style={{color: '#4682B4'}}>Next 5 Days</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))', gap: '15px' }}>
                        {forecast.list.map((day, index) => (
                            <div 
                                key={index} 
                                onClick={() => setSelectedDay(day)} 
                                style={{ 
                                    cursor: 'pointer', 
                                    backgroundColor: selectedDay === day ? '#87CEEB' : 'white', 
                                    color: selectedDay === day ? 'white' : 'black',
                                    padding: '20px', 
                                    borderRadius: '15px', 
                                    textAlign: 'center', 
                                    border: selectedDay === day ? '2px solid #4682B4' : '2px solid transparent',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.05)'
                                }}
                            >
                                <p><strong>{new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'short' })}</strong></p>
                                <img src={`http://openweathermap.org/img/wn/${day.weather[0].icon}.png`} alt="icon" />
                                <p style={{ fontWeight: 'bold' }}>{formatTemp(day.main.temp)}°{unit}</p>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Weather;