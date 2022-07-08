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
  IonTitle,
  IonToolbar,
  useIonViewWillEnter,
} from "@ionic/react";

import Feed, { FilterProps } from "../components/Feed";
import "./Home.css";

import {
  settingsOutline,
  filter,
  documentOutline,
  starOutline,
  gridOutline,
  closeCircle,
} from "ionicons/icons";
import { useState } from "react";

const Home: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [ecoText, setEcoText] = useState<string>("");
  const [minMovesText, setMinMovesText] = useState<string | null>(null);
  const [maxMovesText, setMaxMovesText] = useState<string | null>(null);

  const [eco, setEco] = useState<string>("C05");

  const [filterProps, setFilterProps] = useState<FilterProps>({
    eco: "C05",
    minMoves: null,
    maxMoves: null,
  });

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
      });
    } else {
      setFilterProps({
        eco: ecoText,
        minMoves: min_moves,
        maxMoves: max_moves,
      });
    }

    return true;
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
            <IonIcon className="home_icon" icon={gridOutline} />
          </IonButton>
        </div>
        <IonModal isOpen={isOpen}>
          <IonHeader>
            <IonToolbar>
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
          <IonList lines="none">
            <IonItem>
              <IonLabel position="stacked">ECO</IonLabel>
              <IonInput
                value={ecoText}
                placeholder="C05"
                onIonChange={(e) => setEcoText(e.detail.value!)}
              ></IonInput>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">min moves</IonLabel>
              <IonInput
                value={minMovesText}
                placeholder="any"
                onIonChange={(e) => setMinMovesText(e.detail.value!)}
              ></IonInput>
            </IonItem>
            <IonItem>
              <IonLabel position="stacked">max moves</IonLabel>
              <IonInput
                value={maxMovesText}
                placeholder="any"
                onIonChange={(e) => setMaxMovesText(e.detail.value!)}
              ></IonInput>
            </IonItem>
          </IonList>
        </IonModal>
      </IonContent>
    </IonPage>
  );
};

export default Home;
