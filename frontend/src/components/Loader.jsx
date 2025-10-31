import React from 'react';
import { motion } from 'framer-motion';

const Loader = () => {
  return (
    <div className="loader">
      <motion.div
        animate={{
          rotate: 360
        }}
        transition={{
          duration: 1,
          repeat: Infinity,
          ease: "linear"
        }}
        className="spinner"
      />
    </div>
  );
};

export default Loader;
