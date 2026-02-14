'use client';

import React, { useActionState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Mail, Phone, User } from 'lucide-react';
import { sendContact, type ContactState } from '@/app/contact/actions';
import { motion } from 'framer-motion';

type ContactFormProps = {
  user?: {
    isRegistered: boolean;
    username: string;
    email: string;
    uniqueUserId: string;
  } | null;
};

export default function ContactForm({ user }: ContactFormProps) {
  const [state, formAction] = useActionState<ContactState, FormData>(sendContact, {
    ok: false,
    message: ''
  });

  return (
    <motion.div initial={{ opacity: 0, x: 30 }} whileInView={{ opacity: 1, x: 0 }} className="bg-white px-6 py-8 rounded-2xl shadow-lg">
      {user?.isRegistered && (
        <div className="mb-6 p-4 bg-[#f0fdfa] rounded-lg border border-[#c6f6e6]">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#0f766e] rounded-full flex items-center justify-center">
              <User className="w-5 h-5 text-white" />
            </div>
            <div>
              <p className="text-sm font-medium text-[#0f766e]">Welcome back, {user.username}!</p>
              <p className="text-xs text-slate-600">Your contact details have been pre-filled</p>
            </div>
          </div>
        </div>
      )}

      <form action={formAction} className="space-y-4">
        {user?.isRegistered && (
          <input
            type="hidden"
            name="unique_user_id"
            value={user.uniqueUserId}
          />
        )}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="home-name" className="text-sm font-medium text-slate-700">Full Name *</Label>
            <Input
              id="home-name"
              name="name"
              defaultValue={user?.isRegistered ? user.username : ''}
              placeholder="Your name"
              className="px-3 py-3"
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="home-email" className="text-sm font-medium text-slate-700">Email Address *</Label>
            <Input
              id="home-email"
              name="email"
              type="email"
              defaultValue={user?.isRegistered ? user.email : ''}
              placeholder="your.email@example.com"
              className="px-3 py-3"
              required
            />
          </div>
        </div>
        <div className="space-y-2">
          <Label htmlFor="home-message" className="text-sm font-medium text-slate-700">Message *</Label>
          <textarea
            id="home-message"
            name="message"
            rows={5}
            placeholder="How can we help?"
            className="w-full rounded-lg border border-slate-200 p-3 resize-none focus:outline-none focus:ring-2 focus:ring-[#0f766e] focus:border-transparent transition"
            required
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="bg-[#0f766e] hover:bg-[#0d5e59] text-white rounded-full px-6 py-2">Send Message</Button>
        </div>

        {state.message && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className={`p-4 rounded-lg ${
              state.ok
                ? 'bg-green-50 border border-green-200 text-green-800'
                : 'bg-red-50 border border-red-200 text-red-800'
            }`}
          >
            {state.message}
          </motion.div>
        )}
      </form>
    </motion.div>
  );
}