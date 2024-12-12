import React, { useState, useEffect } from 'react';
import axios from 'axios';
import CommonTable from './table/CommonTable';

const CampaignAgentTable = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/campaign-agent');
        if (response.data.status) {
          // Transform the data to include a single 'formDetails' column
          const transformedData = response.data.data.map((item) => ({
            campaignName: item.data.campaignName,
            formDetails: Object.entries(item.data.formData)
              .map(([key, value]) => `${key}: ${value}`)
              .join(', '),
          }));
          setData(transformedData);
        } else {
          console.error('Failed to retrieve data');
        }
      } catch (err) {
        console.error('Error fetching data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const columns = [
    { label: 'Campaign Name', accessor: 'campaignName' },
    { label: 'Form Details', accessor: 'formDetails' },
  ];

  return <CommonTable title="Campaign Details" data={data} columns={columns} loading={loading} />;
};

export default CampaignAgentTable;
