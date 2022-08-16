/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { useContext } from 'react';
import { Navigate, useLocation, useMatch } from 'react-router-dom';
import { UserContext } from '../../App';

interface IPrivateRouteProps {
  Component: any;
}

// Use this HOC to specify if a route requires auth
export default function PrivateRoute({ Component }: IPrivateRouteProps) {
  const { user } = useContext(UserContext);
  let location = useLocation();
  const createGame = useMatch('/game/create');

  if (!user) {
    return (
      <Navigate
        to={`/login${createGame ? '?create=true' : ''}`}
        state={{ from: location }}
        replace
      />
    );
  }

  return <Component />;
}
