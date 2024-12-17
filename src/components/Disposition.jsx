import React, { useState, useCallback, useContext } from 'react';
import toast from 'react-hot-toast';
import HistoryContext from '../context/HistoryContext';
import axios from 'axios';

const Disposition = ({ bridgeID, setDispositionModal }) => {
  const { username } = useContext(HistoryContext);
  const [selectedAction, setSelectedAction] = useState(null);
  const [isAutoLeadDialDisabled, setIsAutoLeadDialDisabled] = useState(false);
  const [isBreakChecked, setIsBreakChecked] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const dispositionActions = [
    { action: 'Busy', label: 'B - Busy', color: '#1D4ED8' }, // Blue
    { action: 'Not Reachable', label: 'NR - Not Reachable', color: '#DC2626' }, // Red
    { action: 'Switched Off', label: 'SW - Switched Off', color: '#F97316' }, // Orange
    { action: 'Interested', label: 'INT - Interested', color: '#16A34A' }, // Green
    { action: 'Not Answered', label: 'N - Not Answered', color: '#64748B' }, // Gray
    { action: 'Test Call', label: 'TEST - Test Call', color: '#9333EA' }, // Purple
    { action: 'Connected', label: 'CO - Connected', color: '#0D9488' }, // Teal
  ];

  const sendBreakSelection = async (breakType) => {
    try {
      const response = await axios.post(`https://callapp.iotcom.io/user/breakuser:${username}`, {
        breakType,
      });

      if (response.status === 200) {
        toast.success(`${breakType} selected successfully!`);
      }
    } catch (error) {
      toast.error('Something went wrong! Please try again.');
      console.error(error);
    }
  };

  const submitForm = useCallback(async () => {
    setIsSubmitting(true);

    try {
      const sendingdata = {
        bridgeID: bridgeID,
        Disposition: selectedAction,
      };

      const response = await axios.post(`https://callapp.iotcom.io/user/disposition${username}`, sendingdata, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (response.data && response.data.message === 'disposition done sucessfully.') {
        toast.success('Disposition submitted successfully');
        setDispositionModal(false);
        if (isBreakChecked) {
          await sendBreakSelection('TeaBreak');
        }
      } else {
        setSubmissionStatus({
          type: 'error',
          message: response.data.message || 'Submission failed',
        });
      }
    } catch (err) {
      console.error('Error:', err);
      setSubmissionStatus({
        type: 'error',
        message: 'An unexpected error occurred',
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [selectedAction, isBreakChecked]);

  const clearForm = useCallback(() => {
    setSelectedAction(null);
    setIsAutoLeadDialDisabled(false);
    setIsBreakChecked(false);
    setSubmissionStatus(null);
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center dark:bg-gray-900/60 bg-black/60">
      <div className="p-4 bg-white shadow-lg rounded-xl">
        <div className="grid grid-cols-3 gap-4 mb-6">
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
                className="px-4 py-3 rounded-lg font-semibold transition-all duration-300 ease-in-out"
                onClick={() => setSelectedAction(item.action)}
              >
                {item.label}
              </button>
            );
          })}
        </div>

        <div className="flex flex-wrap justify-between items-center space-y-4 md:space-y-0 border-t pt-3">
          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="checkautoleaddial"
              checked={isAutoLeadDialDisabled}
              onChange={(e) => setIsAutoLeadDialDisabled(e.target.checked)}
              className="form-checkbox h-5 w-5 text-blue-600 rounded"
            />
            <label htmlFor="checkautoleaddial" className="text-gray-700 font-medium">
              Auto Dial off
            </label>
          </div>

          <div className="flex items-center space-x-3">
            <input
              type="checkbox"
              id="breakCheckbox"
              checked={isBreakChecked}
              onChange={(e) => setIsBreakChecked(e.target.checked)}
              className="form-checkbox h-5 w-5 text-green-600 rounded"
            />
            <label htmlFor="breakCheckbox" className="text-gray-700 font-medium">
              Add Break
            </label>
          </div>

          <div className="flex space-x-4">
            <button
              type="button"
              onClick={submitForm}
              disabled={isSubmitting}
              className={`
              px-6 py-2 rounded-lg font-semibold transition-all duration-300 ease-in-out
              ${
                isSubmitting
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'py-2 px-4 bg-blue hover:bg-blue-dark text-white font-medium rounded-md shadow-sm outline-none'
              }
            `}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>

            <button
              type="button"
              onClick={clearForm}
              className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-semibold transition-all duration-300"
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
