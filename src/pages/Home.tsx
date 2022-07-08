import {
  IonButton,
  IonContent,
  IonHeader,
  IonIcon,
  IonPage,
  useIonViewWillEnter,
} from "@ionic/react";

import Feed from "../components/Feed";
import "./Home.css";

import {
  settingsOutline,
  filter,
  documentOutline,
  starOutline,
  gridOutline,
} from "ionicons/icons";

const Home: React.FC = () => {
  return (
    <IonPage>
      <IonHeader></IonHeader>
      <IonContent fullscreen>
        <div className="container">
          <Feed />
        </div>
        <div className="home_button_div menu">
          <IonButton className="home_button" color={"dark"}>
            <IonIcon className="home_icon" icon={gridOutline} />
          </IonButton>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
