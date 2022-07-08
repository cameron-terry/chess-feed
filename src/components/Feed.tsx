// import required modules
import styles from "./Feed.module.scss";
import Card, { CardFrontText } from "./Card";
import { firestore } from "../firebase";
import { useEffect, useState } from "react";

const convertTCNumtoStr = (tc: string) => {
  switch (tc) {
    case "1/259200":
      return "daily";
    case "1/86400":
      return "daily";
    case "900+10":
      return "rapid";
    case "600":
      return "blitz";
    case "300":
      return "blitz";
    case "180+2":
      return "blitz";
    case "180":
      return "blitz";
    case "120+1":
      return "bullet";
    case "60":
      return "bullet";
  }
};

interface CardData {
  opponent: string;
  h: number;
  image: string;
  time_control: string;
  result: string;
}

interface QueryContext {
  field1: string;
  field2: any;
  field3: string;
}

export interface FilterProps {
  eco: string;
  minMoves: number | null;
  maxMoves: number | null;
}

export const Feed: React.FC<FilterProps> = (props) => {
  const [data, setData] = useState<CardFrontText[]>([]);

  useEffect(() => {
    const fetchFirstCollection = async () => {
      await getGamesWhere(
        { field1: "eco", field2: "==", field3: props.eco },
        5
      ).then((games) => {
        setData(games);
      });
    };

    fetchFirstCollection();
  }, []);

  useEffect(() => {
    const fetchQuery = async () => {
      await getGamesWhere({
        field1: "eco",
        field2: "==",
        field3: props.eco,
      }).then((games) => {
        setData(games);
      });
    };

    fetchQuery();
  }, [props]);

  const getGamesWhere = async (
    query: QueryContext,
    limit: number | null = null
  ) => {
    let queryResult = firestore
      .collection("users")
      .doc("roudiere")
      .collection("games")
      .where(query.field1, query.field2, query.field3);

    if (limit !== null) {
      queryResult = queryResult.limit(limit);
    }

    return queryResult.get().then(async (querySnapshot) => {
      return querySnapshot.docs.map((doc: any) => {
        const returnData: CardFrontText = {
          opponent: doc.data().opponent,
          h: doc.data().smoothness,
          image: doc.data().image_url,
          time_control: convertTCNumtoStr(doc.data().time_control)!,
          result: doc.data().result,
          pgn: doc.data().pgn,
        };
        return returnData;
      });
    });
  };

  // async function getNextBatch() {
  //   console.log(`${numLoaded} cards in view`);
  // }

  return (
    <div className={styles.swiper_container_div}>
      {data &&
        data.map((game, index) => {
          return (
            <section key={index}>
              <Card text={game} />
            </section>
          );
        })}
    </div>
  );
};

export default Feed;