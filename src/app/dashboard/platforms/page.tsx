'use client';

import { useState } from 'react';
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { toast } from "sonner";
import { Code } from "lucide-react";
import { useContestNotify } from '@/lib/contest-notify-context';

export default function PlatformsPage() {
  const { platforms, togglePlatform, updatePlatform } = useContestNotify();
  const [isLoading, setIsLoading] = useState(false);
  const [modifiedPlatforms, setModifiedPlatforms] = useState<Set<string>>(new Set());

  const handleTogglePlatform = (id: string, field: 'enabled' | 'notificationsEnabled') => {
    togglePlatform(id, field);
    setModifiedPlatforms(prev => new Set(prev).add(id));
  };

  const handleUsernameChange = (id: string, username: string) => {
    updatePlatform(id, { username });
    setModifiedPlatforms(prev => new Set(prev).add(id));
  };

  const handleSave = async (platform: { id: string, name: string }) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    toast.success("Settings saved", {
      description: `${platform.name} settings have been updated.`,
    });
    
    // Remove from modified set
    setModifiedPlatforms(prev => {
      const updated = new Set(prev);
      updated.delete(platform.id);
      return updated;
    });
  };
  
  const handleSaveAll = async () => {
    setIsLoading(true);
    
    // Simulate API call for all modified platforms
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setIsLoading(false);
    toast.success("All settings saved", {
      description: `Settings for ${modifiedPlatforms.size} platforms have been updated.`,
    });
    
    // Clear modified set
    setModifiedPlatforms(new Set());
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Platforms</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              Connect to coding platforms and manage notification preferences
            </p>
            <div className="mt-2 p-4 bg-primary/10 rounded-md border border-primary/20">
              <h2 className="font-medium mb-1">Getting Started</h2>
              <p className="text-sm">
                Welcome to ContestNotify! Start by enabling the platforms you use for coding contests.
                Your dashboard will show contests only from your selected platforms.
              </p>
            </div>
          </div>
          
          <Separator className="my-2 sm:my-4" />
          
          <div className="flex justify-between items-center mb-4">
            {modifiedPlatforms.size > 1 && (
              <Button 
                onClick={handleSaveAll} 
                disabled={isLoading}
                className="text-sm sm:text-base ml-auto"
              >
                {isLoading ? "Saving..." : "Save All Changes"}
              </Button>
            )}
          </div>
          
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {platforms.map(platform => (
              <Card 
                key={platform.id} 
                className={`border shadow-sm hover:shadow transition-shadow ${platform.name === 'CodeChef' ? 'border-primary border-2' : ''}`}
              >
                <CardHeader className="flex flex-row items-center space-x-4">
                  <div className={`w-10 h-10 sm:w-12 sm:h-12 rounded-md ${platform.name === 'CodeChef' ? 'bg-primary/20' : 'bg-muted'} flex items-center justify-center`}>
                    <Code className={`h-5 w-5 sm:h-6 sm:w-6 ${platform.name === 'CodeChef' ? 'text-primary' : ''}`} />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">
                      {platform.name}
                    </CardTitle>
                    <CardDescription>
                      {platform.enabled ? 'Connected' : 'Not connected'}
                    </CardDescription>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center space-x-2">
                    <Switch 
                      checked={platform.enabled} 
                      onCheckedChange={() => handleTogglePlatform(platform.id, 'enabled')} 
                      id={`${platform.id}-enabled`}
                    />
                    <Label htmlFor={`${platform.id}-enabled`} className="text-sm sm:text-base">Enable {platform.name}</Label>
                  </div>
                  
                  {platform.enabled && (
                    <>
                      <div className="space-y-2">
                        <Label htmlFor={`${platform.id}-username`} className="text-sm sm:text-base">Username</Label>
                        <Input 
                          id={`${platform.id}-username`}
                          value={platform.username}
                          onChange={(e) => handleUsernameChange(platform.id, e.target.value)}
                          placeholder={`Your ${platform.name} username`}
                          className="h-9 sm:h-10"
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch 
                          checked={platform.notificationsEnabled} 
                          onCheckedChange={() => handleTogglePlatform(platform.id, 'notificationsEnabled')} 
                          id={`${platform.id}-notifications`}
                          disabled={!platform.enabled}
                        />
                        <Label htmlFor={`${platform.id}-notifications`} className="text-sm sm:text-base">
                          Contest Notifications
                        </Label>
                      </div>
                    </>
                  )}
                </CardContent>
                <CardFooter className="flex justify-end pt-2 pb-4">
                  <Button 
                    onClick={() => handleSave(platform)}
                    disabled={isLoading || !platform.enabled}
                    className="text-sm sm:text-base h-9 sm:h-10"
                  >
                    {isLoading ? "Saving..." : "Save Settings"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
          
          {/* Reset platforms option */}
          <div className="mt-8 border-t pt-6 flex justify-end">
            <Button 
              variant="outline" 
              onClick={() => {
                if(typeof window !== 'undefined') {
                  if(confirm("This will reset all platform settings to their defaults. Are you sure?")) {
                    localStorage.removeItem('contestnotify-platforms');
                    window.location.reload();
                  }
                }
              }}
              className="text-sm"
            >
              Reset All Platforms
            </Button>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}