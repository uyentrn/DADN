import React, { useState } from 'react';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Button } from '../components/ui/button';
import { Input } from '../components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../components/ui/dialog';
import { Label } from '../components/ui/label';
import { Badge } from '../components/ui/badge';
import { 
  Plus, 
  Search, 
  Edit2, 
  Trash2, 
  ShieldAlert, 
  UserCircle 
} from 'lucide-react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'Admin' | 'Analyst' | 'Viewer';
  status: 'Active' | 'Inactive';
  lastActive: string;
}
const searchInputStyle = { paddingLeft: '48px', height: '48px', borderRadius: '16px' };

const INITIAL_USERS: User[] = [
  {
    id: '1',
    name: 'Sarah Jenkins',
    email: 'sarah.j@waterquality.gov',
    role: 'Admin',
    status: 'Active',
    lastActive: 'Just now',
  },
  {
    id: '2',
    name: 'Michael Chang',
    email: 'm.chang@waterquality.gov',
    role: 'Analyst',
    status: 'Active',
    lastActive: '2 hours ago',
  },
  {
    id: '3',
    name: 'Elena Rodriguez',
    email: 'elena.r@waterquality.gov',
    role: 'Viewer',
    status: 'Inactive',
    lastActive: '3 days ago',
  },
];

export function Admin() {
  const [users, setUsers] = useState<User[]>(INITIAL_USERS);
  const [searchQuery, setSearchQuery] = useState('');
  
  // Dialog states
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  
  // Form states
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'Viewer' as User['role'],
    status: 'Active' as User['status'],
  });

  const filteredUsers = users.filter(user => 
    user.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
    user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleOpenDialog = (user?: User) => {
    if (user) {
      setEditingUser(user);
      setFormData({
        name: user.name,
        email: user.email,
        role: user.role,
        status: user.status,
      });
    } else {
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'Viewer',
        status: 'Active',
      });
    }
    setIsDialogOpen(true);
  };

  const handleSaveUser = () => {
    if (editingUser) {
      setUsers(users.map(u => u.id === editingUser.id ? { ...u, ...formData } : u));
    } else {
      const newUser: User = {
        id: Math.random().toString(36).substr(2, 9),
        ...formData,
        lastActive: 'Never',
      };
      setUsers([...users, newUser]);
    }
    setIsDialogOpen(false);
  };

  const handleDeleteUser = (id: string) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      setUsers(users.filter(u => u.id !== id));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-blue-50 to-blue-100 flex flex-col">
      <Header />
      
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="flex flex-row justify-between items-center gap-4">
          <div>
            <h2 className="text-cyan-900 text-4xl font-black flex items-center justify-center md:justify-start gap-3">
              <ShieldAlert className="w-8 h-8 text-cyan-00" />
              User Management
            </h2>
            <p className="text-slate-600 mt-1">Manage system access, roles, and permissions.</p>
          </div>
          
          <Button 
            onClick={() => handleOpenDialog()} 
            style={{ backgroundColor: '#2563eb', color: 'white' }}
            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-xl flex items-center shadow-md shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" />
            Add New User
          </Button>
        </div>

        <div className="bg-white/80 backdrop-blur-xl border border-white/40 shadow-xl rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="relative w-full max-w-md">
              <div className="absolute inset-y-0 left-6 flex items-center pointer-events-none">
                <Search className="w-5 h-5 text-slate-400" />
              </div>
              <Input 
                placeholder="Search users by name or email..." 
                // className="pl-11 h-12 bg-white border-slate-200 rounded-2xl focus:ring-2 focus:ring-blue-400"
                style={searchInputStyle}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
          
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/80">
                  <TableHead>User</TableHead>
                  <TableHead className="text-center font-bold">Role</TableHead>
                  <TableHead className="text-center font-bold">Status</TableHead>
                  <TableHead className="text-center font-bold">Last Active</TableHead>
                  <TableHead className="text-center font-bold">Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-slate-500">
                      No users found matching "{searchQuery}"
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredUsers.map((user) => (
                    <TableRow key={user.id} className="hover:bg-slate-50/50">
                      <TableCell>
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700">
                            <UserCircle className="w-6 h-6" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900">{user.name}</div>
                            <div className="text-sm text-slate-500">{user.email}</div>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        {(() => {
                          const styles = {
                            Admin: { backgroundColor: '#f3e8ff', color: '#7e22ce', border: '1px solid #e9d5ff' },
                            Analyst: { backgroundColor: '#dbeafe', color: '#1d4ed8', border: '1px solid #bfdbfe' },
                            Viewer: { backgroundColor: '#f1f5f9', color: '#475569', border: '1px solid #e2e8f0' },
                          };
                          const currentStyle = styles[user.role] || styles.Viewer;
                          return (
                            <Badge
                              style={currentStyle}
                              className="px-2 py-3 rounded-md font-medium shadow-none rounded-xl"
                            >
                              {user.role}
                            </Badge>
                          );
                        })()}
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="secondary" className={
                          user.status === 'Active' 
                            ? 'bg-green-100 text-green-700 hover:bg-green-100' 
                            : 'bg-slate-100 text-slate-700 hover:bg-slate-100'
                        }>
                          <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.status === 'Active' ? 'bg-green-500' : 'bg-slate-400'}`}></span>
                          {user.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center text-slate-500 text-sm">
                        {user.lastActive}
                      </TableCell>
                      <TableCell className="text-center">
                        <div className="flex justify-center gap-3">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleOpenDialog(user)}
                            className="text-slate-500 hover:text-blue-600 hover:bg-blue-300"
                          >
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon"
                            onClick={() => handleDeleteUser(user.id)}
                            className="text-slate-500 hover:text-red-600 hover:bg-red-50"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </main>

      <Footer />

      {/* User Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent 
          className="sm:max-w-[425px] bg-white text-slate-900 shadow-2xl border border-slate-200"
          style={{ zIndex: 9999 }}
        >
          <DialogHeader>
            <DialogTitle>{editingUser ? 'Edit User' : 'Add New User'}</DialogTitle>
            <DialogDescription>
              {editingUser 
                ? "Update the user's details and permissions here." 
                : "Create a new user account to grant access to the dashboard."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Full Name</Label>
              <Input 
                id="name" 
                value={formData.name}
                onChange={e => setFormData({...formData, name: e.target.value})}
                placeholder="e.g. Jane Doe"
              />
            </div>
            
            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input 
                id="email" 
                type="email"
                value={formData.email}
                onChange={e => setFormData({...formData, email: e.target.value})}
                placeholder="e.g. jane@waterquality.gov"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="role">Role</Label>
                <select 
                  id="role"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.role}
                  onChange={e => setFormData({...formData, role: e.target.value as User['role']})}
                >
                  <option value="Admin">Admin</option>
                  <option value="Analyst">Analyst</option>
                  <option value="Viewer">Viewer</option>
                </select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <select 
                  id="status"
                  className="flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={formData.status}
                  onChange={e => setFormData({...formData, status: e.target.value as User['status']})}
                >
                  <option value="Active">Active</option>
                  <option value="Inactive">Inactive</option>
                </select>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveUser} className="bg-blue-600 hover:bg-blue-700 text-white">
              {editingUser ? 'Save Changes' : 'Create User'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
