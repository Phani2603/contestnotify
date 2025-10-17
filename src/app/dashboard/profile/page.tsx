'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { DashboardLayout } from '@/components/dashboard/layout';
import { ProtectedRoute } from '@/components/protected-route';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, User, Mail, Calendar, Phone, AtSign, FileText } from 'lucide-react';

// Define UserProfile interface
interface UserProfile {
  _id?: string;
  id?: string;
  name: string;
  email: string;
  image?: string;
  username?: string;
  phoneNumber?: string;
  bio?: string;
  role?: string;
  createdAt?: string;
  updatedAt?: string;
}

export default function ProfilePage() {
  const { data: session, update: updateSession } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: session?.user?.name || '',
    email: session?.user?.email || '',
    username: '',
    phoneNumber: '',
    bio: '',
    image: session?.user?.image || ''
  });

  // Load full user profile on component mount
  useEffect(() => {
    const fetchUserProfile = async () => {
      try {
        const response = await fetch('/api/user/profile');
        if (!response.ok) {
          throw new Error('Failed to fetch profile');
        }
        const userData = await response.json() as UserProfile;
        setUserProfile(userData);
        
        // Update form data with the fetched user data
        setFormData({
          name: userData.name || '',
          email: userData.email || '',
          username: userData.username || '',
          phoneNumber: userData.phoneNumber || '',
          bio: userData.bio || '',
          image: userData.image || session?.user?.image || ''
        });
      } catch (error) {
        console.error('Error fetching user profile:', error);
        toast.error('Failed to load profile data');
      }
    };
    
    if (session?.user?.id) {
      fetchUserProfile();
    }
  }, [session]);

  // Format dates for better readability
  const formatDate = (dateStr: string | undefined) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
    } catch {
      return 'Invalid date';
    }
  };
  
  // Calculate time left until session expiration
  const getExpirationInfo = () => {
    if (!session?.expires) return { expired: true, timeLeft: 'Session expired or invalid' };
    
    const expiresAt = new Date(session.expires);
    const now = new Date();
    
    if (expiresAt <= now) {
      return { expired: true, timeLeft: 'Session expired' };
    }
    
    const timeLeftMs = expiresAt.getTime() - now.getTime();
    const minutesLeft = Math.floor(timeLeftMs / (1000 * 60));
    const hoursLeft = Math.floor(minutesLeft / 60);
    const minutesRemaining = minutesLeft % 60;
    
    return {
      expired: false,
      timeLeft: `${hoursLeft}h ${minutesRemaining}m remaining`,
      expirationDate: formatDate(session.expires)
    };
  };
  
  // Get session expiration info
  const expiration = getExpirationInfo();
  
  // Debug the image URL whenever it changes
  useEffect(() => {
    console.log('Form data image URL:', formData.image);
  }, [formData.image]);

  // Handle form field changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };
  
  // Handle image file selection
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Check file type and size
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
        return;
      }
      
      const maxSize = 5 * 1024 * 1024; // 5MB
      if (file.size > maxSize) {
        toast.error('Image is too large. Maximum size is 5MB.');
        return;
      }
      
      setSelectedImage(file);
      
      // Create a preview of the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Handle image upload
  const uploadImage = async (): Promise<string | null> => {
    if (!selectedImage) return null;
    
    try {
      const formData = new FormData();
      formData.append('file', selectedImage);
      
      const response = await fetch('/api/user/upload', {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
      
      const data = await response.json();
      console.log('Image upload response:', data); // Debug the entire response
      
      // Return the URL - handle both property names for safety
      return data.url || data.imageUrl || null;
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error('Failed to upload profile image');
      return null;
    }
  };

  // Save profile changes
  const handleSave = async () => {
    try {
      setIsLoading(true);
      
      // Upload image if a new one was selected
      let imageUrl = formData.image;
      if (selectedImage) {
        const uploadedUrl = await uploadImage();
        console.log('Uploaded URL from API:', uploadedUrl);
        if (uploadedUrl) {
          imageUrl = uploadedUrl;
        }
      }
      
      // Log the image URL being sent to the API
      console.log('Image URL being saved:', imageUrl);
      
      // Update the user profile via API
      const response = await fetch('/api/user/profile', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          image: imageUrl,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update profile');
      }
      
      const result = await response.json() as { message: string; user: UserProfile };
      
      // Update session with new user data
      await updateSession({
        ...session,
        user: {
          ...session?.user,
          name: formData.name,
          image: imageUrl,
        }
      });
      
      // Update local state
      setUserProfile(result.user);
      setSelectedImage(null);
      setImagePreview(null);
      setFormData(prev => ({
        ...prev,
        image: imageUrl // Make sure we use the new image URL
      }));
      setIsEditing(false);
      toast.success('Profile updated successfully');
    } catch (error) {
      console.error('Error updating profile:', error);
      toast.error('Failed to update profile');
    } finally {
      setIsLoading(false);
    }
  };

  // Cancel editing
  const handleCancel = () => {
    setFormData({
      name: userProfile?.name || session?.user?.name || '',
      email: userProfile?.email || session?.user?.email || '',
      username: userProfile?.username || '',
      phoneNumber: userProfile?.phoneNumber || '',
      bio: userProfile?.bio || '',
      image: userProfile?.image || session?.user?.image || ''
    });
    setSelectedImage(null);
    setImagePreview(null);
    setIsEditing(false);
  };

  return (
    <ProtectedRoute>
      <DashboardLayout>
        <div className="space-y-6">
          <div>
            <h1 className="text-3xl font-bold">Profile</h1>
            <p className="text-muted-foreground">
              View and manage your account information
            </p>
          </div>

          <Separator />

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>User Information</CardTitle>
                <CardDescription>
                  Your personal information and settings
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col items-center space-y-4">
                  {/* Profile Photo with upload */}
                  <div className="relative group">
                    {/* Image URL: {imagePreview || formData.image || ''} */}
                    <Avatar className="h-24 w-24 border-2 border-border">
                      <AvatarImage 
                        src={imagePreview || formData.image || ''} 
                        alt={formData.name || 'User'} 
                      />
                      <AvatarFallback className="text-lg">
                        {formData.name ? formData.name[0].toUpperCase() : 'U'}
                      </AvatarFallback>
                    </Avatar>
                    {isEditing && (
                      <label 
                        htmlFor="profile-image" 
                        className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition cursor-pointer"
                      >
                        <span className="text-white text-xs font-medium">Change</span>
                        <input 
                          type="file" 
                          id="profile-image" 
                          className="hidden" 
                          accept="image/jpeg,image/png,image/gif,image/webp"
                          onChange={handleImageChange}
                        />
                      </label>
                    )}
                  </div>

                  {isEditing ? (
                    <div className="space-y-4 w-full">
                      <div className="space-y-2">
                        <Label htmlFor="name">Full Name</Label>
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          placeholder="Your full name"
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="username">Username</Label>
                        <div className="relative">
                          <span className="absolute left-3 top-2.5 text-muted-foreground">@</span>
                          <Input
                            id="username"
                            name="username"
                            value={formData.username}
                            onChange={handleChange}
                            placeholder="username"
                            className="pl-7"
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="email">Email Address</Label>
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleChange}
                          placeholder="your.email@example.com"
                          disabled
                        />
                        <p className="text-xs text-muted-foreground">Email cannot be changed</p>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="phoneNumber">Phone Number</Label>
                        <Input
                          id="phoneNumber"
                          name="phoneNumber"
                          type="tel"
                          value={formData.phoneNumber}
                          onChange={handleChange}
                          placeholder="+1 (555) 123-4567"
                        />
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="bio">Bio</Label>
                        <Textarea
                          id="bio"
                          name="bio"
                          value={formData.bio}
                          onChange={handleChange}
                          placeholder="Tell us a little about yourself"
                          rows={3}
                          className="resize-none"
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="w-full space-y-4 pt-2">
                      <div className="flex items-start gap-3">
                        <User className="h-5 w-5 opacity-70 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Full Name</p>
                          <p className="font-medium">{formData.name || 'Not set'}</p>
                        </div>
                      </div>
                      
                      {formData.username && (
                        <div className="flex items-start gap-3">
                          <AtSign className="h-5 w-5 opacity-70 mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Username</p>
                            <p className="font-medium">@{formData.username}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <Mail className="h-5 w-5 opacity-70 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Email</p>
                          <p className="font-medium">{formData.email || 'Not set'}</p>
                        </div>
                      </div>
                      
                      {formData.phoneNumber && (
                        <div className="flex items-start gap-3">
                          <Phone className="h-5 w-5 opacity-70 mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Phone</p>
                            <p className="font-medium">{formData.phoneNumber}</p>
                          </div>
                        </div>
                      )}
                      
                      {formData.bio && (
                        <div className="flex items-start gap-3">
                          <FileText className="h-5 w-5 opacity-70 mt-0.5" />
                          <div>
                            <p className="text-sm text-muted-foreground">Bio</p>
                            <p className="font-medium text-sm">{formData.bio}</p>
                          </div>
                        </div>
                      )}
                      
                      <div className="flex items-start gap-3">
                        <Calendar className="h-5 w-5 opacity-70 mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Session Expiry</p>
                          <p className={`font-medium ${expiration.expired ? 'text-red-500' : 'text-green-500'}`}>
                            {expiration.expirationDate || 'N/A'} ({expiration.timeLeft})
                          </p>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
              <CardFooter className="flex justify-end space-x-2">
                {isEditing ? (
                  <>
                    <Button variant="ghost" onClick={handleCancel} disabled={isLoading}>
                      Cancel
                    </Button>
                    <Button onClick={handleSave} disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Saving...
                        </>
                      ) : (
                        'Save changes'
                      )}
                    </Button>
                  </>
                ) : (
                  <Button onClick={() => setIsEditing(true)}>Edit profile</Button>
                )}
              </CardFooter>
            </Card>

            <div className="flex flex-col gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Account Information</CardTitle>
                  <CardDescription>
                    Details about your account and security
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md bg-muted p-4">
                    <div className="space-y-3">
                      <div>
                        <p className="text-sm font-medium">Account Type</p>
                        <p className="text-sm">{session?.user?.role || 'User'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Account Created</p>
                        <p className="text-sm">{userProfile?.createdAt ? formatDate(userProfile.createdAt) : 'Unknown'}</p>
                      </div>
                      <div>
                        <p className="text-sm font-medium">Last Updated</p>
                        <p className="text-sm">{userProfile?.updatedAt ? formatDate(userProfile.updatedAt) : 'Unknown'}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="rounded-md border p-4">
                    <h3 className="font-medium mb-2">Security Options</h3>
                    <div className="space-y-2">
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Change Password
                      </Button>
                      <Button variant="outline" size="sm" className="w-full justify-start">
                        Two-factor Authentication
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader>
                  <CardTitle>Session Information</CardTitle>
                  <CardDescription>
                    Details about your current authentication session
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="rounded-md bg-muted p-4 overflow-auto max-h-[200px]">
                    <pre className="text-xs">
                      {JSON.stringify(session, null, 2) || 'No session data available'}
                    </pre>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </DashboardLayout>
    </ProtectedRoute>
  );
}