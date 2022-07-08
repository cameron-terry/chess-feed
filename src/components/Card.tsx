import styles from "./Card.module.scss";
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  bookOutline,
  chevronBackCircleOutline,
  chevronForwardCircleOutline,
  closeCircle,
  flameOutline,
  flashOutline,
  timerOutline,
} from "ionicons/icons";

import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useEffect, useRef, useState } from "react";
import useWindowDimensions from "../hooks/useWindowDimensions";

export interface CardFrontText {
  opponent: string;
  h: number;
  image: any;
  time_control: string;
  result: string;
  pgn: string;
}

const Card: React.FC<{ text: CardFrontText }> = ({ text }) => {
  const { width, height } = useWindowDimensions();
  const [gamePreview, setGamePreview] = useState(new Chess());
  const [game, setGame] = useState(new Chess());
  const [history, setHistory] = useState<string[]>([]);
  const [currentMove, setCurrentMove] = useState(0);

  const [moveSquares, setMoveSquares] = useState({});

  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    gamePreview.load_pgn(text.pgn);
    setGamePreview(new Chess(gamePreview.fen()));
    setHistory(gamePreview.history());
  }, [text]);

  const getOrientation = () => {
    return text.result === "1-0" ? "white" : "black";
  };

  const showNextMove = () => {
    if (currentMove < history.length) {
      const result = game.move(history[currentMove]);
      setCurrentMove(currentMove + 1);
      setMoveSquares({
        [result!.from]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
        [result!.to]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
      });
    }
  };

  const showLastMove = () => {
    if (currentMove > 0) {
      const result = game.undo();
      setCurrentMove(currentMove - 1);
      setMoveSquares({
        [result!.from]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
        [result!.to]: { backgroundColor: "rgba(255, 255, 0, 0.4)" },
      });
    }
  };

  let icon_choice;
  switch (text.time_control) {
    case "daily":
      icon_choice = bookOutline;
      break;
    case "rapid":
      icon_choice = timerOutline;
      break;
    case "blitz":
      icon_choice = flashOutline;
      break;
    case "bullet":
      icon_choice = flameOutline;
  }

  const badgeColor = () => {
    if (text.h < 0.7) {
      return {
        border: "2px solid #9c4943",
      };
    } else if (text.h > 1) {
      return {
        border: "2px solid #85e69a",
      };
    } else {
      return {
        border: "2px solid #d2db9e",
      };
    }
  };

  return (
    <>
      <div className={styles.card}>
        <IonCard onClick={() => setIsOpen(true)}>
          {/* <img src={text.image} alt={"game render"} /> */}
          <Chessboard
            boardWidth={width - 105}
            position={gamePreview.fen()}
            boardOrientation={getOrientation()}
            arePiecesDraggable={false}
          />
          <IonCardHeader color={"light"}>
            <IonCardTitle></IonCardTitle>
            <IonCardSubtitle>
              <div className={styles.card_text_container}>
                <div className={styles.time_format}>
                  <IonIcon icon={icon_choice} />
                  <div className={styles.result}>{text.result}</div>
                </div>
                <div slot="end" className={styles.opponent}>
                  {text.opponent}
                </div>
                <div slot="end" style={badgeColor()}>
                  <IonBadge className={styles.rating} color={"dark"}>
                    {text.h.toFixed(1)}
                  </IonBadge>
                </div>
              </div>
            </IonCardSubtitle>
          </IonCardHeader>
        </IonCard>
      </div>
      <IonModal isOpen={isOpen}>
        <IonHeader>
          <IonToolbar>
            <IonTitle>{text.opponent}</IonTitle>
            <IonButton
              slot="end"
              color={"translucent"}
              onClick={() => {
                setCurrentMove(0);
                setGame(new Chess());
                setMoveSquares({});
                setIsOpen(false);
              }}
            >
              <IonIcon icon={closeCircle} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <div className={styles.modal}>
          <div className={styles.modal_section}>
            <div className={styles.chessboard_interact}>
              <div className={styles.chessboard}>
                <Chessboard
                  boardWidth={width - 105}
                  boardOrientation={getOrientation()}
                  arePiecesDraggable={false}
                  position={game.fen()}
                  customSquareStyles={{ ...moveSquares }}
                  customBoardStyle={{
                    borderRadius: "4px",
                    boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
                  }}
                />
              </div>
              <div className={styles.chessboard_buttons_div}>
                <IonButton
                  className={styles.chessboard_button}
                  color={"translucent"}
                  onClick={() => showLastMove()}
                >
                  <IonIcon icon={chevronBackCircleOutline} />
                </IonButton>
                <IonButton
                  className={styles.chessboard_button}
                  color={"translucent"}
                  onClick={() => showNextMove()}
                >
                  <IonIcon icon={chevronForwardCircleOutline} />
                </IonButton>
              </div>
            </div>
          </div>
          <div className={styles.modal_section}>
            <div className={styles.pgn_div}>{text.pgn}</div>
          </div>
        </div>
      </IonModal>
    </>
  );
};

export default Card;
