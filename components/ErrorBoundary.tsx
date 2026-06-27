import { Component } from 'react';

export class ErrorBoundary extends Component {
  constructor(props: any) {
    super(props);
    (this as any).state = { error: null };
  }

  static getDerivedStateFromError(error: Error) {
    return { error };
  }

  componentDidCatch(error: Error, info: any) {
    console.error('ErrorBoundary caught:', error, info);
  }

  render() {
    if ((this as any).state.error) {
      return (
        <div className="min-h-screen bg-gray-100 flex items-center justify-center p-8">
          <div className="bg-white rounded-xl shadow-lg border border-red-200 p-8 max-w-2xl w-full">
            <h2 className="text-xl font-bold text-red-600 mb-4">Error en la aplicaci\u00f3n</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
              <p className="text-sm font-mono text-red-800 break-all">{(this as any).state.error.message}</p>
            </div>
            <details className="text-sm text-gray-600">
              <summary className="cursor-pointer font-medium">Ver detalles t\u00e9cnicos</summary>
              <pre className="mt-2 bg-gray-50 rounded-lg p-4 text-xs overflow-auto max-h-64">
                {(this as any).state.error.stack}
              </pre>
            </details>
            <button onClick={() => { (this as any).setState({ error: null }); window.location.reload(); }}
              className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-6 py-2.5 rounded-lg transition-colors">
              Recargar p\u00e1gina
            </button>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}
