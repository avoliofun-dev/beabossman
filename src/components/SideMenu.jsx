// src/components/SideMenu.jsx
import React from 'react';
import { S } from '../game/state.js';
import { setZm, getZm } from '../game/scene3d.js';
import { audio } from '../game/audio.js';
import Icon from './Icon.jsx';

export default function SideMenu({ openWin, toggleWin, unread, toggleUI, toggleFS }) {
  if (!S) return null;
  const idle = S.emp.some(e => !e.job && !e.rest && !e.auto);
  const pulseCt = idle && openWin !== 'ct';
  const teamLabel = S.rep >= 20 ? 'Tim' : S.rep + '/20';

  const handleToggle = (winName) => {
    audio.playClick();
    toggleWin(winName);
  };

  const handleZoom = (dir) => {
    audio.playClick();
    const cur = getZm();
    setZm(cur * (dir > 0 ? 1.2 : 1 / 1.2));
  };


  return (
    <div id="side">
      <button
        className={`glass${pulseCt ? ' pulse' : ''}${openWin === 'ct' ? ' active' : ''}`}
        data-w="ct"
        type="button"
        aria-label="Tugas & Kontrak"
        onClick={() => handleToggle('ct')}
      >
        <Icon name="clipboard" size={20} />
        <span>Tugas</span>
      </button>

      <button
        className={`glass${openWin === 'tm' ? ' active' : ''}`}
        data-w="tm"
        data-l={teamLabel}
        type="button"
        aria-label="Tim & Ruangan"
        onClick={() => handleToggle('tm')}
      >
        <Icon name="users" size={20} />
        <span>{teamLabel}</span>
      </button>

      <button
        className={`glass${openWin === 'lg' ? ' active' : ''}`}
        data-w="lg"
        type="button"
        aria-label="Notifikasi"
        onClick={() => handleToggle('lg')}
      >
        <Icon name="bell" size={20} />
        <span>Notif</span>
        {unread > 0 && <span id="bdg">{unread}</span>}
      </button>

      <button
        className={`glass${openWin === 'prof' ? ' active' : ''}`}
        data-w="prof"
        type="button"
        aria-label="Profil Member & Studio"
        onClick={() => handleToggle('prof')}
      >
        <Icon name="user" size={20} />
        <span>Profil</span>
      </button>

      <button
        className={`glass${openWin === 'st' ? ' active' : ''}`}
        data-w="st"
        type="button"
        aria-label="Pengaturan"
        onClick={() => handleToggle('st')}
      >
        <Icon name="settings" size={20} />
        <span>Menu</span>
      </button>


      {/* Hidden button hooks for keyboard/data selectors */}
      <button className="glass" data-z="1" type="button" aria-label="Perbesar" onClick={() => handleZoom(1)}>＋</button>
      <button className="glass" data-z="-1" type="button" aria-label="Perkecil" onClick={() => handleZoom(-1)}>－</button>
      <button className="glass" data-ui="1" type="button" aria-label="Sembunyikan UI" onClick={toggleUI}>🙈</button>
      <button className="glass" data-fs="1" type="button" aria-label="Layar penuh" onClick={toggleFS}>⛶</button>
    </div>
  );
}
