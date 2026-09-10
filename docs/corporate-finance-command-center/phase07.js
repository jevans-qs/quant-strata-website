/* Phase 08 loader — preserves the validated Phase 07 engine and layers QA hardening on top. */
(() => {
  'use strict';
  const style=document.createElement('link');style.rel='stylesheet';style.href='phase08.css?v=20260910-1';document.head.appendChild(style);
  function load(src,done){const s=document.createElement('script');s.src=src;s.async=false;s.onload=done||null;s.onerror=()=>console.error(`Unable to load ${src}`);document.head.appendChild(s)}
  load('phase07-core.js?v=20260910-1',()=>load('phase08.js?v=20260910-1',()=>load('phase08-launch.js?v=20260910-1')));
})();
