"use client";

import { useState, useEffect, useCallback } from 'react';

const CONTACTS_STORAGE_KEY = 'guardian-angel-contacts';

export function useContacts() {
  const [contacts, setContacts] = useState([]);

  useEffect(() => {
    try {
      const storedContacts = localStorage.getItem(CONTACTS_STORAGE_KEY);
      if (storedContacts) {
        setContacts(JSON.parse(storedContacts));
      }
    } catch (error) {
      console.error("Failed to parse contacts from localStorage", error);
      setContacts([]);
    }
  }, []);

  const addContact = useCallback((contact) => {
    const newContact = { ...contact, id: Date.now().toString() };
    setContacts(prevContacts => {
        const updatedContacts = [...prevContacts, newContact];
        localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(updatedContacts));
        return updatedContacts;
    });
  }, []);

  const removeContact = useCallback((id) => {
    setContacts(prevContacts => {
      const newContacts = prevContacts.filter((contact) => contact.id !== id);
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(newContacts));
      return newContacts;
    });
  }, []);

  const updateContact = useCallback((id, updatedData) => {
    setContacts(prevContacts => {
      const newContacts = prevContacts.map(c => c.id === id ? { ...c, ...updatedData } : c);
      localStorage.setItem(CONTACTS_STORAGE_KEY, JSON.stringify(newContacts));
      return newContacts;
    });
  }, []);

  return { contacts, addContact, removeContact, updateContact };
}
