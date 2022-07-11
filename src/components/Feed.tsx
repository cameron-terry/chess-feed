// import required modules
import styles from "./Feed.module.scss";
import Card, { CardFrontText } from "./Card";
import { firestore } from "../firebase";
import { useEffect, useState } from "react";

// convert seconds format to identifier:
// "daily" || "rapid" || "blitz" || "bullet"
const convertTCNumtoStr = (tc: string) => {
  switch (tc) {
    case "1/259200":
      return "daily";
    case "1/86400":
      return "daily";
    case "900+10":
      return "rapid";
    case "600":
      return "rapid";
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

// for accessing .where() from Firebase
interface QueryContext {
  field1: string;
  field2: any;
  field3: string;
}

// for displaying cards based on filter
export interface FilterProps {
  eco: string;
  minMoves: number | null;
  maxMoves: number | null;
  refresh: boolean;
  reverse: boolean;
  bookmark: boolean;
}

export const Feed: React.FC<FilterProps> = (props) => {
  const [data, setData] = useState<CardFrontText[]>([]);
  const [lastValue, setLastValue] = useState<number>();

  useEffect(() => {
    const fetchFirstCollection = async () => {
      await getGamesWhere({
        field1: "eco",
        field2: "==",
        field3: props.eco,
      }).then((games) => {
        setData(games);
      });
    };

    fetchFirstCollection();
  }, []);

  useEffect(() => {
    const fetchQuery = async () => {
      await getGamesWhere(
        {
          field1: "eco",
          field2: "==",
          field3: props.eco,
        },
        false,
        props.reverse
      ).then((games) => {
        setData(games);
      });
    };

    fetchQuery();
  }, [props.eco]);

  useEffect(() => {
    const newCollection = async () => {
      await getGamesWhere(
        {
          field1: "eco",
          field2: "==",
          field3: props.eco,
        },
        true,
        props.reverse,
        props.bookmark
      ).then((games) => {
        setData(games);
      });
    };

    newCollection();
  }, [props.refresh, props.bookmark]);

  const getGamesWhere = async (
    query: QueryContext,
    getNextBatch: boolean = false,
    reverse: boolean = false,
    bookmark: boolean = false
  ) => {
    let queryResult;

    if (bookmark) {
      queryResult = firestore
        .collection("users")
        .doc("roudiere")
        .collection("games")
        .where("bookmark", "==", true);
    } else {
      queryResult = firestore
        .collection("users")
        .doc("roudiere")
        .collection("games")
        .where(query.field1, query.field2, query.field3);
    }

    queryResult = reverse
      ? queryResult.orderBy("smoothness", "asc")
      : queryResult.orderBy("smoothness", "desc");

    if (!bookmark && getNextBatch && lastValue !== undefined) {
      queryResult = queryResult.startAt(lastValue).limit(10);
    } else {
      // TODO: remove eventually, exists for testing purposes
      // stuff gets very laggy when i pull all cards at once
      if (!bookmark) queryResult = queryResult.limit(10);
    }

    return queryResult.get().then(async (querySnapshot) => {
      if (querySnapshot.docs.length > 0) {
        setLastValue(
          querySnapshot.docs[querySnapshot.docs.length - 1].data().smoothness
        );
      }
      const queryDocs = querySnapshot.docs.map((doc: any) => {
        const returnData: CardFrontText = {
          opponent: doc.data().opponent,
          h: doc.data().smoothness,
          time_control: convertTCNumtoStr(doc.data().time_control)!,
          result: doc.data().result,
          pgn: doc.data().pgn,
          color: doc.data().color,
          gameLink: doc.id,
        };
        return returnData;
      });

      return reverse ? queryDocs.reverse() : queryDocs;
    });
  };

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
