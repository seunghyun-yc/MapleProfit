import React from 'react';
import { createRoot } from 'react-dom/client';
import Home from '../app/page';
import '../app/globals.css';

(window as Window & { mapleBrowserStorage?: boolean }).mapleBrowserStorage = true;
createRoot(document.getElementById('root')!).render(<Home />);
