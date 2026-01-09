'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { apiGet, apiPost, apiPut, apiDelete, apiGetLLMSuggestions, getCurrentUser } from '../api';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip';
import EmailForm from '@/components/EmailForm';
import { format } from 'date-fns';
import {
  Search, Filter, Plus, Edit, Trash2, Send, Clock, Calendar, Eye, EyeOff,
  Mail, Users, FileText, Settings, BarChart3, RefreshCw, Save, Copy, Sparkles,
  Lightbulb, HelpCircle, AlertCircle, CheckCircle, Info, Info as InfoIcon,
  ShieldCheck, Zap, Gift, Calendar as CalendarIcon, Clock as ClockIcon,
  UserCheck, MailCheck, RefreshCcw, UserPlus, FileText as FileTextIcon
} from 'lucide-react';

type EmailType = {
  value: string;
  label: string;
};

type Email = {
  id: string;
  title: string;
  type: string;
  the_mail: {
    subject: string;
    html: string;
  };
  status: 'Draft' | 'Scheduled' | 'Sent';
  emails: {
    count: number;
    list: Array<{
      email: string;
      name?: string;
    }>;
  } | null;
  scheduled_time: string | null;
  sent_time: string | null;
  created_at: string;
};

type EmailFormData = {
  title: string;
  type: string;
  subject: string;
  html: string;
  recipients: string;
  scheduled_time: string;
  is_scheduled: boolean;
  template: string;
};

type EmailTemplate = {
  id: string;
  name: string;
  category: string;
  description: string;
  html: string;
  previewImage?: string;
};

