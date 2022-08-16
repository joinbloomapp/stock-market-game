/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

// @ts-nocheck

import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import updateLocale from 'dayjs/plugin/updateLocale';
import utc from 'dayjs/plugin/utc';
import { createContext, useEffect, useState } from 'react';
import { BrowserRouter as Router, Navigate, Route, Routes } from 'react-router-dom';
import './App.css';
import LoadingScreen from './common/LoadingScreen';
import PrivateRoute from './common/PrivateRoute';
import useMobile from './hooks/useMobile';
import Dashboard from './modules/Dashboard';
import GameCreation from './modules/GameCreation';
import MobileLanding from './modules/MobileLanding';
import NotFound from './modules/NotFound';
import Onboarding from './modules/Onboarding';
import PasswordReset from './modules/PasswordReset';
import UserService from './services/User';
import { User } from './services/User/types';
import Analytics from './system/Analytics';
import 'react-toastify/dist/ReactToastify.css';

dayjs.extend(utc);
dayjs.extend(relativeTime);
dayjs.extend(updateLocale);

dayjs.updateLocale('en', {
  relativeTime: {
    future: 'in %s',
    past: '%s ago',
    s: 'a few seconds',
    m: '1m',
    mm: '%dm',
    h: '1h',
    hh: '%dh',
    d: '1d',
    dd: '%dd',
    M: '1mo',
    MM: '%dmo',
    y: '1y',
    yy: '%dy',
  },
});

interface IUserContext {
  user?: Partial<User> | undefined;
  setUser: React.Dispatch<React.SetStateAction<Partial<User> | undefined>>;
}

export const UserContext = createContext<IUserContext>({ user: undefined, setUser: () => {} });

function App() {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState<User | undefined>();

  const fetchUser = async () => {
    setLoading(true);
    if (localStorage.getItem('authToken')) {
      const curUser = await UserService.getUser();
      Analytics.identify(curUser?.id, curUser);
      setUser(curUser);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (!user) {
      fetchUser();
    }
  }, []);

  const renderRoutes = () => {
    if (isMobile) {
      return <Route path="/mobile" element={<MobileLanding />} />;
    }

    return (
      <>
        <Route path="/" element={<Navigate to={user ? '/dashboard/g' : '/game'} replace />} />
        <Route
          path="/start"
          element={user ? <Navigate to="/dashboard/g" replace /> : <Onboarding />}
        />
        <Route
          path="/login"
          element={user ? <Navigate to="/dashboard/g" replace /> : <Onboarding />}
        />
        <Route path="/dashboard" element={<Navigate to="/dashboard/g" replace />} />
        <Route path="/dashboard/g" element={<PrivateRoute Component={Dashboard} />} />
        <Route path="/dashboard/g/:inviteCode/*" element={<PrivateRoute Component={Dashboard} />} />
        <Route path="/game/*" element={<GameCreation />} />
        <Route path="/password/*" element={<PasswordReset />} />
        <Route path="/404" element={<NotFound />} />
      </>
    );
  };

  const isMobile = useMobile();

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <UserContext.Provider value={{ user, setUser }}>
      <Router>
        <Routes>
          {renderRoutes()}
          <Route path="*" element={<Navigate to={isMobile ? '/mobile' : '/404'} replace />} />
        </Routes>
      </Router>
    </UserContext.Provider>
  );
}

export default App;
