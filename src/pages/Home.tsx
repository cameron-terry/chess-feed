import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonInput,
  IonItem,
  IonLabel,
  IonList,
  IonModal,
  IonPage,
  IonSegment,
  IonSegmentButton,
  IonTextarea,
  IonTitle,
  IonToolbar,
} from "@ionic/react";

import Feed, { FilterProps } from "../components/Feed";
import "./Home.css";

import {
  closeCircle,
  arrowDownOutline,
  arrowUpOutline,
  bookmark,
  bookOutline,
  swapVerticalOutline,
} from "ionicons/icons";

import { FaDatabase, FaFilter } from "react-icons/fa";

import { useState } from "react";
import { Chessboard, Square } from "react-chessboard";
import { Chess } from "chess.js";

const Home: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ecoText, setEcoText] = useState<string>("");
  const [minMovesText, setMinMovesText] = useState<string | null>(null);
  const [maxMovesText, setMaxMovesText] = useState<string | null>(null);
  const [lineText, setLineText] = useState<string | null>(null);

  const [eco, setEco] = useState<string>("C05");
  const [refresh, setRefresh] = useState<boolean>(false);
  const [showBookmarks, setShowBookmarks] = useState<boolean>(false);
  const [line, setLine] = useState<string | undefined>(undefined);
  const [color, setColor] = useState<string | undefined>("any");

  const [clearColor, setClearColor] = useState<string>("medium");
  const [userOrientation, setUserOrientation] = useState<string>("white");

  const [modalGame, setModalGame] = useState(new Chess());

  const [filterProps, setFilterProps] = useState<FilterProps>({
    eco: eco,
    minMoves: null,
    maxMoves: null,
    refresh: refresh,
    reverse: false,
    bookmark: showBookmarks,
  });

  const safeGameMutate = (modify: any) => {
    setModalGame((g) => {
      const update = { ...g };
      modify(update);
      return update;
    });
  };

  const setParams = async () => {
    const min_moves: number | null =
      minMovesText !== null ? parseInt(minMovesText) : null;
    const max_moves: number | null =
      maxMovesText !== null ? parseInt(maxMovesText) : null;

    if (ecoText === null || ecoText === undefined || ecoText === "") {
      setFilterProps({
        eco: eco,
        minMoves: min_moves,
        maxMoves: max_moves,
        refresh: refresh,
        reverse: false,
        bookmark: showBookmarks,
        line: line,
        color: color,
      });
    } else {
      setFilterProps({
        eco: ecoText,
        minMoves: min_moves,
        maxMoves: max_moves,
        refresh: refresh,
        reverse: false,
        bookmark: showBookmarks,
        line: line,
        color: color,
      });
      setEco(ecoText);
      setEcoText("");
    }

    return true;
  };

  const getOrientation = () => {
    return userOrientation === "white" ? "white" : "black";
  };

  const flipBoard = () => {
    userOrientation === "white"
      ? setUserOrientation("black")
      : setUserOrientation("white");
  };

  const modalBoardOnDrop = (sourceSquare: Square, targetSquare: Square) => {
    let move = null;
    safeGameMutate(
      (modalGame: {
        move: (arg0: { from: Square; to: Square; promotion: string }) => any;
      }) => {
        move = modalGame.move({
          from: sourceSquare,
          to: targetSquare,
          promotion: "q", // always promote to a queen for example simplicity
        });
      }
    );

    setLineText(modalGame.pgn().replaceAll(". ", "."));
    if (move !== null) {
      setClearColor("danger");
    }
    return move === null ? false : true; // illegal move?
  };

  const clearLineText = () => {
    setModalGame(new Chess());
    setLine("");
    setLineText("");
    setClearColor("medium");
  };

  return (
    <IonPage>
      <IonHeader></IonHeader>
      <IonContent fullscreen>
        <div className="container">
          <Feed {...filterProps} />
        </div>
        <div className="home_button_div menu">
          <IonButton
            className="home_button"
            color={"dark"}
            onClick={() => setIsOpen(true)}
          >
            <FaDatabase />
          </IonButton>
        </div>
        <div className="home_button_div up">
          <IonButton
            className="home_button"
            color={"translucent"}
            onClick={() => {
              setFilterProps({
                eco: eco,
                minMoves: filterProps.minMoves,
                maxMoves: filterProps.maxMoves,
                refresh: !refresh,
                reverse: true,
                bookmark: showBookmarks,
                line: line,
                color: color,
              });
              setRefresh(!refresh);
            }}
          >
            <IonIcon className="home_icon" icon={arrowUpOutline} />
          </IonButton>
        </div>
        <div className="home_button_div right">
          <IonButton
            className="home_button"
            color={"translucent"}
            onClick={() => {
              setFilterProps({
                eco: eco,
                minMoves: filterProps.minMoves,
                maxMoves: filterProps.maxMoves,
                refresh: refresh,
                reverse: false,
                bookmark: !showBookmarks,
                line: line,
                color: color,
              });

              setShowBookmarks(!showBookmarks);
            }}
          >
            <IonIcon
              className="home_icon"
              style={{
                color: showBookmarks ? "red" : "white",
              }}
              icon={bookmark}
            />
          </IonButton>
        </div>
        <div className="home_button_div down">
          <IonButton
            className="home_button"
            color={"translucent"}
            onClick={() => {
              setFilterProps({
                eco: eco,
                minMoves: filterProps.minMoves,
                maxMoves: filterProps.maxMoves,
                refresh: !refresh,
                reverse: false,
                bookmark: showBookmarks,
                line: line,
                color: color,
              });
              setRefresh(!refresh);
            }}
          >
            <IonIcon className="home_icon" icon={arrowDownOutline} />
          </IonButton>
        </div>
        <IonModal isOpen={isOpen}>
          <IonHeader>
            <IonToolbar>
              <IonLabel slot="start">
                <div style={{ fontSize: "1.5em" }}>
                  <FaDatabase />
                </div>
              </IonLabel>
              <IonTitle>Filters</IonTitle>
              <IonButton
                slot={"end"}
                color={"translucent"}
                onClick={async () => {
                  await setParams().then(() => setIsOpen(false));
                }}
              >
                <IonIcon icon={closeCircle} />
              </IonButton>
            </IonToolbar>
          </IonHeader>
          <IonList>
            <IonItem>
              <IonLabel>
                <h1>Basic</h1>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">
                <IonIcon icon={bookOutline} />
                &nbsp; ECO
              </IonLabel>
              <IonInput
                value={ecoText}
                placeholder={eco}
                onIonChange={(e) => setEcoText(e.detail.value!)}
              ></IonInput>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">
                <FaFilter /> &nbsp; min moves
              </IonLabel>
              <IonInput
                value={minMovesText}
                placeholder="any"
                onIonChange={(e) => setMinMovesText(e.detail.value!)}
              ></IonInput>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">
                <FaFilter /> &nbsp; max moves
              </IonLabel>
              <IonInput
                value={maxMovesText}
                placeholder="any"
                onIonChange={(e) => setMaxMovesText(e.detail.value!)}
              ></IonInput>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">
                <h2>Color</h2>
              </IonLabel>
              <IonSegment
                onIonChange={(e) => setColor(e.detail.value)}
                value={color}
              >
                <IonSegmentButton value="white">white</IonSegmentButton>
                <IonSegmentButton value="any">any</IonSegmentButton>
                <IonSegmentButton value="black">black</IonSegmentButton>
              </IonSegment>
            </IonItem>
            <IonItem>
              <IonLabel>
                <h1>Advanced</h1>
              </IonLabel>
            </IonItem>
            <IonItem>
              <IonTextarea
                readonly
                value={lineText}
                placeholder=""
                onIonChange={(e) => setLineText(e.detail.value!)}
              ></IonTextarea>
              <IonButton
                style={{ height: 50 }}
                onClick={() => {
                  setFilterProps({
                    eco: eco,
                    minMoves: filterProps.minMoves,
                    maxMoves: filterProps.maxMoves,
                    refresh: refresh,
                    reverse: false,
                    bookmark: showBookmarks,
                    line: lineText!,
                    color: color,
                  });
                  setLine(lineText!);
                  setIsOpen(false);
                }}
              >
                Search by line
              </IonButton>
              <IonButton
                color={clearColor}
                style={{ height: 50 }}
                onClick={() => clearLineText()}
              >
                Clear
              </IonButton>
            </IonItem>
          </IonList>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            <Chessboard
              boardWidth={300}
              position={modalGame.fen()}
              boardOrientation={getOrientation()}
              onPieceDrop={modalBoardOnDrop}
              customBoardStyle={{
                borderRadius: "4px",
                boxShadow: "0 5px 15px rgba(0, 0, 0, 0.5)",
              }}
              customDarkSquareStyle={{ backgroundColor: "#3d8a99" }}
              customLightSquareStyle={{ backgroundColor: "#edeed1" }}
            />
            <div
              style={{
                position: "absolute",
                right: 0,
                bottom: "12px",
                fontSize: "1.5em",
              }}
            >
              <IonButton color={"translucent"} onClick={() => flipBoard()}>
                <IonIcon icon={swapVerticalOutline} />
              </IonButton>
            </div>
          </div>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Home;
