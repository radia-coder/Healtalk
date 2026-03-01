"use client";

import { motion, AnimatePresence } from "framer-motion";

interface NextButtonProps {
  show: boolean;
  onClick: () => void;
}

export function NextButton({ show, onClick }: NextButtonProps) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 100, opacity: 0 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="pointer-events-none fixed bottom-6 left-0 right-0 z-50 flex justify-center px-4 sm:bottom-8"
        >
          <button
            onClick={onClick}
            className="pointer-events-auto w-[min(92vw,420px)] cursor-pointer rounded-full bg-[#ffc7f2] py-3 text-base font-medium text-black shadow-lg transition-colors hover:bg-[#ffb0eb] sm:text-lg"
          >
            Next
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
