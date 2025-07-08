
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";
import { supabase } from "@/integrations/supabase/client";
import { 
  Eye, 
  DollarSign, 
  Target, 
  TrendingUp, 
  Calendar,
  PlayCircle,
  CheckCircle,
  Clock,
  BarChart3
} from "lucide-react";

interface DashboardAnalyticsProps {
  campaigns: any[];
  user: any;
}

const DashboardAnalytics: React.FC<DashboardAnalyticsProps> = ({ campaigns, user }) => {
  const [analyticsData, setAnalyticsData] = useState<any[]>([]);
  
  useEffect(() => {
    if (campaigns.length > 0) {
      const chartData = campaigns.map((campaign, index) => ({
        name: campaign.title.substring(0, 20) + (campaign.title.length > 20 ? '...' : ''),
        views: campaign.current_views || 0,
        target: campaign.target_views || 0,
        spent: campaign.budget || 0,
        date: new Date(campaign.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
      }));
      setAnalyticsData(chartData);
    }
  }, [campaigns]);

  // Calculate KPIs
  const totalCampaigns = campaigns.length;
  const totalViewsGained = campaigns.reduce((sum, campaign) => sum + (campaign.current_views || 0), 0);
  const totalSpent = campaigns.reduce((sum, campaign) => sum + (campaign.budget || 0), 0);
  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const completedCampaigns = campaigns.filter(c => c.status === 'completed').length;
  const averageViews = totalCampaigns > 0 ? Math.round(totalViewsGained / totalCampaigns) : 0;

  const chartConfig = {
    views: {
      label: "Views Gained",
      color: "#f97316",
    },
    target: {
      label: "Target Views",
      color: "#e5e7eb",
    },
    spent: {
      label: "Amount Spent",
      color: "#10b981",
    },
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-3xl sm:text-4xl font-display font-extrabold tracking-tight text-gray-900 mb-4">
          Campaign Analytics
        </h2>
        <p className="text-lg font-display text-gray-600 max-w-2xl mx-auto">
          Track your video promotion performance with detailed insights and metrics
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="border-0 shadow-elegant bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-display">Total Campaigns</p>
                <p className="text-3xl font-bold text-gray-900 font-display">{totalCampaigns}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-blue-100 to-blue-200 rounded-full flex items-center justify-center">
                <BarChart3 className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <PlayCircle className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{activeCampaigns} active</span>
              <span className="text-gray-500 ml-2">• {completedCampaigns} completed</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-elegant bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-display">Total Views Gained</p>
                <p className="text-3xl font-bold text-gray-900 font-display">{totalViewsGained.toLocaleString()}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center">
                <Eye className="h-6 w-6 text-orange-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
              <span className="text-green-600 font-medium">{averageViews.toLocaleString()} avg per campaign</span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-elegant bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-display">Total Investment</p>
                <p className="text-3xl font-bold text-gray-900 font-display">${totalSpent.toFixed(2)}</p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-green-100 to-green-200 rounded-full flex items-center justify-center">
                <DollarSign className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Target className="h-4 w-4 text-blue-500 mr-1" />
              <span className="text-blue-600 font-medium">
                ${totalViewsGained > 0 ? (totalSpent / totalViewsGained).toFixed(4) : '0.0000'} per view
              </span>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-elegant bg-white/70 backdrop-blur-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 font-display">Success Rate</p>
                <p className="text-3xl font-bold text-gray-900 font-display">
                  {totalCampaigns > 0 ? Math.round((completedCampaigns / totalCampaigns) * 100) : 0}%
                </p>
              </div>
              <div className="w-12 h-12 bg-gradient-to-br from-purple-100 to-purple-200 rounded-full flex items-center justify-center">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
            </div>
            <div className="mt-4 flex items-center text-sm">
              <Clock className="h-4 w-4 text-gray-500 mr-1" />
              <span className="text-gray-600 font-medium">{completedCampaigns} completed campaigns</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      {analyticsData.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Views Performance Chart */}
          <Card className="border-0 shadow-elegant bg-white/70 backdrop-blur-sm">
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-display font-bold text-gray-900">Views Performance</CardTitle>
              <CardDescription className="font-display text-gray-600">
                Track views gained vs targets across campaigns
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis 
                      dataKey="name" 
                      className="text-xs fill-gray-600"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis className="text-xs fill-gray-600" tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line 
                      type="monotone" 
                      dataKey="views" 
                      stroke={chartConfig.views.color}
                      strokeWidth={3}
                      dot={{ fill: chartConfig.views.color, strokeWidth: 2, r: 4 }}
                      activeDot={{ r: 6, stroke: chartConfig.views.color, strokeWidth: 2 }}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="target" 
                      stroke={chartConfig.target.color}
                      strokeWidth={2}
                      strokeDasharray="5 5"
                      dot={{ fill: chartConfig.target.color, strokeWidth: 2, r: 3 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>

          {/* Investment Overview */}
          <Card className="border-0 shadow-elegant bg-white/70 backdrop-blur-sm">
            <CardHeader className="p-6">
              <CardTitle className="text-xl font-display font-bold text-gray-900">Investment Overview</CardTitle>
              <CardDescription className="font-display text-gray-600">
                Campaign spending breakdown by performance
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 pt-0">
              <ChartContainer config={chartConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analyticsData}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-gray-200" />
                    <XAxis 
                      dataKey="name" 
                      className="text-xs fill-gray-600"
                      tick={{ fontSize: 12 }}
                    />
                    <YAxis className="text-xs fill-gray-600" tick={{ fontSize: 12 }} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Bar 
                      dataKey="spent" 
                      fill={chartConfig.spent.color}
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {analyticsData.length === 0 && (
        <Card className="border-0 shadow-elegant bg-white/70 backdrop-blur-sm text-center py-16">
          <CardContent>
            <div className="w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center">
              <BarChart3 className="h-10 w-10 text-gray-400" />
            </div>
            <h3 className="text-2xl font-display font-semibold text-gray-900 mb-4">
              No Analytics Data Yet
            </h3>
            <p className="text-lg font-display text-gray-600 max-w-md mx-auto">
              Create and run campaigns to see detailed performance analytics and insights
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DashboardAnalytics;
