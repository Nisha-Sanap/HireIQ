import { useAuth } from '../context/AuthContext'
import { HiOutlineArrowRightOnRectangle, HiOutlineUser } from 'react-icons/hi2'

export default function Navbar() {
  const { user, logout } = useAuth()

  return (
    <header className="h-16 glass border-b border-dark-700/50 flex items-center justify-between px-6 sticky top-0 z-40">
      <div>
        <h2 className="text-sm font-medium text-dark-300">
          Welcome back, <span className="text-dark-100 font-semibold">{user?.name}</span>
        </h2>
      </div>

      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2 glass-light rounded-xl px-4 py-2">
          <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
            <HiOutlineUser className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-medium text-dark-100">{user?.name}</p>
            <p className="text-xs text-dark-400">{user?.email}</p>
          </div>
        </div>

        <button
          onClick={logout}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-dark-400 hover:text-danger hover:bg-danger/10 transition-all duration-200 text-sm"
          id="logout-button"
        >
          <HiOutlineArrowRightOnRectangle className="w-5 h-5" />
          Logout
        </button>
      </div>
    </header>
  )
}
