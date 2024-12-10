import React, { useEffect, useState } from "react";
import axios from "axios";

const CampaignForm = () => {
  const [campaigns, setCampaigns] = useState([]);
  const [selectedCampaign, setSelectedCampaign] = useState("");
  const [formData, setFormData] = useState({});
  const [visibleFields, setVisibleFields] = useState([]);

  useEffect(() => {
    const fetchCampaigns = async () => {
      try {
        const response = await axios.get("http://localhost:5000/api/campaign");
        const campaignData = response.data.data.map((item) => ({
          name: item.data.campaignFields.campaignName,
          fields: item.data.campaignFields.fields.map((field, index) => ({
            ...field,
            visible: index === 0, // Only the first field is visible initially
          })),
        }));
        setCampaigns(campaignData);
        if (campaignData.length > 0) {
          setSelectedCampaign(campaignData[0].name);
          setVisibleFields(campaignData[0].fields);
        }
      } catch (err) {
        console.error(err);
      }
    };

    fetchCampaigns();
  }, []);

  const handleCampaignChange = (e) => {
    const selected = campaigns.find(
      (campaign) => campaign.name === e.target.value
    );
    setSelectedCampaign(selected.name);
    setVisibleFields(
      selected.fields.map((field, index) => ({
        ...field,
        visible: index === 0, // Reset visibility on campaign change
      }))
    );
    setFormData({});
  };

  const handleInputChange = (id, value) => {
    const updatedFormData = { ...formData, [id]: value };
    setFormData(updatedFormData);

    const updatedFields = visibleFields.map((field, index, allFields) => {
      if (field.id === id) {
        // Check if the current field is valid
        const isValid = value !== "";
        if (isValid && index + 1 < allFields.length) {
          // Make the next field visible
          allFields[index + 1].visible = true;
        }
      }
      return field;
    });

    setVisibleFields(updatedFields);
  };

  const renderField = (field) => {
    switch (field.type) {
      case "text":
      case "number":
      case "email":
      case "date":
        return (
          <input
            type={field.type}
            id={field.id}
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="w-full p-2 border rounded-md outline-none"
          />
        );
      case "textarea":
        return (
          <textarea
            id={field.id}
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="w-full p-2 border rounded-md outline-none"
            rows="3"
          />
        );
      case "checkbox":
        return (
          <input
            type="checkbox"
            id={field.id}
            checked={formData[field.id] || false}
            onChange={(e) => handleInputChange(field.id, e.target.checked)}
            className="w-4 h-4"
          />
        );
      case "radio":
        return (
          <div>
            {field.options.map((option, index) => (
              <label key={index} className="inline-flex items-center mr-4">
                <input
                  type="radio"
                  name={field.id}
                  value={option}
                  checked={formData[field.id] === option}
                  onChange={(e) => handleInputChange(field.id, e.target.value)}
                  className="w-4 h-4"
                />
                <span className="ml-2 text-sm">{option}</span>
              </label>
            ))}
          </div>
        );
      case "select":
        return (
          <select
            id={field.id}
            value={formData[field.id] || ""}
            onChange={(e) => handleInputChange(field.id, e.target.value)}
            className="w-full p-2 border rounded-md outline-none"
          >
            <option value="">Select an option</option>
            {field.options.map((option, index) => (
              <option key={index} value={option}>
                {option}
              </option>
            ))}
          </select>
        );
      default:
        return null;
    }
  };

  return (
    <div className="p-6 mx-auto bg-white rounded-lg shadow">
      <h1 className="text-2xl font-bold mb-4">Campaign Form</h1>
      <label className="block mb-2 text-sm font-medium text-gray-700">
        Select Campaign
      </label>
      <select
        className="w-full p-2 mb-4 border rounded-md outline-none"
        value={selectedCampaign}
        onChange={handleCampaignChange}
      >
        {campaigns.map((campaign) => (
          <option key={campaign.name} value={campaign.name}>
            {campaign.name}
          </option>
        ))}
      </select>

      {visibleFields.map(
        (field) =>
          field.visible && (
            <div key={field.id} className="mb-4">
              <label
                className="block mb-2 text-sm font-medium text-gray-700"
                htmlFor={field.id}
              >
                {field.label}
              </label>
              {renderField(field)}
            </div>
          )
      )}
    </div>
  );
};

export default CampaignForm;
