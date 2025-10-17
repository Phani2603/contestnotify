'use client';

import { useState } from 'react';
import { ProtectedRoute } from '@/components/protected-route';
import { DashboardLayout } from '@/components/dashboard/layout';
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { 
  Table, 
  TableBody,
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Calendar, Search, Bell, BellOff } from "lucide-react";

// Mock contest data
const mockContests = [
  {
    id: '1',
    name: 'Codeforces Round #870',
    platform: 'Codeforces',
    startTime: '2023-10-15T14:00:00Z',
    duration: '2 hours',
    notificationsEnabled: true
  },
  {
    id: '2',
    name: 'LeetCode Weekly Contest 368',
    platform: 'LeetCode',
    startTime: '2023-10-16T02:30:00Z',
    duration: '1.5 hours',
    notificationsEnabled: true
  },
  {
    id: '3',
    name: 'HackerRank Week of Code 42',
    platform: 'HackerRank',
    startTime: '2023-10-20T12:00:00Z',
    duration: '7 days',
    notificationsEnabled: false
  },
  {
    id: '4',
    name: 'AtCoder Beginner Contest 328',
    platform: 'AtCoder',
    startTime: '2023-10-18T12:00:00Z',
    duration: '100 minutes',
    notificationsEnabled: false
  },
  {
    id: '5',
    name: 'Google Kick Start Round H 2023',
    platform: 'Google',
    startTime: '2023-10-30T09:00:00Z',
    duration: '3 hours',
    notificationsEnabled: true
  }
];

type Contest = typeof mockContests[0];

export default function ContestsPage() {
  const [contests, setContests] = useState<Contest[]>(mockContests);
  const [searchQuery, setSearchQuery] = useState('');

  const formatDate = (dateString: string) => {
    const options: Intl.DateTimeFormatOptions = {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  const getTimeUntilContest = (startTimeString: string) => {
    const now = new Date();
    const startTime = new Date(startTimeString);
    const diffMs = startTime.getTime() - now.getTime();
    
    if (diffMs < 0) return 'Started';
    
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    const diffHours = Math.floor((diffMs % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    
    if (diffDays > 0) {
      return `${diffDays}d ${diffHours}h`;
    } else {
      const diffMinutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
      return `${diffHours}h ${diffMinutes}m`;
    }
  };

  const toggleNotification = (contestId: string) => {
    setContests(contests.map(contest => 
      contest.id === contestId 
        ? { ...contest, notificationsEnabled: !contest.notificationsEnabled } 
        : contest
    ));
  };

  const filteredContests = contests.filter(contest => {
    if (!searchQuery) return true;
    
    const query = searchQuery.toLowerCase();
    return (
      contest.name.toLowerCase().includes(query) || 
      contest.platform.toLowerCase().includes(query)
    );
  });

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-4 sm:space-y-6">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Contests</h1>
            <p className="text-sm sm:text-base text-muted-foreground">
              View upcoming coding contests and set notifications
            </p>
          </div>
          
          <Separator className="my-2 sm:my-4" />
          
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 sm:gap-2">
            <div className="relative w-full sm:max-w-sm">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search contests..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-8 h-9 sm:h-10 text-sm sm:text-base"
              />
            </div>
            <Button className="w-full sm:w-auto h-9 sm:h-10 text-sm sm:text-base">
              <Calendar className="mr-2 h-4 w-4" />
              Add to Calendar
            </Button>
          </div>
          
          <Card className="border shadow-sm hover:shadow transition-shadow">
            <CardHeader className="pb-3 sm:pb-4">
              <CardTitle className="text-base sm:text-lg">Upcoming Contests</CardTitle>
              <CardDescription className="text-xs sm:text-sm">
                All upcoming contests from your connected platforms
              </CardDescription>
            </CardHeader>
            <CardContent className="px-2 sm:px-6">
              <Table className="text-xs sm:text-sm">
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[30%] md:w-[25%]">Contest</TableHead>
                    <TableHead className="hidden xs:table-cell w-[15%]">Platform</TableHead>
                    <TableHead className="hidden sm:table-cell w-[20%]">Start Time</TableHead>
                    <TableHead className="w-[15%] sm:w-[10%]">Starts In</TableHead>
                    <TableHead className="hidden md:table-cell w-[15%]">Duration</TableHead>
                    <TableHead className="w-[10%]">Notify</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredContests.length > 0 ? (
                    filteredContests.map(contest => (
                      <TableRow key={contest.id}>
                        <TableCell className="font-medium py-3">
                          {contest.name}
                          <div className="xs:hidden text-xs text-muted-foreground">{contest.platform}</div>
                        </TableCell>
                        <TableCell className="hidden xs:table-cell">
                          <Badge variant="outline" className="text-xs">{contest.platform}</Badge>
                        </TableCell>
                        <TableCell className="hidden sm:table-cell">{formatDate(contest.startTime)}</TableCell>
                        <TableCell className="text-xs sm:text-sm">{getTimeUntilContest(contest.startTime)}</TableCell>
                        <TableCell className="hidden md:table-cell">{contest.duration}</TableCell>
                        <TableCell>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => toggleNotification(contest.id)}
                          >
                            {contest.notificationsEnabled ? (
                              <Bell className="h-4 w-4 text-green-500" />
                            ) : (
                              <BellOff className="h-4 w-4 text-muted-foreground" />
                            )}
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">
                        <div className="flex flex-col items-center justify-center gap-2">
                          <Search className="h-5 w-5 text-muted-foreground" />
                          <span>No contests found matching your search criteria.</span>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}