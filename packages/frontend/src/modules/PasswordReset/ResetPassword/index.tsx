import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import Button, { ButtonType } from '../../../components/Button';
import Input, { InputHeight, InputStyle } from '../../../components/Input';
import AuthService from '../../../services/Auth';
import Analytics from '../../../system/Analytics';
import { OnboardingEvents } from '../../../system/Analytics/events/OnboardingEvents';
import StringUtils from '../../../utils/StringUtils';

export default function ResetPassword() {
  const [newPassword, setNewPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const { token } = useParams();

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthService.resetForgotPassword(token as string, newPassword);
      Analytics.track(OnboardingEvents.RESET_PASSWORD_SUCCESS);
      setSuccess(true);
      setError('');
    } catch (error) {
      Analytics.track(OnboardingEvents.RESET_PASSWORD_ERROR, {
        // @ts-ignore
        error: error?.response?.data?.message || error?.message,
      });
      setError('Could not reset password!');
      setSuccess(false);
    }
    setLoading(false);
  };

  return (
    <div className="bg-b-2 w-[482px] h-[350px] rounded-xl text-center p-10 absolute-vertical-center">
      <div className="flex flex-col justify-between h-full space-y-10">
        <form onSubmit={onSubmit} className="w-full flex flex-col space-y-4">
          <div className="flex flex-col space-y-4">
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="text-t-2">Enter your new password</p>
            <div className="flex flex-col space-y-3">
              <Input
                name="newPassword"
                type="password"
                inputStyle={InputStyle.Primary}
                inputHeight={InputHeight.Medium}
                value={newPassword}
                onChange={(e) => {
                  setError('');
                  setSuccess(false);
                  // Validate the password
                  if (e.target.value.length < 8) {
                    setError('Password must be at least 8 characters');
                  } else if (!StringUtils.isValidPassword(e.target.value)) {
                    const hasLetter = StringUtils.containsLetter(e.target.value);
                    const hasNumber = StringUtils.containsNumber(e.target.value);
                    setError(
                      `Password must contain at least ${!hasLetter ? 'one letter' : ''}${
                        !hasLetter && !hasNumber ? ' and ' : ''
                      }${!hasNumber ? 'one number' : ''}`
                    );
                  }
                  setNewPassword(e.target.value);
                }}
                autoFocus
                placeholder="New password"
                required
              />
              <p className="text-u-negative text-left text-md">{error}</p>
            </div>
            <div className="flex flex-col">
              <Button
                shadow
                loading={loading}
                type={ButtonType.Primary}
                className="w-full"
                disabled={!!(error || loading || success)}
              >
                {success ? 'Password reset!' : 'Reset password'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
