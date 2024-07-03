import React, { useState } from 'react';

const Form = ({ startSession }) => {
  const [topic, setTopic] = useState('');
  const [hours, setHours] = useState('');
  const [apiKey, setApiKey] = useState(localStorage.getItem('apiKey') || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!topic || !hours || isNaN(hours) || hours <= 0 || !apiKey) {
      alert('Please fill in all fields correctly.');
      return;
    }
    localStorage.setItem('apiKey', apiKey);
    startSession(topic, hours, apiKey);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700">Session Topic</label>
        <input type="text" value={topic} onChange={(e) => setTopic(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"/>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">Number of Hours</label>
        <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"/>
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700">API Key</label>
        <input type="password" value={apiKey} onChange={(e) => setApiKey(e.target.value)} className="mt-1 block w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring focus:ring-blue-500 focus:ring-opacity-50"/>
      </div>
      <button type="submit" className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50">Start Session</button>
    </form>
  );
};

export default Form;
