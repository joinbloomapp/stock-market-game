import React, { useState } from 'react';
import Button, { ButtonType } from '../../../components/Button';
import Input, { InputHeight, InputStyle } from '../../../components/Input';
import AuthService from '../../../services/Auth';
import Analytics from '../../../system/Analytics';
import { OnboardingEvents } from '../../../system/Analytics/events/OnboardingEvents';

export default function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await AuthService.sendPasswordResetLink(email);
      Analytics.track(OnboardingEvents.SENT_RESET_PASSWORD_EMAIL_SUCCESS, { email });
      setSuccess(true);
      setError('');
    } catch (error) {
      Analytics.track(OnboardingEvents.SENT_RESET_PASSWORD_EMAIL_ERRROR, {
        email,
        // @ts-ignore
        error: error?.response?.data?.message || error?.message,
      });
      setError('Could not send password reset link. Try again later.');
      setSuccess(false);
    }
    setLoading(false);
  };

  return (
    <div className="bg-b-2 w-[482px] h-min rounded-xl text-center p-12 absolute-vertical-center">
      <div className="flex flex-col justify-between h-full space-y-10">
        <form onSubmit={onSubmit} className="w-full flex flex-col space-y-4">
          <div className="flex flex-col space-y-4">
            <h1 className="text-2xl font-bold">Reset your password</h1>
            <p className="text-t-2">
              Enter the email address associated with your account. We will send a reset link to
              your email.
            </p>
            <div className="flex flex-col space-y-3">
              <Input
                name="email"
                type="email"
                inputStyle={InputStyle.Primary}
                inputHeight={InputHeight.Medium}
                value={email}
                onChange={(e) => {
                  setEmail(e.target.value);
                  setError('');
                  setSuccess(false);
                }}
                autoFocus
                placeholder="What's your email?"
                required
              />
              <p className="text-u-negative text-left text-md">{error}</p>
            </div>
            <div className="flex flex-col">
              <Button
                shadow
                type={ButtonType.Primary}
                className="w-full"
                disabled={!!(error || loading || success)}
              >
                {loading ? 'Sending...' : success ? 'Link sent' : 'Send reset link'}
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
