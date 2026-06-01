import './style.css';
import { GameManager } from './game/GameManager';

// Global error logger overlay for in-browser debugging
window.addEventListener('error', (e) => {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'ui-element';
  errorDiv.style.position = 'absolute';
  errorDiv.style.top = '10px';
  errorDiv.style.left = '10px';
  errorDiv.style.right = '10px';
  errorDiv.style.padding = '20px';
  errorDiv.style.background = 'rgba(180, 0, 0, 0.95)';
  errorDiv.style.color = '#fff';
  errorDiv.style.border = '2px solid #ff4444';
  errorDiv.style.borderRadius = '8px';
  errorDiv.style.zIndex = '999999';
  errorDiv.style.fontFamily = 'monospace';
  errorDiv.style.fontSize = '13px';
  errorDiv.style.whiteSpace = 'pre-wrap';
  errorDiv.style.pointerEvents = 'auto';
  errorDiv.textContent = `🚨 RUNTIME ERROR:\n\nMessage: ${e.message}\nFile: ${e.filename}\nLine: ${e.lineno}:${e.colno}\n\nStack Trace:\n${e.error ? e.error.stack : 'N/A'}`;
  document.body.appendChild(errorDiv);
});

window.addEventListener('unhandledrejection', (e) => {
  const errorDiv = document.createElement('div');
  errorDiv.className = 'ui-element';
  errorDiv.style.position = 'absolute';
  errorDiv.style.top = '10px';
  errorDiv.style.left = '10px';
  errorDiv.style.right = '10px';
  errorDiv.style.padding = '20px';
  errorDiv.style.background = 'rgba(180, 0, 0, 0.95)';
  errorDiv.style.color = '#fff';
  errorDiv.style.border = '2px solid #ff4444';
  errorDiv.style.borderRadius = '8px';
  errorDiv.style.zIndex = '999999';
  errorDiv.style.fontFamily = 'monospace';
  errorDiv.style.fontSize = '13px';
  errorDiv.style.whiteSpace = 'pre-wrap';
  errorDiv.style.pointerEvents = 'auto';
  errorDiv.textContent = `🚨 UNHANDLED REJECTION:\n\nReason: ${e.reason}\n\nStack:\n${e.reason && e.reason.stack ? e.reason.stack : 'N/A'}`;
  document.body.appendChild(errorDiv);
});

window.addEventListener('DOMContentLoaded', () => {
  const game = new GameManager();
  game.start();
});
