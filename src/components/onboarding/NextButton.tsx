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
          className="fixed bottom-8 left-0 right-0 flex justify-center z-50 pointer-events-none"
        >
          <button
            onClick={onClick}
            className="pointer-events-auto bg-[#ffc7f2] hover:bg-[#ffb0eb] text-black font-medium text-lg px-24 py-3 rounded-full shadow-lg transition-colors cursor-pointer"
          >
            Next
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
