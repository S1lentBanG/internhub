import type { RouteObject } from 'react-router-dom';
import Home from '../pages/Home';  // Correct path to Home.jsx
import React from 'react';

export const routes: RouteObject[] = [
  {
    path: '/',
    element: <Home />,
  },
  {
    path: '*',
    element: <div>404 - Page Not Found</div>,
  },
];
