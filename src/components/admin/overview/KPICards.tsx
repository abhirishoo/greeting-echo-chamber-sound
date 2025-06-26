
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, MessageSquare, TrendingUp, Calendar, Video, DollarSign } from "lucide-react";

interface DashboardStats {
  totalSubscribers: number;
  totalMessages: number;
  totalCampaigns: number;
  totalRevenue: number;
  newSubscribersToday: number;
  messagesLast7Days: number;
}

interface KPICardsProps {
  stats: DashboardStats;
  loading: boolean;
}

const KPICards: React.FC<KPICardsProps> = ({ stats, loading }) => {
  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-1/2"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Total Subscribers</CardTitle>
          <Users className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{stats.totalSubscribers}</div>
          <p className="text-sm text-gray-500 mt-1">Newsletter subscribers</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Total Messages</CardTitle>
          <MessageSquare className="h-5 w-5 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{stats.totalMessages}</div>
          <p className="text-sm text-gray-500 mt-1">Contact form submissions</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Total Campaigns</CardTitle>
          <Video className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{stats.totalCampaigns}</div>
          <p className="text-sm text-gray-500 mt-1">All campaigns created</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Total Revenue</CardTitle>
          <DollarSign className="h-5 w-5 text-purple-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">${stats.totalRevenue.toFixed(2)}</div>
          <p className="text-sm text-gray-500 mt-1">From completed payments</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">New Today</CardTitle>
          <TrendingUp className="h-5 w-5 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{stats.newSubscribersToday}</div>
          <p className="text-sm text-gray-500 mt-1">Subscriptions today</p>
        </CardContent>
      </Card>

      <Card className="hover:shadow-lg transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
          <CardTitle className="text-sm font-medium text-gray-600">Last 7 Days</CardTitle>
          <Calendar className="h-5 w-5 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900">{stats.messagesLast7Days}</div>
          <p className="text-sm text-gray-500 mt-1">Recent messages</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default KPICards;
