import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import type { User } from '@supabase/supabase-js'
import { supabase } from '../lib/supabase'

export function Feed() {
  const navigate = useNavigate()
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        navigate('/login')
      } else {
        setUser(user)
      }
      setLoading(false)
    }

    getUser()
  }, [navigate])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    navigate('/login')
  }

  if (loading) {
    return <div className="text-center py-10">Cargando...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <nav className="bg-white shadow">
        <div className="max-w-4xl mx-auto px-4 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold">VaiVen Feed</h1>
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Cerrar sesión
          </button>
        </div>
      </nav>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <p className="text-gray-600">
          Bienvenido, <span className="font-bold">{user?.user_metadata?.nombre_visible || user?.email}</span>
        </p>
        <p className="text-gray-500 mt-2">Esta es la pantalla principal. Aquí irán las donaciones.</p>
      </div>
    </div>
  )
}
