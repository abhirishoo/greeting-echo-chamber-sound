
import React, { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Download, Eye, User, Mail, Calendar, Activity } from "lucide-react";
import { format } from "date-fns";
import { useToast } from "@/hooks/use-toast";

interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  role: string;
  created_at: string;
  campaignCount?: number;
  totalSpent?: number;
}

const UsersSection = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter]);

  const fetchUsers = async () => {
    try {
      const { data: usersData, error: usersError } = await supabase
        .from("profiles")
        .select("*")
        .order("created_at", { ascending: false });

      if (usersError) throw usersError;

      // Fetch campaign counts and spending for each user
      const { data: campaignsData, error: campaignsError } = await supabase
        .from("campaigns")
        .select("user_id, budget");

      if (campaignsError) throw campaignsError;

      const { data: paymentsData, error: paymentsError } = await supabase
        .from("payments")
        .select("user_id, amount")
        .eq("status", "completed");

      if (paymentsError) throw paymentsError;

      // Calculate stats for each user
      const usersWithStats = usersData.map(user => {
        const userCampaigns = campaignsData.filter(c => c.user_id === user.id);
        const userPayments = paymentsData.filter(p => p.user_id === user.id);
        
        return {
          ...user,
          campaignCount: userCampaigns.length,
          totalSpent: userPayments.reduce((sum, payment) => sum + Number(payment.amount), 0)
        };
      });

      setUsers(usersWithStats);
    } catch (error) {
      console.error("Error fetching users:", error);
      toast({
        title: "Error",
        description: "Failed to fetch users data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user =>
        user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== "all") {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    setFilteredUsers(filtered);
  };

  const exportToCSV = () => {
    const headers = ["Full Name", "Email", "Role", "Campaigns", "Total Spent", "Registration Date"];
    const csvContent = [
      headers.join(","),
      ...filteredUsers.map(user =>
        [
          user.full_name || "Not provided",
          user.email,
          user.role,
          user.campaignCount || 0,
          user.totalSpent || 0,
          format(new Date(user.created_at), "yyyy-MM-dd")
        ].join(",")
      )
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "users.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-500";
      case "moderator":
        return "bg-blue-500";
      default:
        return "bg-gray-500";
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
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-0 shadow-elegant bg-white/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium font-display text-gray-600">Total Users</CardTitle>
            <User className="h-5 w-5 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display text-gray-900">{users.length}</div>
            <p className="text-sm font-display text-gray-500 mt-1">Registered accounts</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-elegant bg-white/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium font-display text-gray-600">Active Users</CardTitle>
            <Activity className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display text-gray-900">
              {users.filter(u => (u.campaignCount || 0) > 0).length}
            </div>
            <p className="text-sm font-display text-gray-500 mt-1">Users with campaigns</p>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-elegant bg-white/70 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium font-display text-gray-600">Admin Users</CardTitle>
            <User className="h-5 w-5 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold font-display text-gray-900">
              {users.filter(u => u.role === 'admin').length}
            </div>
            <p className="text-sm font-display text-gray-500 mt-1">Administrative accounts</p>
          </CardContent>
        </Card>
      </div>

      {/* Users Table */}
      <Card className="border-0 shadow-elegant bg-white/70 backdrop-blur-sm">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-xl font-display">User Management</CardTitle>
              <CardDescription className="font-display">View and manage all registered users</CardDescription>
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
                placeholder="Search by name or email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 rounded-full border-gray-200 focus:border-orange-500"
              />
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-full sm:w-48 rounded-full">
                <SelectValue placeholder="Filter by role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
                <SelectItem value="moderator">Moderator</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="rounded-xl border border-gray-200 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-50/50">
                <TableRow>
                  <TableHead className="font-display">User</TableHead>
                  <TableHead className="font-display">Role</TableHead>
                  <TableHead className="font-display">Campaigns</TableHead>
                  <TableHead className="font-display">Total Spent</TableHead>
                  <TableHead className="font-display">Registered</TableHead>
                  <TableHead className="font-display">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-500 font-display">
                      No users found matching your criteria.
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-gray-50/50 transition-colors">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-r from-orange-400 to-orange-600 rounded-full flex items-center justify-center">
                            <span className="text-white text-sm font-semibold">
                              {user.full_name ? user.full_name.charAt(0).toUpperCase() : user.email.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div>
                            <div className="font-medium font-display">{user.full_name || "Not provided"}</div>
                            <div className="text-sm text-gray-500 font-display flex items-center gap-1">
                              <Mail className="h-3 w-3" />
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={`${getRoleBadgeColor(user.role)} rounded-full`}>
                          {user.role}
                        </Badge>
                      </TableCell>
                      <TableCell className="font-display">
                        <div className="flex items-center gap-1">
                          <Activity className="h-4 w-4 text-gray-400" />
                          {user.campaignCount || 0}
                        </div>
                      </TableCell>
                      <TableCell className="font-display font-medium">
                        ${(user.totalSpent || 0).toFixed(2)}
                      </TableCell>
                      <TableCell className="text-sm font-display">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3 text-gray-400" />
                          {format(new Date(user.created_at), "MMM dd, yyyy")}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => setSelectedUser(user)}
                              className="rounded-full hover:bg-orange-50 hover:border-orange-200"
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="max-w-2xl">
                            <DialogHeader>
                              <DialogTitle className="flex items-center gap-2 font-display">
                                <User className="h-5 w-5" />
                                User Details
                              </DialogTitle>
                              <DialogDescription className="font-display">
                                Complete information for {selectedUser?.full_name || selectedUser?.email}
                              </DialogDescription>
                            </DialogHeader>
                            {selectedUser && (
                              <div className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-600 font-display">Full Name</h4>
                                    <p className="font-medium font-display">{selectedUser.full_name || "Not provided"}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-600 font-display">Email</h4>
                                    <p className="font-medium font-display">{selectedUser.email}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-600 font-display">Role</h4>
                                    <Badge className={getRoleBadgeColor(selectedUser.role)}>
                                      {selectedUser.role}
                                    </Badge>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-600 font-display">User ID</h4>
                                    <p className="font-mono text-sm">{selectedUser.id}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-600 font-display">Total Campaigns</h4>
                                    <p className="font-medium font-display">{selectedUser.campaignCount || 0}</p>
                                  </div>
                                  <div>
                                    <h4 className="font-semibold text-sm text-gray-600 font-display">Total Spent</h4>
                                    <p className="font-medium font-display">${(selectedUser.totalSpent || 0).toFixed(2)}</p>
                                  </div>
                                  <div className="col-span-2">
                                    <h4 className="font-semibold text-sm text-gray-600 font-display">Registration Date</h4>
                                    <p className="font-medium font-display">
                                      {format(new Date(selectedUser.created_at), "PPpp")}
                                    </p>
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

export default UsersSection;
