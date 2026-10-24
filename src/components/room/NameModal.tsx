import { useState } from 'react';
import { Modal } from '../ui/Modal';

/** Pide el apodo a quien entra a la sala sin haberlo dado antes */
export function NameModal({ onSubmit }: { onSubmit: (name: string) => void }) {
  const [name, setName] = useState('');
  return (
    <Modal title="Entrar a la sala">
      <p>¿Cómo quieres que te vean los demás?</p>
      <form onSubmit={e => { e.preventDefault(); if (name.trim()) onSubmit(name.trim()); }}>
        <label className="field" htmlFor="name-input">Tu apodo</label>
        <input
          id="name-input"
          type="text"
          maxLength={30}
          autoComplete="nickname"
          autoFocus
          required
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: 16, padding: 11 }}>
          Entrar
        </button>
      </form>
    </Modal>
  );
}
