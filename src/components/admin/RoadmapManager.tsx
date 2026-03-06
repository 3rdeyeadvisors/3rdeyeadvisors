import { useState } from 'react';
import { Plus, Trash2, Loader2, Map, ArrowUpDown, MessageSquare } from 'lucide-react';
import { useRoadmapVotes, useRoadmapAdmin } from '@/hooks/useRoadmapVotes';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { FeatureSuggestionsManager } from './FeatureSuggestionsManager';

const statusOptions = [
  { value: 'proposed', label: 'Proposed', className: 'bg-muted text-muted-foreground' },
  { value: 'in_progress', label: 'In Progress', className: 'bg-amber-500/20 text-amber-400' },
  { value: 'completed', label: 'Completed', className: 'bg-emerald-500/20 text-emerald-400' },
];

export const RoadmapManager = () => {
  const { items, loading, refreshItems } = useRoadmapVotes();
  const { loading: adminLoading, createItem, updateItemStatus, deleteItem } = useRoadmapAdmin();

  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const handleCreate = async () => {
    if (!newTitle.trim()) return;

    const itemId = await createItem(newTitle.trim(), newDescription.trim());
    if (itemId) {
      setNewTitle('');
      setNewDescription('');
      setIsCreating(false);
      refreshItems();
    }
  };

  const handleStatusChange = async (itemId: string, newStatus: string) => {
    const success = await updateItemStatus(
      itemId,
      newStatus as 'proposed' | 'in_progress' | 'completed'
    );
    if (success) {
      refreshItems();
    }
  };

  const handleDelete = async (itemId: string) => {
    const success = await deleteItem(itemId);
    if (success) {
      refreshItems();
    }
  };

  const getStatusBadge = (status: string | null) => {
    const statusInfo = statusOptions.find((s) => s.value === status) || statusOptions[0];
    return (
      <Badge variant="outline" className={statusInfo.className}>
        {statusInfo.label}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2 rounded-lg bg-primary/10">
          <Map className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h2 className="text-2xl font-consciousness font-bold">Roadmap Manager</h2>
          <p className="text-sm text-muted-foreground">
            Manage platform features and community suggestions
          </p>
        </div>
      </div>

      {/* Tabs for Roadmap Items and Suggestions */}
      <Tabs defaultValue="roadmap" className="w-full">
        <TabsList className="grid w-full max-w-md grid-cols-2">
          <TabsTrigger value="roadmap" className="gap-2">
            <Map className="w-4 h-4" />
            Roadmap Items
          </TabsTrigger>
          <TabsTrigger value="suggestions" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            Suggestions
          </TabsTrigger>
        </TabsList>

        <TabsContent value="roadmap" className="space-y-6 mt-6">
          {/* Add Feature Button */}
          <div className="flex justify-end">
            <Button onClick={() => setIsCreating(!isCreating)}>
              <Plus className="w-4 h-4 mr-2" />
              Add Feature
            </Button>
          </div>

          {/* Create Form */}
          {isCreating && (
            <Card className="border-primary/30">
              <CardHeader>
                <CardTitle className="text-lg">New Roadmap Item</CardTitle>
                <CardDescription>
                  Add a new feature for premium members to vote on
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Title</label>
                  <Input
                    placeholder="Feature title..."
                    value={newTitle}
                    onChange={(e) => setNewTitle(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Description</label>
                  <Textarea
                    placeholder="Describe the feature..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    rows={3}
                  />
                </div>
                <div className="flex items-center gap-2 pt-2">
                  <Button onClick={handleCreate} disabled={adminLoading || !newTitle.trim()}>
                    {adminLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    ) : null}
                    Create Item
                  </Button>
                  <Button variant="outline" onClick={() => setIsCreating(false)}>
                    Cancel
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Items Table */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">All Roadmap Items</CardTitle>
                  <CardDescription>
                    {items.length} item{items.length !== 1 ? 's' : ''} • Sorted by votes
                  </CardDescription>
                </div>
                <Button variant="outline" size="sm" onClick={() => refreshItems()} disabled={loading}>
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowUpDown className="w-4 h-4" />}
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-12 text-muted-foreground">
                  <Map className="w-10 h-10 mx-auto mb-3 opacity-50" />
                  <p>No roadmap items yet</p>
                  <p className="text-sm">Click "Add Feature" to create one</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Title</TableHead>
                        <TableHead>Description</TableHead>
                        <TableHead className="text-center">Votes</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {items.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className="font-medium max-w-[200px]">
                            <span className="line-clamp-2">{item.title}</span>
                          </TableCell>
                          <TableCell className="max-w-[300px]">
                            <span className="text-sm text-muted-foreground line-clamp-2">
                              {item.description || '—'}
                            </span>
                          </TableCell>
                          <TableCell className="text-center">
                            <div className="flex flex-col items-center gap-0.5">
                              <span className="font-medium">
                                <span className="text-emerald-400">+{item.yes_votes}</span>
                                <span className="text-muted-foreground mx-1">/</span>
                                <span className="text-red-400">-{item.no_votes}</span>
                              </span>
                              <span className={`text-xs ${item.net_votes >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                net: {item.net_votes >= 0 ? '+' : ''}{item.net_votes}
                              </span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={item.status || 'proposed'}
                              onValueChange={(value) => handleStatusChange(item.id, value)}
                              disabled={adminLoading}
                            >
                              <SelectTrigger className="w-[140px]">
                                <SelectValue>{getStatusBadge(item.status)}</SelectValue>
                              </SelectTrigger>
                              <SelectContent>
                                {statusOptions.map((option) => (
                                  <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell className="text-right">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive hover:text-destructive hover:bg-destructive/10"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Delete Roadmap Item</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will permanently delete "{item.title}" and all its votes.
                                    This action cannot be undone.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => handleDelete(item.id)}
                                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                  >
                                    Delete
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="suggestions" className="mt-6">
          <FeatureSuggestionsManager />
        </TabsContent>
      </Tabs>
    </div>
  );
};

