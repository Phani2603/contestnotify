'use client';

import { useState } from 'react';
import { format } from 'date-fns';
import { ProtectedRoute } from "@/components/protected-route";
import { DashboardLayout } from "@/components/dashboard/layout";
import { Calendar } from "@/components/ui/calendar";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectGroup, SelectItem, SelectLabel, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import {
  CalendarIcon,
  Clock,
  Plus,
  Bell,
  Edit2,
  Trash2,
  Filter,
  Code,
  Globe
} from "lucide-react";
import { useContestNotify, Contest } from "@/lib/contest-notify-context";

// Platforms for dropdown
const platforms = [
  { name: "Codeforces", value: "codeforces" },
  { name: "LeetCode", value: "leetcode" },
  { name: "AtCoder", value: "atcoder" },
  { name: "HackerRank", value: "hackerrank" },
  { name: "Google", value: "google" },
  { name: "TopCoder", value: "topcoder" },
  { name: "CodeChef", value: "codechef" }
];

// Categories for dropdown
const categories = [
  { name: "Algorithm", value: "algorithm" },
  { name: "Beginner", value: "beginner" },
  { name: "Intermediate", value: "intermediate" },
  { name: "Advanced", value: "advanced" },
  { name: "Mixed", value: "mixed" },
  { name: "Special Event", value: "special" }
];

// Reminder options
const reminderOptions = [
  { name: "10 minutes before", value: "10min" },
  { name: "30 minutes before", value: "30min" },
  { name: "1 hour before", value: "1hour" },
  { name: "2 hours before", value: "2hours" },
  { name: "1 day before", value: "1day" },
  { name: "2 days before", value: "2days" }
];

