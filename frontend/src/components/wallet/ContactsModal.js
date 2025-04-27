import React, { useState, useEffect } from 'react';

const ContactsModal = ({ onClose, onSelectContact }) => {
  const [contacts, setContacts] = useState([]);
  const [newContact, setNewContact] = useState({ name: '', payId: '', note: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [editing, setEditing] = useState(null);

  // Load contacts on component mount
  useEffect(() => {
    const storedContacts = JSON.parse(localStorage.getItem('pay_contacts')) || [];
    setContacts(storedContacts);
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (editing !== null) {
      // Update existing contact if editing
      const updatedContacts = [...contacts];
      updatedContacts[editing] = {
        ...updatedContacts[editing],
        [name]: value
      };
      setContacts(updatedContacts);
    } else {
      // Update new contact form
      setNewContact({
        ...newContact,
        [name]: value
      });
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    // Validation
    if (editing === null && !newContact.name || !newContact.payId) {
      setError('Name and PAY ID are required');
      return;
    }
    
    if (editing === null) {
      // Check for duplicate PAY ID
      if (contacts.some(contact => contact.payId === newContact.payId)) {
        setError('A contact with this PAY ID already exists');
        return;
      }
      
      // Add new contact
      const updatedContacts = [...contacts, newContact];
      setContacts(updatedContacts);
      localStorage.setItem('pay_contacts', JSON.stringify(updatedContacts));
      
      // Reset form
      setNewContact({ name: '', payId: '', note: '' });
      setSuccess('Contact added successfully');
    } else {
      // Save edited contact
      localStorage.setItem('pay_contacts', JSON.stringify(contacts));
      setEditing(null);
      setSuccess('Contact updated successfully');
    }
    
    // Clear messages after a delay
    setTimeout(() => {
      setSuccess('');
      setError('');
    }, 3000);
  };

  const handleEdit = (index) => {
    setEditing(index);
    setError('');
    setSuccess('');
  };

  const handleCancelEdit = () => {
    // Reload contacts from localStorage to discard changes
    const storedContacts = JSON.parse(localStorage.getItem('pay_contacts')) || [];
    setContacts(storedContacts);
    setEditing(null);
    setError('');
    setSuccess('');
  };

  const handleDelete = (index) => {
    if (window.confirm('Are you sure you want to delete this contact?')) {
      const updatedContacts = contacts.filter((_, i) => i !== index);
      setContacts(updatedContacts);
      localStorage.setItem('pay_contacts', JSON.stringify(updatedContacts));
      setSuccess('Contact deleted successfully');
      
      if (editing === index) {
        setEditing(null);
      }
    }
  };

  const handleSelect = (contact) => {
    if (onSelectContact) {
      onSelectContact(contact);
      onClose();
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content contacts-modal">
        <div className="modal-header">
          <h3>
            <i className="fas fa-address-book"></i> Contacts
          </h3>
          <button type="button" className="modal-close" onClick={onClose}>
            <i className="fas fa-times"></i>
          </button>
        </div>
        
        {error && <div className="alert alert-danger">{error}</div>}
        {success && <div className="alert alert-success">{success}</div>}

        <div className="contacts-list">
          {contacts.length === 0 ? (
            <div className="no-contacts">
              <p>No contacts yet. Add your first contact below.</p>
            </div>
          ) : (
            contacts.map((contact, index) => (
              <div key={index} className="contact-card">
                {editing === index ? (
                  <form onSubmit={handleSubmit} className="edit-contact-form">
                    <div className="form-group">
                      <input
                        type="text"
                        name="name"
                        value={contact.name}
                        onChange={handleChange}
                        placeholder="Name"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        name="payId"
                        value={contact.payId}
                        onChange={handleChange}
                        placeholder="PAY ID"
                        pattern="[0-9]{4}"
                        maxLength="4"
                        required
                      />
                    </div>
                    <div className="form-group">
                      <input
                        type="text"
                        name="note"
                        value={contact.note || ''}
                        onChange={handleChange}
                        placeholder="Add a note (optional)"
                      />
                    </div>
                    <div className="edit-contact-buttons">
                      <button type="submit" className="btn btn-sm btn-primary">
                        Save
                      </button>
                      <button type="button" className="btn btn-sm btn-light" onClick={handleCancelEdit}>
                        Cancel
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="contact-info" onClick={() => handleSelect(contact)}>
                      <h4>{contact.name}</h4>
                      <div className="contact-pay-id">PAY ID: {contact.payId}</div>
                      {contact.note && <div className="contact-note">{contact.note}</div>}
                    </div>
                    <div className="contact-actions">
                      <button 
                        type="button" 
                        className="btn-icon" 
                        onClick={() => handleEdit(index)}
                        title="Edit contact"
                      >
                        <i className="fas fa-edit"></i>
                      </button>
                      <button 
                        type="button" 
                        className="btn-icon btn-icon-danger" 
                        onClick={() => handleDelete(index)}
                        title="Delete contact"
                      >
                        <i className="fas fa-trash-alt"></i>
                      </button>
                    </div>
                  </>
                )}
              </div>
            ))
          )}
        </div>

        <div className="add-contact-section">
          <h4>Add New Contact</h4>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <input
                type="text"
                name="name"
                value={newContact.name}
                onChange={handleChange}
                placeholder="Name"
                disabled={editing !== null}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="payId"
                value={newContact.payId}
                onChange={handleChange}
                placeholder="PAY ID (4 digits)"
                pattern="[0-9]{4}"
                maxLength="4"
                disabled={editing !== null}
              />
            </div>
            <div className="form-group">
              <input
                type="text"
                name="note"
                value={newContact.note}
                onChange={handleChange}
                placeholder="Add a note (optional)"
                disabled={editing !== null}
              />
            </div>
            <button 
              type="submit" 
              className="btn btn-primary" 
              disabled={editing !== null}
            >
              Add Contact
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ContactsModal; 