/* Pembungkus localStorage dengan cadangan memori bila penyimpanan diblokir. */
(function (root) {
  'use strict';
  const PREFIX = 'utask:';
  const memory = {};

  function load(key, fallback) {
    try {
      const raw = root.localStorage.getItem(PREFIX + key);
      return raw === null ? fallback : JSON.parse(raw);
    } catch (e) {
      return key in memory ? memory[key] : fallback;   // data rusak / storage diblokir
    }
  }
  function save(key, value) {
    memory[key] = value;
    try { root.localStorage.setItem(PREFIX + key, JSON.stringify(value)); return true; }
    catch (e) { return false; }
  }

  const api = { load, save };
  if (typeof module !== 'undefined' && module.exports) module.exports = api;
  root.UTask = Object.assign(root.UTask || {}, { Storage: api });
})(typeof window !== 'undefined' ? window : globalThis);
