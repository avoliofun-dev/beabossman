// src/App.jsx
import React, { useState, useEffect, useReducer } from 'react';
import SceneContainer from './components/SceneContainer.jsx';
import TopBar from './components/TopBar.jsx';
import SideMenu from './components/SideMenu.jsx';
import Rail from './components/Rail.jsx';
import Tutorial from './components/Tutorial.jsx';
import EventModal from './components/EventModal.jsx';
import ToastContainer from './components/ToastContainer.jsx';
import ContractsWindow from './components/ContractsWindow.jsx';
import TeamWindow from './components/TeamWindow.jsx';
import NotificationsWindow from './components/NotificationsWindow.jsx';
import SettingsWindow from './components/SettingsWindow.jsx';
import AuthModal from './components/AuthModal.jsx';
import ProfileModal from './components/ProfileModal.jsx';
import IntroScreen from './components/IntroScreen.jsx';


import { S, save } from './game/state.js';
import { initGame, tick, subscribeUI, toast } from './game/engine.js';

export default function App() {
  const [, forceUpdate] = useReducer(x => x + 1, 0);
  const [showIntro, setShowIntro] = useState(true);
  const [openWin, setOpenWin] = useState('');
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    const hasData = initGame();
    if (hasData) {
      setShowIntro(false);
    }

    const unsubUI = subscribeUI(() => {
      forceUpdate();
    });

    const intervalId = setInterval(() => {
      tick(showIntro);
    }, 250);

    const onVisibilityChange = () => {
      if (S) save();
    };
    document.addEventListener('visibilitychange', onVisibilityChange);

    // Outside click to close window
    const onDocumentClick = (ev) => {
      if (
        ev.composedPath().some(el => {
          return (
            el.id === 'side' ||
            el.id === 'hud' ||
            (el.classList && el.classList.contains('win'))
          );
        })
      ) {
        return;
      }
      setOpenWin('');
    };
    document.addEventListener('click', onDocumentClick);

    return () => {
      clearInterval(intervalId);
      unsubUI();
      document.removeEventListener('visibilitychange', onVisibilityChange);
      document.removeEventListener('click', onDocumentClick);
    };
  }, [showIntro]);

  const toggleWin = (name) => {
    setOpenWin(prev => {
      const next = prev === name ? '' : name;
      if (next === 'lg') {
        setUnread(0);
      }
      return next;
    });
  };

  const toggleUI = () => {
    document.body.classList.toggle('hu');
  };

  const toggleFS = () => {
    const d = document;
    const e = d.documentElement;
    const on = d.fullscreenElement || d.webkitFullscreenElement;
    const rq = e.requestFullscreen || e.webkitRequestFullscreen;
    const ex = d.exitFullscreen || d.webkitExitFullscreen;
    const no = () => {
      toast('Layar penuh tidak didukung di sini. Coba buka halaman ini di tab baru.');
    };
    try {
      const r = on ? ex.call(d) : rq ? rq.call(e) : null;
      if (r && r.catch) r.catch(no);
      else if (!on && !rq) no();
    } catch (x) {
      no();
    }
  };

  return (
    <>
      <SceneContainer />

      {!showIntro && (
        <>
          <TopBar
            onOpenAuth={() => toggleWin('auth')}
            onOpenProfile={() => toggleWin('prof')}
          />
          <SideMenu
            openWin={openWin}
            toggleWin={toggleWin}
            unread={unread}
            toggleUI={toggleUI}
            toggleFS={toggleFS}
          />
          <Rail />
          <Tutorial openWin={openWin} />
          <EventModal />
          <ToastContainer
            openWin={openWin}
            onNewToast={() => setUnread(u => u + 1)}
          />

          <button
            id="ui-show"
            className="glass"
            data-ui="1"
            type="button"
            aria-label="Tampilkan UI"
            onClick={toggleUI}
          >
            👁
          </button>

          {openWin === 'ct' && <ContractsWindow onClose={() => toggleWin('')} />}
          {openWin === 'tm' && <TeamWindow onClose={() => toggleWin('')} />}
          {openWin === 'lg' && <NotificationsWindow onClose={() => toggleWin('')} />}
          {openWin === 'auth' && <AuthModal onClose={() => toggleWin('')} />}
          {openWin === 'prof' && (
            <ProfileModal
              onClose={() => toggleWin('')}
              onOpenAuth={() => toggleWin('auth')}
            />
          )}
          {openWin === 'st' && (
            <SettingsWindow
              onClose={() => toggleWin('')}
              toggleUI={toggleUI}
              toggleFS={toggleFS}
            />
          )}
        </>
      )}


      {showIntro && <IntroScreen onStart={() => setShowIntro(false)} />}
    </>
  );
}
