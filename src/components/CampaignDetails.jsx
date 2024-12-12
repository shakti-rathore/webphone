import React, { useEffect, useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import CampaignAgentTable from './CampaignAgentTable';

const CampaignDetails = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState('');
  const [formData, setFormData] = useState({});
  const [visibleFields, setVisibleFields] = useState([]);
  const [loading, setLoading] = useState(false);
  const [campaignDetails, setCampaignDetails] = useState(false);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/campaign');
        const campaignData = response.data.data.map((item) => ({
          name: item.data.campaignFields.campaignName,
          fields: item.data.campaignFields.fields.map((field) => ({
            ...field,
            visible: field.condition.dependentField ? false : field.visible,
          })),
        }));

        setCampaigns(campaignData);
        if (campaignData.length > 0) {
          setSelectedCampaign(campaignData[0].name);
          setVisibleFields(campaignData[0].fields);
        }
      } catch (err) {
        console.error(err);
        toast.error('Failed to fetch campaigns');
      }
    };

    fetchCampaigns();
  }, []);

  const evaluateCondition = (dependentValue, operator, value) => {
    switch (operator) {
      case 'equals':
        return String(dependentValue).toLowerCase() === String(value).toLowerCase();
      case 'notEquals':
        return String(dependentValue).toLowerCase() !== String(value).toLowerCase();
      default:
        return false;
    }
  };

  const handleCampaignChange = (e) => {
    const selected = campaigns.find((campaign) => campaign.name === e.target.value);
    setSelectedCampaign(selected.name);

    setFormData({});
    setVisibleFields(
      selected.fields.map((field) => ({
        ...field,
        visible: field.condition.dependentField ? false : field.visible,
      }))
    );
  };

  const handleInputChange = (id, value) => {
    const updatedFormData = { ...formData, [id]: value };
    setFormData(updatedFormData);

    const updatedFields = visibleFields.map((field) => {
      if (field.condition && field.condition.dependentField) {
        const dependentValue = updatedFormData[field.condition.dependentField];
        const isVisible = evaluateCondition(dependentValue, field.condition.operator, field.condition.value);

        if (!isVisible && updatedFormData[field.id]) {
          delete updatedFormData[field.id];
        }

        return { ...field, visible: isVisible };
      }
      return field;
    });

    setFormData(updatedFormData);
    setVisibleFields(updatedFields);
  };

  const handleSubmit = async () => {
    setLoading(true);

    try {
      const requiredFieldsMissing = visibleFields.filter((field) => field.visible).some((field) => !formData[field.id]);

      if (requiredFieldsMissing) {
        toast.error('Please fill in all visible fields');
        setLoading(false);
        return;
      }

      const labelBasedFormData = Object.keys(formData).reduce((acc, fieldId) => {
        const field = visibleFields.find((f) => String(f.id) === String(fieldId));

        if (field) {
          acc[field.label] = formData[fieldId];
        }

        return acc;
      }, {});

      const payload = {
        campaignName: selectedCampaign,
        formData: labelBasedFormData,
      };

      const response = await axios.post('http://localhost:5000/api/campaign-agent', payload);

      toast.success('Campaign data saved successfully!');

      setFormData({});
      setVisibleFields(
        visibleFields.map((field) => ({
          ...field,
          visible: field.condition.dependentField ? false : field.visible,
        }))
      );
    } catch (err) {
      console.error('Submission error:', err);
      toast.error('Failed to save campaign data');
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    switch (field.type) {
      case 'text':
      case 'number':
        return (
          <input
            type={field.type}
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="w-full p-2 border rounded-md outline-none"
          />
        );
      case 'textarea':
        return (
          <textarea
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="w-full p-2 border rounded-md outline-none"
            rows="3"
          />
        );
      case 'select':
        return (
          <select
            id={field.id}
            value={formData[field.id] || ''}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="w-full p-2 border rounded-md outline-none capitalize"
          >
            <option value="">Select an option</option>
            {field.options.map((option, index) => (
              <option key={index} value={option} className="capitalize">
                {option}
              </option>
            ))}
          </select>
        );
      case 'radio':
        return (
          <div>
            {field.options.map((option, index) => (
              <label key={index} className="inline-flex items-center mr-4 capitalize">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-4 h-4 capitalize"
                />
                <span className="ml-2 text-sm capitalize">{option}</span>
              </label>
            ))}
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <>
      <div className="text-end mb-4">
        <button
          className="py-2 px-4 bg-blue hover:bg-blue-dark text-white font-medium rounded-md shadow-sm outline-none"
          onClick={() => setCampaignDetails(!campaignDetails)}
        >
          {campaignDetails ? 'Add Campaign' : 'Campaign Details'}
        </button>
      </div>
      {campaignDetails ? (
        <CampaignAgentTable />
      ) : (
        <div className="p-4 mx-auto bg-white rounded-lg shadow">
          <h1 className="font-semibold leading-5 text-start capitalize text-2xl text-gray-900 dark:text-white mb-4">
            Campaign Form
          </h1>
          <label className="block mb-2 text-sm font-medium text-gray-700">Select Campaign</label>
          <select
            className="w-full p-2 mb-4 border rounded-md outline-none capitalize"
            value={selectedCampaign}
            onChange={handleCampaignChange}
          >
            {campaigns.map((campaign) => (
              <option key={campaign.name} value={campaign.name} className="capitalize">
                {campaign.name}
              </option>
            ))}
          </select>

          {visibleFields.map(
            (field) =>
              field.visible && (
                <div key={field.id} className="mb-4">
                  <label className="block mb-2 text-sm font-medium text-gray-700 capitalize" htmlFor={field.id}>
                    {field.label}
                  </label>
                  {renderField(field)}
                </div>
              )
          )}

          <button
            onClick={handleSubmit}
            className="px-4 py-2 rounded-md shadow-sm flex items-center gap-2 hover:bg-blue-dark bg-blue text-white"
            disabled={loading}
          >
            {loading ? 'Saving...' : 'Save'}
          </button>
        </div>
      )}
    </>
  );
};

export default CampaignDetails;
