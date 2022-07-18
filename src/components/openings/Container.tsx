import { IonItem, IonLabel } from "@ionic/react";
import { Chess } from "chess.js";
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { FaChess } from "react-icons/fa";
import { OpeningProps, parseMoveList } from "../../pages/OpeningProps";

export const Container: React.FC<OpeningProps> = (props) => {
  const [game, setGame] = useState(new Chess());

  const eco = props.opening.split("--")[0];
  const name_unparsed = props.opening.split("--")[1];

  const name = name_unparsed.split("(")[0];
  const moves = name_unparsed.split("(")[1].replace(")", "");

  const getColor = (n: number) => {
    if (n > 0.8) {
      return "#1be3f5";
    } else if (n > 0.5) {
      return "#5ef286";
    } else if (n > 0.3) {
      return "#eddb18";
    } else {
      return "#912020";
    }
  };

  useEffect(() => {
    game.load_pgn(parseMoveList(moves));
    setGame(new Chess(game.fen()));
    // eslint-disable-next-line
  }, [props]);

  return (
    <>
      <IonItem lines="none" slot="start">
        <Chessboard
          position={game.fen()}
          boardWidth={140}
          customDarkSquareStyle={{ backgroundColor: "#3d8a99" }}
          customLightSquareStyle={{ backgroundColor: "#edeed1" }}
        />
      </IonItem>

      <IonLabel text-wrap>
        <div style={{ textAlign: "right" }}>
          <h1>
            <b>{eco}</b>
          </h1>
          <h2>{name}</h2>
          <p style={{ color: "#bbbbbb" }}>{moves}</p>
          &nbsp;
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
            }}
          >
            <div style={{ display: "flex", gap: "5px", alignItems: "center" }}>
              <FaChess />
              <p style={{ color: "#bbb" }}>{props.games}</p>
            </div>

            <p style={{ color: getColor(props.best), fontWeight: "bold" }}>
              {props.best.toFixed(2)}
            </p>
          </div>
        </div>
      </IonLabel>
    </>
  );
};
