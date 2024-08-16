import React from 'react';
import { KetcherExample } from './KetcherExample';

function App() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="bg-white shadow-lg rounded-lg p-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">構造式エディタ</h1>
        <KetcherExample />
      </div>
    </div>
  );
}

export default App;