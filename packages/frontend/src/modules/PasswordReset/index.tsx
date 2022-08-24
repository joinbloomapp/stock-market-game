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
    <div className="flex flex-col bg-polka bg-fixed bg-center bg-cover bg-repeat min-h-screen">
      <Header />
      <div className="flex justify-center items-center text-t-1 mt-12 w-full py-6">
        <Routes>
          <Route path="/forgot" element={<ForgotPassword />} />
          <Route path="/reset/:token" element={<ResetPassword />} />
          <Route path="*" element={<Navigate replace to="/404" />} />
        </Routes>
      </div>
    </div>
  );
}
