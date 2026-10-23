// src/components/ToastContainer.jsx
import React, { useState, useEffect } from 'react';
import { subscribeToast } from '../game/engine.js';
import Icon from './Icon.jsx';

export default function ToastContainer({ openWin, onNewToast }) {
  const [toasts, setToasts] = useState([]);

  useEffect(() => {
    const unsub = subscribeToast((msg) => {
      const id = Date.now() + Math.random();
      setToasts(prev => {
        const next = [...prev, { id, msg }];
        return next.slice(-4);
      });
      if (openWin !== 'lg' && onNewToast) {
        onNewToast();
      }
      setTimeout(() => {
        setToasts(prev => prev.filter(t => t.id !== id));
      }, 4500);
    });
    return unsub;
  }, [openWin, onNewToast]);

  return (
    <div id="toasts">
      {toasts.map(t => (
        <div key={t.id} className="toast">
          <Icon name="bell" size={14} style={{ color: 'var(--ac)' }} />
          <span>{t.msg}</span>
        </div>
      ))}
    </div>
  );
}
