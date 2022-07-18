import styles from "./Card.module.scss";
import {
  IonAlert,
  IonBadge,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardSubtitle,
  IonCardTitle,
  IonHeader,
  IonIcon,
  IonLabel,
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
  flameOutline,
  flashOutline,
  helpOutline,
  pauseOutline,
  playOutline,
  timerOutline,
} from "ionicons/icons";

import { AiOutlineCheck } from "react-icons/ai";
import { FaEyeSlash } from "react-icons/fa";

import { Chess } from "chess.js";
import { Chessboard, Square } from "react-chessboard";
import { useEffect, useState } from "react";
import useWindowDimensions from "../../hooks/useWindowDimensions";
import { firestore } from "../../firebase";

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

// for move highlighting
interface MoveArrow {
  start: string | null;
}

// colors for moves
const defaultMove = "rgba(255, 255, 0, 0.4)";
const brilliantMove = "rgba(66, 245, 239, 0.4)";
const blunderMove = "rgba(219, 85, 61, 0.4)";
const bookMove = "rgba(222, 192, 115, 0.4)";

const Card: React.FC<{ text: CardFrontText }> = ({ text }) => {
  // width used to determine <Chessboard /> size
  const { width } = useWindowDimensions();

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

  // user arrow start point
  const [arrow, setArrow] = useState<MoveArrow>({
    start: null,
  });

  // the user chosen colors for each move
  const [moveColors, setMoveColors] = useState<string[]>([]);

  // user designated arrows
  const [arrows, setArrows] = useState<string[][][]>([]);

  // card selected modal trigger
  const [isOpen, setIsOpen] = useState(false);

  // if the user has bookmarked the card
  const [bookmarkGame, setBookmarkGame] = useState<boolean>(false);

  const [hideGame, setHideGame] = useState<boolean>(false);

  // if there is an error
  const [showAlert, setShowAlert] = useState<boolean>(false);

  // initial data fetching for Card
  useEffect(() => {
    const fetchData = async () => {
      // set up preview board
      gamePreview.load_pgn(text.pgn);
      setGamePreview(new Chess(gamePreview.fen()));
      setHistory(gamePreview.history());

      // set move colors, is bookmarked, arrows from Firebase
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
    // eslint-disable-next-line
  }, [text]); // why am i updating on text?

  // is it safe to put this here?
  const gameRef = firestore
    .collection("users")
    .doc("roudiere")
    .collection("games")
    .doc(text.gameLink);

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

  /* query Firebase to get the user's designated move colors for the card,
   * if they exist
   * return a new array of default colors otherwise
   */
  const getMoveColorsFirebase = async () => {
    // query firestore

    return gameRef.get().then((doc: any) => {
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

  // save user's game move color preferences to Firebase
  const updateMoveColorsFirebase = () => {
    try {
      gameRef.update({
        moveColors: moveColors,
      });
    } catch (error) {
      setShowAlert(true);
    }
  };

  // query Firebase to get if card is bookmarked
  const getBookmarkFirebase = async () => {
    return gameRef.get().then((doc: any) => {
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

  // save is bookmarked to Firebase
  const updateBookmarkFirebase = () => {
    gameRef.update({
      bookmark: !bookmarkGame,
    });

    setBookmarkGame(!bookmarkGame);
  };

  const updateHiddenFirebase = () => {
    gameRef.update({
      hidden: !hideGame,
    });

    setHideGame(!hideGame);
  };

  /* query Firebase to get the user's designated arrows,
   * if they exist
   * return a new array ready for arrows otherwise
   */
  const getArrowsFirebase = async () => {
    return gameRef.get().then((doc: any) => {
      if (doc !== undefined) {
        // if user selects game and doesn't draw arrows weird 0 length bug happens
        if (doc.data().arrows === undefined || doc.data().arrows.length === 0) {
          let arrows: string[][][] = new Array(history.length).fill(undefined);
          return arrows;
        }
        return convertFirebaseArrToArrows(doc.data().arrows);
      } else {
        let arrows: string[][][] = new Array(history.length).fill(undefined);
        return arrows;
      }
    });
  };

  // save designated arrows to Firebase
  const updateArrowsFirebase = () => {
    const firebaseArrows = convertArrowsArrToFirebase(arrows);
    try {
      gameRef.update({
        arrows: firebaseArrows,
      });
    } catch (error) {
      console.log("something went wrong -- resetting all arrows");
      let arrow_template: string[][][] = new Array(history.length).fill(
        undefined
      );
      gameRef.update({
        arrows: convertArrowsArrToFirebase(arrow_template),
      });
    }
  };

  // return a move color for "default" || "brilliant" || "blunder" || "book"
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
  const setOrientation = () => {
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
      // console.log(moveList);
    }
  };

  // set all move colors to default
  const setAllDefault = () => {
    setMoveColors(Array(history.length).fill("default"));
  };

  // draw an arrow on a <Chessboard />
  const drawArrow = (sq: Square) => {
    if (arrow.start === null) {
      setArrow({ start: sq });
    } else {
      // seems reaally unsafe
      if (arrows[currentMove] === undefined) {
        arrows[currentMove] = [];
      }
      arrows[currentMove].push([arrow.start, sq]);
      setArrows(arrows);
      setArrow({ start: null });
    }
  };

  // set icon based on time control
  // for some reason this doesn't work when changing
  // icon_choice to a state variable and updating in useEffect()
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
            boardOrientation={setOrientation()}
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
                updateBookmarkFirebase();
              }}
            >
              <IonIcon
                style={{
                  color: bookmarkGame ? "red" : "white",
                }}
                icon={bookmark}
              />
            </IonButton>
            <IonButton color={"translucent"}>
              <FaEyeSlash
                style={{
                  color: hideGame ? "blue" : "white",
                }}
                onClick={() => {
                  updateHiddenFirebase();
                }}
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
                updateMoveColorsFirebase();
                updateArrowsFirebase();
                setIsOpen(false);
              }}
            >
              <IonIcon icon={closeCircle} />
            </IonButton>
          </IonToolbar>
        </IonHeader>
        <div className={styles.modal}>
          <IonAlert
            isOpen={showAlert}
            onDidDismiss={() => setShowAlert(false)}
            header="Missing move colors"
            message="Make sure a move type is defined for all moves"
            buttons={["OK"]}
          />
          <div className={styles.modal_section}>
            <div className={styles.chessboard_interact}>
              <div className={styles.chessboard}>
                <Chessboard
                  boardWidth={300}
                  boardOrientation={setOrientation()}
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
                  onSquareClick={(square) => drawArrow(square)}
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
              <div>&nbsp;</div>
              <div className={styles.move_notation_buttons}>
                <IonButton
                  style={{ border: "1px solid black", borderRadius: "20%" }}
                  color="light"
                  onClick={() => setMoveBook()}
                >
                  <IonIcon icon={bookOutline} />
                </IonButton>
                <IonButton
                  style={{ border: "1px solid black", borderRadius: "20%" }}
                  color="light"
                  onClick={() => setMoveBrilliant()}
                >
                  <IonIcon icon={alertOutline} />
                </IonButton>
                <IonButton
                  style={{ border: "1px solid black", borderRadius: "20%" }}
                  color="light"
                  onClick={() => setMoveBlunder()}
                >
                  <IonIcon icon={helpOutline} />
                </IonButton>
                <IonButton
                  style={{ border: "1px solid black", borderRadius: "20%" }}
                  color="light"
                  onClick={() => setMoveDefault()}
                >
                  <AiOutlineCheck />
                </IonButton>
              </div>
              <div>&nbsp;</div>
              <div className={styles.set_all_default}>
                <IonButton onClick={() => setAllDefault()}>
                  <IonLabel>Set all default</IonLabel>
                </IonButton>
              </div>
            </div>
          </div>
          <div className={styles.modal_section}>
            <div className={styles.pgn_div}>
              <IonLabel>
                <p>{text.pgn}</p>
              </IonLabel>
            </div>
          </div>
        </div>
      </IonModal>
    </>
  );
};

export default Card;
