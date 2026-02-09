import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { ManualOrderProcessor } from "@/components/admin/ManualOrderProcessor";
import { ProductCleanup } from "@/components/admin/ProductCleanup";
import { PrintifyWebhookSetup } from "@/components/admin/PrintifyWebhookSetup";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Plus, Trash2, Edit, Package, ShoppingCart, Tag, Download, Mail } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { isAdminEmail } from "@/lib/admin";

const AdminStoreDashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loading, setLoading] = useState(true);
  const [discounts, setDiscounts] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [digitalOrders, setDigitalOrders] = useState<any[]>([]);
  const [isCreatingDiscount, setIsCreatingDiscount] = useState(false);
  const [resendingOrderId, setResendingOrderId] = useState<string | null>(null);

  const [newDiscount, setNewDiscount] = useState({
    code: "",
    discount_type: "percentage",
    discount_value: "",
    min_purchase_amount: "0",
    max_uses: "",
    valid_until: "",
    applies_to: "all",
    is_active: true,
  });

  useEffect(() => {
    checkAdminStatus();
  }, []);

  const checkAdminStatus = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        navigate("/auth");
        return;
      }

      // Explicitly allow the requested admin email
      if (isAdminEmail(user.email)) {
        setIsAdmin(true);
        loadDashboardData();
        return;
      }

      const { data: roleData } = await supabase
        .from("user_roles")
        .select("role")
        .eq("user_id", user.id)
        .eq("role", "admin")
        .single();

      if (!roleData) {
        toast({
          title: "Access Denied",
          description: "You don't have permission to access this page.",
          variant: "destructive",
        });
        navigate("/");
        return;
      }

      setIsAdmin(true);
      loadDashboardData();
    } catch (error) {
      console.error("Error checking admin status:", error);
      navigate("/");
    }
  };

  const loadDashboardData = async () => {
    setLoading(true);
    try {
      // Load discount codes
      const { data: discountData } = await supabase
        .from("discount_codes")
        .select("*")
        .order("created_at", { ascending: false });

      // Load orders
      const { data: ordersData } = await supabase
        .from("printify_orders")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(50);

      // Load products
      const { data: productsData } = await supabase
        .from("printify_products")
        .select("*")
        .order("created_at", { ascending: false });

      // Load digital orders (grouped by order_id)
      const { data: digitalOrdersData } = await supabase
        .from("digital_downloads")
        .select("*")
        .order("created_at", { ascending: false });

      // Group digital orders by order_id
      const groupedDigitalOrders = digitalOrdersData?.reduce((acc: any, download: any) => {
        if (!acc[download.order_id]) {
          acc[download.order_id] = {
            order_id: download.order_id,
            user_email: download.user_email,
            created_at: download.created_at,
            items: []
          };
        }
        acc[download.order_id].items.push(download);
        return acc;
      }, {});

      setDiscounts(discountData || []);
      setOrders(ordersData || []);
      setProducts(productsData || []);
      setDigitalOrders(Object.values(groupedDigitalOrders || {}));
    } catch (error) {
      console.error("Error loading dashboard data:", error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCreateDiscount = async () => {
    setIsCreatingDiscount(true);
    try {
      const { error } = await supabase.from("discount_codes").insert({
        code: newDiscount.code.toUpperCase(),
        discount_type: newDiscount.discount_type,
        discount_value: parseFloat(newDiscount.discount_value),
        min_purchase_amount: parseInt(newDiscount.min_purchase_amount) || 0,
        max_uses: newDiscount.max_uses ? parseInt(newDiscount.max_uses) : null,
        valid_until: newDiscount.valid_until || null,
        applies_to: newDiscount.applies_to,
        is_active: newDiscount.is_active,
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Discount code created successfully!",
      });

      setNewDiscount({
        code: "",
        discount_type: "percentage",
        discount_value: "",
        min_purchase_amount: "0",
        max_uses: "",
        valid_until: "",
        applies_to: "all",
        is_active: true,
      });

      loadDashboardData();
    } catch (error) {
      console.error("Error creating discount:", error);
      toast({
        title: "Error",
        description: "Failed to create discount code.",
        variant: "destructive",
      });
    } finally {
      setIsCreatingDiscount(false);
    }
  };

  const toggleDiscountStatus = async (id: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from("discount_codes")
        .update({ is_active: !currentStatus })
        .eq("id", id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Discount status updated.",
      });

      loadDashboardData();
    } catch (error) {
      console.error("Error updating discount:", error);
      toast({
        title: "Error",
        description: "Failed to update discount status.",
        variant: "destructive",
      });
    }
  };

  const resendDigitalDeliveryEmail = async (orderId: string) => {
    try {
      setResendingOrderId(orderId);

      const { error } = await supabase.functions.invoke('resend-digital-delivery', {
        body: { order_id: orderId }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Digital delivery email resent successfully.",
      });

      loadDashboardData();
    } catch (error: any) {
      console.error("Error resending email:", error);
      toast({
        title: "Error",
        description: error.message || "Failed to resend email.",
        variant: "destructive",
      });
    } finally {
      setResendingOrderId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Store Management</h1>
      </div>

      <Tabs defaultValue="manual-process" className="space-y-4">
        <TabsList>
          <TabsTrigger value="manual-process" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Manual Process
          </TabsTrigger>
          <TabsTrigger value="discounts" className="flex items-center gap-2">
            <Tag className="h-4 w-4" />
            Discount Codes
          </TabsTrigger>
          <TabsTrigger value="orders" className="flex items-center gap-2">
            <ShoppingCart className="h-4 w-4" />
            Physical Orders
          </TabsTrigger>
          <TabsTrigger value="digital-orders" className="flex items-center gap-2">
            <Download className="h-4 w-4" />
            Digital Orders
          </TabsTrigger>
          <TabsTrigger value="products" className="flex items-center gap-2">
            <Package className="h-4 w-4" />
            Products
          </TabsTrigger>
        </TabsList>

        {/* Manual Process Tab */}
        <TabsContent value="manual-process" className="space-y-4">
          <PrintifyWebhookSetup />
          <ProductCleanup />
          <ManualOrderProcessor />
        </TabsContent>

        {/* Discount Codes Tab */}
        <TabsContent value="discounts" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Discount Codes</CardTitle>
                  <CardDescription>Manage promotional discount codes</CardDescription>
                </div>
                <Dialog>
                  <DialogTrigger asChild>
                    <Button>
                      <Plus className="h-4 w-4 mr-2" />
                      Create Discount
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Create Discount Code</DialogTitle>
                      <DialogDescription>
                        Create a new discount code for your store
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="code">Discount Code *</Label>
                          <Input
                            id="code"
                            placeholder="SUMMER2025"
                            value={newDiscount.code}
                            onChange={(e) =>
                              setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })
                            }
                            className="uppercase"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="type">Type *</Label>
                          <Select
                            value={newDiscount.discount_type}
                            onValueChange={(value) =>
                              setNewDiscount({ ...newDiscount, discount_type: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="percentage">Percentage</SelectItem>
                              <SelectItem value="fixed">Fixed Amount</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="value">
                            {newDiscount.discount_type === "percentage" ? "Percentage" : "Amount ($)"} *
                          </Label>
                          <Input
                            id="value"
                            type="number"
                            placeholder={newDiscount.discount_type === "percentage" ? "10" : "5"}
                            value={newDiscount.discount_value}
                            onChange={(e) =>
                              setNewDiscount({ ...newDiscount, discount_value: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="applies">Applies To</Label>
                          <Select
                            value={newDiscount.applies_to}
                            onValueChange={(value) =>
                              setNewDiscount({ ...newDiscount, applies_to: value })
                            }
                          >
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">All Products</SelectItem>
                              <SelectItem value="courses">Courses Only</SelectItem>
                              <SelectItem value="merchandise">Merchandise Only</SelectItem>
                              <SelectItem value="digital">Digital Products Only</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="min">Min Purchase ($)</Label>
                          <Input
                            id="min"
                            type="number"
                            placeholder="0"
                            value={newDiscount.min_purchase_amount}
                            onChange={(e) =>
                              setNewDiscount({ ...newDiscount, min_purchase_amount: e.target.value })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="max">Max Uses (optional)</Label>
                          <Input
                            id="max"
                            type="number"
                            placeholder="Unlimited"
                            value={newDiscount.max_uses}
                            onChange={(e) =>
                              setNewDiscount({ ...newDiscount, max_uses: e.target.value })
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="expiry">Expiry Date (optional)</Label>
                        <Input
                          id="expiry"
                          type="datetime-local"
                          value={newDiscount.valid_until}
                          onChange={(e) =>
                            setNewDiscount({ ...newDiscount, valid_until: e.target.value })
                          }
                        />
                      </div>

                      <div className="flex items-center space-x-2">
                        <Switch
                          id="active"
                          checked={newDiscount.is_active}
                          onCheckedChange={(checked) =>
                            setNewDiscount({ ...newDiscount, is_active: checked })
                          }
                        />
                        <Label htmlFor="active">Active</Label>
                      </div>

                      <Button
                        onClick={handleCreateDiscount}
                        disabled={
                          !newDiscount.code ||
                          !newDiscount.discount_value ||
                          isCreatingDiscount
                        }
                        className="w-full"
                      >
                        {isCreatingDiscount && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                        Create Discount Code
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Applies To</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {discounts.map((discount) => (
                    <TableRow key={discount.id}>
                      <TableCell className="font-mono font-bold">{discount.code}</TableCell>
                      <TableCell className="capitalize">{discount.discount_type}</TableCell>
                      <TableCell>
                        {discount.discount_type === "percentage"
                          ? `${discount.discount_value}%`
                          : `$${discount.discount_value}`}
                      </TableCell>
                      <TableCell>
                        {discount.current_uses} / {discount.max_uses || "∞"}
                      </TableCell>
                      <TableCell className="capitalize">{discount.applies_to}</TableCell>
                      <TableCell>
                        <Badge variant={discount.is_active ? "default" : "secondary"}>
                          {discount.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <Switch
                          checked={discount.is_active}
                          onCheckedChange={() =>
                            toggleDiscountStatus(discount.id, discount.is_active)
                          }
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                  {discounts.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center text-muted-foreground">
                        No discount codes yet. Create your first one!
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Orders Tab */}
        <TabsContent value="orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Orders</CardTitle>
              <CardDescription>View and manage customer orders</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead>Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orders.map((order) => (
                    <TableRow key={order.id}>
                      <TableCell className="font-mono text-xs">
                        {order.external_id}
                      </TableCell>
                      <TableCell>
                        <Badge>{order.status}</Badge>
                      </TableCell>
                      <TableCell>
                        ${((order.total_price || 0) / 100).toFixed(2)}
                      </TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {orders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No orders yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Digital Orders Tab */}
        <TabsContent value="digital-orders" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Digital Orders</CardTitle>
              <CardDescription>Manage digital product deliveries</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Order ID</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead>Items</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {digitalOrders.map((order: any) => (
                    <TableRow key={order.order_id}>
                      <TableCell className="font-mono text-xs">
                        {order.order_id.substring(order.order_id.length - 8).toUpperCase()}
                      </TableCell>
                      <TableCell>{order.user_email}</TableCell>
                      <TableCell>{order.items.length} item(s)</TableCell>
                      <TableCell>
                        {new Date(order.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => resendDigitalDeliveryEmail(order.order_id)}
                          disabled={resendingOrderId === order.order_id}
                        >
                          {resendingOrderId === order.order_id ? (
                            <Loader2 className="h-4 w-4 animate-spin" />
                          ) : (
                            <>
                              <Mail className="h-4 w-4 mr-2" />
                              Resend Email
                            </>
                          )}
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {digitalOrders.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground">
                        No digital orders yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Products</CardTitle>
              <CardDescription>Manage your product catalog</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Title</TableHead>
                    <TableHead>Printify ID</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {products.map((product) => (
                    <TableRow key={product.id}>
                      <TableCell>{product.title}</TableCell>
                      <TableCell className="font-mono text-xs">
                        {product.printify_id}
                      </TableCell>
                      <TableCell>
                        <Badge variant={product.is_active ? "default" : "secondary"}>
                          {product.is_active ? "Active" : "Inactive"}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {new Date(product.created_at).toLocaleDateString()}
                      </TableCell>
                    </TableRow>
                  ))}
                  {products.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground">
                        No products yet
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminStoreDashboard;
