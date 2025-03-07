// routes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home/Home';
import Exercise from './Exercise/Exercise';
import List from './List/List';
import ExList from './ExList/ExList';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/Client" element={<Home />} />
      <Route path="/exercise" element={<Exercise />} />
      <Route path="/list" element={<List />} />
      <Route path="/ex_list" element={<ExList />} />
    </Routes>
  );
};

export default AppRoutes;
