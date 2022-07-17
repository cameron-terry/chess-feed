import { IonCard, IonIcon, IonItem, IonLabel, IonModal } from "@ionic/react";
import { Chess } from "chess.js";
import { heart } from "ionicons/icons";
import { useEffect, useState } from "react";
import { Chessboard } from "react-chessboard";
import { FaChess, FaChessBoard } from "react-icons/fa";

export interface OpeningProps {
  avg_cp_loss_per_game: number;
  best: number;
  black_win_percent: number;
  blunders_per_game: number;
  elo: number;
  familiarity: number;
  games: number;
  inaccuracies_per_game: number;
  last_played: string;
  mistakes_per_game: number;
  opening: string;
  score: number;
  sharpness: number;
  white_win_percent: number;
}

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

  // todo: make this cleaner with regex (tried for a bit and failed)
  const parseMoveList = (moveList: string) => {
    const pieces = moveList.split(" ");

    let parsed_once = pieces.map((piece, index) => {
      if (index % 3 === 0 && index + 1 < pieces.length) {
        return pieces[index] + "." + pieces[index + 1];
      } else if (index + 1 < pieces.length) {
        return pieces[index + 1];
      }
    });

    let i = parsed_once.length;
    const n = 3;
    while (i--) (i + 1) % n === 0 && parsed_once.splice(i, 1);
    // console.log(parsed_once.filter((n) => n));

    return parsed_once.filter((n) => n).join(" ");
  };

  useEffect(() => {
    game.load_pgn(parseMoveList(moves));
    setGame(new Chess(game.fen()));
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
