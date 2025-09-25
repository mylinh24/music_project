import React from 'react';
import { useSelector } from 'react-redux';
import HeaderUser from './HeaderUser';
import HeaderAdmin from './HeaderAdmin';

const HeaderWrapper = () => {
  const { user } = useSelector((state) => state.auth);

  if (user && user.role === 'admin') {
    return <HeaderAdmin />;
  }
  return <HeaderUser />;
};

export default HeaderWrapper;
