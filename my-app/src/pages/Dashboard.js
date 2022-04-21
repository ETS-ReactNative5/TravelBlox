import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import {
  InputLabel,
  TextField,
  Button,
  FormControl,
  MenuItem,
  Select,
  IconButton,
  Box,
  Card,
  CardMedia,
  CircularProgress,
  Typography,
  Avatar,
  Stack,
} from '@mui/material';
import EditPlanDetail from './EditPlanDetail';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import CountrySelector from '../components/CountrySelector';
import {
  getDocs,
  getDoc,
  collection,
  query,
  where,
  orderBy,
  doc,
} from 'firebase/firestore';
import firebaseDB from '../utils/firebaseConfig';
import OwnPlanCard from '../components/OwnPlanCard';
import FavPlanCard from '../components/PublicPlanCard';

const db = firebaseDB();

const TopSectionWrapper = styled.div`
  display: flex;
`;

const AddPlanBtn = styled.button`
  height: 25px;
  width: 100%;
  padding: 20px;
  text-align: center;
  border: none;
  border-radius: 15px;
  background-color: aliceblue;
`;

const PlanCollectionWrapper = styled.div`
  display: flex;
  padding: 15px;
  width: 100%;
  box-sizing: content-box;
  overflow: auto;
  border: 1px solid black;
  margin: 30px 0;
`;

function Dashboard(props) {
  const [showAddPlanPopUp, setShowAddPlanPopup] = useState(false);
  const [currentUserId, setCurrentUserId] = useState('');
  const [ownPlansIdList, setOwnPlansIdList] = useState([]);
  const [favPlansIdList, setFavlansIdList] = useState(null);
  const [openEditPopUp, setOpenEditPopUp] = useState(false);
  const [currentPlanRef, setCurrentPlanRef] = useState([]);
  const navigate = useNavigate();

  useEffect(async () => {
    const user = localStorage.getItem('userEmail');
    if (!user) {
      alert('Please login first!');
      navigate('/landing');
    }
    setCurrentUserId(localStorage.getItem('userEmail'));

    const ref = collection(db, 'userId', user, 'own_plans');
    const plansList = await getDocs(ref);

    if (plansList.docs.length === 0) {
      console.log('No own plans yet!');
    } else {
      const list = [];
      plansList.forEach((plan) => {
        list.push(plan.data().collection_id);
      });
      setOwnPlansIdList(list);
    }
  }, []);

  useEffect(async () => {
    if (currentUserId) {
      const favRef = collection(db, 'userId', currentUserId, 'fav_plans');
      const favPlansIdList = await getDocs(favRef);

      if (favPlansIdList.docs.length === 0) {
        console.log('No fav plans yet!');
      } else {
        const favList = favPlansIdList.docs.map((e) => e.data());
        setFavlansIdList(favPlansIdList.docs.map((e) => e.data()));
      }
    }
  }, [currentUserId]);

  return (
    <>
      <TopSectionWrapper>
        <Avatar
          onClick={() => {
            console.log('clicked');
          }}
          alt="Remy Sharp"
          src="/static/images/avatar/1.jpg"
          sx={{ width: 56, height: 56 }}
        />
        <h4>Welcom! {currentUserId}</h4>
      </TopSectionWrapper>
      <AddPlanBtn
        onClick={() => {
          setShowAddPlanPopup(!showAddPlanPopUp);
        }}>
        Add New Plan
      </AddPlanBtn>
      {/* {showAddPlanPopUp && <Navigate to="/add-new-plan" ></Navigate>} */}
      {showAddPlanPopUp && navigate('/add-new-plan', { state: favPlansIdList })}
      <PlanCollectionWrapper>
        {ownPlansIdList &&
          ownPlansIdList.map((ownPlanId) => (
            <OwnPlanCard
              userIdentity="author"
              ownPlanId={ownPlanId}
              key={ownPlanId}
              setOpenEditPopUp={setOpenEditPopUp}
              openEditPopUp={openEditPopUp}
            />
          ))}
      </PlanCollectionWrapper>

      <PlanCollectionWrapper>
        {favPlansIdList &&
          favPlansIdList.map((favPlanId) => (
            <OwnPlanCard
              userIdentity="public"
              ownPlanId={favPlanId.fav_collection_id}
              key={favPlanId.fav_collection_id}
            />
          ))}
      </PlanCollectionWrapper>
    </>
  );
}

export default Dashboard;
