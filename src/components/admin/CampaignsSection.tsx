
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

interface Campaign {
  id: string;
  title: string;
  user_id: string;
  status: string;
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
        return "bg-green-500";
      case "completed":
        return "bg-blue-500";
      case "cancelled":
        return "bg-red-500";
      default:
        return "bg-yellow-500";
    }
  };

  const getYouTubeVideoId = (url: string) => {
    const match = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    return match ? match[1] : null;
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
      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl">Campaigns</CardTitle>
              <CardDescription>Manage and view all campaign requests</CardDescription>
            </div>
            <Button onClick={exportToCSV} variant="outline" size="sm">
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
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-48">
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

          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>User</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Budget</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      No campaigns found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredCampaigns.map((campaign) => (
                    <TableRow key={campaign.id} className="hover:bg-gray-50">
                      <TableCell>
                        <div className="font-medium">{campaign.title}</div>
                        <div className="text-sm text-gray-500 truncate max-w-48">
                          {campaign.target_audience}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="font-medium">{campaign.user?.full_name || "Unknown"}</div>
                        <div className="text-sm text-gray-500">{campaign.user?.email || "Unknown"}</div>
                      </TableCell>
                      <TableCell>
                        <Badge className={getStatusBadgeColor(campaign.status)}>
                          {campaign.status}
                        </Badge>
                      </TableCell>
                      <TableCell>${campaign.budget}</TableCell>
                      <TableCell>
                        <div className="text-sm">
                          {campaign.current_views || 0} / {campaign.target_views?.toLocaleString()}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-primary h-2 rounded-full"
                            style={{
                              width: `${Math.min(
                                ((campaign.current_views || 0) / campaign.target_views) * 100,
                                100
                              )}%`,
                            }}
                          ></div>
                        </div>
                      </TableCell>
                      <TableCell className="text-sm">
                        {format(new Date(campaign.created_at), "MMM dd, yyyy")}
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedCampaign(campaign)}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2">
                                <Video className="h-5 w-5" />
                                Campaign Details
                              </DialogTitle>
                              <DialogDescription>
                                Complete information for {selectedCampaign?.title}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedCampaign && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-600">Title</h4>
                                    <p className="font-medium">{selectedCampaign.title}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-600">Status</h4>
                                    <Badge className={getStatusBadgeColor(selectedCampaign.status)}>
                                      {selectedCampaign.status}
                                    </Badge>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-600">Budget</h4>
                                    <p className="font-medium">${selectedCampaign.budget}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-600">Duration</h4>
                                    <p className="font-medium">{selectedCampaign.campaign_duration} days</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-600">Target Views</h4>
                                    <p className="font-medium">{selectedCampaign.target_views?.toLocaleString()}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-600">Current Views</h4>
                                    <p className="font-medium">{selectedCampaign.current_views || 0}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <h4 className="font-semibold text-sm text-gray-600">User</h4>
                                    <p className="font-medium">{selectedCampaign.user?.full_name || "Unknown"}</p>
                                    <p className="text-sm text-gray-500">{selectedCampaign.user?.email || "Unknown"}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <h4 className="font-semibold text-sm text-gray-600">Target Audience</h4>
                                    <p className="font-medium">{selectedCampaign.target_audience}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <h4 className="font-semibold text-sm text-gray-600">YouTube Video</h4>
                                    <div className="flex items-center gap-2">
                                      <a
                                        href={selectedCampaign.youtube_video_url}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-blue-600 hover:text-blue-800 flex items-center gap-1"
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
