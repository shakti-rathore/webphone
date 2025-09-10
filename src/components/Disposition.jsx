import { useState, useCallback, useContext, useEffect } from 'react';
import toast from 'react-hot-toast';
import HistoryContext from '../context/HistoryContext';
import axios from 'axios';

const Disposition = ({ bridgeID, setDispositionModal, handleContact }) => {
  const { username } = useContext(HistoryContext);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const autoDispoFunc = async () => {
      if (isSubmitting) return;

      setIsSubmitting(true);

      try {
        const dispositionData = {
          bridgeID: bridgeID,
          Disposition: 'Auto Disposed',
        };

        const dispositionResponse = await axios.post(
          `${window.location.origin}/user/disposition${username}`,
          dispositionData,
          {
            headers: {
              'Content-Type': 'application/json',
            },
          }
        );

        if (dispositionResponse.data.success) {
          // handleContact();
          // toast.success('Disposition submitted successfully');
          setDispositionModal(false);
        } else {
          toast.error(dispositionResponse.data.message || 'Auto Disposition failed');
        }
      } catch (err) {
        console.error('Error:', err);
        toast.error('An unexpected error occurred during auto disposition');
      } finally {
        setIsSubmitting(false);
      }
    };

    autoDispoFunc();
  }, [bridgeID, username, handleContact, setDispositionModal, isSubmitting]);

  return null;
};

export default Disposition;
