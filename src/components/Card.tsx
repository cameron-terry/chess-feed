import styles from "./Card.module.scss";
import {
  IonBadge,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonHeader,
  IonIcon,
  IonModal,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import {
  alertOutline,
  bookmark,
  bookOutline,
  caretBackOutline,
  caretForwardOutline,
  closeCircle,
  closeOutline,
  flameOutline,
  flashOutline,
  helpOutline,
  pauseOutline,
  playOutline,
  timerOutline,
} from "ionicons/icons";

import { Chess } from "chess.js";
import { Chessboard } from "react-chessboard";
import { useEffect, useState } from "react";
import useWindowDimensions from "../hooks/useWindowDimensions";
import { firestore } from "../firebase";

/*
 * inputs to card
 * opponent: my opponent
 * h: heuristic value for badge (for now, it's smoothness)
 * time_control: "daily" || "rapid" || "blitz" || "bullet"
 * result: "1-0" || "0-1" || "1/2-1/2"
 * pgn: movelist
 * color: "black" || "white"
 * gameLink: Firestore document id
 */
export interface CardFrontText {
  opponent: string;
  h: number;
  time_control: string;
  result: string;
  pgn: string;
  color: string;
  gameLink: string;
}

// colors for moves
const defaultMove = "rgba(255, 255, 0, 0.4)";
const brilliantMove = "rgba(66, 245, 239, 0.4)";
const blunderMove = "rgba(219, 85, 61, 0.4)";
const bookMove = "rgba(222, 192, 115, 0.4)";

const Card: React.FC<{ text: CardFrontText }> = ({ text }) => {
  // width used to determine <Chessboard /> size
  const { width, height } = useWindowDimensions();

  // board to show final position when scrolling (card front)
  const [gamePreview, setGamePreview] = useState(new Chess());

  // board to interact with when selecting card
  const [game, setGame] = useState(new Chess());

  // list of moves
  const [history, setHistory] = useState<string[]>([]);

  // current move on board (when selected)
  const [currentMove, setCurrentMove] = useState(0);

  // the from and to squares of the most recent move
  const [moveSquares, setMoveSquares] = useState({});

  // the user chosen colors for each move
  const [moveColors, setMoveColors] = useState<string[]>([]);

  const [arrows, setArrows] = useState<string[][][]>([]);

  // card selected modal trigger
  const [isOpen, setIsOpen] = useState(false);

  const [bookmarkGame, setBookmarkGame] = useState<boolean>(false);

  // initial data fetching for Card
  useEffect(() => {
    const fetchData = async () => {
      gamePreview.load_pgn(text.pgn);
      setGamePreview(new Chess(gamePreview.fen()));
      setHistory(gamePreview.history());
      await getMoveColorsFirebase().then((colors) => {
        setMoveColors(colors);
      });
      await getBookmarkFirebase().then((bookmark) => {
        setBookmarkGame(bookmark);
      });
      await getArrowsFirebase().then((arrows) => {
        setArrows(arrows);
      });
    };

    fetchData();
  }, [text]); // why am i updating on text?

  /* query Firebase to get the user's designated colors,
   * if they exist
   * return a new array of default colors otherwise
   */
  const getMoveColorsFirebase = async () => {
    // query firestore
    const game = firestore
      .collection("users")
      .doc("roudiere")
      .collection("games")
      .doc(text.gameLink);

    return game.get().then((doc: any) => {
      if (doc !== undefined) {
        if (doc.data().moveColors === undefined) {
          return new Array(history.length).fill("default");
        }
        return doc.data().moveColors;
      } else {
        return new Array(history.length).fill("default");
      }
    });
  };

  const getBookmarkFirebase = async () => {
    const game = firestore
      .collection("users")
      .doc("roudiere")
      .collection("games")
      .doc(text.gameLink);

    return game.get().then((doc: any) => {
      if (doc !== undefined) {
        if (doc.data().bookmark === undefined) {
          return false;
        }
        return doc.data().bookmark;
      } else {
        return false;
      }
    });
  };

  const getArrowsFirebase = async () => {
    const game = firestore
      .collection("users")
      .doc("roudiere")
      .collection("games")
      .doc(text.gameLink);

    return game.get().then((doc: any) => {
      if (doc !== undefined) {
        if (doc.data().arrows === undefined) {
          return new Array(history.length).fill(undefined);
        }
        return convertFirebaseArrToArrows(doc.data().arrows);
      } else {
        return new Array(history.length).fill(undefined);
      }
    });
  };

  // return a color, depending on the string
  const getMoveColor = (i: number) => {
    switch (moveColors[i]) {
      case "default":
        return defaultMove;
      case "brilliant":
        return brilliantMove;
      case "blunder":
        return blunderMove;
      case "book":
        return bookMove;
    }
  };

  // set the <ChessBoard /> orientation
  const getOrientation = () => {
    return text.color === "white" ? "white" : "black";
  };

  // make the next move on the board
  const showNextMove = async () => {
    if (currentMove < history.length) {
      const result = game.move(history[currentMove]);
      setCurrentMove(currentMove + 1);
      setMoveSquares({
        [result!.from]: { backgroundColor: getMoveColor(currentMove) },
        [result!.to]: { backgroundColor: getMoveColor(currentMove) },
      });
    }
  };

  // undo the most recent move on the board
  const showLastMove = () => {
    if (currentMove > 0) {
      game.undo();
      setCurrentMove(currentMove - 1);
      setMoveSquares({});
    }
  };

  // display all of the moves
  const playMoves = async () => {
    console.log("play functionality to come");
    console.log(moveColors);
  };

  // pause display of all of the moves
  const pauseMoves = async () => {
    console.log("pause functionality to come");
  };

  // update move in moveColors to book
  // TODO: this is probably a very bad practice, but it works
  const setMoveBook = () => {
    if (currentMove > 0) {
      let moveList = moveColors;
      moveList[currentMove - 1] = "book";
      // console.log(moveList);
    }
  };

  // update move in moveColors to brilliant
  // TODO: this is probably a very bad practice, but it works
  const setMoveBrilliant = () => {
    if (currentMove > 0) {
      let moveList = moveColors;
      moveList[currentMove - 1] = "brilliant";
      // console.log(moveList);
    }
  };

  // update move in moveColors to blunder
  // TODO: this is probably a very bad practice, but it works
  const setMoveBlunder = () => {
    if (currentMove > 0) {
      let moveList = moveColors;
      moveList[currentMove - 1] = "blunder";
      // console.log(moveList);
    }
  };

  // update move in moveColors to default
  // TODO: this is probably a very bad practice, but it works
  const setMoveDefault = () => {
    if (currentMove > 0) {
      let moveList = moveColors;
      moveList[currentMove - 1] = "default";
      console.log(moveList);
    }
  };

  // save user's game move color preferences to Firebase
  const updateMoveColors = () => {
    const game = firestore
      .collection("users")
      .doc("roudiere")
      .collection("games")
      .doc(text.gameLink);
    game.update({
      moveColors: moveColors,
    });
  };

  const updateBookmark = () => {
    const game = firestore
      .collection("users")
      .doc("roudiere")
      .collection("games")
      .doc(text.gameLink);

    game.update({
      bookmark: !bookmarkGame,
    });

    setBookmarkGame(!bookmarkGame);
  };

  const convertFirebaseArrToArrows = (arr: any) => {
    return arr.map((val: any) => {
      if (val === "") {
        return undefined;
      } else {
        // first split string by semicolon
        return val.split(";").map((arrow: string) => {
          // then split each "from,to" by comma
          return arrow.split(",");
        });
      }
    });
  };

  const convertArrowsArrToFirebase = (arr: any) => {
    return arr.map((val: any) => {
      if (val === undefined) {
        return "";
      } else {
        return (
          val
            // first form each arrow arr into a string "from,to"
            .map((arrow: string[]) => {
              return arrow.join(",");
            })
            // then join all of these with a semicolon
            .join(";")
        );
      }
    });
  };

  const updateArrows = () => {
    const game = firestore
      .collection("users")
      .doc("roudiere")
      .collection("games")
      .doc(text.gameLink);

    game.update({
      arrows: convertArrowsArrToFirebase(arrows),
    });
  };

  // set icon based on time control
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

  // set line below to provide visual clue to game accuracy
  const badgeColor = () => {
    if (text.h < 0.7) {
      return {
        border: "2px solid #9c4943",
      };
    } else if (text.h > 10) {
      return {
        border: "2px solid #42ff50",
      };
    } else if (text.h > 1) {
      return {
        border: "2px solid #20aefa",
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
            customDarkSquareStyle={{ backgroundColor: "#3d8a99" }}
            customLightSquareStyle={{ backgroundColor: "#edeed1" }}
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
            <IonButton
              slot="start"
              color={"translucent"}
              onClick={() => {
                updateBookmark();
              }}
            >
              <IonIcon
                style={{
                  color: bookmarkGame ? "red" : "white",
                }}
                icon={bookmark}
              />
            </IonButton>
            <IonTitle>{text.opponent}</IonTitle>
            <IonButton
              slot="end"
              color={"translucent"}
              onClick={() => {
                setCurrentMove(0);
                setGame(new Chess());
                setMoveSquares({});
                updateMoveColors();
                updateArrows();
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
                  customDarkSquareStyle={{ backgroundColor: "#3d8a99" }}
                  customLightSquareStyle={{ backgroundColor: "#edeed1" }}
                  customArrows={arrows[currentMove]}
                />
              </div>
              <div className={styles.chessboard_buttons_div}>
                <IonButton
                  className={styles.chessboard_button}
                  color={"translucent"}
                  onClick={() => showLastMove()}
                >
                  <IonIcon icon={caretBackOutline} />
                </IonButton>
                <IonButton color={"translucent"} onClick={() => playMoves()}>
                  <IonIcon icon={playOutline} />
                </IonButton>
                <IonButton color={"translucent"} onClick={() => pauseMoves()}>
                  <IonIcon icon={pauseOutline} />
                </IonButton>
                <IonButton
                  className={styles.chessboard_button}
                  color={"translucent"}
                  onClick={() => showNextMove()}
                >
                  <IonIcon icon={caretForwardOutline} />
                </IonButton>
              </div>
              <div className={styles.move_notation_buttons}>
                <IonButton color={"translucent"} onClick={() => setMoveBook()}>
                  <IonIcon icon={bookOutline} />
                </IonButton>
                <IonButton
                  color={"translucent"}
                  onClick={() => setMoveBrilliant()}
                >
                  <IonIcon icon={alertOutline} />
                </IonButton>
                <IonButton
                  color={"translucent"}
                  onClick={() => setMoveBlunder()}
                >
                  <IonIcon icon={helpOutline} />
                </IonButton>
                <IonButton
                  color={"translucent"}
                  onClick={() => setMoveDefault()}
                >
                  <IonIcon icon={closeOutline} />
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
