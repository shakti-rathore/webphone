import axios from 'axios';
import toast from 'react-hot-toast';

const checkApiStatus = async (apiUrl, timeoutMs = 5000) => {
  let isStuck = false;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
      isStuck = true;
    }, timeoutMs);

    await axios.get(apiUrl, {
      signal: controller.signal,
      timeout: timeoutMs,
    });

    clearTimeout(timeoutId);
    isStuck = false;
  } catch (error) {
    console.error('API check failed:', error.message);

    if (
      error.name === 'AbortError' ||
      error.code === 'ECONNABORTED' ||
      error.message.includes('timeout') ||
      error.message.includes('Network Error')
    ) {
      isStuck = true;

      localStorage.clear();
      window.location.href = '/webphone/login';

      toast.error('Connection lost. Please log in again to continue');
    }
  }

  return isStuck;
};

export default checkApiStatus;
