import React, { useRef, useState, useMemo, useEffect } from 'react';
import EmailEditor from 'react-email-editor';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent } from '@/components/ui/card';
import {
  Eye,
  EyeOff,
  Save,
  Users,
  AlertCircle,
  CheckCircle,
  CalendarClock,
  Plus,
  Trash2,
  UserPlus
} from 'lucide-react';

/* =======================
   FORM DATA INTERFACE
======================= */
export interface EmailFormData {
  title: string;
  type: string;
  subject: string;
  html: string;
  design: string; // ✅ REQUIRED
  recipients: string;
  scheduled_time: string;
  is_scheduled: boolean;
}

/* =======================
   COMPONENT PROPS
======================= */
interface Props {
  isEditing: boolean;
  formData: EmailFormData;
  errors: Record<string, string>;
  touched: Record<string, boolean>;
  formLoading: boolean;
  previewHtml: boolean;
  onFieldChange: (name: keyof EmailFormData, value: any) => void;
  onFormSubmit: (data: EmailFormData) => Promise<void>;
  onCancel: () => void;
  onLoadSubscribers: () => void;
  onPreviewToggle: () => void;
}

/* =======================
   COMPONENT
======================= */
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

  /* =======================
     SCHEDULE VALIDATION
  ======================= */
  const isScheduleInvalid = useMemo(() => {
    if (!formData.scheduled_time) return false;
    return new Date(formData.scheduled_time) <= new Date();
  }, [formData.scheduled_time]);

  /* =======================
     RECIPIENTS ARRAY
  ======================= */
  const recipientsArray = useMemo(() => {
    return formData.recipients
      .split('\n')
      .map(e => e.trim())
      .filter(Boolean);
  }, [formData.recipients]);

  /* =======================
     ADD EMAILS
  ======================= */
  const addMultipleEmails = () => {
    if (!emailInput.trim()) return;

    const emails = emailInput
      .split(/[,\n]/)
      .map(e => e.trim())
      .filter(e => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e));

    const unique = Array.from(new Set([...recipientsArray, ...emails]));
    onFieldChange('recipients', unique.join('\n'));
    setEmailInput('');
  };

  const removeEmail = (email: string) => {
    const updated = recipientsArray.filter(e => e !== email);
    onFieldChange('recipients', updated.join('\n'));
  };

  /* =======================
     LOAD EDITOR DESIGN
  ======================= */
  const onEditorReady = () => {
    if (isEditing && formData.design) {
      editorRef.current.editor.loadDesign(JSON.parse(formData.design));
    }
  };

  useEffect(() => {
    if (isEditing && formData.design && editorRef.current?.editor) {
      editorRef.current.editor.loadDesign(JSON.parse(formData.design));
    }
  }, [isEditing, formData.design]);

  /* =======================
     PREVIEW HANDLER
  ======================= */
  const handlePreview = () => {
    editorRef.current.editor.exportHtml((data: any) => {
      onFieldChange('html', data.html);
      onPreviewToggle();
    });
  };

  /* =======================
     SUBMIT HANDLER
  ======================= */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    editorRef.current.editor.exportHtml(async (data: any) => {
      const payload: EmailFormData = {
        ...formData,
        html: data.html,
        design: JSON.stringify(data.design),
        scheduled_time: formData.is_scheduled
          ? new Date(formData.scheduled_time).toISOString()
          : ''
      };

      await onFormSubmit(payload);
    });
  };

  /* =======================
     RENDER
  ======================= */
  return (
    <form onSubmit={handleSubmit} className="space-y-6">

      {/* =======================
         BASIC INFO
      ======================= */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <h2 className="text-lg font-semibold">Email Details</h2>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label>Email Title *</Label>
              <Input
                value={formData.title}
                onChange={e => onFieldChange('title', e.target.value)}
              />
            </div>

            <div>
              <Label>Email Type</Label>
              <select
                className="w-full border rounded-md px-3 py-2"
                value={formData.type}
                onChange={e => onFieldChange('type', e.target.value)}
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
              onChange={e => onFieldChange('subject', e.target.value)}
            />
          </div>
        </CardContent>
      </Card>

      {/* =======================
         EMAIL EDITOR
      ======================= */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex justify-between">
            <h2 className="text-lg font-semibold">Email Content</h2>
            <Button type="button" variant="outline" onClick={handlePreview}>
              {previewHtml ? <EyeOff /> : <Eye />} Preview
            </Button>
          </div>

          <EmailEditor ref={editorRef} minHeight="400px" onReady={onEditorReady} />

          {previewHtml && (
            <div className="border p-4 bg-white">
              <div dangerouslySetInnerHTML={{ __html: formData.html }} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* =======================
         RECIPIENTS
      ======================= */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex justify-between items-center">
            <h2 className="text-lg font-semibold">Recipients</h2>
            <Button type="button" variant="outline" size="sm" onClick={onLoadSubscribers}>
              <Users className="w-4 h-4 mr-1" /> Load All Subscribers
            </Button>
          </div>

          <div className="flex gap-2 ">
            <Input
              value={emailInput}
              onChange={e => setEmailInput(e.target.value)}
              placeholder="Add email or comma separated"
            />
            <Button className='text-white' type="button" onClick={addMultipleEmails}>
              <UserPlus className="mr-1 " /> Add
            </Button>
          </div>

          {recipientsArray.map(email => (
            <div key={email} className="flex justify-between border p-2 rounded">
              <span>{email}</span>
              <Button
                type="button"
                size="sm"
                variant="ghost"
                onClick={() => removeEmail(email)}
              >
                <Trash2 />
              </Button>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* =======================
         SCHEDULING
      ======================= */}
      <Card>
        <CardContent className="space-y-4 pt-6">
          <div className="flex gap-2 items-center">
            <CalendarClock />
            <h2 className="text-lg font-semibold">Scheduling</h2>
          </div>

          <label className="flex gap-2">
            <input
              type="checkbox"
              checked={formData.is_scheduled}
              onChange={e => onFieldChange('is_scheduled', e.target.checked)}
            />
            Schedule email
          </label>

          {formData.is_scheduled && (
            <>
              <input
                type="datetime-local"
                value={formData.scheduled_time}
                onChange={e => onFieldChange('scheduled_time', e.target.value)}
                className="border px-3 py-2 rounded"
              />
              {isScheduleInvalid && (
                <p className="text-red-600">Please select future date & time</p>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* =======================
         ACTIONS
      ======================= */}
      <div className="flex gap-3">
        <Button className='text-white' type="submit" disabled={formLoading}>
          <Save className="mr-2" />
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
