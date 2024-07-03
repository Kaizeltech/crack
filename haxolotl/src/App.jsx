import React, { useState, useEffect } from 'react';
import { Cron } from "croner";

const App = () => {
  const [slackId, setSlackId] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');
  const [topic, setTopic] = useState('');
  const [hours, setHours] = useState('');
  const [timeLeft, setTimeLeft] = useState(null);
  const [isRunning, setIsRunning] = useState(false);
  const [intervalId, setIntervalId] = useState(null);
  const [sessionIntervalId, setSessionIntervalId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const userId = params.get('userid');
    console.log('User ID:', userId);
    setSlackId(userId);
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('Form submitted');
    if (!topic || !hours || isNaN(hours) || hours <= 0 || !apiKey) {
      alert('Please fill in all fields correctly.');
      return;
    }
    localStorage.setItem('apiKey', apiKey);
    console.log('Starting session with topic:', topic, 'for', hours, 'hours');
    setIsRunning(true);
    const endTime = Date.now() + parseInt(hours*60, 10) * 60 * 1000;
    updateTimer(endTime);
    callApiEveryHour(endTime);
  };

  const callApiEveryHour = (endTime) => {
    console.log('Initial API call to start the session');
    callApi('/api/start/:slackId', { work: topic });

    // Schedule job to call API every hour and 2 seconds
    const job = Cron('2 * * * * *', () => {
      console.log('API call to continue the session');
      callApi('/api/start/:slackId', { work: topic });
    });

    const finalTimeout = setTimeout(() => {
      job.stop(); // Cancel the scheduled job
      callApi('/api/end/:slackId', {});
      setIsRunning(false);
      setTimeLeft(0);
      console.log('Final API call to end the session');
    }, endTime - Date.now());

    setSessionIntervalId({ job, finalTimeout });
  };


  const callApi = async (endpoint, data) => {
    const url = `${endpoint.replace(':slackId', slackId)}`;
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
      console.log('API response:', result);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const updateTimer = (endTime) => {
    console.log('Updating timer with end time:', new Date(endTime).toLocaleString());
    const interval = setInterval(() => {
      const remaining = endTime - Date.now();
      if (remaining <= 0) {
        clearInterval(interval);
        clearTimeout(sessionIntervalId.finalTimeout);
        clearInterval(sessionIntervalId.sessionInterval);
        setTimeLeft(0);
        setIsRunning(false);
        console.log('Session ended.');
        return;
      }
      setTimeLeft(remaining);
    }, 1000);
    setIntervalId(interval);
  };

  const formatTime = (milliseconds) => {
    const totalSeconds = Math.floor(milliseconds / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours > 0) {
      return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    } else {
      return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
  };
  

  const pauseSession = () => {
    if (!isPaused) {
      setIsPaused(true);
      callApi('/api/pause/:slackId', {});
      setPauseStartTime(Date.now());
      clearInterval(intervalId);
      clearInterval(sessionIntervalId.sessionInterval);
      console.log('Session paused.');
    } else {
      const newPausedDuration = pausedDuration + (Date.now() - pauseStartTime);
      setPausedDuration(newPausedDuration);
      setIsPaused(false);
      const remainingTime = timeLeft - (Date.now() - pauseStartTime);
      setTimeLeft(remainingTime);
      updateTimer(Date.now() + remainingTime);
      callApiEveryHour(Date.now() + remainingTime);
      console.log('Session resumed.');
    }
  };

  const endSessionEarly = async () => {
    clearInterval(intervalId);
    clearTimeout(sessionIntervalId.finalTimeout);
    clearInterval(sessionIntervalId.sessionInterval);
    console.log('Ending session early');
    callApi('/api/cancel/:slackId', {});
    setIsRunning(false);
    setTimeLeft(0);
    console.log('Session ended early.');
  };

  return (
    <div className="bg-gray-900 text-gray-200 min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full p-6 bg-gray-800 rounded-lg shadow-md flex flex-col items-center">
        <h2 className="text-2xl font-semibold text-gray-200 mb-6">Haxalotl Timer</h2>
        {!isRunning ? (
          <form onSubmit={handleSubmit} className="w-full">
            <div className="mb-4">
              <label htmlFor="topic" className="block text-sm font-medium text-gray-400">Session Topic</label>
              <input
                type="text"
                id="topic"
                name="topic"
                value={topic}
                onChange={(e) => setTopic(e.target.value)}
                className="mt-1 block w-full border-gray-600 bg-gray-700 text-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="hours" className="block text-sm font-medium text-gray-400">Number of Hours</label>
              <input
                type="number"
                id="hours"
                name="hours"
                value={hours}
                onChange={(e) => setHours(e.target.value)}
                className="mt-1 block w-full border-gray-600 bg-gray-700 text-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            <div className="mb-4">
              <label htmlFor="apiKey" className="block text-sm font-medium text-gray-400">API Key</label>
              <input
                type="password"
                id="apiKey"
                name="apiKey"
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="mt-1 block w-full border-gray-600 bg-gray-700 text-gray-200 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"
              />
            </div>
            <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 w-full">Start Session</button>
          </form>
        ) : (
          <div id="timerContainer" className="w-full flex flex-col items-center">
            <div id="timer" className="relative w-36 h-36 mx-auto mb-4">
              <svg className="absolute left-0 top-0 h-full w-full">
                <circle id="timerCircle" className="text-transparent stroke-current stroke-2" cx="50%" cy="50%" r="45%" strokeDasharray="283" strokeDashoffset="0"></circle>
              </svg>
              <div id="timerText" className="absolute left-0 top-0 w-full h-full flex items-center justify-center text-2xl font-semibold text-gray-200">
                {formatTime(timeLeft)}
              </div>
            </div>
            <div className="mt-4 flex justify-center space-x-4 w-full">
              <button onClick={pauseSession} className="bg-yellow-500 hover:bg-yellow-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-500 focus:ring-opacity-50 w-1/2">Pause</button>
              <button onClick={endSessionEarly} className="bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-opacity-50 w-1/2">End Early</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default App;
