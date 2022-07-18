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

// todo: make this cleaner with regex (tried for a bit and failed)
export const parseMoveList = (moveList: string) => {
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
