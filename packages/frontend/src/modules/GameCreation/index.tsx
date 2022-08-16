/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Navigate, Route, Routes, useMatch } from 'react-router-dom';
import PrivateRoute from '../../common/PrivateRoute';
import JoinGame from '../GameCreation/JoinGame';
import Header from '../Header';
import CreateGame from './CreateGame';
import Lobbies from './Lobbies';

export default function GameCreation() {
  const empty = useMatch('/game');

  if (empty) {
    return <Navigate to="join" />;
  }

  return (
    <div className="bg-polka bg-center bg-cover min-h-screen">
      <Header />
      <div className="flex justify-center text-t-1 mt-12 p-4 md:px-16 lg:px-24">
        <Routes>
          <Route path="/join" element={<JoinGame />} />
          <Route path=":inviteCode" element={<Lobbies />} />
          <Route path="/create" element={<PrivateRoute Component={CreateGame} />} />
          <Route path="*" element={<Navigate replace to="/404" />} />
        </Routes>
      </div>
    </div>
  );
}
