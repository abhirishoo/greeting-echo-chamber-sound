import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { 
  Plus, 
  Eye, 
  Calendar, 
  DollarSign, 
  Play, 
  CheckCircle,
  CreditCard,
  BarChart3,
  Edit,
  Target,
  TrendingUp,
  RefreshCw
} from "lucide-react";
import DashboardNavbar from "@/components/DashboardNavbar";
import CampaignActions from "@/components/CampaignActions";
import CampaignForm from "@/components/CampaignForm";
import YouTubeThumbnail from "@/components/YouTubeThumbnail";
import DashboardAnalytics from "@/components/DashboardAnalytics";
import { useYouTubeTracking } from "@/hooks/useYouTubeTracking";
import { calculateViewsGained } from "@/utils/youtube";

type CampaignStatus = "pending" | "active" | "completed" | "cancelled";

const Dashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [editingCampaign, setEditingCampaign] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState<'campaigns' | 'analytics'>('campaigns');
  const navigate = useNavigate();
  const { toast } = useToast();

  // Initialize YouTube tracking
  const { isUpdating } = useYouTubeTracking(campaigns);

  useEffect(() => {
    checkUser();
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        console.log("Dashboard auth state change:", event, session);
        if (!session) {
          navigate("/auth");
        } else {
          setUser(session.user);
          fetchCampaigns();
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  // Set up real-time updates for campaigns
  useEffect(() => {
    if (!user) return;

    const channel = supabase
      .channel('campaign-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'campaigns',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Real-time campaign update:', payload);
          fetchCampaigns(); // Refresh campaigns when changes occur
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [user]);

  const checkUser = async () => {
    console.log("Checking user session...");
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      console.log("No session found, redirecting to auth");
      navigate("/auth");
      return;
    }
    
    console.log("User session found:", session.user.email);
    setUser(session.user);
    localStorage.setItem('swishview_user', JSON.stringify(session.user));
    fetchCampaigns();
  };

  const fetchCampaigns = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) return;

      console.log("Fetching campaigns for user:", session.user.id);

      const { data, error } = await supabase
        .from("campaigns")
        .select("*")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching campaigns:", error);
        throw error;
      }
      
      console.log("Campaigns fetched:", data);
      
      // Auto-update campaign status based on progress
      const updatedCampaigns = data?.map(campaign => {
        if (campaign.status === 'active' && campaign.current_views >= campaign.target_views) {
          // Update campaign status to completed if target reached
          updateCampaignStatus(campaign.id, 'completed' as CampaignStatus);
          return { ...campaign, status: 'completed' as CampaignStatus };
        }
        return campaign;
      }) || [];
      
      setCampaigns(updatedCampaigns);
    } catch (error: any) {
      console.error("Fetch campaigns error:", error);
      toast({
        title: "Error",
        description: "Failed to fetch campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const updateCampaignStatus = async (campaignId: string, status: CampaignStatus) => {
    try {
      const { error } = await supabase
        .from("campaigns")
        .update({ status })
        .eq("id", campaignId);

      if (error) throw error;
      
      if (status === 'completed') {
        toast({
          title: "Campaign Completed! 🎉",
          description: "Your campaign has reached its target views!",
        });
      }
    } catch (error) {
      console.error("Error updating campaign status:", error);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchCampaigns();
  };

  const handleSignOut = async () => {
    console.log("Signing out...");
    await supabase.auth.signOut();
    localStorage.removeItem('swishview_user');
    navigate("/");
  };

  const handleEditCampaign = (campaign: any) => {
    setEditingCampaign(campaign);
    setShowForm(true);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingCampaign(null);
    fetchCampaigns();
  };

  const handleFormCancel = () => {
    setShowForm(false);
    setEditingCampaign(null);
  };

  const getStatusBadge = (status: string) => {
    const styles = {
      pending: "bg-gradient-to-r from-orange-100 to-orange-200 text-orange-800 border-orange-300",
      active: "bg-gradient-to-r from-green-100 to-green-200 text-green-800 border-green-300",
      completed: "bg-gradient-to-r from-blue-100 to-blue-200 text-blue-800 border-blue-300",
      paused: "bg-gradient-to-r from-gray-100 to-gray-200 text-gray-800 border-gray-300"
    };

    return (
      <Badge className={`${styles[status as keyof typeof styles]} px-3 py-1 text-xs font-medium rounded-full border`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const getProgressPercentage = (current: number, target: number) => {
    return Math.min((current / target) * 100, 100);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="text-xl font-display text-gray-800">Loading dashboard...</div>
      </div>
    );
  }

  if (showForm) {
    return (
      <CampaignForm
        campaign={editingCampaign}
        onSuccess={handleFormSuccess}
        onCancel={handleFormCancel}
      />
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100 relative overflow-hidden">
      {/* 🔶 Glow Background Effects - Similar to Homepage */}
      <div
        className="
          absolute 
          top-[-100px] right-[-60px] 
          w-[300px] h-[200px] 
          sm:w-[400px] sm:h-[250px] sm:top-[-100px] sm:right-[-50px]
          md:w-[500px] md:h-[300px] md:top-[-100px] md:right-[-40px]
          lg:w-[700px] lg:h-[400px] lg:top-[-100px] lg:right-[-50px]
          bg-orange-200 
          opacity-40  
          blur-[120px] 
          rounded-full 
          pointer-events-none 
          z-[1]
        "
      />
      
      {/* Additional subtle glow at bottom left */}
      <div
        className="
          absolute 
          bottom-[-150px] left-[-100px] 
          w-[400px] h-[300px] 
          bg-blue-200 
          opacity-20  
          blur-[100px] 
          rounded-full 
          pointer-events-none 
          z-[1]
        "
      />

      {/* Navigation - Homepage Style */}
      <DashboardNavbar user={user} />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-display font-extrabold tracking-tight leading-tight mb-6 text-gray-900">
            Dashboard
          </h1>
          <p className="text-lg sm:text-xl font-display text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Monitor your video promotion campaigns and track performance metrics
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white/70 backdrop-blur-sm rounded-full p-1 shadow-elegant">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('campaigns')}
                className={`px-6 py-3 rounded-full text-sm font-medium font-display transition-all duration-300 ${
                  activeTab === 'campaigns'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Your Campaigns
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`px-6 py-3 rounded-full text-sm font-medium font-display transition-all duration-300 ${
                  activeTab === 'analytics'
                    ? 'bg-gradient-to-r from-orange-500 to-orange-600 text-white shadow-lg'
                    : 'text-gray-600 hover:text-gray-900'
                }`}
              >
                Analytics
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'campaigns' && (
          <div>
            {/* Action Bar */}
            <div className="flex justify-between items-center mb-8">
              <Button 
                onClick={() => setShowForm(true)}
                className="group inline-flex items-center justify-center px-8 py-4 rounded-full border border-white text-white font-medium bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
                size="lg"
              >
                <Plus className="h-5 w-5 mr-2" />
                Create New Campaign
                <span className="ml-2 transform transition-transform group-hover:translate-x-1">→</span>
              </Button>

              <div className="flex items-center gap-3">
                {isUpdating && (
                  <div className="flex items-center text-sm text-gray-600">
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Updating view counts...
                  </div>
                )}
                <Button 
                  onClick={handleRefresh}
                  variant="outline"
                  className="rounded-full"
                  disabled={refreshing}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                  Refresh
                </Button>
              </div>
            </div>

            {/* Campaigns Grid */}
            {campaigns.length === 0 ? (
              <Card className="text-center py-16 border-0 shadow-elegant bg-white/70 backdrop-blur-sm">
                <CardContent>
                  <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                    <BarChart3 className="h-10 w-10 text-orange-600" />
                  </div>
                  <h3 className="text-2xl font-display font-semibold text-gray-900 mb-4">
                    No campaigns yet
                  </h3>
                  <p className="text-lg font-display text-gray-600 mb-8 max-w-md mx-auto">
                    Create your first campaign to start promoting your videos and reaching new audiences
                  </p>
                  <Button 
                    onClick={() => setShowForm(true)}
                    className="group inline-flex items-center justify-center px-6 py-3 rounded-full border border-white text-white font-medium bg-gradient-to-r from-orange-500 to-orange-600 transition-all duration-300 shadow-md hover:shadow-lg"
                    size="lg"
                  >
                    <Plus className="h-5 w-5 mr-2" />
                    Create Campaign
                    <span className="ml-2 transform transition-transform group-hover:translate-x-1">→</span>
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-8">
                {campaigns.map((campaign) => (
                  <Card key={campaign.id} className="border-0 shadow-elegant bg-white/70 backdrop-blur-sm hover:shadow-elegant-hover transition-all duration-300">
                    <CardContent className="p-8">
                      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                        {/* Video Thumbnail - Left */}
                        <div className="lg:col-span-3">
                          <div className="relative rounded-xl overflow-hidden">
                            {(campaign.youtube_video_url || campaign.video_url) ? (
                              <YouTubeThumbnail 
                                videoUrl={campaign.youtube_video_url || campaign.video_url} 
                                size="lg"
                                className="w-full h-40 object-cover"
                              />
                            ) : (
                              <div className="w-full h-40 bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center rounded-xl">
                                <Play className="h-8 w-8 text-gray-400" />
                              </div>
                            )}
                            <div className="absolute top-3 right-3">
                              {getStatusBadge(campaign.status)}
                            </div>
                          </div>
                        </div>

                        {/* Campaign Details - Center */}
                        <div className="lg:col-span-6 space-y-6">
                          <div>
                            <h3 className="text-xl font-display font-bold text-gray-900 mb-2">
                              {campaign.title}
                            </h3>
                            <p className="text-gray-600 font-display">
                              {campaign.target_audience}
                            </p>
                          </div>

                           {/* Progress Section */}
                           <div className="space-y-3">
                             <div className="flex items-center justify-between">
                               <span className="text-sm font-medium text-gray-600 font-display">Views Gained Progress</span>
                               <span className="text-sm font-bold text-gray-900 font-display">
                                 +{calculateViewsGained(campaign.current_views || 0, campaign.starting_views || 0).toLocaleString()} / {campaign.target_views?.toLocaleString()}
                               </span>
                             </div>
                             <Progress 
                               value={getProgressPercentage(calculateViewsGained(campaign.current_views || 0, campaign.starting_views || 0), campaign.target_views)} 
                               className="h-3 bg-gray-100"
                             />
                             <div className="text-xs text-gray-500 font-display">
                               {getProgressPercentage(calculateViewsGained(campaign.current_views || 0, campaign.starting_views || 0), campaign.target_views).toFixed(1)}% complete
                             </div>
                           </div>

                           {/* Metrics Grid */}
                           <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
                            <div className="text-center p-3 bg-gray-50/50 rounded-xl">
                              <Calendar className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                              <p className="text-xs text-gray-500 font-display">Start Date</p>
                              <p className="font-semibold text-gray-900 text-sm font-display">
                                {formatDate(campaign.created_at)}
                              </p>
                            </div>
                            
                             <div className="text-center p-3 bg-gray-50/50 rounded-xl">
                               <Eye className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                               <p className="text-xs text-gray-500 font-display">Current Views</p>
                               <p className="font-semibold text-gray-900 text-sm font-display">
                                 {campaign.current_views?.toLocaleString() || 0}
                               </p>
                             </div>
                             
                             <div className="text-center p-3 bg-gray-50/50 rounded-xl">
                               <TrendingUp className="h-4 w-4 text-green-500 mx-auto mb-1" />
                               <p className="text-xs text-gray-500 font-display">Views Gained</p>
                               <p className="font-semibold text-green-600 text-sm font-display">
                                 +{calculateViewsGained(campaign.current_views || 0, campaign.starting_views || 0).toLocaleString()}
                               </p>
                             </div>
                             
                             <div className="text-center p-3 bg-gray-50/50 rounded-xl">
                               <Target className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                               <p className="text-xs text-gray-500 font-display">Target Views</p>
                               <p className="font-semibold text-gray-900 text-sm font-display">
                                 {campaign.target_views?.toLocaleString()}
                               </p>
                             </div>
                            
                            <div className="text-center p-3 bg-gray-50/50 rounded-xl">
                              <DollarSign className="h-4 w-4 text-gray-500 mx-auto mb-1" />
                              <p className="text-xs text-gray-500 font-display">Total Paid</p>
                              <p className="font-semibold text-gray-900 text-sm font-display">
                                ${campaign.budget}
                              </p>
                            </div>
                          </div>

                          {campaign.status === 'pending' && (
                            <div className="p-4 bg-orange-50 border border-orange-200 rounded-xl">
                              <div className="flex items-center mb-2">
                                <CreditCard className="h-4 w-4 text-orange-600 mr-2" />
                                <span className="text-sm font-medium text-orange-800 font-display">Payment Required</span>
                              </div>
                              <p className="text-xs text-orange-700 mb-3 font-display">
                                Complete payment to activate your campaign
                              </p>
                              <Button
                                onClick={() => navigate(`/payment/${campaign.id}`)}
                                className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white rounded-full text-sm px-4 py-2"
                                size="sm"
                              >
                                Complete Payment
                              </Button>
                            </div>
                          )}
                        </div>

                        {/* Actions - Right */}
                        <div className="lg:col-span-3 flex flex-col items-end space-y-4">
                          <div className="flex flex-wrap gap-2 justify-end">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => handleEditCampaign(campaign)}
                              className="rounded-full border-gray-300 hover:border-orange-500 hover:text-orange-500 transition-colors"
                            >
                              <Edit className="h-4 w-4 mr-1" />
                              Edit
                            </Button>
                            <CampaignActions
                              campaign={campaign}
                              onCampaignUpdated={fetchCampaigns}
                              onEditClick={() => handleEditCampaign(campaign)}
                            />
                          </div>

                          {campaign.status === 'active' && (
                            <div className="flex items-center text-green-600 text-sm font-display">
                              <CheckCircle className="h-4 w-4 mr-1" />
                              Campaign Active
                            </div>
                          )}

                          {campaign.status === 'completed' && (
                            <div className="flex items-center text-blue-600 text-sm font-display">
                              <TrendingUp className="h-4 w-4 mr-1" />
                              Target Reached!
                            </div>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytics' && (
          <DashboardAnalytics campaigns={campaigns} user={user} />
        )}
      </div>
    </div>
  );
};

export default Dashboard;
