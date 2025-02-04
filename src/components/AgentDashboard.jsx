import React, { useContext, useEffect, useState } from 'react';
import moment from 'moment';
import {
  calculateActivityDurations,
  calculateCallStatistics,
  generateChartData,
  ActivityChart,
  CallTrendsChart,
} from '../hooks/agent-dashboard-utils';
import { FiClock, FiPhone, FiPhoneOff, FiUser, FiX } from 'react-icons/fi';
import HistoryContext from '../context/HistoryContext';
import AgentCallData from './AgentCallData';

// Status Badge Component
const StatusBadge = ({ status }) => {
  const getBadgeStyle = (status) => {
    switch (status) {
      case 'INUSE':
        return 'bg-green-100 text-green-800';
      case 'NOT_INUSE':
        return 'bg-blue-100 text-blue-800';
      case 'UNAVAILABLE':
        return 'bg-yellow-100 text-yellow-800';
      case 'Disposition':
        return 'bg-purple-100 text-purple-800';
      case 'RINGING':
        return 'bg-orange-100 text-orange-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <span
      className={`
      px-2 py-1 rounded-full text-xs font-medium uppercase 
      ${getBadgeStyle(status)}
      `}
    >
      {status}
    </span>
  );
};

const AgentDashboard = () => {
  const { selectedStatus, setSelectedStatus } = useContext(HistoryContext);
  const [incomingCallData, setIncomingCallData] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    summary: {
      totalCalls: 0,
      dropCalls: 0,
      myCalls: 0,
      avgDuration: 0,
    },
    activityData: [],
    timeStats: {
      waitingForCall: '0h 0m 0s',
      onCall: '0h 0m 0s',
      break: '0h 0m 0s',
      disposition: '0h 0m 0s',
      totalLoginTime: '0h 0m 0s',
    },
    chartData: [],
  });
  const [loading, setLoading] = useState(true);
  const [showActivityModal, setShowActivityModal] = useState(false);

  const metrics = [
    {
      title: 'Total Calls',
      value: dashboardData.summary.totalCalls,
      icon: <FiPhone className="h-8 w-8 text-blue-500" />,
      color: 'text-blue-500',
    },
    {
      title: 'Drop Calls',
      value: dashboardData.summary.dropCalls,
      icon: <FiPhoneOff className="h-8 w-8 text-red-500" />,
      color: 'text-red-500',
    },
    {
      title: 'My Calls',
      value: dashboardData.summary.myCalls,
      icon: <FiUser className="h-8 w-8 text-green-500" />,
      color: 'text-green-500',
    },
    {
      title: 'Avg Duration',
      value: `${dashboardData.summary.avgDuration}s`,
      icon: <FiClock className="h-8 w-8 text-purple-500" />,
      color: 'text-purple-500',
    },
  ];

  const handleOverlayClick = (e) => {
    if (e.target === e.currentTarget) {
      setShowActivityModal(false);
    }
  };

  useEffect(() => {
    if (showActivityModal) {
      document.body.classList.add('overflow-hidden');
    } else {
      document.body.classList.remove('overflow-hidden');
    }

    return () => {
      document.body.classList.remove('overflow-hidden');
    };
  }, [showActivityModal]);

  useEffect(() => {
    setSelectedStatus('start');
  }, [selectedStatus]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const tokenData = JSON.parse(localStorage.getItem('token'));
        const response = await fetch('${window.location.origin}/agentDashboardData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${tokenData.token}`,
          },
          body: JSON.stringify({ user: tokenData.userData.userid }),
        });

        if (!response.ok) throw new Error('Failed to fetch data');

        const data = await response.json();

        processData(data);
      } catch (err) {
        console.log(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const processData = (rawData) => {
    if (!rawData.DataArray?.length) return;

    const filterData = rawData.DataArray.filter((a) => a.Status !== 'RINGING' && a.Status !== 'RINGINUSE');

    // Process activity durations
    const activityDurations = calculateActivityDurations(filterData);

    // Process call statistics
    const callStats = calculateCallStatistics(rawData.todayCalls || []);

    setDashboardData({
      summary: callStats,
      activityData: filterData,
      timeStats: activityDurations,
      chartData: generateChartData(filterData),
    });
  };

  if (loading)
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );

  return (
    <>
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-4">
        {metrics.map((metric, index) => (
          <div
            className="bg-white dark:bg-gray-800 shadow-md hover:shadow-lg transition-shadow duration-300 p-5 rounded-lg"
            key={index}
          >
            <div className="flex items-center justify-between">
              <div>
                <span className="text-lg font-semibold text-gray-900 dark:text-white mb-1">{metric.title}</span>
                <div className={`font-semibold text-xl ${metric.color}`}>{metric.value}</div>
              </div>
              {metric.icon}
            </div>
          </div>
        ))}
      </div>

      {/* Activity Stats Table */}
      <div className="bg-white dark:bg-[#3333] rounded-lg shadow-[0px_0px_7px_0px_rgba(0,0,0,0.1)] p-6 dark:text-white text-gray-800 mb-4">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold dark:text-white">
            {(incomingCallData && 'Incoming Call Data') || 'Activity Statistics'}
          </h3>
          <div>
            <button className="primary-btn" onClick={() => setIncomingCallData(!incomingCallData)}>
              {(!incomingCallData && 'Incoming Call Data') || 'Activity Statistics'}
            </button>
          </div>
        </div>
        {(incomingCallData && <AgentCallData />) || (
          <div className="overflow-x-auto mt-4">
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#ddd] dark:border-[#333]">
                  <th className="text-left p-2">Waiting For Call</th>
                  <th className="text-left p-2">On Call</th>
                  <th className="text-left p-2">Break</th>
                  <th className="text-left p-2">Disposition</th>
                  <th className="text-left p-2">Total Login Time</th>
                  <th className="text-left p-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td className="p-2">{dashboardData.timeStats.waitingForCall}</td>
                  <td className="p-2">{dashboardData.timeStats.onCall}</td>
                  <td className="p-2">{dashboardData.timeStats.break}</td>
                  <td className="p-2">{dashboardData.timeStats.disposition}</td>
                  <td className="p-2">{dashboardData.timeStats.totalLoginTime}</td>
                  <td className="p-2">
                    <button onClick={() => setShowActivityModal(true)} className="primary-btn">
                      View Details
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-[#3333] rounded-lg shadow-[0px_0px_7px_0px_rgba(0,0,0,0.1)] p-6 dark:text-white text-gray-800">
          <h3 className="text-lg font-semibold">Activity Distribution</h3>
          <div className="mt-4">
            <ActivityChart data={dashboardData.chartData} />
          </div>
        </div>

        <div className="bg-white dark:bg-[#3333] rounded-lg shadow-[0px_0px_7px_0px_rgba(0,0,0,0.1)] p-6 dark:text-white text-gray-800">
          <h3 className="text-lg font-semibold">Call Trends</h3>
          <div className="mt-4">
            <CallTrendsChart data={dashboardData.chartData} />
          </div>
        </div>
      </div>

      {/* Activity Modal */}
      {showActivityModal && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center dark:bg-gray-900/60 bg-black/60"
          onClick={handleOverlayClick}
        >
          <div
            className="max-w-4xl bg-white dark:bg-[#131212] w-full mx-4 rounded-lg shadow-lg max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between p-4 border-b border-[#ddd] dark:border-[#333]">
              <h3 className="md:text-xl text-base font-semibold text-gray-900 dark:text-white">
                Detailed Activity Log
              </h3>
              <button
                onClick={() => setShowActivityModal(false)}
                className="text-gray-500 hover:text-gray-700 dark:hover:text-white"
              >
                <FiX className="w-6 h-6" />
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-[#DDDDDD] dark:divide-[#3B3B3B]">
                <thead className="bg-[#ecf3f9] dark:bg-[#00498E]">
                  <tr>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                      Action Type
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                      Time
                    </th>
                    <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                      Status
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-[#080E1C] divide-y divide-[#DDDDDD] dark:divide-[#3B3B3B]">
                  {dashboardData.activityData.map((activity, index) => (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <td className="p-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{activity.Type}</td>
                      <td className="p-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                        {moment(activity.Time).format('DD-MMM-YYYY hh:mm:ss A')}
                      </td>
                      <td className="p-3 text-sm whitespace-nowrap">
                        <StatusBadge status={activity.Status} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default AgentDashboard;
