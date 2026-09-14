import { Component } from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';

class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Dashboard Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="nb-card-compat bg-red-50 border-2 border-nb-red/30">
          <div className="text-center py-12">
            <div className="w-16 h-16 bg-nb-red/10 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-nb-red" />
            </div>
            <h3 className="text-lg font-semibold text-nb-red mb-2">
              {this.props.title || 'Something went wrong'}
            </h3>
            <p className="text-nb-red mb-4">
              {this.props.message || 'This component encountered an error and needs to be refreshed.'}
            </p>
            <button
              onClick={() => {
                this.setState({ hasError: false, error: null });
                if (this.props.onRetry) {
                  this.props.onRetry();
                }
              }}
              className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors mx-auto"
            >
              <RefreshCw className="w-4 h-4" />
              Try Again
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;