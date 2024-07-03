import React, { useState, useEffect } from 'react';

const Timer = ({ slackId, topic, hours, apiKey, endSession }) => {
  const [remainingTime, setRemainingTime] = useState(hours * 60 * 60);
  const [intervalId, setIntervalId] = useState(null);

  useEffect(() => {
    const id = setInterval(() => {
      setRemainingTime((prev) => prev - 1);
    }, 1000);
    setIntervalId(id);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (remainingTime <= 0) {
      clearInterval(intervalId);
      endSession();
    }
  }, [remainingTime, intervalId, endSession]);

  const formatTime = (time) => {
    const minutes = Math.floor(time / 60);
    const seconds = time % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  };

  const pauseTimer = () => {
    clearInterval(intervalId);
    callApi('/api/pause/:slackId', {});
  };

  const endTimerEarly = () => {
    clearInterval(intervalId);
    setRemainingTime(0);
    callApi('/api/cancel/:slackId', {});
  };

  const callApi = async (endpoint, data) => {
    const url = `https://hackhour.hackclub.com${endpoint.replace(':slackId', slackId)}`;
    const headers = {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    };
    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: headers,
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      const result = await response.json();
      console.log(result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <div className="mt-8">
      <div className="relative w-36 h-36 mx-auto">
        <svg className="absolute left-0 top-0 h-full w-full">
          <circle className="text-transparent stroke-current stroke-2" cx="50%" cy="50%" r="45%" strokeDasharray="283" strokeDashoffset="0"></circle>
        </svg>
        <div className="absolute left-0 top-0 w-full h-full flex items-center justify-center text-2xl font-semibold text-gray-800">
          {formatTime(remainingTime)}
        </div>
      </div>
      <div className="mt-4 flex justify-center space-x-4">
        <button onClick={pauseTimer} className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50">Pause</button>
        <button onClick={endTimerEarly} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50">End Early</button>
      </div>
    </div>
  );
};

export default Timer;
