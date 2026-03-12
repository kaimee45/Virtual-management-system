import React from 'react';
import { renderToString } from 'react-dom/server';
import StaffProjects from './src/pages/Staff/StaffProjects.jsx';
import { DataContext } from './src/context/DataContext.jsx';
import { AuthContext } from './src/context/AuthContext.jsx';
import { BrowserRouter } from 'react-router-dom';

const mockData = {
  projects: [{ assignedStaff: ['123'], status: 'Active', title: 'Test Project', progress: 50, _id: '1' }],
  tasks: [{ projectId: '1', status: 'Pending', assignedTo: 'user' }],
  users: [{ _id: '123', email: 'staff@example.com' }],
  expenses: []
};

const mockAuth = { user: { email: 'staff@example.com', _id: '123' } };

try {
  renderToString(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuth}>
        <DataContext.Provider value={mockData}>
          <StaffProjects />
        </DataContext.Provider>
      </AuthContext.Provider>
    </BrowserRouter>
  );
  console.log('Render successful');
} catch (e) {
  console.error('RENDER ERROR CAUGHT:', e);
}
