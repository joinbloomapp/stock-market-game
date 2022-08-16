/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Navigate, Route, Routes, useMatch } from 'react-router-dom';
import Header from '../Header';
import ForgotPassword from './ForgotPassword';
import ResetPassword from './ResetPassword';

export default function PasswordReset() {
  const empty = useMatch('/password');

  if (empty) {
    return <Navigate to="forgot" replace />;
  }

  return (
    <div className="bg-polka bg-center bg-cover h-screen">
      <Header />
      <div className="flex justify-center text-t-1 mt-16 px-2 md:px-16 lg:px-24">
        <Routes>
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset/:token" element={<ResetPassword />} />
          <Route path="*" element={<Navigate replace to="/404" />} />
        </Routes>
      </div>
    </div>
  );
}
