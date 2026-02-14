'use client';

import { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { AlertCircle, CheckCircle } from 'lucide-react';
import { apiPost } from '../api';

interface ForgotPasswordDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

type Step = 'request' | 'verify' | 'reset';

export default function ForgotPasswordDialog({ open, onOpenChange }: ForgotPasswordDialogProps) {
  const [step, setStep] = useState<Step>('request');
  const [username, setUsername] = useState('');
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');

  const handleRequestOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await apiPost('/auth/forgot-password', null, { username });
      setSuccessMessage('OTP has been sent to your registered email');
      setStep('verify');
    } catch (e: any) {
      setError(e.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      await apiPost('/auth/verify-otp', null, { username, otp });
      setSuccessMessage('OTP verified successfully');
      setStep('reset');
    } catch (e: any) {
      setError(e.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (newPassword !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (newPassword.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);

    try {
      await apiPost('/auth/reset-password', null, {
        username,
        otp,
        newPassword
      });
      setSuccessMessage('Password reset successfully! You can now login with your new password.');
      setTimeout(() => {
        onOpenChange(false);
        resetDialog();
      }, 2000);
    } catch (e: any) {
      setError(e.message || 'Failed to reset password');
    } finally {
      setIsLoading(false);
    }
  };

  const resetDialog = () => {
    setStep('request');
    setUsername('');
    setOtp('');
    setNewPassword('');
    setConfirmPassword('');
    setError('');
    setSuccessMessage('');
  };

  const handleClose = () => {
    onOpenChange(false);
    resetDialog();
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-black">
            {step === 'request' && 'Forgot Password'}
            {step === 'verify' && 'Verify OTP'}
            {step === 'reset' && 'Reset Password'}
          </DialogTitle>
          <DialogDescription className="text-center text-black">
            {step === 'request' && 'Enter your username to receive an OTP on your registered email'}
            {step === 'verify' && 'Enter the OTP sent to your email'}
            {step === 'reset' && 'Enter your new password'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {step === 'request' && (
            <form onSubmit={handleRequestOTP} className="space-y-4">
              <div className="space-y-2 text-black">
                <Label htmlFor="username">Username</Label>
                <Input
                  id="username"
                  type="text"
                  placeholder="Enter your admin username"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Sending OTP...' : 'Send OTP'}
              </Button>
            </form>
          )}

          {step === 'verify' && (
            <form onSubmit={handleVerifyOTP} className="space-y-4">
              <div className="space-y-2 text-black">
                <Label htmlFor="otp">OTP</Label>
                <Input
                  id="otp"
                  type="text"
                  placeholder="Enter 6-digit OTP"
                  value={otp}
                  onChange={(e) => setOtp(e.target.value)}
                  maxLength={6}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Verifying...' : 'Verify OTP'}
              </Button>
            </form>
          )}

          {step === 'reset' && (
            <form onSubmit={handleResetPassword} className="space-y-4">
              <div className="space-y-2 text-black">
                <Label htmlFor="newPassword">New Password</Label>
                <Input
                  id="newPassword"
                  type="password"
                  placeholder="Enter new password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2 text-black">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  placeholder="Confirm new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                />
              </div>

              <Button type="submit" className="w-full" disabled={isLoading}>
                {isLoading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </form>
          )}

          {error && (
            <div className="flex items-center space-x-2 text-sm text-black">
              <AlertCircle className="h-4 w-4" />
              <span>{error}</span>
            </div>
          )}

          {successMessage && (
            <div className="flex items-center space-x-2 text-sm text-black">
              <CheckCircle className="h-4 w-4" />
              <span>{successMessage}</span>
            </div>
          )}

          <div className="flex justify-between pt-4">
            {step !== 'request' && (
              <Button
                type="button"
                variant="outline"
                onClick={() => setStep(step === 'verify' ? 'request' : 'verify')}
                className="text-[#1f5855] border-[#1f5855] hover:bg-[#7aa9ac] hover:text-white"
              >
                Back
              </Button>
            )}
            <Button
              type="button"
              variant="outline"
              onClick={handleClose}
              className={`text-[#1f5855] border-[#1f5855] hover:bg-[#7aa9ac] hover:text-white ${step === 'request' ? 'ml-auto' : ''}`}
            >
              Close
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}