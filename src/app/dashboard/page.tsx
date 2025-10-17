'use client';

import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard/layout";
import { useSession } from "next-auth/react";
import { 
  Calendar, 
  Code, 
  Trophy, 
  Clock, 
  ArrowUpRight,
  Bell, 
  Globe,
  Filter,
  Check 
} from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useContestNotify, formatContestTimeUntil, formatContestDateAndTime } from "@/lib/contest-notify-context";
import { format } from "date-fns";

export default function DashboardPage() {
  const { data: session } = useSession();
  const { 
    getUpcomingContests, 
    platforms, 
    userPerformance 
  } = useContestNotify();
  
  // Get 4 upcoming contests
  const upcomingContests = getUpcomingContests(4).map(contest => ({
    ...contest,
    startsIn: formatContestTimeUntil(contest.date, contest.startTime),
    formattedDate: format(contest.date, 'MMMM d, yyyy'),
    time: contest.startTime + ' UTC'
  }));
  
  // Get connected platforms
  const connectedPlatforms = platforms
    .filter(platform => platform.enabled)
    .map(platform => ({
      name: platform.name,
      username: platform.username,
      lastSync: platform.id === '1' ? '5 hours ago' : 
                platform.id === '2' ? '12 hours ago' : 
                platform.id === '3' ? '1 day ago' : '3 days ago',
      isActive: platform.enabled
    }));
  
  // Recent performance is already in the context
  const recentContestPerformance = userPerformance;
  
  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-foreground">Dashboard</h1>
            <p className="text-muted-foreground dark:text-muted-foreground">
              Welcome back, {session?.user?.name || 'User'}
            </p>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="flex flex-col gap-6">
              {/* Upcoming Contests Card */}
              <Card className="w-full">
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-5 w-5 text-primary" />
                      <CardTitle className="text-lg">Upcoming Contests</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      <Filter className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm text-muted-foreground">Filter</span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Contest</TableHead>
                        <TableHead>Platform</TableHead>
                        <TableHead>Date & Time</TableHead>
                        <TableHead>Starts In</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {upcomingContests.map((contest) => (
                        <TableRow key={contest.id}>
                          <TableCell className="font-medium">
                            <a 
                              href={contest.link}
                              target="_blank"
                              rel="noopener noreferrer" 
                              className="flex items-center gap-1 hover:underline text-primary"
                            >
                              {contest.name}
                              <ArrowUpRight className="h-3 w-3" />
                            </a>
                          </TableCell>
                          <TableCell>{contest.platform}</TableCell>
                          <TableCell>
                            <div className="text-sm">{contest.formattedDate}</div>
                            <div className="text-xs text-muted-foreground">{contest.time} • {contest.duration}</div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-1 text-primary">
                              <Clock className="h-3.5 w-3.5" />
                              <span>{contest.startsIn}</span>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    Showing {upcomingContests.length} upcoming contests
                  </div>
                </CardFooter>
              </Card>

              {/* Connected Platforms Card */}
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <Globe className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Connected Platforms</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <Accordion type="single" collapsible className="w-full">
                    {connectedPlatforms.map((platform, index) => (
                      <AccordionItem key={index} value={`platform-${index}`}>
                        <AccordionTrigger className="py-3 px-1">
                          <div className="flex items-center gap-3">
                            <Code className="h-5 w-5 text-primary" />
                            <div>
                              <div className="font-medium text-left">{platform.name}</div>
                              <div className="text-sm text-muted-foreground text-left">@{platform.username}</div>
                            </div>
                          </div>
                        </AccordionTrigger>
                        <AccordionContent>
                          <div className="flex justify-between items-center pt-2 pb-2 px-1">
                            <div className="text-sm">
                              <div className="mb-1"><span className="text-muted-foreground">Last synced:</span> {platform.lastSync}</div>
                              <div className="mb-1"><span className="text-muted-foreground">Status:</span> {platform.isActive ? 'Active' : 'Inactive'}</div>
                              <div><span className="text-muted-foreground">Rating:</span> 1842</div>
                            </div>
                            <div className="flex flex-col gap-2">
                              <button className="bg-primary text-primary-foreground px-3 py-1 text-xs rounded">Sync now</button>
                              <button className="bg-muted text-muted-foreground px-3 py-1 text-xs rounded">Settings</button>
                            </div>
                          </div>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-between items-center">
                  <div className="text-sm text-muted-foreground">
                    {connectedPlatforms.length} platforms connected
                  </div>
                  <button className="flex items-center gap-1.5 text-sm font-medium text-primary">
                    <Check className="h-3.5 w-3.5" />
                    Sync all platforms
                  </button>
                </CardFooter>
              </Card>
            </div>

            {/* Right Column */}
            <div className="flex flex-col gap-6">
              {/* Contest Performance Card */}
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Trophy className="h-5 w-5 text-primary" />
                      <div>
                        <CardTitle className="text-lg">Contest Performance</CardTitle>
                        <CardDescription>Track your participation and results</CardDescription>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid gap-6">
                    <div className="grid grid-cols-3 gap-4">
                      <div className="rounded-xl border p-4 text-center bg-accent/5">
                        <div className="text-3xl font-bold">24</div>
                        <div className="mt-1 text-sm text-muted-foreground">Contests Participated</div>
                      </div>
                      <div className="rounded-xl border p-4 text-center bg-accent/5">
                        <div className="text-3xl font-bold">12</div>
                        <div className="mt-1 text-sm text-muted-foreground">Top 10% Placements</div>
                      </div>
                      <div className="rounded-xl border p-4 text-center bg-accent/5">
                        <div className="text-3xl font-bold">1850</div>
                        <div className="mt-1 text-sm text-muted-foreground">Peak Rating</div>
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-medium text-lg mb-3">Recent Results</h4>
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead>Contest</TableHead>
                            <TableHead>Platform</TableHead>
                            <TableHead>Ranking</TableHead>
                            <TableHead>Score</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {recentContestPerformance.map(contest => (
                            <TableRow key={contest.id}>
                              <TableCell className="font-medium">{contest.name}</TableCell>
                              <TableCell>{contest.platform}</TableCell>
                              <TableCell>
                                <div className="text-sm">{contest.ranking}</div>
                                <div className="text-xs text-muted-foreground">Problems: {contest.problemsSolved}</div>
                              </TableCell>
                              <TableCell className="font-medium text-primary">{contest.score}</TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                </CardContent>
                <CardFooter className="border-t pt-4">
                  <button className="text-sm text-primary hover:underline w-full text-center">
                    View all performance history
                  </button>
                </CardFooter>
              </Card>
              
              {/* Notifications Card */}
              <Card>
                <CardHeader className="border-b">
                  <div className="flex items-center gap-2">
                    <Bell className="h-5 w-5 text-primary" />
                    <CardTitle className="text-lg">Notification Settings</CardTitle>
                  </div>
                </CardHeader>
                <CardContent className="p-4">
                  <Accordion type="multiple" className="w-full">
                    <AccordionItem value="email-notifications">
                      <AccordionTrigger>Email Notifications</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 py-2">
                          <p className="text-sm text-muted-foreground">
                            Receive email notifications for upcoming contests, reminders, and results.
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">24 hours before contest</span>
                            <div className="h-5 w-9 bg-primary rounded-full relative cursor-pointer">
                              <div className="h-4 w-4 bg-background rounded-full absolute right-0.5 top-0.5"></div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="browser-notifications">
                      <AccordionTrigger>Browser Notifications</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 py-2">
                          <p className="text-sm text-muted-foreground">
                            Get browser notifications for real-time contest updates and reminders.
                          </p>
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium">1 hour before contest</span>
                            <div className="h-5 w-9 bg-primary rounded-full relative cursor-pointer">
                              <div className="h-4 w-4 bg-background rounded-full absolute right-0.5 top-0.5"></div>
                            </div>
                          </div>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                    
                    <AccordionItem value="calendar-integration">
                      <AccordionTrigger>Calendar Integration</AccordionTrigger>
                      <AccordionContent>
                        <div className="space-y-3 py-2">
                          <p className="text-sm text-muted-foreground">
                            Add contests to your calendar automatically with timely reminders.
                          </p>
                          <button className="bg-primary text-primary-foreground px-4 py-2 rounded text-sm">
                            Connect Calendar
                          </button>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                </CardContent>
                <CardFooter className="border-t pt-4 flex justify-end">
                  <button className="text-sm text-muted-foreground hover:text-foreground">
                    Reset to defaults
                  </button>
                </CardFooter>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}