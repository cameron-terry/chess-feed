import { firestore } from "../firebase";
import { Container } from "../components/openings/Container";

import {
  IonPage,
  IonContent,
  IonList,
  IonItem,
  IonButton,
  IonHeader,
  IonIcon,
  IonToolbar,
  IonLabel,
  IonSegment,
  IonSegmentButton,
  useIonLoading,
} from "@ionic/react";
import { chevronBackOutline, flashOutline, timerOutline } from "ionicons/icons";
import { useEffect, useState } from "react";
import { OpeningProps } from "./OpeningProps";

const Openings: React.FC = () => {
  const [openings, setOpenings] = useState<OpeningProps[]>([]);
  const [selected, setSelected] = useState<string>("blitz");

  const [present, dismiss] = useIonLoading();

  const getOpenings = async (value: string) => {
    const blitzOpenings = firestore
      .collection("users")
      .doc("roudiere")
      .collection(`${value}Openings`)
      .orderBy("best", "desc");

    // can't go inside segment change code -- creates an infinite loop
    setSelected(value);

    const result = blitzOpenings.get().then((querySnapshot) => {
      return querySnapshot.docs.map((doc) => {
        const opening: OpeningProps = {
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
        return opening;
      });
    });
    return result;
  };

  useEffect(() => {
    getOpenings("blitz").then((openings) => {
      setOpenings(openings);
    });
  }, []);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButton
            slot="start"
            routerLink="/home"
            color={"translucent"}
            routerDirection="back"
          >
            <div style={{ fontSize: "1.5em" }}>
              <IonIcon icon={chevronBackOutline} />
            </div>
          </IonButton>
          <IonLabel slot="start">
            <h1>
              <b>Opening stats</b>
            </h1>
          </IonLabel>
          <IonSegment
            value={selected}
            onIonChange={(e) => {
              getOpenings(e.detail.value!).then((openings) => {
                setOpenings(openings);
              });
            }}
          >
            <IonSegmentButton value="blitz">
              <IonIcon icon={flashOutline} />
            </IonSegmentButton>
            <IonSegmentButton value="rapid">
              <IonIcon icon={timerOutline} />
            </IonSegmentButton>
          </IonSegment>
        </IonToolbar>
      </IonHeader>
      <IonContent fullscreen>
        <IonList>
          {openings &&
            openings.map((opening, index) => {
              return (
                // todo: make each open a dynamic page
                <IonItem
                  button
                  routerLink={`/openings/${
                    openings[index].opening.split("--")[0]
                  }_${selected}`}
                  key={index}
                >
                  <Container {...opening} />
                </IonItem>
              );
            })}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default Openings;