export default function SchedulerPage() {
  const { contests, addContest, updateContest, deleteContest } = useContestNotify();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [filteredPlatform, setFilteredPlatform] = useState<string>("all");
  const [open, setOpen] = useState(false);
  
  // Form state for new/edited contest
  const [editingContest, setEditingContest] = useState<Contest | null>(null);
  const [contestDate, setContestDate] = useState<Date | undefined>(new Date());
  
  // Filter contests by date and platform
  const filteredContests = contests.filter(contest => {
    const dateMatch = !selectedDate || 
      (contest.date.getDate() === selectedDate.getDate() &&
       contest.date.getMonth() === selectedDate.getMonth() &&
       contest.date.getFullYear() === selectedDate.getFullYear());
       
    const platformMatch = filteredPlatform === "all" || contest.platform.toLowerCase() === filteredPlatform.toLowerCase();
    
    return dateMatch && platformMatch;
  });
  
  // Find days with contests for the calendar
  const contestDays = contests.map(contest => contest.date);
  
  // Function to handle adding a new contest
  const handleAddContest = () => {
    setEditingContest({
      id: Math.random(), // Temporary ID for editing form
      name: "",
      platform: platforms[0].name,
      date: selectedDate || new Date(),
      startTime: "12:00",
      duration: "2 hours",
      category: categories[0].name,
      reminder: reminderOptions[2].name, // Default to 1 hour before
      notes: ""
    });
    setContestDate(selectedDate || new Date());
    setOpen(true);
  };
  
  // Function to handle editing a contest
  const handleEditContest = (contest: Contest) => {
    setEditingContest({...contest});
    setContestDate(contest.date);
    setOpen(true);
  };
  
  // Function to save a contest (add or edit)
  const handleSaveContest = () => {
    if (!editingContest) return;
    
    // Create updated contest object
    const updatedContest = {
      ...editingContest,
      date: contestDate || new Date()
    };
    
    // Check if this is a new contest or an edit
    const isExistingContest = typeof updatedContest.id !== 'undefined' && 
                              contests.some(c => c.id === updatedContest.id);
    
    if (isExistingContest) {
      // Update existing contest
      updateContest(updatedContest.id, updatedContest);
    } else {
      // Add new contest (without the temporary ID)
      const { id, ...contestWithoutId } = updatedContest;
      addContest(contestWithoutId);
    }
    
    setOpen(false);
  };
  
  // Function to delete a contest
  const handleDeleteContest = (id: number | string) => {
    deleteContest(id);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="flex flex-col gap-6">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-foreground">Contest Scheduler</h1>
            <p className="text-muted-foreground dark:text-muted-foreground">
              Manage and schedule your upcoming coding contests
            </p>
          </div>
          
          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Calendar Column */}
            <div className="lg:col-span-1">
              <Card>
                <CardHeader>
                  <CardTitle>Calendar</CardTitle>
                  <CardDescription>
                    Select a date to view or add contests
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Calendar
                    mode="single"
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className="rounded-md border w-full"
                    modifiers={{
                      hasContest: contestDays
                    }}
                    modifiersClassNames={{
                      hasContest: "bg-primary/20 font-medium text-primary dark:text-primary"
                    }}
                  />
                  
                  <div className="mt-6">
                    <Select value={filteredPlatform} onValueChange={setFilteredPlatform}>
                      <SelectTrigger className="w-full">
                        <div className="flex items-center gap-2">
                          <Globe className="h-4 w-4 text-muted-foreground" />
                          <SelectValue placeholder="Filter by platform" />
                        </div>
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Platforms</SelectItem>
                        <SelectGroup>
                          <SelectLabel>Platforms</SelectLabel>
                          {platforms.map(platform => (
                            <SelectItem key={platform.value} value={platform.value}>
                              {platform.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
                <CardFooter className="flex justify-between">
                  <Button 
                    variant="outline" 
                    onClick={() => setSelectedDate(new Date())}
                  >
                    Today
                  </Button>
                  <Button 
                    variant="default"
                    onClick={handleAddContest}
                    className="gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Add Contest
                  </Button>
                </CardFooter>
              </Card>
            </div>
            
            {/* Contests List Column */}
            <div className="lg:col-span-2">
              <Card className="h-full">
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>
                      {selectedDate 
                        ? `Contests for ${format(selectedDate, "MMMM d, yyyy")}`
                        : "All Upcoming Contests"}
                    </CardTitle>
                    <CardDescription>
                      {filteredContests.length} 
                      {filteredContests.length === 1 ? " contest" : " contests"} 
                      {filteredPlatform !== "all" ? ` on ${filteredPlatform}` : ""}
                    </CardDescription>
                  </div>
                  <Button variant="outline" size="sm" className="gap-1" onClick={() => setSelectedDate(undefined)}>
                    <Filter className="h-3.5 w-3.5" />
                    Show All
                  </Button>
                </CardHeader>
                <CardContent>
                  {filteredContests.length > 0 ? (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Contest</TableHead>
                          <TableHead>Date & Time</TableHead>
                          <TableHead>Category</TableHead>
                          <TableHead>Reminder</TableHead>
                          <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredContests.map(contest => (
                          <TableRow key={contest.id}>
                            <TableCell>
                              <div className="font-medium">{contest.name}</div>
                              <div className="text-sm text-muted-foreground flex items-center gap-1 mt-1">
                                <Code className="h-3.5 w-3.5" />
                                {contest.platform}
                              </div>
                            </TableCell>
                            <TableCell>
                              <div>{format(contest.date, "MMM d, yyyy")}</div>
                              <div className="text-sm flex items-center gap-1 mt-1">
                                <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-muted-foreground">{contest.startTime} • {contest.duration}</span>
                              </div>
                            </TableCell>
                            <TableCell>
                              <span className="rounded-md px-2 py-1 text-xs bg-secondary text-secondary-foreground">
                                {contest.category}
                              </span>
                            </TableCell>
                            <TableCell>
                              <div className="flex items-center gap-1">
                                <Bell className="h-3.5 w-3.5 text-muted-foreground" />
                                <span className="text-sm">{contest.reminder}</span>
                              </div>
                            </TableCell>
                            <TableCell className="text-right">
                              <div className="flex items-center justify-end gap-2">
                                <Button 
                                  variant="ghost" 
                                  size="icon" 
                                  onClick={() => handleEditContest(contest)}
                                >
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button 
                                  variant="ghost" 
                                  size="icon"
                                  onClick={() => handleDeleteContest(contest.id)}
                                >
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </div>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-[300px] text-center">
                      <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4" />
                      <h3 className="text-lg font-medium">No contests scheduled</h3>
                      <p className="text-muted-foreground mt-1 mb-4">
                        {selectedDate 
                          ? `No contests scheduled for ${format(selectedDate, "MMMM d, yyyy")}`
                          : "No contests matching your filters"
                        }
                      </p>
                      <Button 
                        variant="default" 
                        className="gap-2"
                        onClick={handleAddContest}
                      >
                        <Plus className="h-4 w-4" />
                        Add a Contest
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
          
          {/* Dialog for Adding/Editing Contests */}
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>
                  {editingContest && editingContest.id ? "Edit Contest" : "Add New Contest"}
                </DialogTitle>
                <DialogDescription>
                  Fill in the details for the coding contest. Click save when you&apos;re done.
                </DialogDescription>
              </DialogHeader>
              
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="name">Contest Name</label>
                  <Input 
                    id="name" 
                    value={editingContest?.name || ""} 
                    onChange={(e) => setEditingContest(prev => prev ? {...prev, name: e.target.value} : null)} 
                    placeholder="Contest Name" 
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="platform">Platform</label>
                    <Select 
                      value={editingContest?.platform.toLowerCase() || platforms[0].value}
                      onValueChange={(val) => setEditingContest(prev => 
                        prev ? {...prev, platform: platforms.find(p => p.value === val)?.name || val} : null
                      )}
                    >
                      <SelectTrigger id="platform">
                        <SelectValue placeholder="Select Platform" />
                      </SelectTrigger>
                      <SelectContent>
                        {platforms.map(platform => (
                          <SelectItem key={platform.value} value={platform.value}>
                            {platform.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="category">Category</label>
                    <Select 
                      value={(editingContest?.category?.toLowerCase()) || categories[0].value}
                      onValueChange={(val) => setEditingContest(prev => 
                        prev ? {...prev, category: categories.find(p => p.value === val)?.name || val} : null
                      )}
                    >
                      <SelectTrigger id="category">
                        <SelectValue placeholder="Select Category" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.value} value={category.value}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Contest Date</label>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button
                          variant="outline"
                          className="w-full justify-start text-left font-normal"
                        >
                          <CalendarIcon className="mr-2 h-4 w-4" />
                          {contestDate ? format(contestDate, "PPP") : "Pick a date"}
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0">
                        <Calendar
                          mode="single"
                          selected={contestDate}
                          onSelect={setContestDate}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="time">Start Time</label>
                    <Input 
                      id="time" 
                      type="time" 
                      value={editingContest?.startTime || "12:00"} 
                      onChange={(e) => setEditingContest(prev => prev ? {...prev, startTime: e.target.value} : null)} 
                    />
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="duration">Duration</label>
                    <Input 
                      id="duration" 
                      value={editingContest?.duration || ""} 
                      onChange={(e) => setEditingContest(prev => prev ? {...prev, duration: e.target.value} : null)} 
                      placeholder="2 hours" 
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium" htmlFor="reminder">Reminder</label>
                    <Select 
                      value={reminderOptions.find(r => r.name === editingContest?.reminder)?.value || reminderOptions[2].value}
                      onValueChange={(val) => setEditingContest(prev => 
                        prev ? {...prev, reminder: reminderOptions.find(r => r.value === val)?.name || val} : null
                      )}
                    >
                      <SelectTrigger id="reminder">
                        <SelectValue placeholder="Set Reminder" />
                      </SelectTrigger>
                      <SelectContent>
                        {reminderOptions.map(option => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium" htmlFor="notes">Notes</label>
                  <Input 
                    id="notes" 
                    value={editingContest?.notes || ""} 
                    onChange={(e) => setEditingContest(prev => prev ? {...prev, notes: e.target.value} : null)} 
                    placeholder="Add notes or preparation tips" 
                  />
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSaveContest}>
                  Save Contest
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}