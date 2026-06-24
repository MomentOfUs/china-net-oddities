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

  /* ── 打字机击键声 (transient key click + noise sweep) ── */
  function playTypewriterClickSound(isBackspace) {
    if (isMuted()) return;
    const ac = getCtx();
    if (!ac) return;
    try {
      const osc = ac.createOscillator();
      const gainOsc = ac.createGain();
      osc.type = isBackspace ? 'triangle' : 'sine';
      const baseFreq = isBackspace ? 320 : 880;
      const endFreq = isBackspace ? 80 : 180;
      const dur = isBackspace ? 0.055 : 0.03;

      osc.frequency.setValueAtTime(baseFreq, ac.currentTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, ac.currentTime + dur);
      
      gainOsc.gain.setValueAtTime(isBackspace ? 0.06 : 0.08, ac.currentTime);
      gainOsc.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + dur);
      
      osc.connect(gainOsc);
      gainOsc.connect(ac.destination);

      // 击键机械撞击噪声
      const bufferSize = ac.sampleRate * 0.012;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ac.createBufferSource();
      noise.buffer = buffer;
      const filter = ac.createBiquadFilter();
      filter.type = 'highpass';
      filter.frequency.value = isBackspace ? 2000 : 3500;
      const gainNoise = ac.createGain();
      gainNoise.gain.setValueAtTime(isBackspace ? 0.03 : 0.05, ac.currentTime);
      gainNoise.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 0.01);

      noise.connect(filter);
      filter.connect(gainNoise);
      gainNoise.connect(ac.destination);

      osc.start();
      osc.stop(ac.currentTime + dur);
      noise.start();
      noise.stop(ac.currentTime + 0.012);
    } catch (_) {}
  }

  /* ── 打字机换行铃声 (dual-sine brass bell decay) ── */
  function playTypewriterBellSound() {
    if (isMuted()) return;
    const ac = getCtx();
    if (!ac) return;
    try {
      const dur = 0.32;
      const now = ac.currentTime;

      // 泛音铜铃
      const osc1 = ac.createOscillator();
      const osc2 = ac.createOscillator();
      const gain1 = ac.createGain();
      const gain2 = ac.createGain();

      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(1900, now);
      gain1.gain.setValueAtTime(0.045, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + dur);

      osc2.type = 'sine';
      osc2.frequency.setValueAtTime(2280, now);
      gain2.gain.setValueAtTime(0.03, now);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + dur - 0.04);

      osc1.connect(gain1);
      gain1.connect(ac.destination);
      osc2.connect(gain2);
      gain2.connect(ac.destination);

      osc1.start(now);
      osc1.stop(now + dur);
      osc2.start(now);
      osc2.stop(now + dur);
    } catch (_) {}
  }

  /* ── 火漆封缄碎裂声 (micro high-pass noise crackles) ── */
  function playWaxSealCrackSound() {
    if (isMuted()) return;
    const ac = getCtx();
    if (!ac) return;
    try {
      const now = ac.currentTime;
      // 级联爆发4次碎片微小破裂声
      for (let i = 0; i < 4; i++) {
        const delay = i * 0.02 + Math.random() * 0.012;
        const clickTime = now + delay;
        const dur = 0.008 + Math.random() * 0.006;
        
        const bufferSize = ac.sampleRate * dur;
        const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
        const data = buffer.getChannelData(0);
        for (let j = 0; j < bufferSize; j++) {
          data[j] = Math.random() * 2 - 1;
        }
        const noise = ac.createBufferSource();
        noise.buffer = buffer;
        const filter = ac.createBiquadFilter();
        filter.type = 'highpass';
        filter.frequency.value = 3200 + Math.random() * 800;
        
        const gain = ac.createGain();
        gain.gain.setValueAtTime(0.12, clickTime);
        gain.gain.exponentialRampToValueAtTime(0.001, clickTime + dur);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(ac.destination);
        
        noise.start(clickTime);
        noise.stop(clickTime + dur);
      }
    } catch (_) {}
  }

  /* ── 缠绕线绳松开声 (low-band noise unwrap scrape) ── */
  function playStringUnwrapSound() {
    if (isMuted()) return;
    const ac = getCtx();
    if (!ac) return;
    try {
      const now = ac.currentTime;
      const dur = 0.25;
      const bufferSize = ac.sampleRate * dur;
      const buffer = ac.createBuffer(1, bufferSize, ac.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }
      const noise = ac.createBufferSource();
      noise.buffer = buffer;

      const filter = ac.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(600, now);
      filter.frequency.exponentialRampToValueAtTime(900, now + dur);
      filter.Q.value = 2.2;

      const gain = ac.createGain();
      gain.gain.setValueAtTime(0.001, now);
      gain.gain.linearRampToValueAtTime(0.05, now + 0.05);
      gain.gain.exponentialRampToValueAtTime(0.001, now + dur);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ac.destination);

      noise.start(now);
      noise.stop(now + dur);
    } catch (_) {}
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
      btn.title = nowMuted ? '已静音 · 点击取消' : '音效开启 · 点击静音';
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
    playTypewriterClickSound: playTypewriterClickSound,
    playTypewriterBellSound: playTypewriterBellSound,
    playWaxSealCrackSound: playWaxSealCrackSound,
    playStringUnwrapSound: playStringUnwrapSound,
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
