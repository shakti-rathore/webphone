import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { InputField } from './table/InputField';

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
      className={`${
        (!userCallOpen &&
          'max-w-lg p-3 bg-white dark:bg-[#3333] rounded-lg shadow-[0px_0px_7px_0px_rgba(0,0,0,0.1)] dark:bg-[#333]') ||
        'p-3'
      }`}
    >
      <form>
        <div className="grid grid-cols-2 gap-2 md:gap-4">
          <InputField
            label="First Name"
            type="text"
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
          />
          <InputField label="Last Name" type="text" name="lastName" value={formData.lastName} onChange={handleChange} />
          <InputField
            label="Mobile Number"
            type="text"
            name="number"
            value={formData.number}
            onChange={handleChange}
            placeholder="Enter Primary Number"
          />
          <InputField
            label="Alternate Number"
            type="text"
            name="alternateNumber"
            value={formData.alternateNumber}
            onChange={handleChange}
            placeholder="Enter Alternate Number"
          />
          <InputField
            label="Address"
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            placeholder="Enter Address Line 1"
          />
          <InputField
            label="State"
            type="text"
            name="state"
            value={formData.state}
            onChange={handleChange}
            placeholder="Enter State"
          />
          <InputField
            label="District"
            type="text"
            name="district"
            value={formData.district}
            onChange={handleChange}
            placeholder="Enter District"
          />
          <InputField
            label="City"
            type="text"
            name="city"
            value={formData.city}
            onChange={handleChange}
            placeholder="Enter City"
          />
          <InputField
            label="Postal Code"
            type="text"
            name="postalCode"
            value={formData.postalCode}
            onChange={handleChange}
            placeholder="Enter Postal Code"
          />
          <InputField
            label="Email"
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Enter Email Address"
          />
        </div>

        <div className="mt-2">
          <label className="input-label">Comment</label>
          <textarea
            name="comment"
            value={formData.comment}
            onChange={handleChange}
            placeholder="Enter Your comment here!"
            className="input-box"
          />
        </div>

        <button
          type="button"
          onClick={handleCall}
          className={`primary-btn w-full sm:mt-4 mt-2 ${
            loading ? 'bg-gray-400 cursor-not-allowed' : ''
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
