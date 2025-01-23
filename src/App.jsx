import { useState, useEffect, useContext } from 'react';
import Home from './components/Home';
import CallScreen from './components/CallScreen';
import HistoryScreen from './components/HistoryScreen';
import useJssip from './hooks/useJssip';
import HistoryContext from './context/HistoryContext';
import CallConference from './components/CallConference';
import Disposition from './components/Disposition';
import AutoDial from './components/AutoDial';
import UserCall from './components/UserCall';
import axios from 'axios';
import toast from 'react-hot-toast';
import ringtoneMp3 from './ringtone.mp3';
import Modal from './components/table/Modal';
import CallerInfo from './components/CallerInfo';

function App() {
  const [
    ringtone,
    conferenceStatus,
    reqUnHold,
    conferenceNumber,
    setConferenceNumber,
    createConferenceCall,
    toggleHold,
    isHeld,
    seconds,
    minutes,
    status,
    phoneNumber,
    setPhoneNumber,
    handleCall,
    session,
    isRunning,
    audioRef,
    setStatus,
    devices,
    selectedDeviceId,
    changeAudioDevice,
    isRecording,
    startRecording,
    stopRecording,
    bridgeID,
    dispositionModal,
    setDispositionModal,
    userCall,
    timeoutArray,
  ] = useJssip();

  const [seeLogs, setSeeLogs] = useState(false);
  const [callConference, setCallConference] = useState(false);
  const { username, dropCalls, setDropCalls, selectedBreak } = useContext(HistoryContext);
  const [usermissedCalls, setUsermissedCalls] = useState([]);
  const [phoneShow, setPhoneShow] = useState(false);
  const length = Object.keys(usermissedCalls).length;

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    number: '',
    alternateNumber: '',
    address: '',
    city: '',
    state: '',
    postalCode: '',
    district: '',
    comment: '',
  });

  // useEffect(() => {
  //   fetchUserMissedCalls();
  // }, []);

  useEffect(() => {
    if (selectedBreak != 'Break' && ringtone.length >= 0) {
      fetchUserMissedCalls();
    }
  }, [ringtone]);

  const fetchUserMissedCalls = async () => {
    try {
      const response = await axios.post(`${window.location.origin}/usermissedCalls/${username}`);
      setUsermissedCalls(response.data.result || []);
    } catch (error) {
      console.error('Error fetching missed calls:', error);
      setUsermissedCalls([]);
    }
  };

  useEffect(() => {
    if (status === 'start') {
      stopRecording();
    }
  }, [status]);

  useEffect(() => {
    if (userCall) {
      setFormData({
        firstName: userCall.firstName || '',
        lastName: userCall.lastName || '',
        number: userCall.contactNumber || '',
        alternateNumber: userCall.alternateNumber || '',
        address: userCall.Contactaddress || '',
        state: userCall.ContactState || '',
        district: userCall.ContactDistrict || '',
        city: userCall.ContactCity || '',
        postalCode: userCall.ContactPincode || '',
        email: userCall.emailId || '',
        comment: userCall.comment || '',
      });
    }
  }, [userCall]);

  const handleContact = async () => {
    const payload = {
      user: username,
      isFresh: userCall?.isFresh,
      data: {
        firstName: formData.firstName,
        lastName: formData.lastName,
        emailId: formData.email,
        contactNumber: formData.number,
        alternateNumber: formData.alternateNumber,
        comment: formData.comment,
        Contactaddress: formData.address,
        ContactDistrict: formData.district,
        ContactCity: formData.city,
        ContactState: formData.state,
        ContactPincode: formData.postalCode,
      },
    };

    try {
      const response = await axios.post(`${window.location.origin}/addModifyContact`, payload);
      if (response.data) {
        toast.success(response.data.message || 'Contact saved successfully.');
      } else {
        toast.error('Failed to save contact.');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Error occurred.');
    }
  };

  function handleCalls() {
    createConferenceCall();
    setCallConference(false);
  }

  return (
    <>
      <div className="w-7 h-7 rounded-full bg-red-500 flex items-center justify-center fixed -translate-x-48 sm:-translate-x-[22rem] top-2 z-50 right-0 text-white text-sm">
        {length}
      </div>

      <div className="min-h-screen w-full">
        {dispositionModal && (
          <Disposition
            bridgeID={bridgeID}
            setDispositionModal={setDispositionModal}
            userCall={userCall}
            handleContact={handleContact}
            setFormData={setFormData}
            formData={formData}
          />
        )}
        {dropCalls && (
          <Modal isOpen={dropCalls} onClose={() => setDropCalls(false)} title={`User Missed Calls (${length})`}>
            <CallerInfo usermissedCalls={usermissedCalls} setDropCalls={setDropCalls} username={username} />
          </Modal>
        )}
        {/* {(ringtone.length > 0 && status !== 'calling') && (
          <audio controls autoPlay hidden>
            <source src={ringtoneMp3} type="audio/mp3" />
          </audio>
        )} */}

        {ringtone.length > 0 && (
          <marquee>
            <div className="text-sm">
              Call Queue: ({ringtone.length})
              <div className="p-1 bg-white border border-gray-200 rounded-md shadow-sm">
                <p className="text-gray-800">{ringtone.map((call) => call.Caller).join(', ')}</p>
              </div>
            </div>
          </marquee>
        )}

        <div className="w-full mx-auto bg-white dark:bg-black/50 rounded-lg shadow p-3">
          <div className="flex flex-col lg:flex-row items-center gap-5">
            {(status !== 'start' && userCall && (
              <div className="w-full lg:w-2/5">
                <UserCall userCall={userCall} username={username} formData={formData} setFormData={setFormData} />
              </div>
            )) || (
              <div className="w-full lg:w-2/5 relative">
                <AutoDial
                  setPhoneNumber={setPhoneNumber}
                  dispositionModal={dispositionModal}
                  handleCall={handleCall}
                  phoneNumber={phoneNumber}
                />
                <div className="bottom-3 left-64 whitespace-nowrap absolute">
                  <button
                    className="primary-btn"
                    onClick={() => {
                      setPhoneShow(!phoneShow);
                    }}
                  >
                    {!phoneShow ? 'Hide Phone' : 'Show Phone'}
                  </button>
                </div>
              </div>
            )}
            <div className={`w-full ${status !== 'start' ? 'lg:w-2/3' : ''}`}>
              {seeLogs ? (
                <HistoryScreen setSeeLogs={setSeeLogs} />
              ) : status === 'start' ? (
                <div className={`${(phoneShow && 'opacity-0') || 'opacity-100'}`}>
                  <Home
                    phoneNumber={phoneNumber}
                    setPhoneNumber={setPhoneNumber}
                    handleCall={handleCall}
                    setSeeLogs={setSeeLogs}
                    timeoutArray={timeoutArray}
                  />
                </div>
              ) : status === 'calling' || status === 'conference' ? (
                callConference ? (
                  <CallConference
                    conferenceNumber={conferenceNumber}
                    setCallConference={setCallConference}
                    setConferenceNumber={setConferenceNumber}
                    handleCall={handleCalls}
                    setSeeLogs={setSeeLogs}
                    phoneNumber={phoneNumber}
                  />
                ) : (
                  <CallScreen
                    conferenceNumber={conferenceNumber}
                    userCall={userCall}
                    reqUnHold={reqUnHold}
                    setCallConference={setCallConference}
                    toggleHold={toggleHold}
                    isHeld={isHeld}
                    isRecording={isRecording}
                    startRecording={startRecording}
                    stopRecording={stopRecording}
                    phoneNumber={phoneNumber}
                    session={session}
                    seconds={seconds < 10 ? `0${seconds}` : `${seconds}`}
                    minutes={minutes < 10 ? `0${minutes}` : `${minutes}`}
                    isRunning={isRunning}
                    devices={devices}
                    selectedDeviceId={selectedDeviceId}
                    changeAudioDevice={changeAudioDevice}
                    conferenceStatus={conferenceStatus}
                  />
                )
              ) : (
                <div className="text-center p-4">No content available</div>
              )}
            </div>
          </div>

          <audio ref={audioRef} autoPlay hidden />
        </div>
      </div>
    </>
  );
}

export default App;
