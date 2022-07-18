import { useEffect, useState } from "react";
import styles from "./ScoreBar.module.scss";

export interface ScoreBarProps {
  left: number;
  value: number;
  right: number;
}

export const ScoreBar: React.FC<ScoreBarProps> = (props) => {
  const [color, setColor] = useState("green");

  useEffect(() => {
    if (props.value < props.right / 4) {
      setColor("red");
    } else if (props.value < props.right / 2) {
      setColor("#d9d20d");
    }
  }, []);

  return (
    <>
      <div
        style={{
          display: "flex",
          gap: "3px",
          alignItems: "center",
        }}
      >
        <div>{props.left}</div>&nbsp;
        <div className={styles.container}>
          <div
            style={{
              borderRadius: "3%/20%",
              backgroundColor: color,
              height: "100%",
              width: `${Math.floor(props.value * 100)}%`,
            }}
          ></div>
        </div>
        &nbsp;
        <div>{props.right}</div>
      </div>
    </>
  );
};
