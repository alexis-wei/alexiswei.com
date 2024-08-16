import React, { useEffect, useState } from "react";
import styles from "./page.module.css";

interface MovingGradientProps {
  color: string;
}

const MovingGradient: React.FC<MovingGradientProps> = ({ color }) => {
  const gradientStyle = {
    background: `radial-gradient(circle, ${color} 0%, transparent 70%)`,
  };

  return (
    <div className={styles.gradientContainer}>
      <div className={styles.movingGradient} style={gradientStyle}></div>
    </div>
  );
};

export default MovingGradient;
