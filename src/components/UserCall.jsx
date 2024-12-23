import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const UserCall = ({ userCall, username, userCallOpen, setUserCallOpen }) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    number: '',
    alternateNumber: '',
    address: '',
    state: '',
    district: '',
    city: '',
    postalCode: '',
    email: '',
    comment: '',
  });

  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (userCall) {
      setFormData((prev) => ({
        ...prev,
        firstName: userCall.firstName || '',
        lastName: userCall.LastName || '',
        number: userCall.contactNumber || '',
        alternateNumber: userCall.alternateNumber || '',
        address: userCall.Contactaddress || '',
        state: userCall.ContactState || '',
        district: userCall.ContactDistrict || '',
        city: userCall.ContactCity || '',
        postalCode: userCall.ContactPincode || '',
        email: userCall.emailId || '',
        comment: userCall.comment || '',
      }));
    }
  }, [userCall]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleCall = useCallback(async () => {
    if (!formData.firstName || !formData.email) {
      toast.error('First name and email are required.');
      return;
    }

    setLoading(true);
    const payload = {
      user: username,
      isFresh: !userCall?.number,
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailId: formData.email,
        contactNumber: formData.number,
        alternateNumber: formData.alternateNumber,
        Contactaddress: formData.address,
        ContactCity: formData.city,
        ContactState: formData.state,
        ContactPincode: formData.postalCode,
      },
    };

    try {
      const response = await axios.post('https://callapp.iotcom.io/addModifyContact', payload);
      if (response.data) {
        toast.success(response.data.message || 'Contact saved successfully.');
        setUserCallOpen(false);
      } else {
        toast.error('Failed to save contact.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred.');
    } finally {
      setLoading(false);
    }
  }, [formData, userCall]);

  return (
    <div
      className={`${(!userCallOpen && 'max-w-lg mx-auto p-3 bg-white shadow-md rounded-md dark:bg-[#333]') || 'p-3'}`}
    >
      {(!userCallOpen && (
        <h2 className="md:text-xl text-base font-semibold text-gray-900 dark:text-white">User Details</h2>
      )) ||
        ''}
      <form>
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          {/* First Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white px-3 text-sm sm:text-base border dark:bg-black/50 rounded-md outline-none"
            />
          </div>

          {/* Last Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white px-3 text-sm sm:text-base border dark:bg-black/50 rounded-md outline-none"
            />
          </div>

          {/* Mobile Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Mobile Number</label>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              placeholder="Primary Number"
              className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white px-3 text-sm sm:text-base border dark:bg-black/50 rounded-md outline-none"
            />
          </div>

          {/* Alternate Number */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Alternate Number</label>
            <input
              type="text"
              name="alternateNumber"
              value={formData.alternateNumber}
              onChange={handleChange}
              placeholder="Alternate"
              className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white px-3 text-sm sm:text-base border dark:bg-black/50 rounded-md outline-none"
            />
          </div>

          {/* Address */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Address</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              placeholder="Address Line 1"
              className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white px-3 text-sm sm:text-base border dark:bg-black/50 rounded-md outline-none"
            />
          </div>

          {/* State */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">State</label>
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white px-3 text-sm sm:text-base border dark:bg-black/50 rounded-md outline-none"
            />
          </div>

          {/* District */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">District</label>
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="District"
              className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white px-3 text-sm sm:text-base border dark:bg-black/50 rounded-md outline-none"
            />
          </div>

          {/* City */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">City</label>
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white px-3 text-sm sm:text-base border dark:bg-black/50 rounded-md outline-none"
            />
          </div>

          {/* Postal Code */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Postal Code</label>
            <input
              type="text"
              name="postalCode"
              value={formData.postalCode}
              onChange={handleChange}
              placeholder="Postal Code"
              className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white px-3 text-sm sm:text-base border dark:bg-black/50 rounded-md outline-none"
            />
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Email</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Email Address"
              className="w-full h-10 sm:h-11 dark:border-[#999] dark:text-white px-3 text-sm sm:text-base border dark:bg-black/50 rounded-md outline-none"
            />
          </div>
        </div>

        {/* Comment Field */}
        <div className="mt-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-white">Comment</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Your comment here!"
            className="mt-1 p-2 border rounded-md w-full outline-none dark:bg-black/50 dark:text-white dark:border-[#999]"
          />
        </div>

        {/* Submit Button */}
        <button
          type="button"
          onClick={handleCall}
          className={`mt-2 w-full py-2 px-4 rounded-md text-white transition ${
            loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue hover:bg-blue-dark'
          }`}
          disabled={loading}
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
};

export default UserCall;
