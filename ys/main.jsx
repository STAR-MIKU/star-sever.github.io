import React from 'react';
import ReactDOM from 'react-dom/client';
import Folder from './Folder';

const App = () => {
  return (
    <div style={{ height: '600px', position: 'relative', display: 'flex', justifyContent: 'center', alignItems: 'center', backgroundColor: '#f0f0f0' }}
      <Folder size={2} color="#5227FF" className="custom-folder" />
    </div>
  );
};

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(<App />);