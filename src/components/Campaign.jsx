import $ from 'jquery';
import React, { Component, createRef } from 'react';
import ReactDOM from 'react-dom';

window.jQuery = $;
window.$ = $;

require('jquery-ui-sortable');
require('formBuilder');

class CampaignFormBuilder extends Component {
  constructor(props) {
    super(props);

    // Initial form data with campaign-specific fields
    this.initialFormData = [
      {
        type: 'header',
        subtype: 'h1',
        label: 'Campaign Form Builder',
        className:'dark:text-white dark:bg-[#3333] bg-white text-gray-900'
      },
      {
        type: 'text',
        label: 'Campaign Name',
        name: 'campaign_name',
        required: true,
        placeholder: 'Enter campaign name',
        className: 'w-full px-3 py-2 border dark:text-white dark:bg-[#3333] dark:border-[#999] border-[#ddd] rounded-md outline-none bg-white',
      },
      {
        type: 'select',
        label: 'Campaign Type',
        name: 'campaign_type',
        values: [
          { label: 'Email Marketing', value: 'email' },
          { label: 'Social Media', value: 'social' },
          { label: 'PPC', value: 'ppc' },
          { label: 'Content Marketing', value: 'content' },
        ],
        className: 'w-full px-3 py-2 border dark:text-white dark:bg-[#3333] dark:border-[#999] border-[#ddd] rounded-md outline-none bg-white',
      },
      {
        type: 'date',
        label: 'Start Date',
        name: 'start_date',
        required: true,
        className: 'w-full px-3 py-2 border dark:text-white dark:bg-[#3333] dark:border-[#999] border-[#ddd] rounded-md bg-white',

      },
      {
        type: 'date',
        label: 'End Date',
        name: 'end_date',
        className: 'w-full px-3 py-2 border dark:text-white dark:bg-[#3333] dark:border-[#999] border-[#ddd] rounded-md bg-white',

      },
      {
        type: 'select',
        label: 'Campaign Status',
        name: 'campaign_status',
        values: [
          { label: 'Draft', value: 'draft' },
          { label: 'Active', value: 'active' },
          { label: 'Paused', value: 'paused' },
          { label: 'Completed', value: 'completed' },
        ],
        className: 'w-full px-3 py-2 border dark:text-white dark:bg-[#3333] dark:border-[#999] border-[#ddd] rounded-md bg-white',

      },
      {
        type: 'number',
        label: 'Budget',
        name: 'campaign_budget',
        step: '0.01',
        className: 'w-full px-3 py-2 border dark:text-white dark:bg-[#3333] dark:border-[#999] border-[#ddd] rounded-md outline-none bg-white',

      },
      {
        type: 'textarea',
        label: 'Campaign Description',
        name: 'campaign_description',
        className: 'w-full px-3 py-2 border dark:text-white dark:bg-[#3333] dark:border-[#999] border-[#ddd] rounded-md outline-none bg-white',

      },
    ];

    // Reference for form builder
    this.fb = createRef();

    // State to track form builder instance
    this.state = {
      formBuilderInstance: null,
    };
  }

  componentDidMount() {
    // Initialize form builder with predefined fields
    const formBuilderInstance = $(this.fb.current).formBuilder({
      formData: this.initialFormData,
      disabledActionButtons: ['data'],
      onSave: this.handleFormSave.bind(this),
    });

    // Store form builder instance in state
    this.setState({ formBuilderInstance });
  }

  // Handle form save action
  handleFormSave(evt) {
    try {
      // Get the form data
      const formData = this.state.formBuilderInstance.actions.getData('json');
      const parsedData = JSON.parse(formData);

      // Log or process the campaign form data
      console.log('Campaign Form Data:', parsedData);

      // Optional: Send data to backend or perform further processing
      this.saveCampaignData(parsedData);
    } catch (error) {
      console.error('Error parsing form data:', error);
    }
  }

  // Method to save campaign data (mock implementation)
  saveCampaignData(data) {
    // In a real application, this would typically involve an API call
    fetch('/api/campaigns', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    })
      .then((response) => response.json())
      .then((result) => {
        console.log('Campaign saved successfully:', result);
        // Optionally show success message or redirect
      })
      .catch((error) => {
        console.error('Error saving campaign:', error);
        // Handle error (show error message, etc.)
      });
  }

  render() {
    return (
      <>
        <div className="mx-auto">
          {/* Form Builder Container */}
          <div className="bg-white dark:bg-[#333] shadow-lg rounded-xl p-6 border dark:border-[#1a1a1a] border-[#ddd] mb-6">
            <div className="flex items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Campaign Details</h2>
            </div>

            <div id="fb-editor" ref={this.fb} className="form-builder-container space-y-4 dark:bg-[#333] bg-white" />
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <button
              onClick={() => this.state.formBuilderInstance?.actions.save()}
              className="flex items-center px-6 py-3 bg-blue-dark text-white rounded-lg hover:bg-blue transition-colors"
            >
              Save Campaign
            </button>
          </div>
        </div>
      </>
    );
  }
}

// Render the component
ReactDOM.render(<CampaignFormBuilder />, document.getElementById('root'));

export default CampaignFormBuilder;
