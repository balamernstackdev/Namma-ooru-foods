'use client';

import { useState, useEffect } from 'react';
import UserForm from '@/components/admin/UserForm';
import { API_URL } from '@/lib/api';
import { Loader2 } from 'lucide-react';

export default function EditUserClient({ id }: { id: string }) {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      fetch(`${API_URL}/api/admin-ops/users/${id}`)
        .then(r => r.json())
        .then(data => {
          setUser(data);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [id]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
      </div>
    );
  }

  return <UserForm mode="edit" initialData={user} />;
}
