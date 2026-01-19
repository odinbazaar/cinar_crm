# Frontend Supabase Kurulum Rehberi

## 📋 Kurulum Adımları

### 1. Environment Variables Ayarlayın

1. `.env.example` dosyasını `.env` olarak kopyalayın:
   ```bash
   cp .env.example .env
   ```

2. Supabase Dashboard'dan gerekli bilgileri alın:
   - **URL**: https://supabase.com/dashboard/project/slanoowprgrcksfqrgak
   - **Project Settings** → **API** bölümüne gidin
   - **Project URL** ve **anon public** key'i kopyalayın

3. `.env` dosyasını güncelleyin:
   ```env
   VITE_SUPABASE_URL=https://laltmysfkyppkqykggmh.supabase.co
   VITE_SUPABASE_ANON_KEY=your-actual-anon-key-here
   VITE_API_URL=http://localhost:3000
   ```

### 2. Supabase Client Kullanımı

Supabase client'ı projenizde kullanmak için:

```typescript
import { supabase, auth, db } from '@/lib/supabase'

// Authentication
const { data, error } = await auth.signIn('user@example.com', 'password')

// Database operations
const { data: users } = await db.from('users').select('*')

// Real-time subscriptions
db.subscribe('users', (payload) => {
  console.log('Change received!', payload)
})
```

## 🔐 Authentication Örnekleri

### Login
```typescript
import { auth } from '@/lib/supabase'

const handleLogin = async (email: string, password: string) => {
  const { data, error } = await auth.signIn(email, password)
  
  if (error) {
    console.error('Login error:', error.message)
    return
  }
  
  console.log('User logged in:', data.user)
}
```

### Sign Up
```typescript
const handleSignUp = async (email: string, password: string, userData: any) => {
  const { data, error } = await auth.signUp(email, password, {
    firstName: userData.firstName,
    lastName: userData.lastName,
    role: userData.role
  })
  
  if (error) {
    console.error('Sign up error:', error.message)
    return
  }
  
  console.log('User created:', data.user)
}
```

### Logout
```typescript
const handleLogout = async () => {
  const { error } = await auth.signOut()
  
  if (error) {
    console.error('Logout error:', error.message)
    return
  }
  
  console.log('User logged out')
}
```

### Auth State Listener
```typescript
import { useEffect } from 'react'
import { auth } from '@/lib/supabase'

useEffect(() => {
  const { data: { subscription } } = auth.onAuthStateChange((event, session) => {
    console.log('Auth event:', event)
    console.log('Session:', session)
    
    if (event === 'SIGNED_IN') {
      console.log('User signed in:', session?.user)
    }
    
    if (event === 'SIGNED_OUT') {
      console.log('User signed out')
    }
  })

  return () => {
    subscription.unsubscribe()
  }
}, [])
```

## 💾 Database İşlemleri

### Select
```typescript
import { db } from '@/lib/supabase'

// Tüm kayıtları getir
const { data: clients, error } = await db.from('clients').select('*')

// Filtreleme ile
const { data: activeClients } = await db
  .from('clients')
  .select('*')
  .eq('isActive', true)

// İlişkili verilerle
const { data: projects } = await db
  .from('projects')
  .select(`
    *,
    client:clients(*),
    projectManager:users(*)
  `)
```

### Insert
```typescript
const { data, error } = await db
  .from('clients')
  .insert({
    name: 'Yeni Müşteri',
    email: 'musteri@example.com',
    type: 'CORPORATE'
  })
  .select()
```

### Update
```typescript
const { data, error } = await db
  .from('clients')
  .update({ isActive: false })
  .eq('id', clientId)
  .select()
```

### Delete
```typescript
const { error } = await db
  .from('clients')
  .delete()
  .eq('id', clientId)
```

## 🔄 Real-time Subscriptions

### Tablo Değişikliklerini Dinleme
```typescript
import { useEffect } from 'react'
import { db } from '@/lib/supabase'

useEffect(() => {
  const subscription = db.subscribe('projects', (payload) => {
    console.log('Change received!', payload)
    
    if (payload.eventType === 'INSERT') {
      console.log('New project:', payload.new)
    }
    
    if (payload.eventType === 'UPDATE') {
      console.log('Updated project:', payload.new)
    }
    
    if (payload.eventType === 'DELETE') {
      console.log('Deleted project:', payload.old)
    }
  })

  return () => {
    subscription.unsubscribe()
  }
}, [])
```

## 🎯 React Hook Örneği

```typescript
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export function useSupabaseQuery<T>(
  table: string,
  query?: (q: any) => any
) {
  const [data, setData] = useState<T[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true)
        let q = supabase.from(table).select('*')
        
        if (query) {
          q = query(q)
        }
        
        const { data, error } = await q
        
        if (error) throw error
        
        setData(data || [])
      } catch (err) {
        setError(err as Error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [table])

  return { data, loading, error }
}

// Kullanım
const { data: clients, loading, error } = useSupabaseQuery('clients')
```

## 🔒 Row Level Security (RLS)

Supabase'de Row Level Security politikaları oluşturmanız önerilir:

1. Supabase Dashboard → **Authentication** → **Policies**
2. Her tablo için uygun politikalar oluşturun

Örnek politika (SQL):
```sql
-- Kullanıcılar sadece kendi kayıtlarını görebilir
CREATE POLICY "Users can view own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Kullanıcılar sadece kendi kayıtlarını güncelleyebilir
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);
```

## 📝 Notlar

- **Environment Variables**: `.env` dosyası `.gitignore`'da olmalı
- **Anon Key**: Public key'dir, frontend'de kullanılabilir
- **Service Role Key**: Asla frontend'de kullanmayın!
- **RLS**: Production'da mutlaka Row Level Security kullanın

## 🐛 Sorun Giderme

### CORS Hataları
Supabase Dashboard → **Settings** → **API** → **CORS** ayarlarını kontrol edin.

### Auth Hataları
- Email confirmation gerekli mi kontrol edin
- Supabase Dashboard → **Authentication** → **Settings**

### Real-time Çalışmıyor
- Supabase Dashboard → **Database** → **Replication** → Tabloyu real-time için etkinleştirin
