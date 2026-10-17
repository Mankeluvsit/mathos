import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, beforeEach, vi } from 'vitest';

afterEach(() => { cleanup(); localStorage.clear(); });

// DOM tests verify workflows; the native canvas is checked separately in a browser.
beforeEach(() => { window.history.replaceState({}, '', '/?lab=reference'); vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(null); });
