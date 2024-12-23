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
      <form className="px-3 py-2">
        {/* Personal Information Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-4">
          {/* Full Name */}
          <div className="relative">
            <label
              htmlFor="leadfullname"
              className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Full Name
            </label>
            <div className="flex items-center">
              <FaUser className="absolute left-3 text-gray-400 text-sm sm:text-base" aria-hidden="true" />
              <input
                type="text"
                id="leadfullname"
                name="fullName"
                disabled
                value={formData.fullName}
                onChange={handleInputChange}
                placeholder="Enter full name"
                className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white pl-9 sm:pl-10 pr-3 text-sm sm:text-base border rounded-md outline-none"
                aria-label="Full Name"
              />
            </div>
          </div>

          {/* Email Address */}
          <div className="relative">
            <label
              htmlFor="leademailaddress"
              className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Email Address
            </label>
            <div className="flex items-center">
              <FaEnvelope className="absolute left-3 text-gray-400 text-sm sm:text-base" aria-hidden="true" />
              <input
                type="email"
                id="leademailaddress"
                name="emailAddress"
                disabled
                value={formData.emailAddress}
                onChange={handleInputChange}
                placeholder="Enter email address"
                className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white pl-9 sm:pl-10 pr-3 text-sm sm:text-base border rounded-md outline-none"
                aria-label="Email Address"
              />
            </div>
          </div>

          {/* Phone Number */}
          <div className="relative">
            <label
              htmlFor="leadphonenumber"
              className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Phone Number
            </label>
            <div className="flex items-center">
              <FiPhone className="absolute left-3 text-gray-400 text-sm sm:text-base" aria-hidden="true" />
              <input
                type="tel"
                id="leadphonenumber"
                name="phoneNumber"
                disabled
                value={formData.phoneNumber}
                onChange={handleInputChange}
                placeholder="Enter phone number"
                className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white pl-9 sm:pl-10 pr-3 text-sm sm:text-base border rounded-md outline-none"
                aria-label="Phone Number"
              />
            </div>
          </div>
          {/* Street Address */}
          <div className="relative">
            <label
              htmlFor="leadaddress1"
              className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Street Address
            </label>
            <div className="flex items-center">
              <FaMapMarkerAlt className="absolute left-3 text-gray-400 text-sm sm:text-base" aria-hidden="true" />
              <input
                type="text"
                id="leadaddress1"
                name="address1"
                disabled
                value={formData.address1}
                onChange={handleInputChange}
                placeholder="Enter street address"
                className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white pl-9 sm:pl-10 pr-3 text-sm sm:text-base border rounded-md outline-none"
                aria-label="Street Address"
              />
            </div>
          </div>
        </div>

        {/* Address Section */}
        <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-4">
          {/* Address Line 2 */}
          <div>
            <label
              htmlFor="leadaddress2"
              className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Address Line 2
            </label>
            <input
              type="text"
              id="leadaddress2"
              name="address2"
              disabled
              value={formData.address2}
              onChange={handleInputChange}
              placeholder="Apartment, suite, etc."
              className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white px-3 text-sm sm:text-base border dark:bg-black/50 rounded-md outline-none"
              aria-label="Address Line 2"
            />
          </div>

          {/* City */}
          <div>
            <label
              htmlFor="leadcity"
              className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              City
            </label>
            <input
              type="text"
              id="leadcity"
              name="city"
              disabled
              value={formData.city}
              onChange={handleInputChange}
              placeholder="Enter your city"
              className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white px-3 text-sm sm:text-base border dark:bg-black/50 rounded-md outline-none"
              aria-label="City"
            />
          </div>

          {/* State */}
          <div>
            <label
              htmlFor="leadstate"
              className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              State
            </label>
            <input
              type="text"
              id="leadstate"
              name="state"
              disabled
              value={formData.state}
              onChange={handleInputChange}
              placeholder="Enter your state"
              className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white px-3 text-sm sm:text-base border dark:bg-black/50 rounded-md outline-none"
              aria-label="State"
            />
          </div>

          {/* Postal Code */}
          <div>
            <label
              htmlFor="leadpostal"
              className="block text-sm sm:text-base font-medium text-gray-700 dark:text-gray-200 mb-1"
            >
              Postal Code
            </label>
            <input
              type="number"
              id="leadpostal"
              name="postalCode"
              disabled
              value={formData.postalCode}
              onChange={handleInputChange}
              placeholder="Enter postal code"
              className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white px-3 text-sm sm:text-base border dark:bg-black/50 rounded-md outline-none"
              aria-label="Postal Code"
            />
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 sm:mt-4 mt-2">
          <button
            type="button"
            onClick={(e) => {
              e.preventDefault();
              handleLeadCall();
            }}
            disabled={isLoading}
            className={`w-full sm:w-auto py-2 px-4 text-white font-medium rounded-md shadow-sm outline-none transition-colors flex items-center justify-center text-sm sm:text-base
            ${isLoading ? 'bg-blue-300 cursor-not-allowed' : 'bg-blue hover:bg-blue-dark'}`}
            aria-label={isLoading ? 'Dialing...' : 'Dial Lead'}
          >
            {isLoading ? (
              'Dial...'
            ) : (
              <>
                <FiPhone className="mr-2" aria-hidden="true" /> Dial
              </>
            )}
          </button>

          <button
            type="button"
            onClick={handleNextLead}
            disabled={isLoading}
            className={`w-full sm:w-auto flex items-center justify-center text-white px-4 py-2 rounded transition-colors text-sm sm:text-base
            ${isLoading ? 'bg-green-300 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'}`}
            aria-label={isLoading ? 'Loading next lead...' : 'Next Lead'}
          >
            {isLoading ? (
              'Loading...'
            ) : (
              <>
                Next Lead <FaArrowRight className="ml-2" aria-hidden="true" />
              </>
            )}
          </button>
        </div>
      </form>
    </>
  );
};

export default AutoDial;
