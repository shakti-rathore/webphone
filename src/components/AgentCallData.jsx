import React, { useEffect, useState } from 'react';
import { Loader } from 'rsuite';
import 'rsuite/dist/rsuite.min.css';
import DatePicker from './date/DatePicker';

const AgentCallData = () => {
  const [callDetails, setCallDetails] = useState([]);
  const [loading, setLoading] = useState(true);
  const [campaignList, setCampaignList] = useState([]);

  useEffect(() => {
    const fetchCampaignData = async () => {
      try {
        const tokenData = JSON.parse(localStorage.getItem('token'));
        console.log(tokenData)
        const response = await fetch('${window.location.origin}/agentcampaigndetails', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({ admin: tokenData.adminuser }),
        });

        if (!response.ok) throw new Error('Failed to fetch campaign data');

        const data = await response.json();
        const campaigns = data.result.map((campaign) => ({
          campaignID: campaign.campaignID,
          campaignName: campaign.campaignname,
        }));
        setCampaignList(campaigns);
      } catch (error) {
        console.error('Error fetching campaign details:', error);
      }
    };

    const fetchCallData = async () => {
      try {
        const tokenData = JSON.parse(localStorage.getItem('token'));
        const currentDate = new Date();
        const pastDate = new Date();
        pastDate.setDate(currentDate.getDate() - 1);

        const response = await fetch('${window.location.origin}/agentcallData', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
          body: JSON.stringify({
            admin: tokenData.adminuser,
            // startdate: currentDate.toISOString().substring(0, 10),
            // enddate: pastDate.toISOString().substring(0, 10),
            startdate: '2025-03-03',
            enddate: '2025-03-03',
          }),
        });

        // if (response.status === 401) {
        //   window.location.href = '/login.html';
        //   return;
        // }

        if (!response.ok) throw new Error('Failed to fetch call data');

        const data = await response.json();
        const username = tokenData.userid;

        let processedCallDetails = data.result
          .filter((x) => x.agent === username || x.agent === `transferBy-${username}`)
          .map((entry) => {
            return {
              ...entry,
              duration: Math.floor((entry.hanguptime - entry.startTime) / 1000),
              hanguptime: formatDateTime(entry.hanguptime),
              anstime: formatDateTime(entry.anstime),
              startTime: formatDateTime(entry.startTime),
              campaign: campaignList.find((a) => a.campaignID === entry.campaign)?.campaignName || 'Unknown',
              Type: entry.agent.startsWith(`transferBy-${username}`) ? `transfer-${entry.Type}` : entry.Type,
            };
          });

        const uniqueCallDetails = Array.from(
          new Map(processedCallDetails.map((item) => [item.bridgeID, item])).values()
        );

        setCallDetails(uniqueCallDetails);
        setLoading(false);
      } catch (error) {
        console.error('Error fetching call details:', error);
        setLoading(false);
      }
    };

    function formatDateTime(dateTimeString) {
      if (!dateTimeString) return 'NA';
      const istDate = new Date(dateTimeString);
      const day = String(istDate.getDate()).padStart(2, '0');
      const month = String(istDate.getMonth() + 1).padStart(2, '0');
      const year = istDate.getFullYear();
      const formattedDate = `${day}/${month}/${year}`;

      const formattedTime = istDate.toLocaleString('en-US', {
        timeZone: 'Asia/Kolkata',
        hour: 'numeric',
        minute: 'numeric',
        second: 'numeric',
        hour12: true,
      });

      return `${formattedDate}\n\n\n${formattedTime}`;
    }

    fetchCampaignData();
    fetchCallData();
  }, []);

  const handlePlayAudio = (bridgeID) => {
    const audioSource = `/recording${bridgeID}.wav`;
    console.log('Playing audio:', audioSource);
    // Implement audio playback logic
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader size="lg" />
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto mt-4">
        <DatePicker />
        <table className="min-w-full divide-y divide-[#DDDDDD] dark:divide-[#3B3B3B]">
          <thead className="bg-[#ecf3f9] dark:bg-[#00498E]">
            <tr>
              <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                Caller
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                Campaign
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                Call Received
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                Call Answered
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                Call Disconnected
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                Duration
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                Type
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                Disposition
              </th>
              <th className="p-3 text-left text-xs font-medium text-gray-500 dark:text-white uppercase tracking-wider">
                Listen
              </th>
            </tr>
          </thead>

          <tbody className="bg-white dark:bg-[#080E1C] divide-y divide-[#DDDDDD] dark:divide-[#3B3B3B]">
            {(callDetails.length > 0 &&
              callDetails.map(
                (call, index) =>
                  (
                    <tr key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200">
                      <td className="p-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{call.Caller}</td>
                      <td className="p-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{call.campaign}</td>
                      <td className="p-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{call.startTime}</td>
                      <td className="p-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{call.anstime}</td>
                      <td className="p-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{call.hanguptime}</td>
                      <td className="p-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{call.duration}</td>
                      <td className="p-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">{call.Type}</td>
                      <td className="p-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                        {call.Disposition || 'No Disposition'}
                      </td>
                      <td className="p-3 text-sm text-gray-900 dark:text-white whitespace-nowrap">
                        <button
                          onClick={() => handlePlayAudio(call.bridgeID)}
                          className="bg-green-500 text-white p-2 rounded hover:bg-green-600 transition-colors"
                        >
                          <i className="bi bi-headphones"></i>
                        </button>
                      </td>
                    </tr>
                  ) || ''
              )) || (
              <tr className="text-center">
                <td colSpan={9} className="dark:text-white pt-4">
                  No Incoming Call Data Found
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </>
  );
};

export default AgentCallData;
