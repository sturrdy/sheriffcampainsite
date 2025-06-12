
import { useState, useMemo, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from "@/components/ui/alert-dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  Download, Users, Heart, ClipboardList, Mail, Search, Calendar, DollarSign, 
  MapPin, Phone, Edit, Trash2, Filter, SortAsc, SortDesc, CheckSquare, 
  Square, MoreHorizontal, Eye, Copy, ExternalLink, Zap, TrendingUp,
  Clock, Target, FileText, BarChart3, Settings
} from "lucide-react";
import { format, subDays, isAfter } from "date-fns";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  type Volunteer, 
  type YardSignRequest, 
  type Donation, 
  type NewsletterSubscription 
} from "@shared/schema";

const volunteerEditSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  interests: z.array(z.string()).min(1, "Please select at least one interest"),
});

const yardSignEditSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  phone: z.string().optional(),
  address: z.string().min(1, "Address is required"),
  quantity: z.number().min(1).default(1),
});

export default function AdminDashboard() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedItems, setSelectedItems] = useState(new Set());
  const [sortField, setSortField] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [statusFilter, setStatusFilter] = useState("all");
  const [dateFilter, setDateFilter] = useState("all");
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);
  const [editingVolunteer, setEditingVolunteer] = useState<Volunteer | null>(null);
  const [editingYardSign, setEditingYardSign] = useState<YardSignRequest | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: volunteers = [] } = useQuery<Volunteer[]>({
    queryKey: ["/api/volunteers"],
  });

  const { data: yardSignRequests = [] } = useQuery<YardSignRequest[]>({
    queryKey: ["/api/yard-sign-requests"],
  });

  const { data: donations = [] } = useQuery<Donation[]>({
    queryKey: ["/api/donations"],
  });

  const { data: newsletterSubscriptions = [] } = useQuery<NewsletterSubscription[]>({
    queryKey: ["/api/newsletter"],
  });

  // Advanced filtering and sorting logic
  const filterAndSortData = useCallback((data: any[], searchFields: string[], type?: string) => {
    let filtered = [...data];

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(item =>
        searchFields.some(field =>
          item[field]?.toString().toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    // Date filter
    if (dateFilter !== "all") {
      const cutoffDate = subDays(new Date(), 
        dateFilter === "week" ? 7 : 
        dateFilter === "month" ? 30 : 
        dateFilter === "quarter" ? 90 : 0
      );
      filtered = filtered.filter(item => isAfter(new Date(item.createdAt), cutoffDate));
    }

    // Sorting
    filtered.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];
      
      if (aVal instanceof Date) aVal = aVal.getTime();
      if (bVal instanceof Date) bVal = bVal.getTime();
      
      if (typeof aVal === 'string') aVal = aVal.toLowerCase();
      if (typeof bVal === 'string') bVal = bVal.toLowerCase();
      
      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    });

    return filtered;
  }, [searchTerm, statusFilter, dateFilter, sortField, sortDirection]);

  // Bulk operations
  const handleBulkDelete = () => {
    console.log("Bulk deleting:", Array.from(selectedItems));
    setSelectedItems(new Set());
    toast({ title: "Success", description: `Deleted ${selectedItems.size} items` });
  };

  const handleBulkExport = () => {
    console.log("Bulk exporting:", Array.from(selectedItems));
    toast({ title: "Success", description: `Exported ${selectedItems.size} items` });
  };

  const toggleItemSelection = (id: number) => {
    const newSelection = new Set(selectedItems);
    if (newSelection.has(id)) {
      newSelection.delete(id);
    } else {
      newSelection.add(id);
    }
    setSelectedItems(newSelection);
  };

  const toggleAllSelection = (items: any[]) => {
    if (selectedItems.size === items.length) {
      setSelectedItems(new Set());
    } else {
      setSelectedItems(new Set(items.map(item => item.id)));
    }
  };

  // Enhanced CSV export
  const exportToCSV = (data: any[], filename: string, headers: string[], selectedOnly = false) => {
    const exportData = selectedOnly ? 
      data.filter(item => selectedItems.has(item.id)) : 
      data;
    
    const csvContent = [
      headers.join(","),
      ...exportData.map(row => headers.map(header => {
        const key = header.toLowerCase().replace(/\s+/g, "");
        let value = row[key] || "";
        if (Array.isArray(value)) value = value.join("; ");
        if (value instanceof Date) value = format(value, "MM/dd/yyyy HH:mm");
        return `"${value}"`;
      }).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}-${format(new Date(), "yyyy-MM-dd")}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  // Delete mutations
  const deleteVolunteerMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/volunteers/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      toast({ title: "Success", description: "Volunteer deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete volunteer", variant: "destructive" });
    },
  });

  const deleteYardSignMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/yard-sign-requests/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/yard-sign-requests"] });
      toast({ title: "Success", description: "Yard sign request deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete yard sign request", variant: "destructive" });
    },
  });

  const deleteNewsletterMutation = useMutation({
    mutationFn: (id: number) => apiRequest("DELETE", `/api/newsletter/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/newsletter"] });
      toast({ title: "Success", description: "Newsletter subscription deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete subscription", variant: "destructive" });
    },
  });

  // Update mutations
  const updateVolunteerMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/volunteers/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/volunteers"] });
      toast({ title: "Success", description: "Volunteer updated successfully" });
      setEditingVolunteer(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update volunteer", variant: "destructive" });
    },
  });

  const updateYardSignMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: any }) => 
      apiRequest("PUT", `/api/yard-sign-requests/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/yard-sign-requests"] });
      toast({ title: "Success", description: "Yard sign request updated successfully" });
      setEditingYardSign(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update yard sign request", variant: "destructive" });
    },
  });

  const volunteerForm = useForm({
    resolver: zodResolver(volunteerEditSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      interests: [],
    },
  });

  const yardSignForm = useForm({
    resolver: zodResolver(yardSignEditSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      address: "",
      quantity: 1,
    },
  });

  const handleVolunteerEdit = (data: any) => {
    if (!editingVolunteer) return;
    updateVolunteerMutation.mutate({ id: editingVolunteer.id, data });
  };

  const handleYardSignEdit = (data: any) => {
    if (!editingYardSign) return;
    updateYardSignMutation.mutate({ id: editingYardSign.id, data });
  };

  // Enhanced stats with trends
  const totalDonationAmount = donations
    .filter((d: Donation) => d.status === "succeeded")
    .reduce((sum: number, d: Donation) => sum + (d.amount || 0), 0) / 100;

  const recentVolunteers = volunteers.filter(v => 
    isAfter(new Date(v.createdAt), subDays(new Date(), 7))
  ).length;

  const stats = [
    {
      title: "Total Volunteers",
      value: volunteers.length,
      change: `+${recentVolunteers} this week`,
      icon: Users,
      color: "text-blue-600",
      trend: "up"
    },
    {
      title: "Yard Sign Requests",
      value: yardSignRequests.length,
      change: `${yardSignRequests.length} total requests`,
      icon: ClipboardList,
      color: "text-green-600",
      trend: "up"
    },
    {
      title: "Total Donations",
      value: `$${totalDonationAmount.toFixed(2)}`,
      change: `${donations.filter(d => d.status === "succeeded").length} successful`,
      icon: DollarSign,
      color: "text-red-600",
      trend: "up"
    },
    {
      title: "Newsletter Subscribers",
      value: newsletterSubscriptions.length,
      change: `${newsletterSubscriptions.filter(n => 
        isAfter(new Date(n.createdAt), subDays(new Date(), 30))
      ).length} this month`,
      icon: Mail,
      color: "text-purple-600",
      trend: "up"
    },
  ];

  const filteredVolunteers = useMemo(() => 
    filterAndSortData(volunteers, ["name", "email", "phone"], "volunteers"), 
    [volunteers, filterAndSortData]
  );

  const filteredYardSigns = useMemo(() => 
    filterAndSortData(yardSignRequests, ["name", "email", "address"]), 
    [yardSignRequests, filterAndSortData]
  );

  const filteredDonations = useMemo(() => 
    filterAndSortData(donations, ["email"]), 
    [donations, filterAndSortData]
  );

  const filteredNewsletter = useMemo(() => 
    filterAndSortData(newsletterSubscriptions, ["email"]), 
    [newsletterSubscriptions, filterAndSortData]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Enhanced Header */}
        <div className="mb-8 flex justify-between items-start">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2 flex items-center">
              <Zap className="h-8 w-8 text-blue-600 mr-3" />
              Campaign Command Center
            </h1>
            <p className="text-gray-600">Nick Smith for Walker County Sheriff - Advanced Data Management</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={() => setShowSettings(true)}>
              <Settings className="h-4 w-4 mr-2" />
              Settings
            </Button>
            <Button variant="outline" size="sm">
              <BarChart3 className="h-4 w-4 mr-2" />
              Analytics
            </Button>
          </div>
        </div>

        {/* Enhanced Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const IconComponent = stat.icon;
            return (
              <Card key={index} className="hover:shadow-lg transition-shadow border-l-4 border-l-blue-500">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <IconComponent className={`h-4 w-4 ${stat.color}`} />
                    {stat.trend === "up" && <TrendingUp className="h-3 w-3 text-green-500" />}
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold mb-1">{stat.value}</div>
                  <p className="text-xs text-gray-600">{stat.change}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Advanced Search and Filters */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search by name, email, address, or any field..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              
              <div className="flex gap-2">
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger className="w-32">
                    <SelectValue placeholder="Date" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Time</SelectItem>
                    <SelectItem value="week">This Week</SelectItem>
                    <SelectItem value="month">This Month</SelectItem>
                    <SelectItem value="quarter">This Quarter</SelectItem>
                  </SelectContent>
                </Select>

                <Button
                  variant="outline"
                  onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                >
                  <Filter className="h-4 w-4 mr-2" />
                  Filters
                </Button>
              </div>
            </div>

            {showAdvancedFilters && (
              <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div>
                    <label className="text-sm font-medium">Sort by</label>
                    <Select value={sortField} onValueChange={setSortField}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="createdAt">Date Created</SelectItem>
                        <SelectItem value="name">Name</SelectItem>
                        <SelectItem value="email">Email</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="text-sm font-medium">Direction</label>
                    <Select value={sortDirection} onValueChange={setSortDirection}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="desc">Newest First</SelectItem>
                        <SelectItem value="asc">Oldest First</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bulk Actions Bar */}
        {selectedItems.size > 0 && (
          <Card className="mb-6 border-blue-200 bg-blue-50">
            <CardContent className="py-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-blue-800">
                  {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''} selected
                </span>
                <div className="flex space-x-2">
                  <Button size="sm" variant="outline" onClick={handleBulkExport}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Selected
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button size="sm" variant="destructive">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Delete Selected
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete Selected Items</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete {selectedItems.size} item{selectedItems.size !== 1 ? 's' : ''}? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete} className="bg-red-600 hover:bg-red-700">
                          Delete {selectedItems.size} Item{selectedItems.size !== 1 ? 's' : ''}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Enhanced Data Tables */}
        <Tabs defaultValue="volunteers" className="space-y-4">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="volunteers" className="flex items-center">
              <Users className="h-4 w-4 mr-2" />
              Volunteers ({volunteers.length})
            </TabsTrigger>
            <TabsTrigger value="yard-signs" className="flex items-center">
              <ClipboardList className="h-4 w-4 mr-2" />
              Yard Signs ({yardSignRequests.length})
            </TabsTrigger>
            <TabsTrigger value="donations" className="flex items-center">
              <DollarSign className="h-4 w-4 mr-2" />
              Donations ({donations.length})
            </TabsTrigger>
            <TabsTrigger value="newsletter" className="flex items-center">
              <Mail className="h-4 w-4 mr-2" />
              Newsletter ({newsletterSubscriptions.length})
            </TabsTrigger>
          </TabsList>

          {/* Enhanced Volunteers Tab */}
          <TabsContent value="volunteers">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Users className="h-5 w-5 mr-2" />
                    Volunteer Management
                  </CardTitle>
                  <CardDescription>
                    Campaign volunteers with advanced management tools
                  </CardDescription>
                </div>
                <div className="flex space-x-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => toggleAllSelection(filteredVolunteers)}
                  >
                    {selectedItems.size === filteredVolunteers.length ? (
                      <CheckSquare className="h-4 w-4 mr-2" />
                    ) : (
                      <Square className="h-4 w-4 mr-2" />
                    )}
                    Select All
                  </Button>
                  <Button
                    onClick={() => exportToCSV(
                      filteredVolunteers,
                      "volunteers",
                      ["Name", "Email", "Phone", "Interests", "CreatedAt"]
                    )}
                    className="flex items-center space-x-2"
                  >
                    <Download className="h-4 w-4" />
                    <span>Export All</span>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {filteredVolunteers.map((volunteer) => (
                    <div 
                      key={volunteer.id} 
                      className={`border rounded-lg p-4 transition-all hover:shadow-md ${
                        selectedItems.has(volunteer.id) ? 'border-blue-300 bg-blue-50' : 'border-gray-200'
                      }`}
                    >
                      <div className="flex items-start space-x-4">
                        <Checkbox
                          checked={selectedItems.has(volunteer.id)}
                          onCheckedChange={() => toggleItemSelection(volunteer.id)}
                          className="mt-1"
                        />
                        
                        <div className="flex-1">
                          <div className="flex justify-between items-start">
                            <div className="flex-1">
                              <div className="flex items-center space-x-3 mb-2">
                                <h4 className="font-semibold text-lg">{volunteer.name}</h4>
                                <Badge variant="default" className="bg-green-100 text-green-800">
                                  Active
                                </Badge>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                                <div className="flex items-center space-x-2">
                                  <Mail className="h-4 w-4" />
                                  <span>{volunteer.email}</span>
                                  <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                </div>
                                
                                {volunteer.phone && (
                                  <div className="flex items-center space-x-2">
                                    <Phone className="h-4 w-4" />
                                    <span>{volunteer.phone}</span>
                                  </div>
                                )}
                                
                                <div className="flex items-center space-x-2">
                                  <Calendar className="h-4 w-4" />
                                  <span>Joined {format(new Date(volunteer.createdAt), "MMM dd, yyyy")}</span>
                                </div>
                              </div>
                              
                              <div className="flex flex-wrap gap-1 mt-3">
                                {volunteer.interests?.map((interest: string, index: number) => (
                                  <Badge key={index} variant="outline" className="text-xs">
                                    <Target className="h-3 w-3 mr-1" />
                                    {interest}
                                  </Badge>
                                ))}
                              </div>
                            </div>

                            <div className="flex space-x-1">
                              <Button size="sm" variant="ghost" title="View Details">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                title="Edit"
                                onClick={() => {
                                  setEditingVolunteer(volunteer);
                                  volunteerForm.reset({
                                    name: volunteer.name,
                                    email: volunteer.email,
                                    phone: volunteer.phone || "",
                                    interests: volunteer.interests || [],
                                  });
                                }}
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <AlertDialog>
                                <AlertDialogTrigger asChild>
                                  <Button size="sm" variant="ghost" title="Delete">
                                    <Trash2 className="h-4 w-4 text-red-500" />
                                  </Button>
                                </AlertDialogTrigger>
                                <AlertDialogContent>
                                  <AlertDialogHeader>
                                    <AlertDialogTitle>Delete Volunteer</AlertDialogTitle>
                                    <AlertDialogDescription>
                                      Are you sure you want to delete {volunteer.name}? This action cannot be undone.
                                    </AlertDialogDescription>
                                  </AlertDialogHeader>
                                  <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction 
                                      onClick={() => deleteVolunteerMutation.mutate(volunteer.id)}
                                      className="bg-red-600 hover:bg-red-700"
                                    >
                                      Delete
                                    </AlertDialogAction>
                                  </AlertDialogFooter>
                                </AlertDialogContent>
                              </AlertDialog>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {filteredVolunteers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No volunteers found</h3>
                    <p className="text-gray-600">Try adjusting your search or filter criteria.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Yard Signs Tab */}
          <TabsContent value="yard-signs">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <ClipboardList className="h-5 w-5 mr-2" />
                    Yard Sign Management
                  </CardTitle>
                  <CardDescription>Yard sign requests with delivery tracking</CardDescription>
                </div>
                <Button
                  onClick={() => exportToCSV(
                    filteredYardSigns,
                    "yard-sign-requests",
                    ["Name", "Email", "Phone", "Address", "Quantity", "CreatedAt"]
                  )}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredYardSigns.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h4 className="font-semibold text-lg">{request.name}</h4>
                            <Badge variant="outline">
                              {request.quantity} sign{request.quantity !== 1 ? 's' : ''}
                            </Badge>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>{request.email}</span>
                            </div>
                            {request.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4" />
                                <span>{request.phone}</span>
                              </div>
                            )}
                            <div className="flex items-center space-x-2">
                              <MapPin className="h-4 w-4" />
                              <span>{request.address}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(request.createdAt), "MMM dd, yyyy 'at' h:mm a")}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setEditingYardSign(request);
                              yardSignForm.reset({
                                name: request.name,
                                email: request.email,
                                phone: request.phone || "",
                                address: request.address,
                                quantity: request.quantity,
                              });
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Yard Sign Request</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the request from {request.name}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteYardSignMutation.mutate(request.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Donations Tab */}
          <TabsContent value="donations">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <DollarSign className="h-5 w-5 mr-2" />
                    Donation Management
                  </CardTitle>
                  <CardDescription>Campaign donations and payment tracking</CardDescription>
                </div>
                <Button
                  onClick={() => exportToCSV(
                    filteredDonations,
                    "donations",
                    ["Email", "Amount", "Status", "StripePaymentIntentId", "CreatedAt"]
                  )}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredDonations.map((donation) => (
                    <div key={donation.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start">
                        <div>
                          <div className="flex items-center space-x-3">
                            <h4 className="font-semibold text-lg">${(donation.amount / 100).toFixed(2)}</h4>
                            <Badge 
                              variant={donation.status === "succeeded" ? "default" : 
                                     donation.status === "pending" ? "secondary" : "destructive"}
                            >
                              {donation.status}
                            </Badge>
                          </div>
                          <div className="text-sm text-gray-600 space-y-1 mt-2">
                            <div className="flex items-center space-x-2">
                              <Mail className="h-4 w-4" />
                              <span>{donation.email}</span>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Calendar className="h-4 w-4" />
                              <span>{format(new Date(donation.createdAt), "MMM dd, yyyy 'at' h:mm a")}</span>
                            </div>
                            {donation.stripePaymentIntentId && (
                              <div className="text-xs text-gray-500">
                                Payment ID: {donation.stripePaymentIntentId}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Enhanced Newsletter Tab */}
          <TabsContent value="newsletter">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="flex items-center">
                    <Mail className="h-5 w-5 mr-2" />
                    Newsletter Management
                  </CardTitle>
                  <CardDescription>Campaign newsletter subscribers</CardDescription>
                </div>
                <Button
                  onClick={() => exportToCSV(
                    filteredNewsletter,
                    "newsletter-subscribers",
                    ["Email", "CreatedAt"]
                  )}
                  className="flex items-center space-x-2"
                >
                  <Download className="h-4 w-4" />
                  <span>Export CSV</span>
                </Button>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {filteredNewsletter.map((subscription) => (
                    <div key={subscription.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <Mail className="h-4 w-4 text-gray-500" />
                          <span className="font-medium">{subscription.email}</span>
                        </div>
                        <div className="flex items-center space-x-4">
                          <div className="text-sm text-gray-600">
                            {format(new Date(subscription.createdAt), "MMM dd, yyyy")}
                          </div>
                          <AlertDialog>
                            <AlertDialogTrigger asChild>
                              <Button size="sm" variant="outline">
                                <Trash2 className="h-4 w-4 text-red-500" />
                              </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                              <AlertDialogHeader>
                                <AlertDialogTitle>Delete Newsletter Subscription</AlertDialogTitle>
                                <AlertDialogDescription>
                                  Are you sure you want to delete the subscription for {subscription.email}? This action cannot be undone.
                                </AlertDialogDescription>
                              </AlertDialogHeader>
                              <AlertDialogFooter>
                                <AlertDialogCancel>Cancel</AlertDialogCancel>
                                <AlertDialogAction 
                                  onClick={() => deleteNewsletterMutation.mutate(subscription.id)}
                                  className="bg-red-600 hover:bg-red-700"
                                >
                                  Delete
                                </AlertDialogAction>
                              </AlertDialogFooter>
                            </AlertDialogContent>
                          </AlertDialog>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Edit Volunteer Dialog */}
        <Dialog open={!!editingVolunteer} onOpenChange={() => setEditingVolunteer(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Volunteer</DialogTitle>
              <DialogDescription>
                Update volunteer information
              </DialogDescription>
            </DialogHeader>
            <Form {...volunteerForm}>
              <form onSubmit={volunteerForm.handleSubmit(handleVolunteerEdit)} className="space-y-4">
                <FormField
                  control={volunteerForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={volunteerForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={volunteerForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={volunteerForm.control}
                  name="interests"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Interests</FormLabel>
                      <FormControl>
                        <Textarea 
                          {...field} 
                          value={field.value?.join(", ") || ""}
                          onChange={(e) => field.onChange(e.target.value.split(", ").filter(Boolean))}
                          placeholder="Enter interests separated by commas"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditingVolunteer(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Edit Yard Sign Dialog */}
        <Dialog open={!!editingYardSign} onOpenChange={() => setEditingYardSign(null)}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle>Edit Yard Sign Request</DialogTitle>
              <DialogDescription>
                Update yard sign request information
              </DialogDescription>
            </DialogHeader>
            <Form {...yardSignForm}>
              <form onSubmit={yardSignForm.handleSubmit(handleYardSignEdit)} className="space-y-4">
                <FormField
                  control={yardSignForm.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={yardSignForm.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input type="email" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={yardSignForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Phone (optional)</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={yardSignForm.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Address</FormLabel>
                      <FormControl>
                        <Textarea {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={yardSignForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantity</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          {...field}
                          onChange={(e) => field.onChange(parseInt(e.target.value) || 1)}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setEditingYardSign(null)}>
                    Cancel
                  </Button>
                  <Button type="submit">Save Changes</Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>

        {/* Settings Dialog */}
        <Dialog open={showSettings} onOpenChange={setShowSettings}>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                <Settings className="h-5 w-5 mr-2" />
                Admin Settings
              </DialogTitle>
              <DialogDescription>
                Configure admin panel preferences and system settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-6">
              {/* Export Settings */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Export Settings</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Default export format</label>
                    <Select defaultValue="csv">
                      <SelectTrigger className="w-32">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="csv">CSV</SelectItem>
                        <SelectItem value="xlsx">Excel</SelectItem>
                        <SelectItem value="json">JSON</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Include timestamps in filename</label>
                    <Checkbox defaultChecked />
                  </div>
                </div>
              </div>

              {/* Display Settings */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Display Settings</h4>
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Items per page</label>
                    <Select defaultValue="25">
                      <SelectTrigger className="w-20">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="10">10</SelectItem>
                        <SelectItem value="25">25</SelectItem>
                        <SelectItem value="50">50</SelectItem>
                        <SelectItem value="100">100</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Auto-refresh data</label>
                    <Checkbox />
                  </div>
                  <div className="flex items-center justify-between">
                    <label className="text-sm">Show advanced filters by default</label>
                    <Checkbox />
                  </div>
                </div>
              </div>

              {/* Data Management */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">Data Management</h4>
                <div className="space-y-2">
                  <Button variant="outline" className="w-full justify-start">
                    <Download className="h-4 w-4 mr-2" />
                    Export All Data
                  </Button>
                  <Button variant="outline" className="w-full justify-start">
                    <FileText className="h-4 w-4 mr-2" />
                    Generate Reports
                  </Button>
                  <Button variant="outline" className="w-full justify-start text-red-600 hover:text-red-700">
                    <Trash2 className="h-4 w-4 mr-2" />
                    Clear Old Data (90+ days)
                  </Button>
                </div>
              </div>

              {/* System Info */}
              <div className="space-y-3">
                <h4 className="text-sm font-medium">System Information</h4>
                <div className="bg-gray-50 p-3 rounded text-xs space-y-1">
                  <div className="flex justify-between">
                    <span>Total Records:</span>
                    <span>{volunteers.length + yardSignRequests.length + donations.length + newsletterSubscriptions.length}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last Updated:</span>
                    <span>{format(new Date(), "MMM dd, yyyy 'at' h:mm a")}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Version:</span>
                    <span>v1.0.0</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <Button variant="outline" onClick={() => setShowSettings(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({ title: "Settings saved", description: "Your preferences have been updated." });
                setShowSettings(false);
              }}>
                Save Settings
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
