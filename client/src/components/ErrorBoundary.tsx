import { Component, type ReactNode, type ErrorInfo } from 'react';
import { Card } from './Card';
import { AlertTriangle, RefreshCcw, Home } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
  }

  handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div className="min-h-screen bg-[#fafafa] flex items-center justify-center p-6 font-sans">
          <Card className="max-w-md w-full border-red-100 shadow-xl" noPadding>
            <div className="p-8 text-center">
              <div className="w-16 h-16 bg-red-50 rounded-full flex items-center justify-center mx-auto mb-6 text-red-600">
                <AlertTriangle className="h-8 w-8" />
              </div>
              <h1 className="text-xl font-bold text-slate-900 mb-2">Technical Fault Detected</h1>
              <p className="text-slate-500 text-sm mb-8 leading-relaxed">
                The application encountered an unexpected runtime exception. Our engineers have been notified.
              </p>
              
              <div className="bg-slate-50 rounded-lg p-4 mb-8 text-left border border-slate-100">
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1">Error Trace</p>
                <p className="text-xs font-mono text-red-600 break-all leading-tight">
                  {this.state.error?.message || 'Unknown runtime error'}
                </p>
              </div>

              <div className="flex flex-col gap-3">
                <button
                  onClick={this.handleReset}
                  className="w-full h-11 bg-slate-900 text-white rounded-lg text-sm font-bold shadow-sm hover:bg-slate-800 transition-all active:scale-[0.98] flex items-center justify-center gap-2"
                >
                  <RefreshCcw className="h-4 w-4" />
                  Attempt Recovery
                </button>
                <button
                  onClick={() => window.location.href = '/'}
                  className="w-full h-11 bg-white text-slate-600 rounded-lg text-sm font-bold border border-slate-200 hover:bg-slate-50 transition-all flex items-center justify-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Return Home
                </button>
              </div>
            </div>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}