export default function EmailManagerPage() {
  const [emails, setEmails] = useState<Email[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [totalEmails, setTotalEmails] = useState(0);
  const [mounted, setMounted] = useState(false);
  
  // Form state
  const [showForm, setShowForm] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingEmail, setEditingEmail] = useState<Email | null>(null);
  const [formData, setFormData] = useState<EmailFormData>({
    title: '',
    type: 'Newsletter',
    subject: '',
    html: '',
    recipients: '',
    scheduled_time: '',
    is_scheduled: false,
    template: 'none'
  });
  const [formLoading, setFormLoading] = useState(false);
  const [previewHtml, setPreviewHtml] = useState(false);
  
  // Enhanced form validation state
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [touched, setTouched] = useState<{[key: string]: boolean}>({});
  const [autoSaveStatus, setAutoSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // LLM Suggestions state
  const [titleSuggestions, setTitleSuggestions] = useState<string[]>([]);
  const [subjectSuggestions, setSubjectSuggestions] = useState<string[]>([]);
  const [contentSuggestions, setContentSuggestions] = useState<string[]>([]);
  const [llmLoading, setLlmLoading] = useState<string | null>(null);
  const [showHelp, setShowHelp] = useState(false);
  
  // Statistics
  const [stats, setStats] = useState<any>(null);
  const [statsLoading, setStatsLoading] = useState(false);

  // Email Templates
  const emailTemplates: EmailTemplate[] = [
    {
      id: 'welcome',
      name: 'Welcome Aboard',
      category: 'Welcome',
      description: 'Perfect for welcoming new subscribers to your community',
      html: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #f8f9fa; padding: 20px;">
        <div style="background-color: #ffffff; padding: 40px; border-radius: 8px; box-shadow: 0 2px 10px rgba(0,0,0,0.1);">
          <div style="text-align: center; margin-bottom: 30px;">
            <h1 style="color: #2c3e50; margin: 0; font-size: 28px;">Welcome to Our Community!</h1>
            <p style="color: #7f8c8d; margin-top: 10px; font-size: 16px;">We're excited to have you with us</p>
          </div>
          
          <div style="background-color: #e8f4fd; padding: 20px; border-left: 4px solid #3498db; margin: 20px 0;">
            <h2 style="margin: 0 0 10px 0; color: #2c3e50;">What's Next?</h2>
            <ul style="margin: 0; padding-left: 20px; color: #34495e;">
              <li style="margin-bottom: 8px;">Explore our latest content</li>
              <li style="margin-bottom: 8px;">Connect with our community</li>
              <li style="margin-bottom: 8px;">Stay updated with exclusive offers</li>
            </ul>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="#" style="background-color: #3498db; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold; display: inline-block;">Get Started</a>
          </div>

          <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #ecf0f1; text-align: center; color: #7f8c8d; font-size: 14px;">
            <p style="margin: 0;">If you have any questions, simply reply to this email.</p>
          </div>
        </div>
      </div>`
    },
    {
      id: 'newsletter',
      name: 'Modern Newsletter',
      category: 'Newsletter',
      description: 'Clean and professional newsletter template',
      html: `<div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 40px; text-align: center; color: white;">
          <h1 style="margin: 0; font-size: 32px; font-weight: 700;">Weekly Newsletter</h1>
          <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Your weekly dose of inspiration and updates</p>
        </div>

        <div style="padding: 40px;">
          <div style="margin-bottom: 30px;">
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 24px;">This Week's Highlights</h2>
            <p style="color: #34495e; line-height: 1.6; font-size: 16px;">Discover the latest trends, tips, and insights that matter to you. We've curated the best content just for our subscribers.</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
              <h3 style="margin: 0 0 10px 0; color: #2c3e50;">Article of the Week</h3>
              <p style="color: #666; font-size: 14px; line-height: 1.5;">Discover our most popular article that's helping people achieve their goals.</p>
              <a href="#" style="color: #667eea; text-decoration: none; font-weight: bold;">Read More →</a>
            </div>
            <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; border-left: 4px solid #764ba2;">
              <h3 style="margin: 0 0 10px 0; color: #2c3e50;">Community Spotlight</h3>
              <p style="color: #666; font-size: 14px; line-height: 1.5;">Meet inspiring members from our growing community.</p>
              <a href="#" style="color: #764ba2; text-decoration: none; font-weight: bold;">Read More →</a>
            </div>
          </div>

          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border: 1px solid #ffeaa7; margin: 30px 0;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">Special Offer Inside</h3>
            <p style="margin: 0; color: #856404; font-size: 14px;">As a valued subscriber, enjoy exclusive access to our premium content.</p>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <a href="#" style="background-color: #667eea; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; display: inline-block;">Explore More</a>
          </div>
        </div>

        <div style="background-color: #2c3e50; color: white; padding: 30px; text-align: center;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">You're receiving this email because you subscribed to our newsletter.</p>
          <p style="margin: 10px 0 0 0; font-size: 12px; opacity: 0.6;">© 2024 Your Company. All rights reserved.</p>
        </div>
      </div>`
    },
    {
      id: 'promotion',
      name: 'Special Promotion',
      category: 'Promotional',
      description: 'Eye-catching promotional email with discount offers',
      html: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #fff;">
        <div style="background: linear-gradient(135deg, #ff6b6b, #ee5a24); padding: 40px; text-align: center; color: white;">
          <div style="background-color: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 12px; display: inline-block;">
            <h1 style="margin: 0; font-size: 36px; font-weight: 800; text-transform: uppercase; letter-spacing: 2px;">Special Offer</h1>
            <p style="margin: 10px 0 0 0; font-size: 18px; font-weight: 600;">Limited Time Only</p>
          </div>
        </div>

        <div style="padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border: 2px solid #ffc107; display: inline-block;">
              <h2 style="margin: 0 0 10px 0; color: #856404; font-size: 28px;">50% OFF</h2>
              <p style="margin: 0; color: #856404; font-size: 16px; font-weight: bold;">On All Products</p>
            </div>
          </div>

          <div style="margin: 30px 0;">
            <h3 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 22px;">Why Choose Us?</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px;">
                <strong style="color: #2c3e50;">Quality Guaranteed</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Premium products you can trust</p>
              </div>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px;">
                <strong style="color: #2c3e50;">Fast Shipping</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Get your order quickly</p>
              </div>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px;">
                <strong style="color: #2c3e50;">Easy Returns</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Hassle-free return policy</p>
              </div>
              <div style="background-color: #f8f9fa; padding: 15px; border-radius: 6px;">
                <strong style="color: #2c3e50;">24/7 Support</strong>
                <p style="margin: 5px 0 0 0; font-size: 14px; color: #666;">Always here to help</p>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="#" style="background-color: #ff6b6b; color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-size: 18px; font-weight: bold; box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);">Shop Now</a>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #666; font-size: 14px;">Offer ends in <span style="color: #ff6b6b; font-weight: bold;">3 days</span></p>
            <p style="margin: 5px 0 0 0; color: #666; font-size: 12px;">Use code: SPECIAL50 at checkout</p>
          </div>
        </div>

        <div style="background-color: #2c3e50; color: white; padding: 20px; text-align: center;">
          <p style="margin: 0; font-size: 12px; opacity: 0.8;">© 2024 Your Company. All rights reserved.</p>
        </div>
      </div>`
    },
    {
      id: 'announcement',
      name: 'Product Launch',
      category: 'Announcement',
      description: 'Exciting product launch announcement',
      html: `<div style="max-width: 600px; margin: 0 auto; font-family: 'Helvetica Neue', Arial, sans-serif; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #2c3e50, #34495e); padding: 60px 40px; text-align: center; color: white;">
          <div style="background-color: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 12px; backdrop-filter: blur(10px);">
            <h1 style="margin: 0; font-size: 42px; font-weight: 800; letter-spacing: 2px; text-transform: uppercase;">Introducing</h1>
            <h2 style="margin: 15px 0 0 0; font-size: 28px; font-weight: 300; opacity: 0.9;">The Future is Here</h2>
          </div>
        </div>

        <div style="padding: 40px;">
          <div style="text-align: center; margin-bottom: 40px;">
            <div style="width: 120px; height: 120px; background: linear-gradient(135deg, #3498db, #9b59b6); border-radius: 50%; margin: 0 auto 20px; display: flex; align-items: center; justify-content: center;">
              <span style="font-size: 40px; font-weight: bold;">🚀</span>
            </div>
            <h3 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 24px;">Revolutionary Product Launch</h3>
            <p style="color: #7f8c8d; margin: 0; font-size: 16px;">We're proud to introduce something that will change everything.</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 20px; margin: 40px 0;">
            <div style="text-align: center; padding: 20px; border: 1px solid #ecf0f1; border-radius: 8px;">
              <div style="width: 60px; height: 60px; background-color: #e8f5e9; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                <span style="font-size: 24px;">⚡</span>
              </div>
              <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Lightning Fast</h4>
              <p style="margin: 0; color: #7f8c8d; font-size: 14px;">Experience unprecedented speed and performance.</p>
            </div>
            <div style="text-align: center; padding: 20px; border: 1px solid #ecf0f1; border-radius: 8px;">
              <div style="width: 60px; height: 60px; background-color: #e3f2fd; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                <span style="font-size: 24px;">🔒</span>
              </div>
              <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Secure & Safe</h4>
              <p style="margin: 0; color: #7f8c8d; font-size: 14px;">Your data protected with military-grade encryption.</p>
            </div>
            <div style="text-align: center; padding: 20px; border: 1px solid #ecf0f1; border-radius: 8px;">
              <div style="width: 60px; height: 60px; background-color: #fff3e0; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                <span style="font-size: 24px;">📱</span>
              </div>
              <h4 style="margin: 0 0 10px 0; color: #2c3e50;">Any Device</h4>
              <p style="margin: 0; color: #7f8c8d; font-size: 14px;">Works seamlessly across all your devices.</p>
            </div>
          </div>

          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin: 40px 0; text-align: center;">
            <h3 style="margin: 0 0 15px 0; color: #2c3e50; font-size: 22px;">Ready to Experience the Future?</h3>
            <p style="margin: 0 0 20px 0; color: #7f8c8d; font-size: 16px;">Join thousands of satisfied users who have already made the switch.</p>
            <a href="#" style="background-color: #3498db; color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(52, 152, 219, 0.3);">Get Started</a>
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <p style="margin: 0; color: #7f8c8d; font-size: 14px;">Launching on <strong style="color: #2c3e50;">November 15th</strong></p>
            <p style="margin: 5px 0 0 0; color: #7f8c8d; font-size: 12px;">Be the first to know when we go live!</p>
          </div>
        </div>

        <div style="background-color: #2c3e50; color: white; padding: 30px; text-align: center;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">Follow us on social media for more updates</p>
          <div style="margin-top: 15px;">
            <a href="#" style="color: white; text-decoration: none; margin: 0 10px; font-size: 18px;">📱</a>
            <a href="#" style="color: white; text-decoration: none; margin: 0 10px; font-size: 18px;">🐦</a>
            <a href="#" style="color: white; text-decoration: none; margin: 0 10px; font-size: 18px;">💼</a>
          </div>
        </div>
      </div>`
    },
    {
      id: 'reminder',
      name: 'Friendly Reminder',
      category: 'Reminder',
      description: 'Gentle reminder email with helpful tone',
      html: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff; border: 1px solid #e9ecef;">
        <div style="background-color: #f8f9fa; padding: 30px; text-align: center; border-bottom: 1px solid #e9ecef;">
          <div style="width: 80px; height: 80px; background-color: #e3f2fd; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
            <span style="font-size: 32px;">⏰</span>
          </div>
          <h2 style="margin: 0; color: #495057; font-size: 24px;">Just a Friendly Reminder</h2>
          <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 16px;">We wanted to make sure you didn't miss this</p>
        </div>

        <div style="padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <h3 style="color: #495057; margin: 0 0 15px 0; font-size: 22px;">You Have Something Waiting</h3>
            <p style="color: #6c757d; line-height: 1.6; font-size: 16px;">We noticed you left something important behind. Don't worry, we've saved it just for you.</p>
          </div>

          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 30px 0;">
            <h4 style="margin: 0 0 10px 0; color: #856404;">What You Missed:</h4>
            <ul style="margin: 0; padding-left: 20px; color: #856404;">
              <li style="margin-bottom: 5px;">Important updates and announcements</li>
              <li style="margin-bottom: 5px;">Exclusive content just for you</li>
              <li style="margin-bottom: 5px;">Special offers and discounts</li>
            </ul>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
            <div style="text-align: center; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
              <div style="width: 50px; height: 50px; background-color: #d1ecf1; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                <span style="font-size: 20px;">📋</span>
              </div>
              <h4 style="margin: 0 0 10px 0; color: #495057;">To-Do List</h4>
              <p style="margin: 0; color: #6c757d; font-size: 14px;">Check what needs your attention</p>
            </div>
            <div style="text-align: center; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
              <div style="width: 50px; height: 50px; background-color: #d4edda; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                <span style="font-size: 20px;">✅</span>
              </div>
              <h4 style="margin: 0 0 10px 0; color: #495057;">Complete Tasks</h4>
              <p style="margin: 0; color: #6c757d; font-size: 14px;">Finish what you started</p>
            </div>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="#" style="background-color: #28a745; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);">Take Action Now</a>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">If you have any questions, our team is here to help.</p>
            <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 12px;">Simply reply to this email or contact support.</p>
          </div>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #6c757d; font-size: 12px;">© 2024 Your Company. All rights reserved.</p>
        </div>
      </div>`
    },
    {
      id: 'thankyou',
      name: 'Thank You Note',
      category: 'Thank You',
      description: 'Heartfelt thank you email with gratitude',
      html: `<div style="max-width: 600px; margin: 0 auto; font-family: 'Georgia', serif; background-color: #ffffff;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px; text-align: center; color: white;">
          <div style="background-color: rgba(255, 255, 255, 0.1); padding: 25px; border-radius: 12px; display: inline-block;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 400; letter-spacing: 1px;">Thank You</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">From the bottom of our hearts</p>
          </div>
        </div>

        <div style="padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
              <span style="font-size: 32px;">❤️</span>
            </div>
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 26px;">Your Support Means Everything</h2>
            <p style="color: #7f8c8d; line-height: 1.6; font-size: 16px; max-width: 500px; margin: 0 auto;">We are truly grateful for your trust and partnership. Your support fuels our passion and drives us to be better every day.</p>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 40px 0;">
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #667eea; text-align: center;">
              <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 20px;">Our Promise</h3>
              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">We promise to continue delivering exceptional value and service that exceeds your expectations.</p>
            </div>
            <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; border-left: 4px solid #764ba2; text-align: center;">
              <h3 style="margin: 0 0 10px 0; color: #2c3e50; font-size: 20px;">Our Commitment</h3>
              <p style="margin: 0; color: #666; font-size: 14px; line-height: 1.5;">We're committed to building a relationship that grows stronger with time.</p>
            </div>
          </div>

          <div style="background-color: #fff3cd; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">Special Gift for You</h3>
            <p style="margin: 0 0 15px 0; color: #856404; font-size: 14px;">As a token of our appreciation, enjoy this exclusive offer.</p>
            <a href="#" style="background-color: #856404; color: white; padding: 10px 25px; text-decoration: none; border-radius: 25px; font-weight: bold; font-size: 14px;">Claim Your Gift</a>
          </div>

          <div style="text-align: center; margin-top: 40px;">
            <p style="color: #7f8c8d; font-size: 16px; line-height: 1.6; font-style: italic;">"Gratitude turns what we have into enough."</p>
            <p style="color: #2c3e50; margin-top: 15px; font-size: 14px;">With heartfelt thanks,</p>
            <p style="color: #2c3e50; font-weight: bold; font-size: 16px;">The Team at [Your Company]</p>
          </div>
        </div>

        <div style="background-color: #2c3e50; color: white; padding: 25px; text-align: center;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">We're always here for you. Just reach out whenever you need us.</p>
        </div>
      </div>`
    },
    {
      id: 'update',
      name: 'Service Update',
      category: 'Update',
      description: 'Professional service update notification',
      html: `<div style="max-width: 600px; margin: 0 auto; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #ffffff; border: 1px solid #e9ecef;">
        <div style="background-color: #007bff; padding: 30px; text-align: center; color: white;">
          <div style="background-color: rgba(255, 255, 255, 0.2); padding: 20px; border-radius: 8px; display: inline-block;">
            <h1 style="margin: 0; font-size: 24px; font-weight: 700;">Service Update</h1>
            <p style="margin: 10px 0 0 0; font-size: 14px; opacity: 0.9;">Important information about your service</p>
          </div>
        </div>

        <div style="padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 60px; height: 60px; background-color: #e3f2fd; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
              <span style="font-size: 24px;">📢</span>
            </div>
            <h2 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 24px;">Important Update</h2>
            <p style="color: #7f8c8d; font-size: 16px;">Please read this important information about your account/service.</p>
          </div>

          <div style="background-color: #fff3cd; padding: 20px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 30px 0;">
            <h3 style="margin: 0 0 10px 0; color: #856404;">What's Changing:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #856404;">
              <li style="margin-bottom: 8px;">Enhanced security features</li>
              <li style="margin-bottom: 8px;">Improved performance and speed</li>
              <li style="margin-bottom: 8px;">New user interface updates</li>
              <li style="margin-bottom: 8px;">Additional features and capabilities</li>
            </ul>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
            <div style="padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
              <div style="width: 40px; height: 40px; background-color: #d4edda; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                <span style="font-size: 18px;">✅</span>
              </div>
              <h4 style="margin: 0 0 10px 0; color: #155724;">Benefits</h4>
              <p style="margin: 0; color: #155724; font-size: 14px;">Improved experience, better security, and enhanced features.</p>
            </div>
            <div style="padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
              <div style="width: 40px; height: 40px; background-color: #f8d7da; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin-bottom: 15px;">
                <span style="font-size: 18px;">⚠️</span>
              </div>
              <h4 style="margin: 0 0 10px 0; color: #721c24;">Action Required</h4>
              <p style="margin: 0; color: #721c24; font-size: 14px;">Please review the changes and update your settings if needed.</p>
            </div>
          </div>

          <div style="background-color: #e9ecef; padding: 20px; border-radius: 8px; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #495057;">Timeline</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr 1fr; gap: 15px;">
              <div style="text-align: center; padding: 15px; background-color: white; border-radius: 6px;">
                <strong style="color: #495057; display: block; margin-bottom: 5px;">Phase 1</strong>
                <span style="color: #6c757d; font-size: 12px;">Starting Nov 1</span>
              </div>
              <div style="text-align: center; padding: 15px; background-color: white; border-radius: 6px;">
                <strong style="color: #495057; display: block; margin-bottom: 5px;">Phase 2</strong>
                <span style="color: #6c757d; font-size: 12px;">Starting Dec 1</span>
              </div>
              <div style="text-align: center; padding: 15px; background-color: white; border-radius: 6px;">
                <strong style="color: #495057; display: block; margin-bottom: 5px;">Complete</strong>
                <span style="color: #6c757d; font-size: 12px;">Jan 2025</span>
              </div>
            </div>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="#" style="background-color: #007bff; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; box-shadow: 0 4px 15px rgba(0, 123, 255, 0.3);">Learn More</a>
            <a href="#" style="background-color: #6c757d; color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; font-weight: bold; margin-left: 10px; box-shadow: 0 4px 15px rgba(108, 117, 125, 0.3);">Contact Support</a>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">Thank you for your continued trust in our service.</p>
            <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 12px;">We're committed to providing you with the best experience possible.</p>
          </div>
        </div>

        <div style="background-color: #f8f9fa; padding: 20px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0; color: #6c757d; font-size: 12px;">© 2024 Your Company. All rights reserved.</p>
        </div>
      </div>`
    },
    {
      id: 'survey',
      name: 'Feedback Request',
      category: 'Feedback',
      description: 'Professional feedback and survey request',
      html: `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; background-color: #ffffff; border: 1px solid #e9ecef;">
        <div style="background: linear-gradient(135deg, #28a745, #20c997); padding: 40px; text-align: center; color: white;">
          <div style="background-color: rgba(255, 255, 255, 0.2); padding: 25px; border-radius: 12px; display: inline-block;">
            <h1 style="margin: 0; font-size: 28px; font-weight: 700;">We Value Your Opinion</h1>
            <p style="margin: 10px 0 0 0; font-size: 16px; opacity: 0.9;">Help us serve you better</p>
          </div>
        </div>

        <div style="padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #28a745, #20c997); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
              <span style="font-size: 32px;">📝</span>
            </div>
            <h2 style="color: #2c3e50; margin: 0 0 15px 0; font-size: 24px;">Share Your Experience</h2>
            <p style="color: #7f8c8d; line-height: 1.6; font-size: 16px; max-width: 500px; margin: 0 auto;">Your feedback helps us improve our products and services to better meet your needs.</p>
          </div>

          <div style="background-color: #e8f5e9; padding: 20px; border-radius: 8px; border-left: 4px solid #28a745; margin: 30px 0;">
            <h3 style="margin: 0 0 10px 0; color: #155724;">Why Your Feedback Matters:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #155724;">
              <li style="margin-bottom: 8px;">Helps us understand your needs better</li>
              <li style="margin-bottom: 8px;">Guides our product development</li>
              <li style="margin-bottom: 8px;">Improves customer experience for everyone</li>
              <li style="margin-bottom: 8px;">Shapes our future offerings</li>
            </ul>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
            <div style="text-align: center; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
              <div style="width: 60px; height: 60px; background-color: #e3f2fd; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                <span style="font-size: 24px;">⏱️</span>
              </div>
              <h4 style="margin: 0 0 10px 0; color: #495057;">Quick & Easy</h4>
              <p style="margin: 0; color: #6c757d; font-size: 14px;">Only takes 2-3 minutes of your time</p>
            </div>
            <div style="text-align: center; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
              <div style="width: 60px; height: 60px; background-color: #fff3cd; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                <span style="font-size: 24px;">🎁</span>
              </div>
              <h4 style="margin: 0 0 10px 0; color: #495057;">Reward Included</h4>
              <p style="margin: 0; color: #6c757d; font-size: 14px;">Complete the survey for a special gift</p>
            </div>
          </div>

          <div style="background-color: #f8f9fa; padding: 25px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <h3 style="margin: 0 0 15px 0; color: #495057;">Your Honest Feedback</h3>
            <p style="margin: 0; color: #6c757d; font-size: 14px;">We value your honest opinion. All responses are confidential and will be used solely for improvement purposes.</p>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="#" style="background-color: #28a745; color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(40, 167, 69, 0.3);">Start Survey</a>
          </div>

          <div style="background-color: #e7f3ff; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #0c5460; font-size: 14px;">Questions? Contact our support team at support@company.com</p>
            <p style="margin: 10px 0 0 0; color: #0c5460; font-size: 12px;">Survey closes on December 31st, 2024</p>
          </div>
        </div>

        <div style="background-color: #2c3e50; color: white; padding: 25px; text-align: center;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">Thank you for helping us improve. Your voice matters!</p>
        </div>
      </div>`
    },
    {
      id: 'event',
      name: 'Event Invitation',
      category: 'Event',
      description: 'Elegant event invitation with RSVP functionality',
      html: `<div style="max-width: 600px; margin: 0 auto; font-family: 'Georgia', serif; background-color: #ffffff; border: 1px solid #e9ecef;">
        <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 50px; text-align: center; color: white;">
          <div style="background-color: rgba(255, 255, 255, 0.1); padding: 30px; border-radius: 12px; display: inline-block;">
            <h1 style="margin: 0; font-size: 32px; font-weight: 400; letter-spacing: 2px; text-transform: uppercase;">You're Invited</h1>
            <p style="margin: 15px 0 0 0; font-size: 16px; opacity: 0.9;">An exclusive event awaits</p>
          </div>
        </div>

        <div style="padding: 40px;">
          <div style="text-align: center; margin-bottom: 30px;">
            <div style="width: 80px; height: 80px; background: linear-gradient(135deg, #667eea, #764ba2); border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 20px;">
              <span style="font-size: 32px;">🎉</span>
            </div>
            <h2 style="color: #2c3e50; margin: 0 0 10px 0; font-size: 26px;">Exclusive Event Invitation</h2>
            <p style="color: #7f8c8d; font-size: 16px;">Join us for an unforgettable experience</p>
          </div>

          <div style="background-color: #f8f9fa; padding: 30px; border-radius: 8px; margin: 30px 0; text-align: center;">
            <h3 style="margin: 0 0 20px 0; color: #2c3e50; font-size: 22px;">Event Details</h3>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px;">
              <div style="text-align: left;">
                <strong style="color: #2c3e50; display: block; margin-bottom: 5px;">📅 Date:</strong>
                <span style="color: #666; font-size: 14px;">November 15th, 2024</span>
              </div>
              <div style="text-align: left;">
                <strong style="color: #2c3e50; display: block; margin-bottom: 5px;">🕐 Time:</strong>
                <span style="color: #666; font-size: 14px;">6:00 PM - 10:00 PM</span>
              </div>
              <div style="text-align: left;">
                <strong style="color: #2c3e50; display: block; margin-bottom: 5px;">📍 Location:</strong>
                <span style="color: #666; font-size: 14px;">Grand Ballroom, City Center</span>
              </div>
              <div style="text-align: left;">
                <strong style="color: #2c3e50; display: block; margin-bottom: 5px;">👔 Dress Code:</strong>
                <span style="color: #666; font-size: 14px;">Smart Casual</span>
              </div>
            </div>
          </div>

          <div style="background-color: #fff3cd; padding: 25px; border-radius: 8px; border-left: 4px solid #ffc107; margin: 30px 0;">
            <h3 style="margin: 0 0 15px 0; color: #856404;">What to Expect:</h3>
            <ul style="margin: 0; padding-left: 20px; color: #856404;">
              <li style="margin-bottom: 8px;">Networking with industry leaders</li>
              <li style="margin-bottom: 8px;">Gourmet dinner and refreshments</li>
              <li style="margin-bottom: 8px;">Live entertainment and music</li>
              <li style="margin-bottom: 8px;">Special guest speakers</li>
              <li style="margin-bottom: 8px;">Exciting giveaways and prizes</li>
            </ul>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 20px; margin: 30px 0;">
            <div style="text-align: center; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
              <div style="width: 50px; height: 50px; background-color: #d4edda; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                <span style="font-size: 20px;">✅</span>
              </div>
              <h4 style="margin: 0 0 10px 0; color: #495057;">Confirmed</h4>
              <p style="margin: 0; color: #6c757d; font-size: 14px;">You're all set to attend</p>
            </div>
            <div style="text-align: center; padding: 20px; border: 1px solid #e9ecef; border-radius: 8px;">
              <div style="width: 50px; height: 50px; background-color: #f8d7da; border-radius: 50%; display: flex; align-items: center; justify-content: center; margin: 0 auto 15px;">
                <span style="font-size: 20px;">❓</span>
              </div>
              <h4 style="margin: 0 0 10px 0; color: #495057;">RSVP Required</h4>
              <p style="margin: 0; color: #6c757d; font-size: 14px;">Please confirm your attendance</p>
            </div>
          </div>

          <div style="text-align: center; margin: 40px 0;">
            <a href="#" style="background-color: #667eea; color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);">RSVP Now</a>
            <a href="#" style="background-color: #764ba2; color: white; padding: 15px 40px; text-decoration: none; border-radius: 50px; font-weight: bold; font-size: 16px; margin-left: 10px; box-shadow: 0 4px 15px rgba(118, 75, 162, 0.4);">View Details</a>
          </div>

          <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
            <p style="margin: 0; color: #6c757d; font-size: 14px;">Can't make it? Let us know, we'd love to hear from you.</p>
            <p style="margin: 10px 0 0 0; color: #6c757d; font-size: 12px;">For questions, contact events@company.com</p>
          </div>
        </div>

        <div style="background-color: #2c3e50; color: white; padding: 25px; text-align: center;">
          <p style="margin: 0; font-size: 14px; opacity: 0.8;">We look forward to celebrating with you!</p>
        </div>
      </div>`
    }
  ];

  const token = typeof window !== 'undefined' ? localStorage.getItem('adminToken') : null;
  const router = useRouter();

  // Handle hydration
  useEffect(() => {
    setMounted(true);
  }, []);

  // Debounced search
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Load emails
  const loadEmails = useCallback(async () => {
    if (!token) return;

    setLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        limit: pageSize.toString(),
        sort: 'created_at',
        order: 'desc',
        ...(debouncedSearchTerm && { search: debouncedSearchTerm }),
        ...(statusFilter && { status: statusFilter }),
        ...(typeFilter && { type: typeFilter }),
      });

      const response = await apiGet<{
        data: Email[];
        pagination: {
          total: number;
          page: number;
          totalPages: number;
          limit: number;
        };
      }>(`/email-manager?${params}`, token);

      setEmails(response.data || []);
      setTotalEmails(response.pagination.total || 0);
    } catch (err) {
      console.error('Failed to load emails:', err);
      setError('Failed to load emails. Please try again.');
    } finally {
      setLoading(false);
    }
  }, [token, currentPage, pageSize, debouncedSearchTerm, statusFilter, typeFilter]);

  // Load statistics
  const loadStats = useCallback(async () => {
    if (!token) return;

    setStatsLoading(true);
    try {
      const response = await apiGet('/email-manager/stats', token);
      setStats(response);
    } catch (err) {
      console.error('Failed to load statistics:', err);
    } finally {
      setStatsLoading(false);
    }
  }, [token]);

  // Load subscriber emails
  const loadSubscriberEmails = async () => {
    if (!token) return;

    try {
      const response = await apiGet<{ count: number; emails: Array<{ email: string; name: string }> }>('/subscribers/emails', token);
      const subscriberEmails = response.emails.map((sub) => sub.email).join('\n');

      setFormData(prev => ({
        ...prev,
        recipients: prev.recipients ? prev.recipients + '\n' + subscriberEmails : subscriberEmails
      }));

      alert(`Loaded ${response.count} subscriber emails`);
    } catch (err: any) {
      console.error('Failed to load subscriber emails:', err);
      alert('Failed to load subscriber emails. Please try again.');
    }
  };

  useEffect(() => {
    loadEmails();
    loadStats();
  }, [loadEmails, loadStats]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearchTerm, statusFilter, typeFilter]);

  // Update form data when editingEmail changes
  useEffect(() => {
    if (isEditing && editingEmail) {
      setFormData({
        title: editingEmail.title,
        type: editingEmail.type,
        subject: editingEmail.the_mail.subject,
        html: editingEmail.the_mail.html,
        recipients: editingEmail.emails?.list.map(r => r.email).join('\n') || '',
        scheduled_time: editingEmail.scheduled_time || '',
        is_scheduled: !!editingEmail.scheduled_time,
        template: 'none'
      });
    } else if (!isEditing) {
      setFormData({
        title: '',
        type: 'Newsletter',
        subject: '',
        html: '',
        recipients: '',
        scheduled_time: '',
        is_scheduled: false,
        template: 'none'
      });
    }
  }, [isEditing, editingEmail]);

  // Enhanced form validation functions
  const validateField = (name: string, value: string): string => {
    switch (name) {
      case 'title':
        if (!value.trim()) return 'Title is required';
        if (value.length < 5) return 'Title should be at least 5 characters long';
        if (value.length > 100) return 'Title should not exceed 100 characters';
        return '';
      case 'subject':
        if (!value.trim()) return 'Subject is required';
        if (value.length < 10) return 'Subject should be at least 10 characters long';
        if (value.length > 150) return 'Subject should not exceed 150 characters';
        return '';
      case 'html':
        if (!value.trim()) return 'Email content is required';
        if (!value.includes('<') || !value.includes('>')) return 'Content should contain HTML tags';
        return '';
      case 'recipients':
        if (!isEditing) {
          const emails = value.split('\n').map(email => email.trim()).filter(email => email.length > 0);
          if (emails.length === 0) return 'At least one recipient is required';
          
          const invalidEmails = emails.filter(email => !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email));
          if (invalidEmails.length > 0) return `Invalid email addresses: ${invalidEmails.join(', ')}`;
        }
        return '';
      case 'scheduled_time':
        if (value && new Date(value) <= new Date()) return 'Scheduled time must be in the future';
        return '';
      default:
        return '';
    }
  };

  const validateForm = (): boolean => {
    const newErrors: {[key: string]: string} = {};
    const fieldsToValidate = ['title', 'subject', 'html'];
    
    if (!isEditing) fieldsToValidate.push('recipients');
    if (formData.is_scheduled) fieldsToValidate.push('scheduled_time');

    fieldsToValidate.forEach(field => {
      const error = validateField(field, formData[field as keyof EmailFormData] as string);
      if (error) newErrors[field] = error;
    });

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFieldChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
    setTouched(prev => ({ ...prev, [name]: true }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  // Auto-save functionality
  const autoSave = useCallback(async () => {
    if (!showForm || isEditing || !validateForm()) return;
    
    setAutoSaveStatus('saving');
    
    try {
      // Create a draft email
      const recipientsList = formData.recipients
        .split('\n')
        .map(email => email.trim())
        .filter(email => email.length > 0 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        .map(email => ({ email }));

      const draftData = {
        title: formData.title.trim(),
        type: formData.type,
        the_mail: {
          subject: formData.subject.trim(),
          html: formData.html
        },
        emails: recipientsList.length > 0 ? {
          count: recipientsList.length,
          list: recipientsList
        } : null,
        scheduled_time: formData.is_scheduled ? formData.scheduled_time : null,
        status: 'Draft'
      };

      await apiPost('/email-manager', token, draftData);
      setAutoSaveStatus('saved');
      
      // Clear saved status after 2 seconds
      setTimeout(() => setAutoSaveStatus('idle'), 2000);
    } catch (err) {
      console.error('Auto-save failed:', err);
      setAutoSaveStatus('error');
      setTimeout(() => setAutoSaveStatus('idle'), 3000);
    }
  }, [formData, showForm, isEditing, token]);

  // Set up auto-save interval
  useEffect(() => {
    if (!showForm || isEditing) return;
    
    const interval = setInterval(autoSave, 30000); // Auto-save every 30 seconds
    return () => clearInterval(interval);
  }, [autoSave, showForm, isEditing]);

  // LLM Suggestions Functions
  const getContextFromForm = () => {
    return {
      category: formData.type,
      tags: [], // Could add tags if needed
      title: formData.title.trim() || undefined,
      excerpt: formData.subject.trim() || undefined,
      author: undefined, // Could add author if needed
      content: formData.html || undefined
    };
  };

  const getLLMSuggestions = async (fieldType: string, currentValue = '') => {
    if (!token) return;

    setLlmLoading(fieldType);
    try {
      const context = getContextFromForm();
      
      // Map email manager field types to API field types
      let apiFieldType = fieldType;
      switch (fieldType) {
        case 'title':
          apiFieldType = 'title';
          break;
        case 'subject':
          apiFieldType = 'excerpt';
          break;
        case 'content':
          apiFieldType = 'content';
          break;
        default:
          apiFieldType = fieldType;
      }

      const response = await apiGetLLMSuggestions(apiFieldType, context, currentValue, token);

      // Update state based on field type
      switch (fieldType) {
        case 'title':
          setTitleSuggestions(response.suggestions);
          break;
        case 'subject':
          setSubjectSuggestions(response.suggestions);
          break;
        case 'content':
          setContentSuggestions(response.suggestions);
          break;
      }
    } catch (error) {
      console.error('LLM suggestions error:', error);
      // Silently fail - LLM is optional
    } finally {
      setLlmLoading(null);
    }
  };

  // Auto-generate suggestions when certain fields are filled
  useEffect(() => {
    const timer = setTimeout(() => {
      // Generate title suggestions when type is selected but title is empty
      if (formData.type && !formData.title.trim() && !titleSuggestions.length) {
        getLLMSuggestions('title');
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [formData.type, formData.title, titleSuggestions.length]);

  useEffect(() => {
    const timer = setTimeout(() => {
      // Generate subject suggestions when title is filled but subject is empty
      if (formData.title.trim() && !formData.subject.trim() && !subjectSuggestions.length) {
        getLLMSuggestions('subject');
      }
    }, 1500);

    return () => clearTimeout(timer);
  }, [formData.title, formData.subject, subjectSuggestions.length]);

  const handleCreate = () => {
    setIsEditing(false);
    setEditingEmail(null);
    setFormData({
      title: '',
      type: 'Newsletter',
      subject: '',
      html: '',
      recipients: '',
      scheduled_time: '',
      is_scheduled: false,
      template: 'none'
    });
    setShowForm(true);
  };

  const handleEdit = (email: Email) => {
    setIsEditing(true);
    setEditingEmail(email);
    setFormData({
      title: email.title,
      type: email.type,
      subject: email.the_mail.subject,
      html: email.the_mail.html,
      recipients: email.emails?.list.map(r => r.email).join('\n') || '',
      scheduled_time: email.scheduled_time || '',
      is_scheduled: !!email.scheduled_time,
      template: 'none'
    });
    setShowForm(true);
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete email "${title}"?`)) return;

    try {
      await apiDelete(`/email-manager/${id}`, token);
      await loadEmails();
      alert('Email deleted successfully!');
    } catch (err: any) {
      console.error('Delete failed:', err);
      alert(err.message || "Failed to delete email. Please try again.");
    }
  };

  const handleSend = async (id: string) => {
    if (!confirm('Are you sure you want to send this email now?')) return;

    try {
      const response = await apiPost<{ results: { sent: number } }>(`/email-manager/${id}/send`, token, {});
      await loadEmails();
      alert(`Email sent to ${response.results.sent} recipients successfully.`);
    } catch (err: any) {
      console.error('Send failed:', err);
      alert(err.message || "Failed to send email. Please try again.");
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormLoading(true);

    try {
      // Debug: Log current form data
      console.log('Form submission - current formData.recipients:', formData.recipients);

      // Parse recipients
      const rawRecipients = formData.recipients
        .split('\n')
        .map(email => email.trim())
        .filter(email => email.length > 0);

      console.log('Parsed rawRecipients:', rawRecipients);

      // Filter for valid email addresses
      const recipientsList = rawRecipients
        .filter(email => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
        .map(email => ({ email }));

      // Check if we have valid recipients after filtering
      if (!isEditing && recipientsList.length === 0 && rawRecipients.length > 0) {
        throw new Error('Please provide at least one valid email address. All entered email addresses appear to be invalid.');
      }

      // Validate email type before sending to API
      const validTypes = ['Welcome', 'New Post', 'Newsletter', 'Template', 'Other'];
      if (!validTypes.includes(formData.type)) {
        throw new Error(`Invalid email type: ${formData.type}. Valid types are: ${validTypes.join(', ')}`);
      }

      // Ensure HTML content is available (should be exported by EmailForm component)
      if (!formData.html || formData.html.trim().length === 0) {
        throw new Error('Email content is required. Please make sure to create content in the email editor.');
      }

      const emailData = {
        title: formData.title.trim(),
        type: formData.type,
        the_mail: {
          subject: formData.subject.trim(),
          html: formData.html
        },
        emails: isEditing ? undefined : recipientsList.length > 0 ? {
          count: recipientsList.length,
          list: recipientsList
        } : null,
        scheduled_time: formData.is_scheduled ? formData.scheduled_time : null
      };

      if (isEditing && editingEmail) {
        await apiPut(`/email-manager/${editingEmail.id}`, token, emailData);
        alert('Email updated successfully!');
      } else {
        await apiPost('/email-manager', token, emailData);
        alert('Email created successfully!');
      }

      setShowForm(false);
      setFormData({
        title: '',
        type: 'Newsletter',
        subject: '',
        html: '',
        recipients: '',
        scheduled_time: '',
        is_scheduled: false,
        template: 'none'
      });
      await loadEmails();
    } catch (err: any) {
      console.error('Form submit failed:', err);
      alert(err.message || "Failed to save email. Please try again.");
    } finally {
      setFormLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
        return 'Invalid date';
      }
      return format(date, 'MMM dd, yyyy HH:mm');
    } catch (error) {
      return 'Invalid date';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Draft': return 'bg-gray-100 text-gray-800';
      case 'Scheduled': return 'bg-blue-100 text-blue-800';
      case 'Sent': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'Welcome': return 'Welcome emails';
      case 'New Post': return 'New Post';
      case 'Newsletter': return 'Newsletter email';
      case 'Template': return 'Template';
      case 'Other': return 'Other';
      default: return type;
    }
  };

  if (!mounted) {
    return <div className="space-y-6">Loading...</div>;
  }

  if (!token) {
    return null;
  }

  const handleTemplateSelect = (templateId: string) => {
    if (templateId === 'none') {
      setFormData(prev => ({
        ...prev,
        template: 'none'
      }));
      return;
    }

    const selectedTemplate = emailTemplates.find(t => t.id === templateId);
    if (selectedTemplate) {
      setFormData(prev => ({
        ...prev,
        html: selectedTemplate.html,
        template: templateId
      }));
    }
  };


  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-black">Email Manager</h1>
          <p className="text-muted-foreground text-black">
            Create, manage, and send emails to your subscribers
          </p>
        </div>
        <div className="flex items-center space-x-4">
          <Button onClick={handleCreate} className="text-white">
            <Plus className="w-4 h-4 mr-2" />
            Create Email
          </Button>
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Emails</p>
                <p className="text-2xl font-bold text-black">{stats?.total || 0}</p>
              </div>
              <Mail className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Draft</p>
                <p className="text-2xl font-bold text-black">{stats?.status?.draft || 0}</p>
              </div>
              <FileText className="w-8 h-8 text-gray-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Scheduled</p>
                <p className="text-2xl font-bold text-black">{stats?.status?.scheduled || 0}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Sent</p>
                <p className="text-2xl font-bold text-black">{stats?.status?.sent || 0}</p>
              </div>
              <Send className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col md:flex-row gap-4 text-black">
            <div className="flex-1">
              <Label htmlFor="search" className="block text-sm font-medium text-black mb-1">
                Search Emails
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  id="search"
                  placeholder="Search by title or type..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 placeholder:text-gray-400"
                />
              </div>
            </div>
            <div className="flex-1">
              <Label htmlFor="status-filter" className="block text-sm font-medium text-black mb-1">
                Status
              </Label>
              <select
                id="status-filter"
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All statuses</option>
                <option value="Draft">Draft</option>
                <option value="Scheduled">Scheduled</option>
                <option value="Sent">Sent</option>
              </select>
            </div>
            <div className="flex-1">
              <Label htmlFor="type-filter" className="block text-sm font-medium text-black mb-1">
                Type
              </Label>
              <select
                id="type-filter"
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">All types</option>
                <option value="Welcome">Welcome</option>
                <option value="New Post">New Post</option>
                <option value="Newsletter">Newsletter</option>
                <option value="Template">Template</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex items-end space-x-2">
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setStatusFilter('');
                  setTypeFilter('');
                  loadStats();
                }}
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Refresh
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Email Form */}
      {showForm && (
        <Card className="text-black">
          <CardHeader>
            <CardTitle>{isEditing ? 'Edit Email' : 'Create New Email'}</CardTitle>
            <CardDescription>
              {isEditing ? 'Update the email details below' : 'Fill in the email details to create a new email'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <EmailForm
              isEditing={isEditing}
              formData={formData}
              errors={errors}
              touched={touched}
              formLoading={formLoading}
              previewHtml={previewHtml}
              
              onFieldChange={handleFieldChange}
              
              onPreviewToggle={() => setPreviewHtml(!previewHtml)}
              onFormSubmit={handleFormSubmit}
              onCancel={() => {
                setShowForm(false);
                setFormData({
                  title: '',
                  type: 'Newsletter',
                  subject: '',
                  html: '',
                  recipients: '',
                  scheduled_time: '',
                  is_scheduled: false,
                  template: 'none'
                });
              }}
              onLoadSubscribers={loadSubscriberEmails}
            />
          </CardContent>
        </Card>
      )}

      {/* Error Message */}
      {error && (
        <Card className="border-red-200 bg-red-50">
          <CardContent className="p-4">
            <p className="text-red-700 font-medium">{error}</p>
          </CardContent>
        </Card>
      )}

      {/* Loading State */}
      {loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-teal-600"></div>
            <p className="mt-2 text-black">Loading emails...</p>
          </CardContent>
        </Card>
      )}

      {/* Emails Table */}
      {!loading && (
        <Card className='text-black'>
          <CardHeader>
            <CardTitle className='text-black'>Emails</CardTitle>
            <CardDescription>
              Manage your email campaigns and templates
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Recipients</TableHead>
                    <TableHead>Scheduled</TableHead>
                    <TableHead>Sent</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {emails.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                        No emails found. {debouncedSearchTerm ? 'Try adjusting your search.' : 'Create your first email!'} 
                      </TableCell>
                    </TableRow>
                  ) : (
                    emails.map((email) => (
                      <TableRow key={email.id} className="hover:bg-gray-50">
                        <TableCell className="font-medium">
                          {email.title}
                        </TableCell>
                        <TableCell>
                          <Badge variant="secondary">{getTypeLabel(email.type)}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(email.status)}>{email.status}</Badge>
                        </TableCell>
                        <TableCell>
                          {email.emails ? (
                            <div className="flex items-center space-x-2">
                              <Users className="w-4 h-4 text-gray-500" />
                              <span>{email.emails.count}</span>
                            </div>
                          ) : (
                            <span className="text-gray-500 italic">No recipients</span>
                          )}
                        </TableCell>
                        <TableCell>
                          {email.scheduled_time ? formatDate(email.scheduled_time) : '-'}
                        </TableCell>
                        <TableCell>
                          {email.sent_time ? formatDate(email.sent_time) : '-'}
                        </TableCell>
                        <TableCell>
                          {formatDate(email.created_at)}
                        </TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            {email.status !== 'Sent' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(email)}
                              className="text-blue-600 hover:text-blue-900"
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            )}
                            {email.status === 'Draft' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleSend(email.id)}
                                className="text-green-600 hover:text-green-900"
                              >
                                <Send className="w-4 h-4" />
                              </Button>
                            )}
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => {
                                // Copy email details to clipboard
                                const emailDetails = `Title: ${email.title}\nType: ${email.type}\nStatus: ${email.status}\nSubject: ${email.the_mail.subject}\nRecipients: ${email.emails?.count || 0}`;
                                navigator.clipboard.writeText(emailDetails);
                                alert('Email details copied to clipboard.');
                              }}
                              className="text-gray-600 hover:text-gray-900"
                            >
                              <Copy className="w-4 h-4" />
                            </Button>
                            {email.status !== 'Sent' && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDelete(email.id, email.title)}
                                className="text-red-600 hover:text-red-900"
                              >
                                <Trash2 className="w-4 h-4" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Pagination */}
            {emails.length > 0 && (
              <div className="flex items-center justify-between mt-4">
                <div className="text-sm text-gray-700">
                  Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalEmails)} of {totalEmails} emails
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    variant="outline"
                  >
                    Previous
                  </Button>
                  <span className="text-sm text-gray-700">
                    Page {currentPage}
                  </span>
                  <Button
                    onClick={() => setCurrentPage(currentPage + 1)}
                    disabled={emails.length < pageSize}
                    variant="outline"
                  >
                    Next
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
