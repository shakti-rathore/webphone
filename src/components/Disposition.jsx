import React, { useState, useCallback, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import HistoryContext from '../context/HistoryContext';
import axios from 'axios';
import Modal from './table/Modal';
import UserCall from './UserCall';
import BreakDropdown from './BreakDropdown';

const Disposition = ({ bridgeID, setDispositionModal, handleContact, setFormData, formData }) => {
  const { username, selectedBreak, setSelectedBreak } = useContext(HistoryContext);
  const [selectedAction, setSelectedAction] = useState(null);
  const [isAutoLeadDialDisabled, setIsAutoLeadDialDisabled] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [userCallOpen, setUserCallOpen] = useState(false);

  const dispositionActions = [
    { action: 'Busy', label: 'B - Busy', color: '#1D4ED8' },
    { action: 'Not Reachable', label: 'NR - Not Reachable', color: '#DC2626' },
    { action: 'Switched Off', label: 'SW - Switched Off', color: '#F97316' },
    { action: 'Interested', label: 'INT - Interested', color: '#16A34A' },
    { action: 'Not Answered', label: 'N - Not Answered', color: '#64748B' },
    { action: 'Test Call', label: 'TEST - Test Call', color: '#9333EA' },
    { action: 'Connected', label: 'CO - Connected', color: '#0D9488' },
  ];

  const handleBreakStatus = async () => {
    try {
      if (selectedBreak === 'Break') {
        const response = await axios.post(`https://callapp.iotcom.io/user/removebreakuser:${username}`);
        if (response.status === 200) {
          setSelectedBreak('Break');
        } else {
          toast.error('Failed to remove break status');
        }
      } else {
        const response = await axios.post(`https://callapp.iotcom.io/user/breakuser:${username}`, {
          breakType: selectedBreak,
        });

        if (response.status === 200) {
          setSelectedBreak(selectedBreak);
        } else {
          toast.error('Failed to set break status');
          setSelectedBreak('Break');
        }
      }
    } catch (error) {
      console.error('Error managing break status:', error);
      toast.error('Failed to update break status');
      setSelectedBreak('Break');
    }
  };
  const submitForm = useCallback(async () => {
    if (!selectedAction) {
      toast.error('Please select an action before submitting.');
      return;
    }

    setIsSubmitting(true);

    try {
      const dispositionData = {
        bridgeID: bridgeID,
        Disposition: selectedAction,
      };

      const dispositionResponse = await axios.post(
        `https://callapp.iotcom.io/user/disposition${username}`,
        dispositionData,
        {
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      if (dispositionResponse.data && dispositionResponse.data.message === 'disposition done sucessfully.') {
        await handleBreakStatus();
        handleContact();
        toast.success('Disposition submitted successfully');
        setDispositionModal(false);
      } else {
        toast.error(dispositionResponse.data.message || 'Submission failed');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('An unexpected error occurred');
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedAction, bridgeID, username, handleContact, setDispositionModal, selectedBreak, setSelectedBreak]);

  const clearForm = useCallback(() => {
    setSelectedAction(null);
    setIsAutoLeadDialDisabled(false);
  }, []);

  useEffect(() => {
    let isMounted = true;
    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 dark:bg-gray-900/60 bg-black/60">
      <Modal isOpen={userCallOpen} onClose={() => setUserCallOpen(false)} title="User Details">
        <UserCall userCallOpen={userCallOpen} formData={formData} setFormData={setFormData} />
      </Modal>

      <div className="w-full max-w-xl bg-white shadow-lg rounded-xl dark:bg-[#333] p-3">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-2 sm:gap-3 md:gap-4 mb-4 sm:mb-6">
          {dispositionActions.map((item) => {
            const isSelected = selectedAction === item.action;
            return (
              <button
                key={item.action}
                type="button"
                style={{
                  backgroundColor: isSelected ? item.color : '#F3F4F6',
                  color: isSelected ? '#FFFFFF' : '#374151',
                }}
                className="w-full px-3 sm:px-4 py-2 sm:py-3 rounded-lg font-semibold text-sm sm:text-base transition-all duration-300 ease-in-out hover:opacity-90"
                onClick={() => setSelectedAction(item.action)}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-between items-start sm:items-center border-t pt-3">
          <div className="w-full sm:w-auto">
            <label className="flex items-center space-x-3 cursor-pointer">
              <input
                type="checkbox"
                id="checkautoleaddial"
                checked={isAutoLeadDialDisabled}
                onChange={(e) => setIsAutoLeadDialDisabled(e.target.checked)}
                className="form-checkbox h-4 w-4 sm:h-5 sm:w-5 text-blue-600 rounded"
              />
              <span className="text-sm sm:text-base text-gray-700 font-medium dark:text-white">Auto Dial off</span>
            </label>
          </div>

          <div className="flex flex-wrap gap-2 sm:gap-3 w-full sm:w-auto">
            <BreakDropdown breakDropdown={true} />
            <button
              type="button"
              onClick={() => setUserCallOpen(true)}
              className="sm:w-auto py-2 px-4 bg-green-500 hover:bg-green-600 text-white rounded-md text-sm sm:text-base transition-colors duration-300"
            >
              See form
            </button>

            <button
              type="button"
              onClick={submitForm}
              disabled={isSubmitting}
              className={`primary-btn ${isSubmitting ? 'bg-gray-400 cursor-not-allowed' : ''}`}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>

            <button
              type="button"
              onClick={clearForm}
              className="sm:w-auto px-4 py-2 bg-gray-200 text-gray-700 text-sm sm:text-base rounded-md hover:bg-gray-300 transition-colors duration-300"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Disposition;
