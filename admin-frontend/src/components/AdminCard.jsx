import React from 'react'

const AdminCard = ({ title, children }) => {
  return (
    <div className="admin-card">
      <h2>{title}</h2>
      {children}
    </div>
  )
}

export default AdminCard
