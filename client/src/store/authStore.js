/**
 * authStore.js — backward-compatibility shim
 *
 * api.js imports from this file. Rather than rewriting api.js, we simply
 * re-export the canonical useAuthStore so both files share the same instance.
 *
 * DO NOT add logic here. All store logic lives in useAuthStore.js.
 */
export { default } from './useAuthStore.js';
