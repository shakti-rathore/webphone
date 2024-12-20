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
        ...userCall,
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
        setUserCallOpen(false)
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
    <div className={`${!userCallOpen && 'max-w-lg mx-auto p-4 bg-white shadow-md rounded-md dark:bg-[#333]' || 'p-4'}`}>
      {(!userCallOpen && <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4">User Details</h2>) || ''}
      <form>
        {/* Name Fields */}
        <div className="flex space-x-2">
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 dark:text-white">First Name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              className="mt-1 p-2 border rounded-md w-full outline-none"
            />
          </div>
          <div className="w-1/2">
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Last Name</label>
            <input
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              className="mt-1 p-2 border rounded-md w-full outline-none"
            />
          </div>
        </div>

        {/* Number Fields */}
        <div className="mt-4 flex space-x-2">
          <div className="w-2/3">
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Mobile Number</label>
            <input
              type="text"
              name="number"
              value={formData.number}
              onChange={handleChange}
              placeholder="Primary Number"
              className="mt-1 p-2 border rounded-md w-full outline-none"
            />
          </div>
          <div className="w-1/3">
            <label className="block text-sm font-medium text-gray-700 dark:text-white">Alternate Number</label>
            <input
              type="text"
              name="alternateNumber"
              value={formData.alternateNumber}
              onChange={handleChange}
              placeholder="Alternate"
              className="mt-1 p-2 border rounded-md w-full outline-none"
            />
          </div>
        </div>

        {/* Address Fields */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-white">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Address Line 1"
            className="mt-1 p-2 border rounded-md w-full outline-none"
          />
          <div className="mt-2 flex space-x-2">
            <input
              type="text"
              name="state"
              value={formData.state}
              onChange={handleChange}
              placeholder="State"
              className="p-2 border rounded-md w-1/3 outline-none"
            />
            <input
              type="text"
              name="district"
              value={formData.district}
              onChange={handleChange}
              placeholder="District"
              className="p-2 border rounded-md w-1/3 outline-none"
            />
            <input
              type="text"
              name="city"
              value={formData.city}
              onChange={handleChange}
              placeholder="City"
              className="p-2 border rounded-md w-1/3 outline-none"
            />
          </div>
          <input
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="Postal Code"
            className="mt-2 p-2 border rounded-md w-full outline-none"
          />
        </div>

        {/* Email Field */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-white">Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="mt-1 p-2 border rounded-md w-full outline-none"
          />
        </div>

        {/* Comment Field */}
        <div className="mt-4">
          <label className="block text-sm font-medium text-gray-700 dark:text-white">Comment</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Your comment here!"
            className="mt-1 p-2 border rounded-md w-full outline-none"
          />
        </div>

        <button
          type="button"
          onClick={handleCall}
          className={`mt-6 w-full py-2 px-4 rounded-md text-white transition ${
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
