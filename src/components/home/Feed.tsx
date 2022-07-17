// import required modules
import styles from "./Feed.module.scss";
import Card, { CardFrontText } from "./Card";
import { firestore } from "../../firebase";
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
  filters?: Filters;
}

interface Filters {
  minMoves: number | null;
  maxMoves: number | null;
}

// for displaying cards based on filter
export interface FilterProps {
  eco: string;
  minMoves: number | null;
  maxMoves: number | null;
  refresh: boolean;
  reverse: boolean;
  bookmark: boolean;
  line?: string;
  color?: string;
}

export const Feed: React.FC<FilterProps> = (props) => {
  // cards
  const [data, setData] = useState<(CardFrontText | null)[]>([]);

  // smoothness, for sorting OR pgn for get by line
  const [lastValue, setLastValue] = useState<number | string>();

  const newCollection = async (getNextBatch: boolean) => {
    await getGamesWhere(
      {
        field1: "eco",
        field2: "==",
        field3: props.eco,
      },
      getNextBatch,
      props.reverse,
      props.bookmark,
      props.line,
      props.color
    ).then((games) => {
      setData(games);
    });
  };

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
    // eslint-disable-next-line
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
        props.reverse,
        props.bookmark,
        undefined, // prioritize new eco
        props.color
      ).then((games) => {
        setData(games);
      });
    };

    fetchQuery();
    // eslint-disable-next-line
  }, [props.eco]);

  // show bookmarks or last query, depending on if bookmark is selected
  useEffect(() => {
    newCollection(false);
    // eslint-disable-next-line
  }, [props.bookmark]);

  useEffect(() => {
    newCollection(true);
    // eslint-disable-next-line
  }, [props.refresh, props.line]);

  const getGamesWhere = async (
    query: QueryContext,
    getNextBatch: boolean = false,
    reverse: boolean = false,
    bookmark: boolean = false,
    line?: string,
    color?: string
  ) => {
    let queryResult;
    if (line !== undefined) {
      // have to create these indices to chain .wheres (cant call separately)
      // should probably move these to their own hooks / function calls
      if (color !== undefined && color !== "any") {
        queryResult = firestore
          .collection("users")
          .doc("roudiere")
          .collection("games")
          .where("color", "==", color)
          .where("pgn", ">=", line)
          .where("pgn", "<=", line + "\uf8ff")
          .orderBy("pgn");
      } else {
        queryResult = firestore
          .collection("users")
          .doc("roudiere")
          .collection("games")
          .where("pgn", ">=", line)
          .where("pgn", "<=", line + "\uf8ff")
          .orderBy("pgn");
      }
    } else if (bookmark) {
      if (color !== undefined && color !== "any") {
        queryResult = firestore
          .collection("users")
          .doc("roudiere")
          .collection("games")
          .where("color", "==", color)
          .where("bookmark", "==", true);
      } else {
        queryResult = firestore
          .collection("users")
          .doc("roudiere")
          .collection("games")
          .where("bookmark", "==", true);
      }
    } else {
      if (color !== undefined && color !== "any") {
        queryResult = firestore
          .collection("users")
          .doc("roudiere")
          .collection("games")
          .where("color", "==", color)
          .where(query.field1, query.field2, query.field3);
      } else {
        queryResult = firestore
          .collection("users")
          .doc("roudiere")
          .collection("games")
          .where(query.field1, query.field2, query.field3);
      }
    }

    // navigate up/down the result
    queryResult = reverse
      ? queryResult.orderBy("smoothness", "asc")
      : queryResult.orderBy("smoothness", "desc");

    // determine which page to show
    if (getNextBatch && lastValue !== undefined) {
      // next page
      queryResult = queryResult.startAt(lastValue).limit(10);
    } else {
      // first page
      queryResult = queryResult.limit(10);
    }

    // retrieve docs and return the data as CardFrontText
    return queryResult.get().then(async (querySnapshot) => {
      // set the last value (for pagination)
      if (querySnapshot.docs.length > 0) {
        if (line === undefined) {
          setLastValue(
            querySnapshot.docs[querySnapshot.docs.length - 1].data().smoothness
          );
        } else {
          setLastValue(
            querySnapshot.docs[querySnapshot.docs.length - 1].data().pgn
          );
        }
      }
      // data format
      const queryDocs = querySnapshot.docs
        .map((doc: any) => {
          const returnData: CardFrontText = {
            opponent: doc.data().opponent,
            h: doc.data().smoothness,
            time_control: convertTCNumtoStr(doc.data().time_control)!,
            result: doc.data().result,
            pgn: doc.data().pgn,
            color: doc.data().color,
            gameLink: doc.id,
          };
          return doc.data().hidden !== true ? returnData : null;
        })
        .filter((n) => n);

      // flip order if navigating up (so largest to smallest is preserved)
      return reverse ? queryDocs.reverse() : queryDocs;
    });
  };

  return (
    <div className={styles.swiper_container_div}>
      {data &&
        data.map((game, index) => {
          return (
            <section key={index}>
              <Card text={game!} />
            </section>
          );
        })}
    </div>
  );
};

export default Feed;
