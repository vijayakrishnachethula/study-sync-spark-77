import React from 'react';

type Props = { children: React.ReactNode };

type State = { hasError: boolean; message?: string };

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(err: any): State {
    return { hasError: true, message: err?.message || 'Something went wrong' };
  }

  componentDidCatch(error: any, info: any) {
    // eslint-disable-next-line no-console
    console.error('[ErrorBoundary]', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: 24 }}>
          <h2 style={{ marginBottom: 8 }}>We hit a snag on this page.</h2>
          <p style={{ opacity: 0.8 }}>{this.state.message}</p>
          <button onClick={() => window.location.reload()} style={{ marginTop: 12, padding: '8px 12px' }}>
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
