import React, { useState, useEffect, useCallback } from 'react';
import { Bell, X, Megaphone, Clock, Check, Pin, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataService } from '../services/dataService';
import { AppUser, AppNotification, NotificationType } from '../types';
import { Language, translations } from '../translations';

interface NotificationCenterProps {
  user: AppUser;
  language: Language;
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({ user, language }) => {
  const t = translations[language];
  const [notifications, setNotifications] = useState<AppNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(false);
  const [unreadForPopup, setUnreadForPopup] = useState<AppNotification[]>([]);
  const [readIds, setReadIds] = useState<Set<string>>(new Set());

  const refreshNotifs = useCallback(() => {
    const notifs = dataService.getNotifications(user);
    const count = dataService.getUnreadCount(user.id);
    const read = dataService.getReadStatus(user.id);
    
    setNotifications(notifs);
    setUnreadCount(count);
    setReadIds(read);

    // Identify unread notifications that haven't been shown in a popup this session (or just any unread ones)
    // Requirement: "unread notifications appear in a popup/modal upon app open"
    const unread = notifs.filter(n => !read.has(n.id));
    if (unread.length > 0 && unreadForPopup.length === 0) {
      setUnreadForPopup(unread);
      setShowPopup(true);
    }
  }, [user, unreadForPopup.length]);

  useEffect(() => {
    refreshNotifs();
  }, [refreshNotifs]);

  const handleMarkAsRead = (id: string) => {
    dataService.markAsRead(user.id, id);
    refreshNotifs();
  };

  const handleMarkAllAsRead = () => {
    notifications.forEach(n => {
      if (!readIds.has(n.id)) {
        dataService.markAsRead(user.id, n.id);
      }
    });
    refreshNotifs();
  };

  const handleClosePopup = () => {
    setShowPopup(false);
  };

  return (
    <>
      {/* Bell Icon */}
      <div className="relative">
        <button 
          onClick={() => setIsOpen(true)}
          className="relative p-2 text-slate-500 hover:text-slate-900 transition-colors"
        >
          <Bell className="w-6 h-6" />
          {unreadCount > 0 && (
            <span className="absolute top-1.5 right-1.5 w-4 h-4 bg-brand-red text-white text-[10px] font-black rounded-full flex items-center justify-center animate-bounce">
              {unreadCount}
            </span>
          )}
        </button>
      </div>

      {/* History Modal */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-end">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm"
              onClick={() => setIsOpen(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col"
            >
              <div className="p-6 border-b border-slate-100 flex items-center justify-between bg-slate-50">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="font-black text-slate-900 uppercase tracking-tight">{t.notifications}</h3>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{unreadCount} Unread</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={handleMarkAllAsRead}
                    className="text-[10px] font-black text-brand-red uppercase tracking-widest hover:underline px-2"
                  >
                    Mark all as read
                  </button>
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-2 text-slate-400 hover:text-slate-900 transition-colors"
                  >
                    <X className="w-6 h-6" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {notifications.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <Megaphone className="w-16 h-16 text-slate-100 mx-auto" />
                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No announcements at this time</p>
                  </div>
                ) : (
                  notifications.map(notif => {
                    const isRead = readIds.has(notif.id);
                    return (
                      <div 
                        key={notif.id}
                        className={`p-5 rounded-[24px] border transition-all ${isRead ? 'bg-white border-slate-100' : 'bg-brand-red/5 border-brand-red/10 ring-1 ring-brand-red/5'}`}
                      >
                        <div className="flex justify-between items-start gap-4 mb-2">
                          <div className="flex items-center gap-2">
                            <span className={`text-[8px] font-black px-2 py-0.5 rounded-full uppercase ${
                              notif.type === NotificationType.EMERGENCY ? 'bg-red-100 text-red-600' :
                              notif.type === NotificationType.MAINTENANCE ? 'bg-amber-100 text-amber-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {notif.type}
                            </span>
                            {notif.isPinned && <Pin className="w-3 h-3 text-brand-red fill-brand-red" />}
                          </div>
                          <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">
                            {new Date(notif.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <h4 className="font-black text-slate-900 tracking-tight mb-1">{notif.title}</h4>
                        <p className="text-sm text-slate-600 leading-relaxed mb-4">{notif.message}</p>
                        
                        {!isRead && (
                          <button 
                            onClick={() => handleMarkAsRead(notif.id)}
                            className="flex items-center gap-2 text-[10px] font-black text-brand-red uppercase tracking-widest hover:underline"
                          >
                            <Check className="w-3 h-3" />
                            {t.markAsRead}
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Auto-Open Modal (Popup) */}
      <AnimatePresence>
        {showPopup && unreadForPopup.length > 0 && (
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-md"
              onClick={handleClosePopup}
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="bg-white rounded-[40px] w-full max-w-lg shadow-2xl relative z-10 overflow-hidden"
            >
              <div className="bg-slate-900 p-8 text-white relative">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Megaphone className="w-24 h-24 rotate-12" />
                </div>
                <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="bg-brand-red w-2 h-2 rounded-full animate-ping" />
                    <span className="text-[10px] font-black uppercase tracking-[0.3em] text-brand-red-light">{t.newUpdate}</span>
                  </div>
                  <h3 className="text-3xl font-black tracking-tight">{translations[language].notifications}</h3>
                </div>
              </div>

              <div className="p-8 space-y-6 max-h-[50vh] overflow-y-auto custom-scrollbar">
                {unreadForPopup.map(notif => (
                  <div key={notif.id} className="space-y-3 pb-6 border-b border-slate-100 last:border-0 last:pb-0">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-black px-2 py-0.5 rounded-full uppercase ${
                        notif.type === NotificationType.EMERGENCY ? 'bg-red-50 text-red-600' :
                        notif.type === NotificationType.MAINTENANCE ? 'bg-amber-50 text-amber-600' :
                        'bg-blue-50 text-blue-600'
                      }`}>
                        {notif.type}
                      </span>
                      <div className="flex items-center gap-2 text-[10px] font-medium text-slate-400">
                        <Calendar className="w-3 h-3" />
                        {new Date(notif.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <h4 className="text-xl font-black text-slate-900 tracking-tight">{notif.title}</h4>
                    <p className="text-slate-600 font-medium leading-relaxed">{notif.message}</p>
                    <button 
                      onClick={() => handleMarkAsRead(notif.id)}
                      className="bg-slate-50 text-slate-900 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-100 transition-all flex items-center gap-2"
                    >
                      <Check className="w-4 h-4 text-brand-red" />
                      {t.markAsRead}
                    </button>
                  </div>
                ))}
              </div>

              <div className="p-6 bg-slate-50 flex justify-end">
                <button 
                  onClick={handleClosePopup}
                  className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-sm uppercase tracking-widest hover:bg-black transition-all shadow-lg"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
};
