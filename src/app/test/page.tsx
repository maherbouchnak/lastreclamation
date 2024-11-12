'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

// Add admin type
type Admin = {
  id: string;
  email: string;
  full_name: string;
  role: 'admin';
  created_at: string;
}

export default function TestPage() {
  const [users, setUsers] = useState<any[]>([])
  const [agencies, setAgencies] = useState<any[]>([])
  const [complaints, setComplaints] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Form states
  const [newUser, setNewUser] = useState({ email: '', full_name: '', role: 'user' })
  const [newAgency, setNewAgency] = useState({ name: '', state: '' })
  const [newComplaint, setNewComplaint] = useState({
    user_id: '',
    agency_id: '',
    account_number: '',
    type: '',
    status: 'En attente',
    description: ''
  })

  const [connectionStatus, setConnectionStatus] = useState<'untested' | 'success' | 'error'>('untested')
  const [connectionError, setConnectionError] = useState<string | null>(null)

  // Add admin state
  const [admins, setAdmins] = useState<Admin[]>([])
  const [newAdmin, setNewAdmin] = useState({
    email: '',
    full_name: '',
    password: '' // for creating new admin
  })

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      setLoading(true)
      
      // Fetch admins
      const { data: adminData, error: adminError } = await supabase
        .from('users')
        .select('*')
        .eq('role', 'admin')
      if (adminError) throw adminError
      setAdmins(adminData)

      // Fetch users
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
      if (userError) throw userError
      setUsers(userData)

      // Fetch agencies
      const { data: agencyData, error: agencyError } = await supabase
        .from('agencies')
        .select('*')
      if (agencyError) throw agencyError
      setAgencies(agencyData)

      // Fetch complaints with relations
      const { data: complaintData, error: complaintError } = await supabase
        .from('complaints')
        .select(`
          *,
          users (full_name),
          agencies (name)
        `)
      if (complaintError) throw complaintError
      setComplaints(complaintData)

    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  const addUser = async () => {
    try {
      const { error } = await supabase
        .from('users')
        .insert([newUser])
      if (error) throw error
      fetchData()
      setNewUser({ email: '', full_name: '', role: 'user' })
    } catch (error: any) {
      setError(error.message)
    }
  }

  const addAgency = async () => {
    try {
      const { error } = await supabase
        .from('agencies')
        .insert([newAgency])
      if (error) throw error
      fetchData()
      setNewAgency({ name: '', state: '' })
    } catch (error: any) {
      setError(error.message)
    }
  }

  const addComplaint = async () => {
    try {
      const { error } = await supabase
        .from('complaints')
        .insert([newComplaint])
      if (error) throw error
      fetchData()
      setNewComplaint({
        user_id: '',
        agency_id: '',
        account_number: '',
        type: '',
        status: 'En attente',
        description: ''
      })
    } catch (error: any) {
      setError(error.message)
    }
  }

  const deleteItem = async (table: string, id: string | number) => {
    try {
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', id)
      if (error) throw error
      fetchData()
    } catch (error: any) {
      setError(error.message)
    }
  }

  const testConnection = async () => {
    try {
      setConnectionStatus('untested')
      setConnectionError(null)
      
      // Test the connection by making a simple query
      const { data, error } = await supabase
        .from('users')
        .select('count')
        .single()

      if (error) throw error

      setConnectionStatus('success')
      alert('Connection to Supabase successful!')
    } catch (error: any) {
      console.error('Connection test error:', error)
      setConnectionStatus('error')
      setConnectionError(error.message)
      alert('Connection test failed. Check console for details.')
    }
  }

  // Add admin management functions
  const addAdmin = async () => {
    try {
      // First create auth user
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: newAdmin.email,
        password: newAdmin.password,
      })
      if (authError) throw authError

      // Then create admin record
      const { error: adminError } = await supabase
        .from('users')
        .insert([{
          id: authData.user?.id,
          email: newAdmin.email,
          full_name: newAdmin.full_name,
          role: 'admin'
        }])
      if (adminError) throw adminError

      fetchData()
      setNewAdmin({ email: '', full_name: '', password: '' })
      alert('Admin created successfully!')
    } catch (error: any) {
      setError(error.message)
      alert('Failed to create admin: ' + error.message)
    }
  }

  const deleteAdmin = async (id: string) => {
    try {
      // Delete from users table
      const { error: userError } = await supabase
        .from('users')
        .delete()
        .eq('id', id)
      if (userError) throw userError

      // Delete from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(id)
      if (authError) throw authError

      fetchData()
    } catch (error: any) {
      setError(error.message)
      alert('Failed to delete admin: ' + error.message)
    }
  }

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Database Test Page</h1>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div 
              className={`w-3 h-3 rounded-full ${
                connectionStatus === 'untested' ? 'bg-gray-400' :
                connectionStatus === 'success' ? 'bg-green-500' :
                'bg-red-500'
              }`}
            />
            <span className="text-sm">
              {connectionStatus === 'untested' ? 'Not Tested' :
               connectionStatus === 'success' ? 'Connected' :
               'Connection Failed'}
            </span>
          </div>
          <Button 
            onClick={testConnection}
            variant={connectionStatus === 'success' ? 'outline' : 'default'}
            className={connectionStatus === 'error' ? 'bg-red-500 hover:bg-red-600' : ''}
          >
            Test Connection
          </Button>
        </div>
      </div>
      
      {connectionError && (
        <Card className="mb-6 border-red-500">
          <CardHeader>
            <CardTitle className="text-red-500">Connection Error</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-red-500">{connectionError}</p>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="admins">
        <TabsList>
          <TabsTrigger value="admins">Admins</TabsTrigger>
          <TabsTrigger value="users">Users</TabsTrigger>
          <TabsTrigger value="agencies">Agencies</TabsTrigger>
          <TabsTrigger value="complaints">Complaints</TabsTrigger>
        </TabsList>

        <TabsContent value="admins">
          <Card>
            <CardHeader>
              <CardTitle>Administrators</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Email"
                  value={newAdmin.email}
                  onChange={(e) => setNewAdmin({ ...newAdmin, email: e.target.value })}
                />
                <Input
                  placeholder="Full Name"
                  value={newAdmin.full_name}
                  onChange={(e) => setNewAdmin({ ...newAdmin, full_name: e.target.value })}
                />
                <Input
                  type="password"
                  placeholder="Password"
                  value={newAdmin.password}
                  onChange={(e) => setNewAdmin({ ...newAdmin, password: e.target.value })}
                />
                <Button onClick={addAdmin}>Add Admin</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Created At</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {admins.map((admin) => (
                    <TableRow key={admin.id}>
                      <TableCell>{admin.id}</TableCell>
                      <TableCell>{admin.email}</TableCell>
                      <TableCell>{admin.full_name}</TableCell>
                      <TableCell>{new Date(admin.created_at).toLocaleDateString()}</TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          onClick={() => deleteAdmin(admin.id)}
                          className="text-sm"
                        >
                          Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Users</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Email"
                  value={newUser.email}
                  onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                />
                <Input
                  placeholder="Full Name"
                  value={newUser.full_name}
                  onChange={(e) => setNewUser({ ...newUser, full_name: e.target.value })}
                />
                <select
                  value={newUser.role}
                  onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                  className="border p-2 rounded"
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                </select>
                <Button onClick={addUser}>Add User</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Role</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {users.map((user) => (
                    <TableRow key={user.id}>
                      <TableCell>{user.id}</TableCell>
                      <TableCell>{user.email}</TableCell>
                      <TableCell>{user.full_name}</TableCell>
                      <TableCell>{user.role}</TableCell>
                      <TableCell>
                        <Button variant="destructive" onClick={() => deleteItem('users', user.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="agencies">
          <Card>
            <CardHeader>
              <CardTitle>Agencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <Input
                  placeholder="Name"
                  value={newAgency.name}
                  onChange={(e) => setNewAgency({ ...newAgency, name: e.target.value })}
                />
                <Input
                  placeholder="State"
                  value={newAgency.state}
                  onChange={(e) => setNewAgency({ ...newAgency, state: e.target.value })}
                />
                <Button onClick={addAgency}>Add Agency</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>State</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {agencies.map((agency) => (
                    <TableRow key={agency.id}>
                      <TableCell>{agency.id}</TableCell>
                      <TableCell>{agency.name}</TableCell>
                      <TableCell>{agency.state}</TableCell>
                      <TableCell>
                        <Button variant="destructive" onClick={() => deleteItem('agencies', agency.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="complaints">
          <Card>
            <CardHeader>
              <CardTitle>Complaints</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex gap-2 mb-4">
                <select
                  value={newComplaint.user_id}
                  onChange={(e) => setNewComplaint({ ...newComplaint, user_id: e.target.value })}
                  className="border p-2 rounded"
                >
                  <option value="">Select User</option>
                  {users.map(user => (
                    <option key={user.id} value={user.id}>{user.full_name}</option>
                  ))}
                </select>
                <select
                  value={newComplaint.agency_id}
                  onChange={(e) => setNewComplaint({ ...newComplaint, agency_id: e.target.value })}
                  className="border p-2 rounded"
                >
                  <option value="">Select Agency</option>
                  {agencies.map(agency => (
                    <option key={agency.id} value={agency.id}>{agency.name}</option>
                  ))}
                </select>
                <Input
                  placeholder="Account Number"
                  value={newComplaint.account_number}
                  onChange={(e) => setNewComplaint({ ...newComplaint, account_number: e.target.value })}
                />
                <Input
                  placeholder="Type"
                  value={newComplaint.type}
                  onChange={(e) => setNewComplaint({ ...newComplaint, type: e.target.value })}
                />
                <Input
                  placeholder="Description"
                  value={newComplaint.description}
                  onChange={(e) => setNewComplaint({ ...newComplaint, description: e.target.value })}
                />
                <Button onClick={addComplaint}>Add Complaint</Button>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ID</TableHead>
                    <TableHead>User</TableHead>
                    <TableHead>Agency</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {complaints.map((complaint) => (
                    <TableRow key={complaint.id}>
                      <TableCell>{complaint.id}</TableCell>
                      <TableCell>{complaint.users?.full_name}</TableCell>
                      <TableCell>{complaint.agencies?.name}</TableCell>
                      <TableCell>{complaint.type}</TableCell>
                      <TableCell>{complaint.status}</TableCell>
                      <TableCell>
                        <Button variant="destructive" onClick={() => deleteItem('complaints', complaint.id)}>Delete</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
} 