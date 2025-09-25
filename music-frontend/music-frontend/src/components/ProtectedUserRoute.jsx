import React from 'react';
import { Navigate } from 'react-router-dom';
import { useSelector } from 'react-redux';

const ProtectedUserRoute = ({ children }) => {
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  if (!isAuthenticated) {
    return <Navigate to="/login" />;
  }

  if (user && user.role === 'admin') {
    return <Navigate to="/admin" />;
  }

  return children;
};

export default ProtectedUserRoute;
