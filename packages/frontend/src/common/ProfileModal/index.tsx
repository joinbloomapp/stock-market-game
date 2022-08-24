/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Dialog } from '@headlessui/react';
import { Icon24Cancel } from '@vkontakte/icons';
import React, { useContext, useEffect, useState } from 'react';
import { UserContext } from '../../App';
import Button, { ButtonType } from '../../components/Button';
import Input, { InputHeight, InputStyle } from '../../components/Input';
import Modal, { IModalProps } from '../../components/Modal';
import { DashboardContext } from '../../modules/Dashboard';
import UserService from '../../services/User';
import Analytics from '../../system/Analytics';
import { ProfileEvents } from '../../system/Analytics/events/ProfileEvents';
import StringUtils from '../../utils/StringUtils';

export interface IProfileModalProps extends IModalProps {}

export default function ProfileModal({ open, setOpen }: IProfileModalProps) {
  const { user, setUser } = useContext(UserContext);
  const { viewingOtherUser } = useContext(DashboardContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const initialState = {
    firstName: user?.firstName,
    lastName: user?.lastName,
    email: user?.email,
    oldPassword: '',
    newPassword: '',
  };
  const [{ firstName, lastName, email, oldPassword, newPassword }, setFormValues] =
    useState(initialState);
  const [showPasswordReset, setShowPasswordReset] = useState(false);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!open) {
      timeout = setTimeout(() => {
        setError('');
        setSuccess('');
        setFormValues({ ...initialState });
        setShowPasswordReset(false);
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [open]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setError('');
    setSuccess('');
    if (e.target.name === 'newPassword') {
      // Validate the new password
      if (e.target.value.length < 8) {
        setError('New password must be at least 8 characters');
      } else if (!StringUtils.isValidPassword(e.target.value)) {
        const hasLetter = StringUtils.containsLetter(e.target.value);
        const hasNumber = StringUtils.containsNumber(e.target.value);
        setError(
          `New password must contain at least ${!hasLetter ? 'one letter' : ''}${
            !hasLetter && !hasNumber ? ' and ' : ''
          }${!hasNumber ? 'one number' : ''}`
        );
      }
    }
    setFormValues((prevState) => ({ ...prevState, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    if (showPasswordReset) {
      let ok;

      try {
        await UserService.resetPassword(oldPassword, newPassword);
        Analytics.track(ProfileEvents.RESET_PASSWORD_SUCCESS);
        setFormValues({ ...initialState });
        setSuccess('Reset password successfully');
        setError('');
        ok = true;
      } catch (error) {
        Analytics.track(ProfileEvents.RESET_PASSWORD_ERROR, {
          // @ts-ignore
          error: error?.response?.data?.message || error?.message,
        });
        setError('Old password is incorrect');
      }
    } else {
      let ok;
      const body = {
        firstName,
        lastName,
        email,
      };

      try {
        await UserService.updateUser(body);
        const curUser = await UserService.getUser();
        setUser(curUser);
        Analytics.track(ProfileEvents.UPDATE_USER_SUCCESS, body);
        setSuccess('Saved user successfully');
        setError('');
        ok = true;
      } catch (error) {
        Analytics.track(ProfileEvents.UPDATE_USER_ERROR, {
          ...body,
          // @ts-ignore
          error: error?.response?.data?.message || error?.message,
        });
        // @ts-ignore
        if (error?.response?.status === 403) {
          setError('This email already exists');
        } else {
          setError('Unable to save changes');
        }
      }
    }
    setLoading(false);
  };

  const switchView = () => {
    Analytics.track(ProfileEvents.SWITCH_TABS, {
      to: showPasswordReset ? 'profile' : 'reset_password',
    });
    setShowPasswordReset(!showPasswordReset);
    setSuccess('');
    setError('');
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl min-h-[480px] bg-b-2 pt-9 pb-0 px-4 md:px-9 text-left align-middle shadow-xl transition-all flex flex-col justify-between relative">
        <form onSubmit={onSubmit}>
          <div>
            <Dialog.Title as="h5" className="font-semibold text-center text-t-1">
              Your profile
            </Dialog.Title>
            <Button
              type={ButtonType.IconButton}
              className="absolute w-6 h-6 top-10 right-9 text-t-3 bg-transparent"
              onClick={() => setOpen(false)}
              buttonType="button"
            >
              <Icon24Cancel />
            </Button>
            <div className="overflow-y-auto">
              <div className="flex flex-col space-y-3 my-6">
                {showPasswordReset ? (
                  <>
                    <Input
                      name="oldPassword"
                      label="OLD PASSWORD"
                      type="password"
                      inputStyle={InputStyle.Primary}
                      inputHeight={InputHeight.Medium}
                      value={oldPassword}
                      onChange={onChange}
                      required
                    />
                    <Input
                      name="newPassword"
                      label="NEW PASSWORD"
                      type="password"
                      inputStyle={InputStyle.Primary}
                      inputHeight={InputHeight.Medium}
                      value={newPassword}
                      onChange={onChange}
                      required
                    />
                  </>
                ) : (
                  <>
                    <Input
                      name="firstName"
                      label="FIRST NAME"
                      type="text"
                      inputStyle={InputStyle.Primary}
                      inputHeight={InputHeight.Medium}
                      value={firstName}
                      onChange={onChange}
                      autoFocus
                      placeholder="First name"
                      required
                    />
                    <Input
                      name="lastName"
                      label="LAST NAME"
                      type="text"
                      inputStyle={InputStyle.Primary}
                      inputHeight={InputHeight.Medium}
                      value={lastName}
                      onChange={onChange}
                      placeholder="Last name"
                      required
                    />
                    <Input
                      name="email"
                      label="EMAIL"
                      type="email"
                      inputStyle={InputStyle.Primary}
                      inputHeight={InputHeight.Medium}
                      value={email}
                      onChange={onChange}
                      placeholder="What's your email?"
                      required
                    />
                  </>
                )}
                {success && <p className="text-t-1 text-left text-md">{success}</p>}
                {error && <p className="text-u-negative text-left text-md">{error}</p>}
              </div>
            </div>
          </div>
          <div className="absolute flex space-x-3 w-full bottom-8 left-0 right-0 mr-auto ml-auto px-4">
            {!viewingOtherUser ? (
              <Button
                shadow
                type={ButtonType.Secondary}
                className="w-full h-14"
                buttonType="button"
                onClick={switchView}
              >
                {showPasswordReset ? 'Edit profile' : 'Change password'}
              </Button>
            ) : (
              <Button
                shadow
                loading={loading}
                type={ButtonType.Secondary}
                className="w-full h-14"
                buttonType="button"
                onClick={() => setOpen(false)}
              >
                Cancel
              </Button>
            )}
            <Button
              shadow
              loading={loading}
              type={ButtonType.Primary}
              className="w-full h-14"
              buttonType="submit"
              disabled={!!(error || loading)}
            >
              {showPasswordReset ? 'Reset password' : 'Save'}
            </Button>
          </div>
        </form>
      </Dialog.Panel>
    </Modal>
  );
}
