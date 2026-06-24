/**
 * 共享音频模块 — 翻书 / 盖章音效 + 静音控制
 * 单例 AudioContext，避免重复创建开销
 */
(function () {
  'use strict';

  // 单例
  let ctx = null;

  function getCtx() {
    if (ctx && ctx.state !== 'closed') return ctx;
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    ctx = new AudioContext();
    return ctx;
  }

  function isMuted() {
    try {
      return localStorage.getItem('archive-muted') === '1';
    } catch (_) {
      return false;
    }
  }

  /* ── 翻书声 (bandpass noise sweep) ── */
  function playBookFlipSound() {
    if (isMuted()) return;
    const ac = getCtx();
    if (!ac) return;
    try {
      const bufferSize = ac.sampleRate * 0.4;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ac.createBufferSource();
      noise.buffer = buffer;

      const filter = ac.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1000, ac.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1500, ac.currentTime + 0.3);
      filter.Q.value = 1.0;

      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.01, ac.currentTime);
      gain.gain.linearRampToValueAtTime(0.12, ac.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.38);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);

      noise.start();
      noise.stop(ac.currentTime + 0.4);
    } catch (_) { /* 静默忽略 */ }
  }

  /* ── 盖章声 (triangle thud + click + noise) ── */
  function playStampSound() {
    if (isMuted()) return;
    const ac = getCtx();
    if (!ac) return;
    try {
      // 闷响
      const osc = ac.createOscillator();
      const gainOsc = ac.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(120, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(30, ac.currentTime + 0.15);
      gainOsc.gain.setValueAtTime(0.7, ac.currentTime);
      gainOsc.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.15);
      osc.connect(gainOsc);
      gainOsc.connect(ac.destination);

      // 点击
      const click = ac.createOscillator();
      const gainClick = ac.createGain();
      click.type = 'sine';
      click.frequency.setValueAtTime(1000, ac.currentTime);
      click.frequency.exponentialRampToValueAtTime(150, ac.currentTime + 0.04);
      gainClick.gain.setValueAtTime(0.5, ac.currentTime);
      gainClick.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.04);
      click.connect(gainClick);
      gainClick.connect(ac.destination);

      // 杂音
      const bufferSize = ac.sampleRate * 0.06;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ac.createBufferSource();
      noise.buffer = buffer;
      const filter = ac.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.value = 350;
      filter.Q.value = 2.0;
      const gainNoise = ac.createGain();
      gainNoise.gain.setValueAtTime(0.3, ac.currentTime);
      gainNoise.gain.exponentialRampToValueAtTime(0.01, ac.currentTime + 0.06);
      noise.connect(filter);
      filter.connect(gainNoise);
      gainNoise.connect(ac.destination);

      osc.start();
      osc.stop(ac.currentTime + 0.18);
      click.start();
      click.stop(ac.currentTime + 0.06);
      noise.start();
      noise.stop(ac.currentTime + 0.06);
    } catch (_) { /* 静默忽略 */ }
  }

  /* ── 纸张摩擦声 (bandpass noise sweep with micro variation) ── */
  function playPaperRustleSound() {
    if (isMuted()) return;
    const ac = getCtx();
    if (!ac) return;
    try {
      const bufferSize = ac.sampleRate * 0.45;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ac.createBufferSource();
      noise.buffer = buffer;

      const filter = ac.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(900, ac.currentTime);
      filter.frequency.exponentialRampToValueAtTime(1400, ac.currentTime + 0.35);
      filter.Q.value = 1.6;

      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.001, ac.currentTime);
      gain.gain.linearRampToValueAtTime(0.08, ac.currentTime + 0.08);
      gain.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.43);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);

      noise.start();
      noise.stop(ac.currentTime + 0.45);
    } catch (_) { /* 静默忽略 */ }
  }

  /* ── 金属敲击声/回形针敲击 (highpitch decay + transient noise) ── */
  function playMetalClickSound() {
    if (isMuted()) return;
    const ac = getCtx();
    if (!ac) return;
    try {
      const osc = ac.createOscillator();
      const gainOsc = ac.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(2600, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(700, ac.currentTime + 0.04);
      gainOsc.gain.setValueAtTime(0.08, ac.currentTime);
      gainOsc.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.05);

      osc.connect(gainOsc);
      gainOsc.connect(ac.destination);

      const bufferSize = ac.sampleRate * 0.02;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ac.createBufferSource();
      noise.buffer = buffer;
      const filter = ac.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = 4000;
      const gainNoise = ac.createGain();
      gainNoise.gain.setValueAtTime(0.05, ac.currentTime);
      gainNoise.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.015);

      noise.connect(filter);
      filter.connect(gainNoise);
      gainNoise.connect(ac.destination);

      osc.start();
      osc.stop(ac.currentTime + 0.06);
      noise.start();
      noise.stop(ac.currentTime + 0.02);
    } catch (_) { /* 静默忽略 */ }
  }

  /* ── 静音按钮自动渲染 ── */
  function renderMuteToggle() {
    var existing = document.getElementById('archive-mute-btn');
    if (existing) return;
    // 查找第一个 .footer 元素
    var footer = document.querySelector('.footer');
    if (!footer) {
      // 页面可能还没有 .footer (admin 等)，稍后重试
      setTimeout(renderMuteToggle, 500);
      return;
    }
    var btn = document.createElement('span');
    btn.id = 'archive-mute-btn';
    btn.textContent = isMuted() ? '🔇' : '🔊';
    btn.title = isMuted() ? '已静音 · 点击取消' : '音效开启 · 点击静音';
    btn.style.cssText = 'cursor:pointer;margin-left:8px;font-size:10px;opacity:0.5;transition:opacity 0.2s;';
    btn.addEventListener('mouseenter', function () { btn.style.opacity = '1'; });
    btn.addEventListener('mouseleave', function () { btn.style.opacity = '0.5'; });
    btn.addEventListener('click', function () {
      var nowMuted = window.__archiveAudio.toggleMute();
      btn.textContent = nowMuted ? '🔇' : '🔊';
      btn.title = nowMuted ? '音效开启 · 点击静音';
    });
    footer.appendChild(btn);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', renderMuteToggle);
  } else {
    renderMuteToggle();
  }

  /* ── 暴露全局接口 ── */
  window.__archiveAudio = {
    playBookFlipSound: playBookFlipSound,
    playStampSound: playStampSound,
    playPaperRustleSound: playPaperRustleSound,
    playMetalClickSound: playMetalClickSound,
    isMuted: isMuted,
    toggleMute: function () {
      try {
        var next = isMuted() ? '0' : '1';
        localStorage.setItem('archive-muted', next);
        return next === '1';
      } catch (_) {
        return false;
      }
    }
  };
})();
