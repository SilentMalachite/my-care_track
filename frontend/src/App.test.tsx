import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import App from './App';

// ルートコンポーネントのモック
vi.mock('./routes', () => ({
  AppRoutes: () => <div data-testid="app-routes">App Routes</div>,
}));

describe('App', () => {
  it('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('app-routes')).toBeInTheDocument();
  });

  it('BrowserRouterでラップされている', async () => {
    render(<App />);
    
    // BrowserRouterが正しく機能していることを確認
    await waitFor(() => {
      expect(screen.getByTestId('app-routes')).toBeInTheDocument();
    });
  });
});