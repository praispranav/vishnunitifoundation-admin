import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const FormControl = ({ darkMode }) => {
  const [formId, setFormId] = useState(null);
  const [formTitle, setFormTitle] = useState('Pledge Form');
  const [formOpenerText, setFormOpenerText] = useState('Take a Pledge');
  const [buttonText, setButtonText] = useState('Submit');
  const [buttonColor, setButtonColor] = useState('#6f3a8f');

  const [fields, setFields] = useState([
    { label: 'Name', type: 'text', show: true },
    { label: 'Phone', type: 'text', show: true },
    { label: 'City', type: 'text', show: true },
    { label: 'Email', type: 'text', show: false }
  ]);
  const [newFieldLabel, setNewFieldLabel] = useState('');
  const [coordinateOptions, setCoordinateOptions] = useState([]);

  const apiKey = localStorage.getItem('apiKey');
  const themeCard = darkMode ? 'bg-dark text-white border-light' : 'bg-light text-dark border';
  const inputBg = darkMode ? 'bg-secondary text-white' : '';

  const getTemplates = async () => {
    try {
      const res = await axios.get('https://cervical.praispranav.com/day-template/get-template', {
        headers: { 'x-api-key': apiKey }
      });
      const options = (res.data || []).map(temp => ({
        label: temp.name,
        value: temp._id,
        show: false
      }));
      setCoordinateOptions(options);
    } catch {
      toast.error('Failed to load coordinate options.');
    }
  };

  const getFormControl = async () => {
    try {
      const res = await axios.get('https://cervical.praispranav.com/day-template/get-form-control', {
        headers: { 'x-api-key': apiKey }
      });
      const data = res.data;
      if (!data) return;

      setFormId(data._id || null);
      setFormTitle(data.formTitle || '');
      setFormOpenerText(data.formOpenerButtonText || '');
      setButtonText(data.submitButtonText || '');
      setButtonColor(data.submitButtonColor || '#6f3a8f');

      const updatedFields = fields.map(field => ({
        ...field,
        show: data[`show${field.label}Field`] ?? field.show
      }));
      setFields(updatedFields);

      setCoordinateOptions(prev =>
        prev.map(opt => ({
          ...opt,
          show: data.eventRadioBtns?.includes(opt.value) || false
        }))
      );
    } catch {
      toast.error('Failed to load form data');
    }
  };

  useEffect(() => {
    (async () => {
      await getTemplates();
      await getFormControl();
    })();
  }, []);

  const toggleFieldVisibility = (index) => {
    const updated = [...fields];
    updated[index].show = !updated[index].show;
    setFields(updated);
  };


  // const toggleRadioOptionVisibility = (index) => {
  //   const updated = [...coordinateOptions];
  //   updated[index].show = !updated[index].show;
  //   setCoordinateOptions(updated);
  // };

  const toggleRadioOptionVisibility = (index) => {
    const updated = coordinateOptions.map((opt, i) => ({
      ...opt,
      show: i === index ? true : false
    }));
    setCoordinateOptions(updated);
  };
  

  const addNewField = () => {
    const label = newFieldLabel.trim();
    if (label && !fields.some(f => f.label.toLowerCase() === label.toLowerCase())) {
      setFields([...fields, { label, type: 'text', show: true }]);
      setNewFieldLabel('');
    }
  };

  const handleSave = async () => {
    const body = {
      formOpenerButtonText: formOpenerText,
      formTitle,
      submitButtonText: buttonText,
      submitButtonColor: buttonColor,
      showNameField: fields.find(f => f.label === 'Name')?.show || false,
      showPhoneField: fields.find(f => f.label === 'Phone')?.show || false,
      showCityField: fields.find(f => f.label === 'City')?.show || false,
      showEmailField: fields.find(f => f.label === 'Email')?.show || false,
      eventRadioBtns: coordinateOptions.filter(opt => opt.show).map(opt => opt.value),
    };

    const url = formId
      ? 'https://cervical.praispranav.com/day-template/update-from-control'
      : 'https://cervical.praispranav.com/day-template/create-form-control';

    const method = formId ? 'PATCH' : 'POST';
    if (formId) body._id = formId;

    try {
      await axios({
        method,
        url,
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': apiKey
        },
        data: body
      });

      toast.success('Form control saved successfully!');
    } catch {
      toast.error('Error saving form control.');
    }
  };

  return (
    <div className={`card card-style shadow-sm p-3 ${themeCard}`}>
      <ToastContainer position="top-right" autoClose={3000} />
      <h3 className="mb-4 d-flex align-items-center">Form Control</h3>

      <div className="mb-3">
        <label>Form Opener Button Text:</label>
        <input
          type="text"
          className={`form-control ${inputBg}`}
          value={formOpenerText}
          onChange={(e) => setFormOpenerText(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label>Form Title:</label>
        <input
          type="text"
          className={`form-control ${inputBg}`}
          value={formTitle}
          onChange={(e) => setFormTitle(e.target.value)}
        />
      </div>

      <hr />
      <h5 className="mt-4">Form Fields:</h5>
      {fields.map((field, index) => (
        <div
          className={`d-flex justify-content-between align-items-center border p-2 rounded mb-2 ${darkMode ? 'bg-secondary text-white' : ''}`}
          key={index}
        >
          <strong>{field.label}</strong>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={field.show}
              onChange={() => toggleFieldVisibility(index)}
            />
            <label className="form-check-label">{field.show ? 'Shown' : 'Hidden'}</label>
          </div>
        </div>
      ))}

      <div className="d-flex mt-3">
        <input
          type="text"
          className={`form-control me-2 ${inputBg}`}
          placeholder="Add new field label"
          value={newFieldLabel}
          onChange={(e) => setNewFieldLabel(e.target.value)}
        />
        <button className="btn btn-secondary" onClick={addNewField}>Add</button>
      </div>

      <hr />
      <h5>Coordinate Radio Options:</h5>
      {coordinateOptions.map((opt, index) => (
        <div
          className={`d-flex justify-content-between align-items-center border p-2 rounded mb-2 ${darkMode ? 'bg-secondary text-white' : ''}`}
          key={index}
        >
          <strong>{opt.label}</strong>
          <div className="form-check form-switch">
            <input
              className="form-check-input"
              type="checkbox"
              checked={opt.show}
              onChange={() => toggleRadioOptionVisibility(index)}
            />
            <label className="form-check-label">{opt.show ? 'Shown' : 'Hidden'}</label>
          </div>
        </div>
      ))}

      <hr />
      <div className="mb-3">
        <label>Submit Button Text:</label>
        <input
          type="text"
          className={`form-control ${inputBg}`}
          value={buttonText}
          onChange={(e) => setButtonText(e.target.value)}
        />
      </div>

      <div className="mb-3">
        <label>Submit Button Color:</label>
        <input
          type="color"
          className="form-control form-control-color"
          value={buttonColor}
          onChange={(e) => setButtonColor(e.target.value)}
        />
      </div>

      <div className="d-flex justify-content-end mb-2">
        <button className="btn btn-outline-primary" onClick={handleSave}>Update Changes</button>
      </div>
    </div>
  );
};

export default FormControl;
