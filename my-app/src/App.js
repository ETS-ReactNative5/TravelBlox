import '@fontsource/roboto/300.css';
import '@fontsource/roboto/400.css';
import '@fontsource/roboto/500.css';
import '@fontsource/roboto/700.css';
import './styles/alertStyles.scss';

import { Route, Router, Routes } from 'react-router-dom';
import { collection, doc, getDoc, getDocs } from 'firebase/firestore';
import { createContext, useEffect, useState } from 'react';
import {
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from 'firebase/auth';

import AddNewPlan from './pages/AddNewPlan';
import Allplans from './pages/AllPlans';
import Dashboard from './pages/Dashboard';
import EditPlanDetail from './pages/EditPlanDetail';
import GlobalStyle from './styles/globalStyles';
import ParallaxLanding from './pages/ParallaxLanding';
import StaticPlanDetail from './pages/StaticPlanDetail';
import Swal from 'sweetalert2';
import { Wrapper } from '@googlemaps/react-wrapper';
import firebaseDB from './utils/firebaseConfig';
import { useNavigate } from 'react-router-dom';

const db = firebaseDB();

export const UserContext = createContext();

function App() {
  const [defaultImg, setDefaultImg] = useState('');
  const navigate = useNavigate();
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const auth = getAuth();
    onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserInfo({
          userToken: user.accessToken,
          userEmail: user.email,
        });
        navigate('/discover');
      } else {
        console.log('not logged in');
      }
    });
  }, []);

  useEffect(async () => {
    const docSnap = await getDoc(
      doc(db, 'main-components', 'default_plan_img')
    );

    setDefaultImg(docSnap.data().default_plan_img);
  }, []);

  return (
    <>
      <UserContext.Provider value={userInfo}>
        <GlobalStyle />

        <Wrapper
          apiKey={process.env.REACT_APP_GOOGLE_API_KEY}
          libraries={['places']}>
          <Routes>
            <Route path="/" element={<ParallaxLanding />} />
            <Route
              path="/edit-plan-detail/:planDocRef"
              element={<EditPlanDetail />}
            />
            <Route
              path="/new-plan"
              element={<AddNewPlan defaultImg={defaultImg} />}
            />
            <Route
              path="/static-plan-detail/:planDocRef"
              element={<StaticPlanDetail />}
            />

            <Route path="/dashboard" element={<Dashboard />} />
            <Route
              path="/discover"
              element={<Allplans defaultImg={defaultImg} />}
            />
          </Routes>
        </Wrapper>
      </UserContext.Provider>
    </>
  );
}

export default App;
