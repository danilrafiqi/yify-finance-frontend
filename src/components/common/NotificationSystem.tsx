import React from 'react'
import { Toaster, ToastBar, toast } from 'react-hot-toast'
import { X } from 'lucide-react'

const NotificationSystem: React.FC = () => {
  return (
    <Toaster
      position="bottom-right"
      toastOptions={{
        duration: 5000,
        style: {
          background: 'transparent',
          padding: 0,
          boxShadow: 'none',
        },
      }}
    >
      {(t) => (
        <ToastBar toast={t}>
          {({ icon, message }) => (
            <div
              className={`
                flex items-center gap-3 px-4 py-3 min-w-[300px]
                border-2 border-black shadow-neo
                ${t.type === 'error' ? 'bg-neo-red text-white' : 
                  t.type === 'success' ? 'bg-neo-green text-black' : 
                  'bg-neo-white text-black'}
                font-bold uppercase animate-enter
              `}
            >
              {icon}
              <div className="flex-1">{message}</div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="p-1 hover:bg-black/10 rounded"
              >
                <X size={16} />
              </button>
            </div>
          )}
        </ToastBar>
      )}
    </Toaster>
  )
}

export default NotificationSystem

