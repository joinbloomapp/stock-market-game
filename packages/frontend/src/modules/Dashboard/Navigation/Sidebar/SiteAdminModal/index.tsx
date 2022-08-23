/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Dialog } from '@headlessui/react';
import { Icon24Cancel } from '@vkontakte/icons';
import React, { useContext, useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DashboardContext } from '../../..';
import { UserContext } from '../../../../../App';
import Button, { ButtonType } from '../../../../../components/Button';
import Input, { InputHeight, InputStyle } from '../../../../../components/Input';
import Modal, { IModalProps } from '../../../../../components/Modal';
import AdminService from '../../../../../services/Admin';
import UserService from '../../../../../services/User';

export interface ISiteAdminModalProps extends IModalProps {}

export default function SiteAdminModal({ open, setOpen }: ISiteAdminModalProps) {
  const navigate = useNavigate();
  const { user, setUser } = useContext(UserContext);
  const { setViewingOtherUser } = useContext(DashboardContext);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [email, setEmail] = useState('');

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    if (!open) {
      timeout = setTimeout(() => {
        setError('');
        setSuccess('');
        setEmail('');
      }, 500);
    }
    return () => clearTimeout(timeout);
  }, [open]);

  const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setError('');
    setSuccess('');
    setEmail(e.target.value);
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    let ok;

    try {
      await AdminService.loginAs(email);
      ok = true;
    } catch (err) {
      setError('Email does not exist');
    }

    if (ok) {
      const curUser = await UserService.getUser();
      navigate('/');
      setUser(curUser);
      setViewingOtherUser(true);
    }

    setLoading(false);
  };

  return (
    <Modal open={open} setOpen={setOpen}>
      <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl min-h-[480px] bg-b-2 p-10 text-left align-middle shadow-xl transition-all flex flex-col justify-between relative">
        <form onSubmit={onSubmit}>
          <div>
            <Dialog.Title as="h5" className="font-semibold text-center text-t-1">
              Support panel
            </Dialog.Title>
            <Button
              type={ButtonType.IconButton}
              className="absolute w-6 h-6 top-11 right-9 text-t-3 bg-transparent"
              onClick={() => setOpen(false)}
              buttonType="button"
            >
              <Icon24Cancel />
            </Button>
            <div className="overflow-y-auto">
              <p className="text-t-2 text-center">Log in to another user's dashboard</p>
              <div className="flex flex-col space-y-3 my-6">
                <Input
                  name="email"
                  label="EMAIL"
                  type="email"
                  inputStyle={InputStyle.Primary}
                  inputHeight={InputHeight.Medium}
                  value={email}
                  onChange={onChange}
                  placeholder="What's the user's email?"
                  required
                />

                {success && <p className="text-t-1 text-left text-md">{success}</p>}
                {error && <p className="text-u-negative text-left text-md">{error}</p>}
              </div>
            </div>
          </div>
          <div className="absolute flex space-x-3 w-full bottom-10 left-0 right-0 mr-auto ml-auto px-8">
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
            <Button shadow type={ButtonType.Primary} className="w-full h-14" buttonType="submit">
              Login into account
            </Button>
          </div>
        </form>
      </Dialog.Panel>
    </Modal>
  );
}
