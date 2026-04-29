import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState } from "react";
import logo from "@/assets/bot-logo.png";

export function SplashScreen() {
  const [isVisible, setIsVisible] = useState(true);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const timer = setTimeout(() => setIsVisible(false), 2500);
    const interval = setInterval(() => {
      setProgress((prev) => (prev < 100 ? prev + 2 : 100));
    }, 40);

    return () => {
      clearTimeout(timer);
      clearInterval(interval);
    };
  }, []);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: "easeInOut" }}
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-white"
        >
          <div className="relative flex flex-col items-center">
            {/* Logo with circular outline */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: "easeOut" }}
              className="relative mb-12"
            >
              <div className="absolute inset-[-20px] rounded-full border border-primary/20" />
              <div className="absolute inset-[-10px] rounded-full border border-primary/10" />
              <div className="h-28 w-28 flex items-center justify-center bg-white rounded-full">
                <img src={logo} alt="BOT Logo" className="h-24 w-24 object-contain" />
              </div>
            </motion.div>

            {/* Loading text */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="mb-6 flex flex-col items-center"
            >
              <span className="text-[12px] font-bold tracking-[0.4em] text-primary/80 uppercase">
                Loading
              </span>
            </motion.div>

            {/* Progress bar */}
            <div className="relative h-1 w-48 overflow-hidden rounded-full bg-muted/40">
              <motion.div
                className="absolute left-0 top-0 h-full bg-primary shadow-[0_0_8px_rgba(var(--primary),0.4)]"
                initial={{ width: "0%" }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.1, ease: "linear" }}
              />
            </div>
          </div>

          {/* Footer Copyright */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
            className="absolute bottom-10 text-[10px] font-medium text-muted-foreground/50 uppercase tracking-widest"
          >
            © {new Date().getFullYear()} BE ON TIME Platform
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
