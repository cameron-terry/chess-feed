import {
  IonPage,
  IonContent,
  IonButton,
  IonIcon,
  IonToolbar,
  IonTitle,
  IonList,
  IonItem,
  IonLabel,
  IonCol,
  IonGrid,
  IonRow,
  IonPopover,
} from "@ionic/react";
import { Chess } from "chess.js";
import {
  alertOutline,
  barChartOutline,
  bookOutline,
  chevronBackOutline,
  flashOutline,
  helpOutline,
  informationCircleOutline,
  statsChartOutline,
  timerOutline,
} from "ionicons/icons";
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { FaChessPawn, FaMicrochip } from "react-icons/fa";
import { useParams } from "react-router-dom";
import { ScoreBar } from "../components/openings/ScoreBar";
import { firestore } from "../firebase";
import { OpeningProps, parseMoveList } from "./OpeningProps";

const OpeningDetail: React.FC = () => {
  const [data, setData] = useState<OpeningProps>();
  const [openingGame, setOpeningGame] = useState(new Chess());

  let { id } = useParams<{ id: string }>();
  let eco = id.split("_")[0];
  let mode = id.split("_")[1];

  let icon_choice = mode === "blitz" ? flashOutline : timerOutline;

  const getOpeningInfo = async () => {
    const queryResult = firestore
      .collection("users")
      .doc("roudiere")
      .collection(`${mode}Openings`)
      .where("eco", "==", eco);

    return queryResult.get().then((querySnapshot) => {
      return querySnapshot.docs.map((doc) => {
        const result: OpeningProps = {
          avg_cp_loss_per_game: doc.data().avg_cp_loss_per_game,
          best: doc.data().best,
          black_win_percent: doc.data().black_win_percent,
          blunders_per_game: doc.data().blunders_per_game,
          elo: doc.data().elo,
          familiarity: doc.data().familiarity,
          games: doc.data().games,
          inaccuracies_per_game: doc.data().inaccuracies_per_game,
          last_played: doc.data().last_played,
          mistakes_per_game: doc.data().mistakes_per_game,
          opening: doc.data().opening,
          score: doc.data().score,
          sharpness: doc.data().sharpness,
          white_win_percent: doc.data().white_win_percent,
        };
        return result;
      });
    });
  };

  useEffect(() => {
    getOpeningInfo().then((data) => {
      const result = data[0];
      const eco = result.opening.split("--")[0];
      const name_unparsed = result.opening.split("--")[1];

      const name = name_unparsed.split("(")[0];
      const moves = name_unparsed.split("(")[1].replace(")", "");

      openingGame.load_pgn(parseMoveList(moves));

      setOpeningGame(new Chess(openingGame.fen()));
      setData(result);
    });
  }, []);

  return (
    <IonPage>
      <IonContent>
        <IonToolbar>
          <IonButton
            slot="start"
            routerLink="/openings"
            color={"translucent"}
            routerDirection="back"
          >
            <div style={{ fontSize: "1.5em" }}>
              <IonIcon icon={chevronBackOutline} />
            </div>
          </IonButton>
          <IonTitle>
            <h1
              style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <b style={{ marginRight: "10px" }}>{eco}</b>
              <IonIcon icon={icon_choice} />
            </h1>
          </IonTitle>
          <IonButton slot="end" color={"translucent"} id="click-trigger">
            <div style={{ fontSize: "1.5em" }}>
              <IonIcon icon={informationCircleOutline} />
            </div>
          </IonButton>
          <IonPopover trigger="click-trigger" triggerAction="click">
            <IonContent class="ion-padding">
              <div>
                <IonLabel>
                  <h1>What do the icons represent?</h1>
                </IonLabel>
                <IonLabel
                  style={{ display: "flex", alignItems: "center", gap: "1em" }}
                >
                  <IonIcon icon={barChartOutline} />:<p>elo</p>
                </IonLabel>
                <IonLabel
                  style={{ display: "flex", alignItems: "center", gap: "1em" }}
                >
                  <IonIcon icon={bookOutline} />:<p>exploration</p>
                </IonLabel>
                <IonLabel
                  style={{ display: "flex", alignItems: "center", gap: "1em" }}
                >
                  <IonIcon icon={alertOutline} style={{ color: "lightblue" }} />
                  :<p>sharpness</p>
                </IonLabel>
                <IonLabel
                  style={{ display: "flex", alignItems: "center", gap: "1em" }}
                >
                  <h2 style={{ color: "yellow" }}>!?</h2>:<p>inaccuracy</p>
                </IonLabel>
                <IonLabel
                  style={{ display: "flex", alignItems: "center", gap: "1em" }}
                >
                  <IonIcon icon={helpOutline} style={{ color: "orange" }} />:
                  <p>mistake</p>
                </IonLabel>
                <IonLabel
                  style={{ display: "flex", alignItems: "center", gap: "1em" }}
                >
                  <h2 style={{ color: "red" }}>??</h2>:<p>blunder</p>
                </IonLabel>
                <IonLabel>
                  <h1>What is centipawn loss?</h1>
                  <p>It's a measure of how much advantage a move gave.</p>
                </IonLabel>
              </div>
            </IonContent>
          </IonPopover>
        </IonToolbar>
        <div
          style={{
            height: "90vh",
            display: "grid",
            gridTemplateRows: "1fr 1fr",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <Chessboard
              position={openingGame.fen()}
              boardWidth={300}
              customDarkSquareStyle={{ backgroundColor: "#3d8a99" }}
              customLightSquareStyle={{ backgroundColor: "#edeed1" }}
            />
          </div>
          <IonGrid>
            <IonRow style={{ display: "flex", justifyContent: "center" }}>
              {" "}
              <IonLabel>
                <h1>opening strength</h1>
              </IonLabel>{" "}
            </IonRow>
            <IonRow>
              <IonCol>
                <IonItem lines="none">
                  <IonLabel style={{ textAlign: "center" }}>
                    <IonIcon icon={barChartOutline} />
                    <p>{data && data.elo}</p>
                  </IonLabel>
                </IonItem>
              </IonCol>
              <IonCol>
                <IonItem lines="none">
                  <IonLabel style={{ textAlign: "center" }}>
                    <IonIcon icon={bookOutline} />
                    <p>{data && data.familiarity.toFixed(2)}</p>
                  </IonLabel>
                </IonItem>
              </IonCol>
              <IonCol>
                <IonItem lines="none">
                  <IonLabel style={{ textAlign: "center" }}>
                    <IonIcon
                      icon={alertOutline}
                      style={{ color: "lightblue" }}
                    />
                    <p>{data && data.sharpness.toFixed(2)}</p>
                  </IonLabel>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow>
              <IonCol />
            </IonRow>
            <IonRow style={{ display: "flex", justifyContent: "center" }}>
              {" "}
              <IonLabel>
                <h1>per game</h1>
              </IonLabel>{" "}
            </IonRow>
            <IonRow>
              <IonCol>
                <IonItem lines="none">
                  <IonLabel style={{ textAlign: "center" }}>
                    <h2 style={{ color: "yellow" }}>!?</h2>
                    <p>{data && data.inaccuracies_per_game.toFixed(2)}</p>
                  </IonLabel>
                </IonItem>
              </IonCol>
              <IonCol>
                <IonItem lines="none">
                  <IonLabel style={{ textAlign: "center" }}>
                    <h2 style={{ color: "orange" }}>?</h2>
                    <p>{data && data.mistakes_per_game.toFixed(2)}</p>
                  </IonLabel>
                </IonItem>
              </IonCol>
              <IonCol>
                <IonItem lines="none">
                  <IonLabel style={{ textAlign: "center" }}>
                    <h2 style={{ color: "red" }}>??</h2>
                    <p>{data && data.blunders_per_game.toFixed(2)}</p>
                  </IonLabel>
                </IonItem>
              </IonCol>
            </IonRow>
            <IonRow style={{ display: "flex", justifyContent: "center" }}>
              {" "}
              <IonLabel>
                <h1>score</h1>
              </IonLabel>{" "}
            </IonRow>
            <IonRow style={{ display: "flex", justifyContent: "center" }}>
              {" "}
              <FaChessPawn style={{ color: "white" }} />
              &nbsp;
              {data && (
                <ScoreBar
                  left={0}
                  value={
                    isNaN(data.white_win_percent) ? 0 : data.white_win_percent
                  }
                  right={1}
                />
              )}{" "}
            </IonRow>
            <IonRow>
              <IonCol />
            </IonRow>
            <IonRow style={{ display: "flex", justifyContent: "center" }}>
              {" "}
              <FaChessPawn />
              &nbsp;
              {data && (
                <ScoreBar
                  left={0}
                  value={
                    isNaN(data.black_win_percent) ? 0 : data.black_win_percent
                  }
                  right={1}
                />
              )}{" "}
            </IonRow>
            <IonRow>
              <IonCol />
            </IonRow>
            <IonRow>
              <IonCol />
            </IonRow>
            <IonRow style={{ display: "flex", justifyContent: "center" }}>
              {" "}
              <IonLabel>
                <h1 style={{ fontSize: "0.8em" }}>
                  average centipawn loss per move / game
                </h1>
              </IonLabel>{" "}
            </IonRow>
            <IonRow style={{ display: "flex", justifyContent: "center" }}>
              {" "}
              <IonLabel style={{ textAlign: "center" }}>
                <FaMicrochip />
                <p>{data && data.avg_cp_loss_per_game.toFixed(2)}</p>
              </IonLabel>{" "}
            </IonRow>
          </IonGrid>
        </div>
      </IonContent>
    </IonPage>
  );
};

const ItemRow: React.FC<{ title: string; value: number }> = ({
  title,
  value,
}) => {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "1fr 1fr",
        width: "80vw",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        {title}
      </div>
      <div
        style={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
        }}
      ></div>
    </div>
  );
};

export default OpeningDetail;
