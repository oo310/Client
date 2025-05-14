// routes.js
import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Home from './Home/Home';
import Exercise from './Exercise/Exercise';
import List from './List/List';
import ExList from './ExList/ExList';
import TeList from './TeList/TeList';
import Test from './Test/Test';
import { Navigate } from 'react-router-dom';
const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/exercise/:id" element={<Exercise />} />
      <Route path="/list" element={<List />} />
      <Route path="/ex_list" element={<ExList />} />
      <Route path="/test/:id" element={<Test />} />
      <Route path="/te_list" element={<TeList />} />
    </Routes>
  );
};

export default AppRoutes;
