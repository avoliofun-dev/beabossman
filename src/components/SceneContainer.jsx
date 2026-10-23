// src/components/SceneContainer.jsx
import React, { useRef, useEffect, useState } from 'react';
import { build, destroyScene, setZm, getZm, vw, rotateCam } from '../game/scene3d.js';
import { subscribePop } from '../game/engine.js';
import { S } from '../game/state.js';

export default function SceneContainer() {
  const sceneRef = useRef(null);
  const [pops, setPops] = useState([]);

  useEffect(() => {
    let mounted = true;
    if (sceneRef.current) {
      build(sceneRef.current);
    }
    const unsubPop = subscribePop((text) => {
      if (!mounted) return;
      const id = Date.now() + Math.random();
      setPops(prev => [...prev, { id, text }]);
      setTimeout(() => {
        if (!mounted) return;
        setPops(prev => prev.filter(p => p.id !== id));
      }, 1900);
    });

    return () => {
      mounted = false;
      unsubPop();
      destroyScene();
    };
  }, []);

  const handleZoom = (factor) => {
    setZm(getZm() * factor);
  };

  const handleRotate = (angle) => {
    rotateCam(angle);
  };

  const handleView = (type) => {
    vw(type);
  };

  return (
    <div id="scene" ref={sceneRef}>
      {/* Floating Pops Feedback */}
      {pops.map(p => (
        <div key={p.id} className="pop">
          <span>🪙</span>
          <span>{p.text}</span>
        </div>
      ))}

      {/* Floating Ergonomic Camera HUD */}
      <div className="cam-hud" data-ui="1">
        <button type="button" title="Perbesar (Zoom In)" onClick={() => handleZoom(1.2)}>➕</button>
        <button type="button" title="Perkecil (Zoom Out)" onClick={() => handleZoom(0.83)}>➖</button>
        <button type="button" title="Putar Kiri" onClick={() => handleRotate(0.25)}>↺</button>
        <button type="button" title="Putar Kanan" onClick={() => handleRotate(-0.25)}>↻</button>
        <button type="button" title="Tampilan Isometrik" onClick={() => handleView('iso')}>📐</button>
        {S && S.f2 && (
          <button type="button" title="Fokus Lantai 2" onClick={() => handleView('lt2')}>🏢</button>
        )}
      </div>
    </div>
  );
}
