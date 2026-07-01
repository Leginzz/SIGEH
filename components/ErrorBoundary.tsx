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
          <div className="bg-white rounded-xl border border-red-200 max-w-lg w-full">
            <div className="px-5 py-4 border-b border-red-100">
              <h2 className="text-base font-bold text-red-600">Error en la aplicación</h2>
            </div>
            <div className="p-5 space-y-4">
              <div className="bg-red-50 border border-red-100 rounded-lg p-3">
                <p className="text-sm font-mono text-red-800 break-all">{(this as any).state.error.message}</p>
              </div>
              <details className="text-sm text-gray-500">
                <summary className="text-xs font-medium text-gray-600 cursor-pointer">Ver detalles técnicos</summary>
                <pre className="mt-2 bg-gray-50 rounded-lg p-3 text-xs overflow-auto max-h-48 text-gray-700">
                  {(this as any).state.error.stack}
                </pre>
              </details>
              <button onClick={() => { (this as any).setState({ error: null }); window.location.reload(); }}
                className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium px-4 py-2.5 rounded-lg transition-colors text-sm">
                Recargar página
              </button>
            </div>
          </div>
        </div>
      );
    }
    return (this as any).props.children;
  }
}
