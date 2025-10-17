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

// Mock platform data
const mockPlatforms = [
  {
    id: '1',
    name: 'Codeforces',
    enabled: true,
    username: 'user123',
    notificationsEnabled: true,
    logo: '/platforms/codeforces.png'
  },
  {
    id: '2',
    name: 'LeetCode',
    enabled: true,
    username: 'leetcoder',
    notificationsEnabled: true,
    logo: '/platforms/leetcode.png'
  },
  {
    id: '3',
    name: 'HackerRank',
    enabled: false,
    username: '',
    notificationsEnabled: false,
    logo: '/platforms/hackerrank.png'
  },
  {
    id: '4',
    name: 'AtCoder',
    enabled: false,
    username: '',
    notificationsEnabled: false,
    logo: '/platforms/atcoder.png'
  }
];

type Platform = typeof mockPlatforms[0];

export default function PlatformsPage() {
  const [platforms, setPlatforms] = useState<Platform[]>(mockPlatforms);
  const [isLoading, setIsLoading] = useState(false);

  const handleTogglePlatform = (id: string, field: 'enabled' | 'notificationsEnabled') => {
    setPlatforms(platforms.map(platform => {
      if (platform.id === id) {
        return {
          ...platform,
          [field]: !platform[field],
          // If disabling platform, also disable notifications
          ...(field === 'enabled' && !platform.enabled ? {} : 
            field === 'enabled' && platform.enabled ? { notificationsEnabled: false } : {}
          )
        };
      }
      return platform;
    }));
  };

  const handleUsernameChange = (id: string, username: string) => {
    setPlatforms(platforms.map(platform => 
      platform.id === id ? { ...platform, username } : platform
    ));
  };

  const handleSave = async (platform: Platform) => {
    setIsLoading(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    setIsLoading(false);
    toast.success("Settings saved", {
      description: `${platform.name} settings have been updated.`,
    });
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
          </div>
          
          <Separator className="my-2 sm:my-4" />
          
          <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-2">
            {platforms.map(platform => (
              <Card key={platform.id} className="border shadow-sm hover:shadow transition-shadow">
                <CardHeader className="flex flex-row items-center space-x-4">
                  <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-md bg-muted flex items-center justify-center">
                    <Code className="h-5 w-5 sm:h-6 sm:w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-base sm:text-lg">{platform.name}</CardTitle>
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
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}