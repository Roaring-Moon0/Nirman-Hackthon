import React, { useState } from 'react'

const AdminForm = ({ fields, onSubmit, submitText = 'Submit', loading = false }) => {
  const [formData, setFormData] = useState({})

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    })
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    onSubmit(formData)
  }

  const handleReset = () => {
    setFormData({})
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      {fields.map((field) => (
        <div key={field.name} className="form-group">
          <label>
            {field.label} {field.required && <span>*</span>}
          </label>
          <input
            type={field.type}
            name={field.name}
            placeholder={field.placeholder}
            value={formData[field.name] || ''}
            onChange={handleChange}
            required={field.required}
          />
        </div>
      ))}
      <div style={{ display: 'flex', gap: '10px' }}>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Submitting...' : submitText}
        </button>
        <button type="button" className="btn btn-secondary" onClick={handleReset}>
          Reset
        </button>
      </div>
    </form>
  )
}

export default AdminForm
