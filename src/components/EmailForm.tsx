import React, { useRef, useState, useMemo } from 'react';
import EmailEditor from 'react-email-editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import { Eye, EyeOff, Save, Users, AlertCircle, CheckCircle, CalendarClock, Upload, FileText, Image as ImageIcon, FileCheck, HelpCircle, Plus, Trash2, UserPlus, UserMinus } from 'lucide-react';

export interface EmailFormData {
  title: string;
  type: string;
  subject: string;
  html: string;
  recipients: string;
  scheduled_time: string;
  is_scheduled: boolean;
}

interface Props {
  isEditing: boolean;
  formData: EmailFormData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  formLoading: boolean;
  previewHtml: boolean;
  onFieldChange: (name: keyof EmailFormData, value: any) => void;
  onFormSubmit: (e: React.FormEvent) => Promise<void>;
  onCancel: () => void;
  onLoadSubscribers: () => void;
  onPreviewToggle: () => void;
}

const EmailFormWithVisualEditor: React.FC<Props> = ({
  isEditing,
  formData,
  errors,
  touched,
  formLoading,
  previewHtml,
  onFieldChange,
  onFormSubmit,
  onCancel,
  onLoadSubscribers,
  onPreviewToggle
}) => {
  const editorRef = useRef<any>(null);
  const [emailInput, setEmailInput] = useState('');

  const titleCount = formData.title.length;

  const isScheduleInvalid = useMemo(() => {
    if (!formData.scheduled_time) return false;
    return new Date(formData.scheduled_time) <= new Date();
  }, [formData.scheduled_time]);

  // Parse recipients into array for better management
  const recipientsArray = useMemo(() => {
    return formData.recipients
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0);
  }, [formData.recipients]);

  // Add single email to recipients
  const addEmail = () => {
    if (!emailInput.trim()) return;
    
    const newRecipients = [...recipientsArray, emailInput.trim()];
    onFieldChange('recipients', newRecipients.join('\n'));
    setEmailInput('');
  };

  // Remove specific email from recipients
  const removeEmail = (emailToRemove: string) => {
    const newRecipients = recipientsArray.filter(email => email !== emailToRemove);
    onFieldChange('recipients', newRecipients.join('\n'));
  };

  // Add multiple emails from comma-separated input
  const addMultipleEmails = () => {
    if (!emailInput.trim()) return;
    
    const emailsToAdd = emailInput
      .split(/[,\n]/)
      .map(email => email.trim())
      .filter(email => email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    
    if (emailsToAdd.length === 0) return;
    
    const newRecipients = [...new Set([...recipientsArray, ...emailsToAdd])];
    onFieldChange('recipients', newRecipients.join('\n'));
    setEmailInput('');
  };

  const exportHtml = () => {
    editorRef.current?.editor.exportHtml((data: any) => {
      onFieldChange('html', data.html);
      // The parent component manages the preview state
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Export HTML content from editor before submitting
    const htmlPromise = new Promise<string>((resolve) => {
      editorRef.current?.editor.exportHtml((data: any) => {
        const htmlContent = data.html || '';
        onFieldChange('html', htmlContent);
        resolve(htmlContent);
      });
    });

    const exportedHtml = await htmlPromise;

    // Store scheduled_time directly as selected by user
    if (formData.is_scheduled && formData.scheduled_time) {
      onFieldChange('scheduled_time', formData.scheduled_time);
    }

    // Call parent submit handler with exported HTML
    await onFormSubmit(e);
  };

  // Enhanced validation for recipients
  const validateRecipients = (recipients: string): string => {
    if (isEditing) return ''; // Skip validation for editing existing emails
    
    const emails = recipients
      .split('\n')
      .map(email => email.trim())
      .filter(email => email.length > 0);

    if (emails.length === 0) {
      return 'Please provide at least one recipient email address';
    }

    const invalidEmails = emails.filter(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
    if (invalidEmails.length > 0) {
      return `Invalid email addresses: ${invalidEmails.join(', ')}`;
    }

    return '';
  };

  const handleRecipientsChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value;
    onFieldChange('recipients', value);
    
    // Clear error when user starts typing
    if (errors.recipients) {
      // We can't directly clear errors here, but the parent component should handle this
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* BASIC INFO */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold">Email Details</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Email Title *</Label>
              <Input
                value={formData.title}
                onChange={(e) => onFieldChange('title', e.target.value)}
              />
              <div className="text-xs flex justify-between">
                <span>{titleCount}/100</span>
                {touched.title && errors.title && (
                  <span className="text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> {errors.title}
                  </span>
                )}
                {touched.title && !errors.title && titleCount > 0 && (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" /> Looks good
                  </span>
                )}
              </div>
            </div>

            <div>
              <Label>Email Type</Label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={formData.type}
                onChange={(e) => onFieldChange('type', e.target.value)}
              >
                <option value="Welcome">Welcome</option>
                <option value="Newsletter">Newsletter</option>
                <option value="New Post">New Post</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <Label>Subject *</Label>
            <Input
              value={formData.subject}
              onChange={(e) => onFieldChange('subject', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* VISUAL EMAIL EDITOR */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Email Content</h2>
            <div className="flex gap-2">
              <Button type="button" size="sm" variant="outline" onClick={exportHtml}>
                <Save className="w-4 h-4 mr-1" /> Save Content
              </Button>
              <Button type="button" size="sm" variant="outline" onClick={onPreviewToggle}>
                {previewHtml ? <EyeOff className="w-4 h-4 mr-1" /> : <Eye className="w-4 h-4 mr-1" />}
                Preview
              </Button>
            </div>
          </div>

          <EmailEditor ref={editorRef} minHeight="400px" />

          {previewHtml && (
            <div className="border rounded-md p-4 bg-white">
              <div dangerouslySetInnerHTML={{ __html: formData.html }} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* RECIPIENTS */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recipients</h2>
            <div className="flex gap-2">
              <Button size="sm" variant="outline" onClick={onLoadSubscribers}>
                <Users className="w-4 h-4 mr-1" /> Load Subscribers
              </Button>
              <Button size="sm" variant="outline" onClick={addMultipleEmails}>
                <Plus className="w-4 h-4 mr-1" /> Add Multiple
              </Button>
            </div>
          </div>

          {/* Quick Add Section */}
          <div className="space-y-3">
            <div className="flex gap-2">
              <Input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Add email (or comma-separated list)"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    addMultipleEmails();
                  }
                }}
              />
              <Button
                size="sm"
                onClick={addMultipleEmails}
                disabled={!emailInput.trim()}
              >
                <UserPlus className="w-4 h-4 mr-1" /> Add
              </Button>
            </div>

            {emailInput && (
              <div className="text-xs text-gray-600">
                Tip: You can add multiple emails separated by commas or new lines
              </div>
            )}
          </div>

          {/* Recipients List */}
          {recipientsArray.length > 0 && (
            <div className="space-y-2">
              <div className="text-sm font-medium">Added Recipients ({recipientsArray.length})</div>
              <div className="grid gap-2 max-h-40 overflow-y-auto">
                {recipientsArray.map((email, index) => {
                  const isValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
                  return (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-2 rounded-md border ${
                        isValid ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <div className={`w-2 h-2 rounded-full ${isValid ? 'bg-green-500' : 'bg-red-500'}`} />
                        <span className="text-sm font-medium">{email}</span>
                      </div>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => removeEmail(email)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-100"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Legacy Textarea (Hidden when using new interface) */}
          <div className="relative">
            <Textarea
              disabled={isEditing}
              placeholder="one-email-per-line@example.com"
              value={formData.recipients}
              onChange={handleRecipientsChange}
              className="opacity-0 h-0 overflow-hidden"
            />
            <div className="absolute inset-0 text-sm text-gray-500 border border-dashed rounded-md p-4 flex items-center justify-center">
              {recipientsArray.length === 0 ? "No recipients added yet" : "Recipients managed above"}
            </div>
          </div>
          
          {/* Recipients summary and validation feedback */}
          <div className="space-y-2">
            <div className="text-xs text-gray-600">
              <p>Enter one email address per line. Example:</p>
              <p className="text-gray-400 mt-1">john@example.com</p>
              <p className="text-gray-400">jane@company.org</p>
              <p className="text-gray-400">support@business.com</p>
            </div>

            <div className="flex justify-between items-center">
              <div className="text-xs">
                {touched.recipients && errors.recipients && (
                  <span className="text-red-600 flex items-center">
                    <AlertCircle className="w-3 h-3 mr-1" /> {errors.recipients}
                  </span>
                )}
                {touched.recipients && !errors.recipients && formData.recipients.trim().length > 0 && (
                  <span className="text-green-600 flex items-center">
                    <CheckCircle className="w-3 h-3 mr-1" /> Valid recipients
                  </span>
                )}
              </div>

              {/* Recipients count */}
              {formData.recipients.trim().length > 0 && (
                <div className="text-xs text-gray-600">
                  {(() => {
                    const emails = formData.recipients
                      .split('\n')
                      .map(email => email.trim())
                      .filter(email => email.length > 0);
                    const validEmails = emails.filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
                    return `${validEmails.length} valid recipient${validEmails.length !== 1 ? 's' : ''}`;
                  })()}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* SCHEDULING */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex items-center gap-2">
            <CalendarClock className="w-5 h-5" />
            <h2 className="text-lg font-semibold">Scheduling</h2>
          </div>

          <label className="flex gap-2 items-center text-sm">
            <input
              type="checkbox"
              checked={formData.is_scheduled}
              onChange={(e) => onFieldChange('is_scheduled', e.target.checked)}
            />
            Schedule this email
          </label>

          {formData.is_scheduled && (
            <div>
              <Label className="flex items-center gap-2">
                <span>📅 Send Date & Time</span>
                <span className="text-xs text-gray-500">(Future dates only)</span>
              </Label>
              <div className="relative">
              <input
                type="datetime-local"
                value={formData.scheduled_time}
                onChange={(e) => onFieldChange('scheduled_time', e.target.value)}
                className={`w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 text-black ${
                  isScheduleInvalid
                    ? 'border-red-300 focus:ring-red-500 bg-red-50'
                    : 'border-gray-300 focus:ring-teal-500'
                }`}
              />
                <div className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400">
                  🕐
                </div>
              </div>
              {isScheduleInvalid && formData.scheduled_time && (
                <p className="mt-1 text-sm text-red-600 flex items-center gap-1">
                  <span>⚠️</span> Please select a future date and time
                </p>
              )}
              {!isScheduleInvalid && formData.scheduled_time && (
                <p className="mt-1 text-sm text-green-600 flex items-center gap-1">
                  <span>✅</span> Valid schedule time
                </p>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ACTIONS */}
      <div className="flex gap-3">
        <Button type="submit" className='text-white' disabled={formLoading}>
          <Save className="w-4 h-4 mr-2" />
          {isEditing ? 'Update Email' : 'Create Email'}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
};

export default EmailFormWithVisualEditor;
