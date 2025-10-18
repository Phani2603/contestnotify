'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { AlertCircle, Check, XCircle } from 'lucide-react';
import { useContestNotify } from '@/lib/contest-notify-context';

const ApiDebugger = () => {
  const [isTestingApi, setIsTestingApi] = useState(false);
  const [apiStatus, setApiStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [apiResponse, setApiResponse] = useState<{
    message: string;
    timestamp?: string;
    error?: unknown;
    diagnostics?: Record<string, unknown>;
  } | null>(null);
  const { fetchContestsForSelectedPlatforms, platforms } = useContestNotify();
  
  const [isTestingServerApi, setIsTestingServerApi] = useState(false);
  const [serverApiStatus, setServerApiStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [serverApiResponse, setServerApiResponse] = useState<{
    success: boolean;
    message?: string;
    environmentCheck?: Record<string, string>;
    apiResponse?: {
      meta?: {
        limit: number;
        offset: number;
        total_count: number;
      };
      objectCount?: number;
      sample?: {
        name: string;
        platform: string;
        start: string;
        end: string;
      } | null;
    };
    error?: unknown;
  } | null>(null);

  const envVars = {
    username: process.env.NEXT_PUBLIC_CLIST_API_USERNAME || 'Not set',
    key: process.env.NEXT_PUBLIC_CLIST_API_KEY ? 
      `${process.env.NEXT_PUBLIC_CLIST_API_KEY.substring(0, 8)}...` : 'Not set',
  };

  const testApiConnection = async () => {
    setIsTestingApi(true);
    setApiStatus('idle');
    
    try {
      // Check if we have any platforms enabled before making the API call
      const enabledPlatforms = platforms.filter(p => p.enabled);
      
      // Gather environment info for diagnostics
      const diagnosticInfo = {
        timestamp: new Date().toISOString(),
        envVars: {
          username: process.env.NEXT_PUBLIC_CLIST_API_USERNAME ? '✓' : '✗',
          key: process.env.NEXT_PUBLIC_CLIST_API_KEY ? '✓' : '✗',
        },
        window: typeof window !== 'undefined' ? '✓' : '✗',
        navigator: typeof navigator !== 'undefined' ? 
          { userAgent: navigator.userAgent, language: navigator.language } : '✗',
        context: {
          enabledPlatformsCount: enabledPlatforms.length,
          platformNames: enabledPlatforms.map(p => p.name)
        }
      };
      
      // Attempt to fetch contests using the context function
      console.log('Starting client-side API test with diagnostic info:', diagnosticInfo);
      await fetchContestsForSelectedPlatforms();      // If we get here without error, the API is working
      setApiStatus('success');
      setApiResponse({
        message: 'Client-side API connection successful',
        timestamp: new Date().toISOString(),
        diagnostics: diagnosticInfo
      });
    } catch (error) {
      // Handle API error
      console.error('Client API test failed:', error);
      
      // Extract more diagnostic information
      const diagnosticInfo = {
        timestamp: new Date().toISOString(),
        envVars: {
          username: process.env.NEXT_PUBLIC_CLIST_API_USERNAME ? '✓' : '✗',
          key: process.env.NEXT_PUBLIC_CLIST_API_KEY ? '✓' : '✗',
        },
        error: {
          name: error instanceof Error ? error.name : typeof error,
          message: error instanceof Error ? error.message : String(error),
          stack: error instanceof Error ? error.stack : undefined
        }
      };
      
      setApiStatus('error');
      setApiResponse({
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error,
        diagnostics: diagnosticInfo
      });
    } finally {
      setIsTestingApi(false);
    }
  };
  
  const testServerApiConnection = async () => {
    setIsTestingServerApi(true);
    setServerApiStatus('idle');
    
    try {
      console.log('Testing server-side API endpoint...');
      
      // Attempt to fetch contests through our server-side API endpoint
      const response = await fetch('/api/debug/clist');
      
      // Try to get response details even if not ok
      let responseData;
      try {
        responseData = await response.json();
      } catch (parseError) {
        console.error('Failed to parse API response:', parseError);
        responseData = { 
          parseError: true, 
          text: await response.text() 
        };
      }
      
      if (!response.ok) {
        console.error(`HTTP error! Status: ${response.status}`, responseData);
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      
      console.log('Server API response:', responseData);
      
      // Set the response status based on the API result
      if (responseData.success) {
        setServerApiStatus('success');
      } else {
        setServerApiStatus('error');
      }
      
      // Store the full response for debugging
      setServerApiResponse(responseData);
      
    } catch (error) {
      // Handle API error
      console.error('Server API test failed:', error);
      setServerApiStatus('error');
      setServerApiResponse({
        success: false,
        message: error instanceof Error ? error.message : 'Unknown error',
        error: error instanceof Error ? {
          name: error.name,
          message: error.message,
          stack: error.stack
        } : error
      });
    } finally {
      setIsTestingServerApi(false);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Client-Side API Configuration</CardTitle>
          <CardDescription>
            Check client-side environment variables and API connectivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium">CLIST API Username</h3>
                <p className="mt-1 text-sm">
                  {envVars.username === 'Not set' 
                    ? <span className="text-red-500 flex items-center gap-1"><XCircle size={16} /> Not configured</span>
                    : <span className="text-green-500 flex items-center gap-1"><Check size={16} /> Configured</span>
                  }
                </p>
              </div>
              <div>
                <h3 className="text-sm font-medium">CLIST API Key</h3>
                <p className="mt-1 text-sm">
                  {envVars.key === 'Not set' 
                    ? <span className="text-red-500 flex items-center gap-1"><XCircle size={16} /> Not configured</span>
                    : <span className="text-green-500 flex items-center gap-1"><Check size={16} /> {envVars.key}</span>
                  }
                </p>
              </div>
            </div>
            
            <div className="pt-2">
              <Button 
                onClick={testApiConnection}
                disabled={isTestingApi}
                variant={
                  apiStatus === 'success' ? 'default' : 
                  apiStatus === 'error' ? 'destructive' : 'outline'
                }
              >
                {isTestingApi ? 'Testing Client API...' : 'Test Client-Side API'}
              </Button>
              
              {apiStatus !== 'idle' && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium flex items-center gap-1">
                    {apiStatus === 'success' ? (
                      <>
                        <Check className="text-green-500" size={16} /> 
                        <span className="text-green-500">Client API Connection Successful</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="text-red-500" size={16} /> 
                        <span className="text-red-500">Client API Connection Failed</span>
                      </>
                    )}
                  </h3>
                  <pre className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs overflow-x-auto">
                    {JSON.stringify(apiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Server-Side API Configuration</CardTitle>
          <CardDescription>
            Check server-side environment variables and API connectivity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="pt-2">
              <Button 
                onClick={testServerApiConnection}
                disabled={isTestingServerApi}
                variant={
                  serverApiStatus === 'success' ? 'default' : 
                  serverApiStatus === 'error' ? 'destructive' : 'outline'
                }
              >
                {isTestingServerApi ? 'Testing Server API...' : 'Test Server-Side API'}
              </Button>
              
              {serverApiStatus !== 'idle' && (
                <div className="mt-4">
                  <h3 className="text-sm font-medium flex items-center gap-1">
                    {serverApiStatus === 'success' ? (
                      <>
                        <Check className="text-green-500" size={16} /> 
                        <span className="text-green-500">Server API Connection Successful</span>
                      </>
                    ) : (
                      <>
                        <AlertCircle className="text-red-500" size={16} /> 
                        <span className="text-red-500">Server API Connection Failed</span>
                      </>
                    )}
                  </h3>
                  
                  {serverApiResponse?.environmentCheck && (
                    <div className="mt-2 mb-2">
                      <h4 className="text-sm font-medium">Server Environment Variables:</h4>
                      <div className="grid grid-cols-2 gap-2 mt-1">
                        <div>
                          <p className="text-sm flex items-center gap-1">
                            CLIST_API_USERNAME: {' '}
                            {serverApiResponse.environmentCheck.username === '✓' 
                              ? <Check className="text-green-500" size={14} />
                              : <XCircle className="text-red-500" size={14} />
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm flex items-center gap-1">
                            CLIST_API_KEY: {' '}
                            {serverApiResponse.environmentCheck.apiKey === '✓' 
                              ? <Check className="text-green-500" size={14} />
                              : <XCircle className="text-red-500" size={14} />
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm flex items-center gap-1">
                            NEXT_PUBLIC_CLIST_API_USERNAME: {' '}
                            {serverApiResponse.environmentCheck.nextPublicUsername === '✓' 
                              ? <Check className="text-green-500" size={14} />
                              : <XCircle className="text-red-500" size={14} />
                            }
                          </p>
                        </div>
                        <div>
                          <p className="text-sm flex items-center gap-1">
                            NEXT_PUBLIC_CLIST_API_KEY: {' '}
                            {serverApiResponse.environmentCheck.nextPublicApiKey === '✓' 
                              ? <Check className="text-green-500" size={14} />
                              : <XCircle className="text-red-500" size={14} />
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <pre className="mt-2 p-2 bg-slate-100 dark:bg-slate-800 rounded text-xs overflow-x-auto">
                    {JSON.stringify(serverApiResponse, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ApiDebugger;