import React, { useState } from 'react';
import { DateRangePicker } from 'rsuite';
import DateRange from './DateRange';
import moment from 'moment';

const DatePicker = ({ setStartDate, setEndDate, setIsDataFetched }) => {
  const [datePickerValue, setDatePickerValue] = useState([]);

  function handleDatePicker(value) {
    if (value && value.length > 0) {
      setDatePickerValue(value);
      setStartDate(value[0].toISOString());
      setEndDate(value[1].toISOString());
      setIsDataFetched(false);
    } else {
      setDatePickerValue(value);
      const startDate = moment().subtract(24, 'hours').toISOString();
      const endDate = moment().toISOString();
      setStartDate(startDate);
      setEndDate(endDate);
      setIsDataFetched(false);
    }
  }

  return (
    <div className="whitespace-nowrap">
      <DateRangePicker
        ranges={DateRange}
        showOneCalendar
        placeholder={'Select Date Range'}
        style={{ width: 350 }}
        value={datePickerValue}
        onChange={(value) => handleDatePicker(value)}
      />
    </div>
  );
};

export default DatePicker;
