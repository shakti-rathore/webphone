import React, { useContext, useState, useCallback, useEffect } from 'react';
import { FaArrowRight, FaUser, FaEnvelope, FaMapMarkerAlt } from 'react-icons/fa';
import { FiPhone } from 'react-icons/fi';
import axios from 'axios';
import HistoryContext from '../context/HistoryContext';

const AutoDial = ({ setPhoneNumber, setIsAutoDialOpen }) => {
  const { username } = useContext(HistoryContext);
  const [formData, setFormData] = useState({
    fullName: '',
    emailAddress: '',
    phoneNumber: '',
    address1: '',
    address2: '',
    country: '',
    city: '',
    postalCode: '',
    state: '',
  });
  const [isLoading, setIsLoading] = useState(false);
  const [currentLeadId, setCurrentLeadId] = useState(null);

  const handleInputChange = (e) => {
    const { id, value } = e.target;
    setFormData((prevState) => ({
      ...prevState,
      [id.replace('lead', '').charAt(0).toLowerCase() + id.replace('lead', '').slice(1)]: value,
    }));
  };

  useEffect(() => {
    handleDial();
  }, []);

  const handleDial = async () => {
    const payload = {
      user: username,
    };

    setIsLoading(true);
    try {
      const response = await axios.post('https://callapp.iotcom.io/leadforautocall', payload);

      if (response.data.result) {
        const result = response.data.result;

        setFormData({
          fullName: result.name || '',
          emailAddress: result.emailAddress || '',
          phoneNumber: result.number || '',
          address1: result.address || '',
          address2: result.address2 || '',
          country: result.country || '',
          city: result.city || '',
          postalCode: result.postalCode || '',
          state: result.state || '',
        });

        setCurrentLeadId(result.leadId);
      }
    } catch (err) {
      console.error('Error submitting lead:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleNextLead = useCallback(async () => {
    const payload = {
      user: username,
      preleadid: currentLeadId,
      dialstatus: false,
    };

    setIsLoading(true);
    try {
      const response = await axios.post('https://callapp.iotcom.io/nextleadforautocall', payload);

      if (response.data.result) {
        const result = response.data.result;

        setFormData({
          fullName: result.name || '',
          emailAddress: result.emailAddress || '',
          phoneNumber: result.number || '',
          address1: result.address || '',
          address2: result.address2 || '',
          country: result.country || '',
          city: result.city || '',
          postalCode: result.postalCode || '',
          state: result.state || '',
        });

        setCurrentLeadId(result.leadId);
      }
    } catch (err) {
      console.error('Error fetching next lead:', err);
    } finally {
      setIsLoading(false);
    }
  }, [currentLeadId]);

  const handleLeadCall = async () => {
    const payload = {
      caller: username,
      leaddata: {
        _id: currentLeadId,
        name: formData.fullName,
        number: formData.phoneNumber,
        address: formData.address1,
      },
    };
    setIsLoading(true);
    try {
      const response = await axios.post('https://callapp.iotcom.io/leaddialnumber', payload);
      if (response.data && response.data) {
        localStorage.setItem('dialing', true);
        setPhoneNumber(formData.phoneNumber);
        setIsAutoDialOpen(false);
      } else {
        console.error('Failed to initiate call:', response.data.message || 'Unknown error');
      }
    } catch (err) {
      console.error('Error calling API:', err.response?.data || err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <form className="space-y-4 p-4">
        <div className="grid grid-cols-2 gap-4">
          {/* Full Name */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
            <div className="flex items-center">
              <FaUser className="absolute left-3 text-gray-400" />
              <input
                type="text"
                id="leadfullname"
                disabled
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className="w-full dark:border-[#999] dark:text-white pl-10 pr-3 py-2 border rounded-md focus:outline-none"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="relative">
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <div className="flex items-center">
              <FaEnvelope className="absolute left-3 text-gray-400" />
              <input
                type="email"
                id="leademailaddress"
                disabled
                value={formData.emailAddress}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="w-full dark:border-[#999] dark:text-white pl-10 pr-3 py-2 border rounded-md focus:outline-none"
              />
            </div>
          </div>
        </div>

        {/* Phone Number & Country in a line */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
            <input
              type="tel"
              id="leadphonenumber"
              disabled
              value={formData.phoneNumber}
              onChange={handleInputChange}
              placeholder="Enter phone number"
              className="w-full dark:border-[#999] dark:text-white px-3 py-2 border rounded-md focus:outline-none"
            />
          </div>
        </div>

        {/* Address Section */}
        <div className="space-y-3">
          <label className="block text-sm font-medium text-gray-700">Address</label>
          <div className="grid grid-cols-2 gap-4">
            <div className="relative col-span-2">
              <FaMapMarkerAlt className="absolute left-3 top-3 text-gray-400" />
              <input
                type="text"
                id="leadaddress1"
                disabled
                value={formData.address1}
                onChange={handleInputChange}
                placeholder="Enter street address"
                className="w-full dark:border-[#999] dark:text-white pl-10 pr-3 py-2 border rounded-md focus:outline-none mb-2"
              />
            </div>
            <input
              type="text"
              id="leadaddress2"
              disabled
              value={formData.address2}
              onChange={handleInputChange}
              placeholder="Enter street address 2"
              className="w-full dark:border-[#999] dark:text-white px-3 py-2 border rounded-md focus:outline-none mb-2"
            />
            <input
              type="text"
              id="leadcity"
              disabled
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Enter your city"
              className="w-full dark:border-[#999] dark:text-white px-3 py-2 border rounded-md focus:outline-none mb-2"
            />
            <input
              type="text"
              id="leadstate"
              disabled
              value={formData.state}
              onChange={handleInputChange}
              placeholder="Enter your state"
              className="w-full dark:border-[#999] dark:text-white px-3 py-2 border rounded-md focus:outline-none mb-2"
            />
            <input
              type="number"
              id="leadpostal"
              disabled
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="Postal code"
              className="w-full dark:border-[#999] dark:text-white px-3 py-2 border rounded-md focus:outline-none mb-2"
            />
          </div>
        </div>
        <div className="flex space-x-4">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleLeadCall();
            }}
            disabled={isLoading}
            className={`py-2 px-4 text-white font-medium rounded-md shadow-sm outline-none transition-colors flex items-center 
    ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue hover:bg-blue-dark'}`}
          >
            {isLoading ? (
              'Dial...'
            ) : (
              <>
                <FiPhone className="mr-2" /> Dial
              </>
            )}
          </button>

          <button
            onClick={handleNextLead}
            disabled={isLoading}
            className={`flex items-center text-white px-4 py-2 rounded transition-colors
              ${isLoading ? 'bg-green-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
          >
            {isLoading ? (
              'Loading...'
            ) : (
              <>
                Next Lead <FaArrowRight className="ml-2" />
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default AutoDial;
