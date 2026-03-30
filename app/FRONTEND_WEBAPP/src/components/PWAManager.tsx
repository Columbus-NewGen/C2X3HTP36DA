import { useEffect } from 'react';
import { useRegisterSW } from 'virtual:pwa-register/react';
import { useToasts } from './ui/Toast';

export default function PWAManager() {
    const { addToast } = useToasts();
    const {
        offlineReady: [offlineReady, setOfflineReady],
        needRefresh: [needRefresh, setNeedRefresh],
        updateServiceWorker,
    } = useRegisterSW({
        onRegistered(r: ServiceWorkerRegistration | undefined) {
            console.log('SW Registered:', r);
        },
        onRegisterError(error: any) {
            console.log('SW registration error', error);
        },
    });

    const close = () => {
        setOfflineReady(false);
        setNeedRefresh(false);
    };

    useEffect(() => {
        if (offlineReady) {
            addToast('success', 'แอปฯ พร้อมใช้งานแบบออฟไลน์แล้ว!');
            setOfflineReady(false);
        }
    }, [offlineReady, addToast, setOfflineReady]);

    if (!needRefresh) return null;

    return (
        <div className="fixed bottom-6 right-6 z-[10000] animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="bg-zinc-900/95 backdrop-blur-md rounded-2xl p-4 shadow-2xl border border-white/10 flex items-center gap-4 min-w-[320px]">
                <div className="flex-1">
                    <p className="text-white text-xs font-bold uppercase opacity-50 mb-0.5">Application Update</p>
                    <p className="text-white text-[13px] font-bold">มีเวอร์ชันใหม่พร้อมใช้งาน</p>
                </div>

                <div className="flex gap-2">
                    <button
                        onClick={() => updateServiceWorker(true)}
                        className="bg-lime-500 hover:bg-lime-400 text-lime-950 text-xs font-bold px-4 py-2 rounded-xl transition-all active:scale-95 cursor-pointer"
                    >
                        อัปเดต
                    </button>
                    <button
                        onClick={() => close()}
                        className="text-white/40 hover:text-white text-xs font-bold px-2 py-2 transition-colors cursor-pointer"
                    >
                        ปิด
                    </button>
                </div>
            </div>
        </div>
    );
}
