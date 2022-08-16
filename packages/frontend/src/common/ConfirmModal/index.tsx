/*
 * Copyright (c) 2022 Contour Labs, Inc.
 * SPDX-License-Identifier: AGPL-3.0-only
 */

import { Dialog } from '@headlessui/react';
import { Icon24Cancel } from '@vkontakte/icons';
import Button, { ButtonType } from '../../components/Button';
import Modal, { IModalProps } from '../../components/Modal';

interface IConfirmModalProps extends IModalProps {
  text?: string;
  confirmBtnText?: string;
  cancelBtnText?: string;
  onConfirm: () => Promise<void>;
}

export default function ConfirmModal({
  open,
  setOpen,
  text = 'Are you sure?',
  confirmBtnText = 'Yes',
  cancelBtnText = 'No',
  onConfirm,
}: IConfirmModalProps) {
  return (
    <Modal open={open} setOpen={setOpen}>
      <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl min-h-[250px] bg-b-2 p-9 text-left align-middle shadow-xl transition-all flex flex-col justify-between">
        <div>
          <Dialog.Title as="h5" className="font-semibold text-center text-t-1 px-16">
            {text}
          </Dialog.Title>
          <Button
            type={ButtonType.IconButton}
            className="absolute w-6 h-6 top-11 right-9 text-t-3"
            onClick={() => setOpen(false)}
          >
            <Icon24Cancel />
          </Button>
        </div>
        <div className="mt-4 flex space-x-3">
          <Button
            shadow
            type={ButtonType.Secondary}
            className="w-full bg-b-2 h-10"
            onClick={() => setOpen(false)}
          >
            {cancelBtnText}
          </Button>
          <Button shadow type={ButtonType.Primary} className="w-full h-10" onClick={onConfirm}>
            {confirmBtnText}
          </Button>
        </div>
      </Dialog.Panel>
    </Modal>
  );
}
