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
    <div className="flex flex-col bg-polka bg-center bg-cover bg-fixed bg-repeat min-h-screen">
      <Header />
      <div className="flex justify-center items-center text-t-1 mt-12 w-full py-6">
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
