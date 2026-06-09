import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '100vh',
          padding: '24px',
          background: 'var(--bg-primary)',
          color: 'var(--text-primary)'
        }}>
          <div className="glass-panel" style={{
            maxWidth: '500px',
            width: '100%',
            padding: '32px',
            textAlign: 'center',
            border: '1px solid var(--color-toxic-present-border)'
          }}>
            <h2 style={{
              color: 'var(--color-toxic-present)',
              marginBottom: '16px',
              fontSize: '28px'
            }}>
              System Error Detected
            </h2>
            <p style={{
              color: 'var(--text-secondary)',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              An unexpected error occurred in LAMS application runtime. Please check the logs or try refreshing the page.
            </p>
            <div style={{
              background: 'rgba(0, 0, 0, 0.3)',
              padding: '12px',
              borderRadius: 'var(--border-radius-sm)',
              fontFamily: 'monospace',
              fontSize: '12px',
              textAlign: 'left',
              overflowX: 'auto',
              marginBottom: '24px',
              color: 'var(--color-toxic-present)'
            }}>
              {this.state.error?.toString()}
            </div>
            <button 
              onClick={() => window.location.reload()}
              style={{ background: 'var(--accent-color)' }}
            >
              Refresh Application
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
