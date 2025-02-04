import React from 'react';
import { LineChart, BarChart, XAxis, YAxis, CartesianGrid, Tooltip, Legend, Line, Bar, ResponsiveContainer } from 'recharts';

// Helper function to convert milliseconds to "h:m:s" format
export const msToHMS = (duration) => {
  const seconds = Math.floor((duration / 1000) % 60);
  const minutes = Math.floor((duration / (1000 * 60)) % 60);
  const hours = Math.floor((duration / (1000 * 60 * 60)) % 24);
  return `${hours}h ${minutes}m ${seconds}s`;
};

// Calculate activity durations from filtered data
export const calculateActivityDurations = (filterData) => {
  const summary = {
    waitingForCall: 0,
    onCall: 0,
    break: 0,
    disposition: 0,
    totalLoginTime: 0,
  };

  // Process the time differences between consecutive events
  for (let i = 0; i < filterData.length - 1; i++) {
    const startTime = new Date(filterData[i].Time).getTime();
    const endTime = new Date(filterData[i + 1].Time).getTime();
    const duration = endTime - startTime;

    // Determine the activity type based on status
    const status = filterData[i].Status;
    if (status === 'NOT_INUSE') {
      summary.waitingForCall += duration;
    } else if (status === 'INUSE') {
      summary.onCall += duration;
    } else if (status === 'Disposition') {
      summary.disposition += duration;
    } else if (status === 'UNAVAILABLE') {
      summary.break += duration;
    }
  }

  // Calculate total login time
  summary.totalLoginTime = summary.waitingForCall + summary.onCall + summary.disposition;

  // Convert all durations to HMS format
  return {
    waitingForCall: msToHMS(summary.waitingForCall),
    onCall: msToHMS(summary.onCall),
    break: msToHMS(summary.break),
    disposition: msToHMS(summary.disposition),
    totalLoginTime: msToHMS(summary.totalLoginTime),
  };
};

// Calculate call statistics
export const calculateCallStatistics = (todayCalls) => {
  const user = JSON.parse(localStorage.getItem('token'))?.userData?.userid;

  const stats = {
    totalCalls: todayCalls.length,
    dropCalls: todayCalls.filter((call) => call.Type === 'incoming' && !call.anstime).length,
    myCalls: todayCalls.filter((call) => call.agent === user).length,
    avgDuration: 0,
  };

  // Calculate average duration for answered calls
  const answeredCalls = todayCalls.filter((call) => call.Type === 'incoming' && call.anstime && call.hanguptime);

  if (answeredCalls.length > 0) {
    const totalDuration = answeredCalls.reduce((sum, call) => sum + (call.hanguptime - call.anstime), 0);
    stats.avgDuration = Math.round(totalDuration / (1000 * answeredCalls.length));
  }

  return stats;
};

// Generate chart data
export const generateChartData = (filterData) => {
  // Activity Distribution Chart Data
  const activityDistribution = filterData.reduce((acc, curr) => {
    const hour = new Date(curr.Time).getHours();
    if (!acc[hour]) {
      acc[hour] = { INUSE: 0, NOT_INUSE: 0, Disposition: 0, UNAVAILABLE: 0 };
    }
    acc[hour][curr.Status] = (acc[hour][curr.Status] || 0) + 1;
    return acc;
  }, {});

  return Object.entries(activityDistribution).map(([hour, stats]) => ({
    name: `${hour}:00`,
    onCall: stats.INUSE || 0,
    waiting: stats.NOT_INUSE || 0,
    disposition: stats.Disposition || 0,
    break: stats.UNAVAILABLE || 0,
  }));
};

// Chart Components with Responsive Design
export const ActivityChart = ({ data, className = '' }) => (
  <div className={`w-full h-80 ${className}`}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
        <XAxis 
          dataKey="name" 
          tickLine={false} 
          axisLine={{ stroke: '#888' }} 
          tick={{ fill: '#666', fontSize: 12 }} 
        />
        <YAxis 
          tickLine={false} 
          axisLine={{ stroke: '#888' }} 
          tick={{ fill: '#666', fontSize: 12 }} 
        />
        <Tooltip 
          contentStyle={{ 
            backgroundColor: 'rgba(255,255,255,0.9)', 
            borderRadius: '8px', 
            border: '1px solid #ddd' 
          }} 
        />
        <Legend 
          verticalAlign="bottom" 
          height={36} 
          iconType="circle" 
          iconSize={10}
        />
        <Line type="monotone" dataKey="onCall" stroke="#8884d8" name="On Call" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="waiting" stroke="#82ca9d" name="Waiting" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="disposition" stroke="#ffc658" name="Disposition" strokeWidth={2} dot={false} />
        <Line type="monotone" dataKey="break" stroke="#ff7300" name="Break" strokeWidth={2} dot={false} />
      </LineChart>
    </ResponsiveContainer>
  </div>
);

export const CallTrendsChart = ({ data, className = '' }) => {
  const callTrends = data.map((item) => ({
    name: item.name,
    totalActivity: item.onCall + item.waiting + item.disposition + item.break,
  }));

  return (
    <div className={`w-full h-80 ${className}`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={callTrends} margin={{ top: 20, right: 30, left: 20, bottom: 20 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis 
            dataKey="name" 
            tickLine={false} 
            axisLine={{ stroke: '#888' }} 
            tick={{ fill: '#666', fontSize: 12 }} 
          />
          <YAxis 
            tickLine={false} 
            axisLine={{ stroke: '#888' }} 
            tick={{ fill: '#666', fontSize: 12 }} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: 'rgba(255,255,255,0.9)', 
              borderRadius: '8px', 
              border: '1px solid #ddd' 
            }} 
          />
          <Legend 
            verticalAlign="bottom" 
            height={36} 
            iconType="circle" 
            iconSize={10}
          />
          <Bar dataKey="totalActivity" fill="#8884d8" name="Total Activity" barSize={30} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};
