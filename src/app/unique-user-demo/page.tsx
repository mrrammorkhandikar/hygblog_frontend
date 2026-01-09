'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';

export default function UniqueUserDemoPage() {
  const [userId, setUserId] = useState<string>('');
  const [userDetails, setUserDetails] = useState<any>(null);
  const [subscriptionStatus, setSubscriptionStatus] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  // Simulate what happens when user visits newsletter page
  const simulateNewsletterVisit = async () => {
    setIsLoading(true);
    
    try {
      // Step 1: Try to find user ID from various storage locations
      const userIdFromStorage = localStorage.getItem('userId') || 
                               localStorage.getItem('unique_user_id');
      
      if (userIdFromStorage) {
        setUserId(userIdFromStorage);
        
        // Step 2: Try to get user details from blogUser storage
        const storedUser = localStorage.getItem('blogUser');
        if (storedUser) {
          try {
            const parsedUser = JSON.parse(storedUser);
            setUserDetails(parsedUser);
          } catch (error) {
            console.error('Error parsing user data:', error);
          }
        }
        
        // Step 3: Check subscription status
        const API_BASE = process.env.NEXT_PUBLIC_ADMIN_API || 'http://localhost:8080';
        const response = await fetch(`${API_BASE}/newsletter/check?unique_user_id=${userIdFromStorage}`);
        
        if (response.ok) {
          const result = await response.json();
          
          if (result.isSubscribed) {
            setSubscriptionStatus('Already subscribed!');
          } else {
            setSubscriptionStatus('Not subscribed - ready to subscribe');
          }
        } else {
          setSubscriptionStatus('Error checking subscription status');
        }
      } else {
        setUserId('No unique_user_id found in localStorage');
        setSubscriptionStatus('Not registered - will need to generate new UUID');
      }
    } catch (error) {
      console.error('Error:', error);
      setSubscriptionStatus('Error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-run demo when page loads
  useEffect(() => {
    simulateNewsletterVisit();
  }, []);

  const generateSampleUUID = () => {
    const uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
    setUserId(uuid);
    return uuid;
  };

  const simulateUserRegistration = () => {
    const sampleUser = {
      uniqueUserId: generateSampleUUID(),
      username: 'John Doe',
      email: 'john.doe@example.com',
      isRegistered: true
    };
    
    localStorage.setItem('blogUser', JSON.stringify(sampleUser));
    localStorage.setItem('unique_user_id', sampleUser.uniqueUserId);
    localStorage.setItem('userId', sampleUser.uniqueUserId);
    
    setUserDetails(sampleUser);
    setUserId(sampleUser.uniqueUserId);
    setSubscriptionStatus('User registered - ready to check subscription');
  };

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-2xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          Unique User ID Demo - How Newsletter Page Works
        </h1>
        
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Current Storage State</h2>
          <div className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="font-medium text-gray-900">Storage Locations:</h3>
              <div className="mt-2 space-y-2 text-sm">
                <div>blogUser: {localStorage.getItem('blogUser') || 'Not found'}</div>
                <div>unique_user_id: {localStorage.getItem('unique_user_id') || 'Not found'}</div>
                <div>userId: {localStorage.getItem('userId') || 'Not found'}</div>
              </div>
            </div>
            
            <div className="bg-blue-50 p-4 rounded-lg">
              <h3 className="font-medium text-blue-900">Current Status:</h3>
              <div className="mt-2 text-sm">
                <div><strong>Unique User ID:</strong> {userId}</div>
                <div><strong>User Details:</strong> {JSON.stringify(userDetails)}</div>
                <div><strong>Subscription Status:</strong> {subscriptionStatus}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h2 className="text-2xl font-semibold mb-4">Demo Controls</h2>
          <div className="space-y-4">
            <Button 
              onClick={simulateNewsletterVisit}
              disabled={isLoading}
            >
              {isLoading ? 'Checking...' : 'Simulate Newsletter Page Load'}
            </Button>
            
            <Button 
              onClick={simulateUserRegistration}
              variant="outline"
            >
              Simulate User Registration
            </Button>
            
            <Button 
              onClick={() => window.location.href = '/newsletter'}
              className="bg-green-600 hover:bg-green-700"
            >
              Go to Newsletter Page
            </Button>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-lg p-6">
          <h2 className="text-2xl font-semibold mb-4">How It Works:</h2>
          <ol className="space-y-3 text-gray-700">
            <li><strong>1. Page Loads:</strong> Newsletter page runs useEffect to check localStorage</li>
            <li><strong>2. Find User ID:</strong> Looks for userId or unique_user_id in localStorage</li>
            <li><strong>3. Load User Data:</strong> Parses blogUser storage for name/email</li>
            <li><strong>4. Check Subscription:</strong> API call to /newsletter/check with unique_user_id</li>
            <li><strong>5. Display Result:</strong> Shows appropriate message based on subscription status</li>
            <li><strong>6. Auto-submit:</strong> unique_user_id included in form submission</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
