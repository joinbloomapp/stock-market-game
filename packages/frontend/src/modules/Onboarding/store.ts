/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: APGL-3.0-only
 */

import create from 'zustand';
import { SignupUser } from './../../services/Auth/types';

interface IState {
  onboarding: Omit<SignupUser, 'name'>;
  updateOnboarding: (body: Partial<Omit<SignupUser, 'name'>>) => void;
  clearOnboarding: () => void;
}

const INITIAL_STATE: IState = {
  onboarding: {
    email: '',
    password: '',
    firstName: '',
    lastName: '',
  },
  updateOnboarding: (body: Partial<Omit<SignupUser, 'name'>>) => {},
  clearOnboarding: () => {},
};

const useStore = create<IState>((set) => ({
  ...INITIAL_STATE,
  updateOnboarding: (body) => {
    set((state) => {
      return {
        onboarding: {
          ...state.onboarding,
          ...body,
        },
      };
    });
  },
  clearOnboarding: () => {
    set((state) => {
      return {
        onboarding: {
          email: '',
          password: '',
          firstName: '',
          lastName: '',
        },
      };
    });
  },
}));

export const useOnboardingStore = useStore;
