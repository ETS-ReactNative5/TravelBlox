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
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { getDocs, getDoc, collection } from 'firebase/firestore';
import firebaseDB from '../utils/firebaseConfig';
import EditPlanDetail from '../pages/EditPlanDetail';
import CountrySelector from '../components/CountrySelector';

const db = firebaseDB();

const SinglePlanContainer = styled.div`
  width: 400px;
  height: 400px;
  margin: 0 30px;
`;

const SinglePlanText = styled.div`
  font-size: 14px;
  font-weight: 600;
`;

const PlanMainImageContainer = styled.div`
  width: 100%;
`;

const ImageContainer = styled.div`
  width: 300px;
  max-width: 100%;
`;

const MainImage = styled.img`
  /* max-height: 100%; */
  max-width: 100%;
`;

function OwnPlanCard(props) {
  const [docData, setDocData] = useState(null);
  const [currentPlanRef, setCurrentPlanRef] = useState(null);
  const [doImport, setDoimport] = useState(false);
  const planId = props.ownPlanId;

  const navigate = useNavigate();

  const redirectToEdit = () => {
    navigate('/edit-plan-detail', { state: currentPlanRef });
  };

  const redirectToStatic = () => {
    navigate('/static-plan-detail', { state: currentPlanRef });
  };

  useEffect(async () => {
    const ref = collection(db, planId);
    const ownPlanData = await getDocs(ref);

    ownPlanData.forEach((doc) => {
      setCurrentPlanRef({
        collectionID: planId,
        planDocRef: doc.id,
      });

      setDocData(doc.data());
      return doc.data();
    });
  }, [planId]);

  useEffect(async () => {
    if (doImport) {
      const ref = collection(
        db,
        planId,
        currentPlanRef.planDocRef,
        'time_blocks'
      );
      const importTimeBlocks = await getDocs(ref);

      importTimeBlocks.forEach((doc) => {
        console.log(doc.data());
        return doc.data();
      });
    }
  }, [doImport]);

  function renderSwitch(identity) {
    switch (identity) {
      case 'author':
        redirectToEdit();
      case 'importer':
        // redirectToimport();
        setDoimport(true);
      default:
        redirectToStatic();
    }
  }

  return (
    docData && (
      <SinglePlanContainer
        onClick={
          () => renderSwitch(props.userIdentity)
          // props.userIdentity === 'author'
          //   ? redirectToEdit()
          //   : redirectToStatic()
        }>
        <PlanMainImageContainer>
          <SinglePlanText>{docData.title}</SinglePlanText>
          <ImageContainer>
            <MainImage src={docData.main_image} alt="main image"></MainImage>
          </ImageContainer>
        </PlanMainImageContainer>
      </SinglePlanContainer>
    )
  );
}

export default OwnPlanCard;
