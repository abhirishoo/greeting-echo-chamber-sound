import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Eye, Video, ExternalLink } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import type { Database } from "@/integrations/supabase/types";

type CampaignStatus = Database["public"]["Enums"]["campaign_status"];

interface Campaign {
  id: string;
  title: string;
  user_id: string;
  status: CampaignStatus;
  budget: number;
  target_views: number;
  current_views: number;
  youtube_video_url: string;
  target_audience: string;
  campaign_duration: number;
  created_at: string;
  user?: {
    email: string;
    full_name: string;
  };
}

const CampaignsSection = () => {
  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [filteredCampaigns, setFilteredCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null);
  const [editingStatus, setEditingStatus] = useState<{[key: string]: boolean}>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchCampaigns();
  }, []);

  useEffect(() => {
    filterCampaigns();
  }, [campaigns, searchTerm, statusFilter]);

  const fetchCampaigns = async () => {
    try {
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("campaigns")
        .select("*")
        .order("created_at", { ascending: false });

      if (campaignsError) throw campaignsError;

      const { data: profilesData, error: profilesError } = await supabase
        .from("profiles")
        .select("id, email, full_name");

      if (profilesError) throw profilesError;

      const profilesMap = profilesData.reduce((acc, profile) => {
        acc[profile.id] = profile;
        return acc;
      }, {} as Record<string, any>);

      const campaignsWithUsers = campaignsData.map(campaign => ({
        ...campaign,
        user: profilesMap[campaign.user_id]
      }));

      setCampaigns(campaignsWithUsers);
    } catch (error) {
      console.error("Error fetching campaigns:", error);
      toast({
        title: "Error",
        description: "Failed to fetch campaigns",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterCampaigns = () => {
    let filtered = campaigns;

    if (searchTerm) {
      filtered = filtered.filter(campaign =>
        campaign.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.user?.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        campaign.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(campaign => campaign.status === statusFilter);
    }

    setFilteredCampaigns(filtered);
  };

  const updateCampaignStatus = async (campaignId: string, newStatus: string) => {
    try {
      setEditingStatus({...editingStatus, [campaignId]: true});
      
      const { error } = await supabase
        .from("campaigns")
        .update({ status: newStatus as CampaignStatus })
        .eq("id", campaignId);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Campaign status updated successfully",
      });

      // Update local state with proper typing
      setCampaigns(campaigns.map(campaign => 
        campaign.id === campaignId 
          ? { ...campaign, status: newStatus as CampaignStatus }
          : campaign
      ));
    } catch (error) {
      console.error("Error updating campaign status:", error);
      toast({
        title: "Error",
        description: "Failed to update campaign status",
        variant: "destructive",
      });
    } finally {
      setEditingStatus({...editingStatus, [campaignId]: false});
    }
  };

  const exportToCSV = () => {
    const headers = ["Title", "User Email", "Status", "Budget", "Target Views", "Current Views", "Created Date"];
    const csvContent = [
      headers.join(","),
      ...filteredCampaigns.map(campaign =>
        [
          campaign.title,
          campaign.user?.email || "Unknown",
          campaign.status,
          campaign.budget,
          campaign.target_views,
          campaign.current_views || 0,
          format(new Date(campaign.created_at), "yyyy-MM-dd HH:mm:ss")
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "campaigns.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-500 text-white";
      case "completed":
        return "bg-blue-500 text-white";
      case "cancelled":
        return "bg-red-500 text-white";
      case "pending":
        return "bg-yellow-500 text-white";
      default:
        return "bg-gray-500 text-white";
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <Card className="border-0 shadow-elegant bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-display">Campaign Management</CardTitle>
              <CardDescription className="font-display">Manage and monitor all campaign requests</CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm" className="rounded-full">
              <Download className="h-4 w-4 mr-2" />
              Export CSV
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search campaigns, titles, or user emails..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-full border-gray-200 focus:border-orange-500"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48 rounded-full">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-display">Campaign</TableHead>
                  <TableHead className="font-display">User</TableHead>
                  <TableHead className="font-display">Status</TableHead>
                  <TableHead className="font-display">Budget</TableHead>
                  <TableHead className="font-display">Views</TableHead>
                  <TableHead className="font-display">Created</TableHead>
                  <TableHead className="font-display">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500 font-display">
                      No campaigns found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell>
                        <div className="font-medium font-display">{campaign.title}</div>
                        <div className="text-sm text-gray-500 font-display truncate max-w-48">
                          {campaign.target_audience}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium font-display">{campaign.user?.full_name || "Unknown"}</div>
                        <div className="text-sm text-gray-500 font-display">{campaign.user?.email || "Unknown"}</div>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={campaign.status}
                          onValueChange={(value) => updateCampaignStatus(campaign.id, value)}
                          disabled={editingStatus[campaign.id]}
                        >
                          <SelectTrigger className="w-32 h-8 rounded-full">
                            <Badge className={`${getStatusBadgeColor(campaign.status)} rounded-full border-0`}>
                              {campaign.status}
                            </Badge>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="pending">Pending</SelectItem>
                            <SelectItem value="active">Active</SelectItem>
                            <SelectItem value="completed">Completed</SelectItem>
                            <SelectItem value="cancelled">Cancelled</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell className="font-display font-medium">${campaign.budget}</TableCell>
                      <TableCell>
                        <div className="text-sm font-display">
                          {campaign.current_views || 0} / {campaign.target_views?.toLocaleString()}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-gradient-to-r from-orange-400 to-orange-600 h-2 rounded-full transition-all duration-300"
                            style={{
                              width: `${Math.min(
                                ((campaign.current_views || 0) / campaign.target_views) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm font-display">
                        {format(new Date(campaign.created_at), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setSelectedCampaign(campaign)}
                                className="rounded-full hover:bg-orange-50 hover:border-orange-200"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-2xl">
                              <DialogHeader>
                                <DialogTitle className="flex items-center gap-2 font-display">
                                  <Video className="h-5 w-5" />
                                  Campaign Details
                                </DialogTitle>
                                <DialogDescription className="font-display">
                                  Complete information for {selectedCampaign?.title}
                                </DialogDescription>
                              </DialogHeader>
                              {selectedCampaign && (
                                <div className="space-y-4">
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <h4 className="font-semibold text-sm text-gray-600 font-display">Title</h4>
                                      <p className="font-medium font-display">{selectedCampaign.title}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-gray-600 font-display">Status</h4>
                                      <Badge className={getStatusBadgeColor(selectedCampaign.status)}>
                                        {selectedCampaign.status}
                                      </Badge>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-gray-600 font-display">Budget</h4>
                                      <p className="font-medium font-display">${selectedCampaign.budget}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-gray-600 font-display">Duration</h4>
                                      <p className="font-medium font-display">{selectedCampaign.campaign_duration} days</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-gray-600 font-display">Target Views</h4>
                                      <p className="font-medium font-display">{selectedCampaign.target_views?.toLocaleString()}</p>
                                    </div>
                                    <div>
                                      <h4 className="font-semibold text-sm text-gray-600 font-display">Current Views</h4>
                                      <p className="font-medium font-display">{selectedCampaign.current_views || 0}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <h4 className="font-semibold text-sm text-gray-600 font-display">User</h4>
                                      <p className="font-medium font-display">{selectedCampaign.user?.full_name || "Unknown"}</p>
                                      <p className="text-sm text-gray-500 font-display">{selectedCampaign.user?.email || "Unknown"}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <h4 className="font-semibold text-sm text-gray-600 font-display">Target Audience</h4>
                                      <p className="font-medium font-display">{selectedCampaign.target_audience}</p>
                                    </div>
                                    <div className="col-span-2">
                                      <h4 className="font-semibold text-sm text-gray-600 font-display">YouTube Video</h4>
                                      <div className="flex items-center gap-2">
                                        <a
                                          href={selectedCampaign.youtube_video_url}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="text-blue-600 hover:text-blue-800 flex items-center gap-1 font-display"
                                        >
                                          <ExternalLink className="h-4 w-4" />
                                          View Video
                                        </a>
                                      </div>
                                    </div>
                                  </div>
                                </div>
                              )}
                            </DialogContent>
                          </Dialog>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CampaignsSection;
