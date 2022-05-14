import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

import { TextField, Button, IconButton, Box, Stack } from '@mui/material';
import { PhotoCamera } from '@mui/icons-material';
import '../styles/calendarStyle.scss';
import PlanCalendar from './PlanCalendar';
import AddNewTimeBlock from './AddNewTimeBlock';
import EditTimeBlock from './EditTimeBlock';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import firebaseDB from '../utils/firebaseConfig';
import { useNavigate, useLocation, useParams } from 'react-router-dom';
import CountrySelector from '../components/CountrySelector';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import DatePicker from '../components/Input/DatePicker';
import {
  handleMainImageUpload,
  addPlanToAllPlans,
  saveToDataBase,
  listenToSnapShot,
  getFavPlan,
} from '../utils/functionList';
import FavFolderDropdown from '../favourite/FavFolderDropdown';
import {
  themeColours,
  EditableMainImageContainer,
  EditableMainImage,
  FlexColumnWrapper,
  LightBlueBtn,
  PaleEmptyBtn,
} from '../styles/globalTheme';
import '../favourite/favDropDown.scss';
import Swal from 'sweetalert2';
import '../styles/alertStyles.scss';

const db = firebaseDB();

const Wrapper = styled.div`
  padding: 50px;
  margin: auto;
`;

const TopContainer = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;

  .instruction_text {
    color: ${themeColours.light_grey};
    font-size: 12px;
  }
`;

const CalendarContainer = styled.div`
  width: 100%;
  height: 60vh;
  margin-top: 60px;
  margin-bottom: 30px;
  position: relative;
`;

const Input = styled('input')({
  display: 'none',
});

const InstructionText = styled.div`
  font-size: 12px;
  font-weight: 600;
  font-style: italic;
  line-height: 1.5;
  text-align: center;
  padding: 10px 0;
`;

const ButtonContainer = styled.div`
  display: flex;
  padding: 30px;
  align-items: center;
  justify-content: center;
`;

async function addPlanToUserInfo(currentUserId, createPlanDocId) {
  console.log('saving this docRef to firebase', createPlanDocId);
  try {
    const userInfoRef = doc(
      db,
      'userId',
      currentUserId,
      'own_plans',
      createPlanDocId
    );

    await setDoc(
      userInfoRef,
      {
        collection_id: createPlanDocId,
      },
      { merge: true }
    );
  } catch (error) {
    console.log(error);
  }
}

const BottomBtnContainer = styled.div`
  display: flex;
  align-items: center;
  /* justify-content: space-between; */
  height: 150px;
  margin-bottom: 30px;
  position: relative;
  /* .left_btns {
    display: flex;
    align-items: center;
    position: relative;
  } */
`;

const CalendarColourBackground = styled.div`
  background-color: #fdfcf8;
  width: 100%;
  height: 60vh;
  z-index: -10;
  border-radius: 15%;
  right: 0;
  top: 15px;
  position: absolute;
`;

// defaultImg={defaultImg}
// user={user} accessToken, email
function AddNewPlan(props) {
  const { currentUserId } = useParams();
  const [username, setUsername] = useState('');
  // const location = useLocation();
  const [planTitle, setPlanTitle] = useState('');
  const [country, setCountry] = useState('');
  const [mainImage, setMainImage] = useState(null);
  const [showPopUp, setShowPopUp] = useState(false);
  const [myEvents, setMyEvents] = useState([]);
  const [showEditPopUp, setShowEditPopUp] = useState(false);
  const [currentSelectTimeData, setCurrentSelectTimeData] = useState('');
  const [currentSelectTimeId, setCurrentSelectTimeId] = useState('');
  const [hasCreatedCollection, setHasCreatedCollection] = useState(false);
  // const [collectionRef, setCollectionRef] = useState(null);
  const [startDateValue, setStartDateValue] = useState(new Date());
  const [endDateValue, setEndDateValue] = useState(new Date());
  const [planDocRef, setPlanDocRef] = useState('');
  const [addedTimeBlock, setAddedTimeBlock] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  const [favPlansNameList, setFavPlansNameList] = useState(null);
  const [showFavPlans, setShowFavPlans] = useState(false);
  const [selectedPlanId, setSelectedPlanId] = useState('');

  const [showFavContainer, setShowFavContainer] = useState(false);
  const navigate = useNavigate();
  const createNewCollection = async (
    startDateValue,
    endDateValue,
    planTitle,
    mainImage
  ) => {
    const currentTimeMilli = new Date().getTime();
    const createPlanDocId = `plan${currentTimeMilli}`;
    setPlanDocRef(createPlanDocId);

    if (mainImage === null || '') {
      mainImage = props.defaultImg;
      setMainImage(props.defaultImg);
    }

    try {
      // console.log(currentUserId);
      await setDoc(doc(db, 'plans', createPlanDocId), {
        author: currentUserId,
        author_name: username,
        start_date: startDateValue,
        end_date: endDateValue,
        title: planTitle,
        main_image: mainImage,
        published: false,
        planDocRef: createPlanDocId,
      });

      setHasCreatedCollection(true);

      addPlanToUserInfo(props.user.email, createPlanDocId);

      addPlanToAllPlans(
        props.user.email,
        createPlanDocId,
        planTitle,
        mainImage,
        country,
        isPublished
      );
    } catch (e) {
      console.error('Error adding document: ', e);
    }
  };

  useEffect(() => {
    if (addedTimeBlock) {
      console.log('addedTimeBlock is', addedTimeBlock);
      console.log('onsnap open');
      listenToSnapShot(setMyEvents, planDocRef);
    }
  }, [addedTimeBlock]);

  useEffect(async () => {
    if (currentUserId) {
      const userDoc = await getDoc(doc(db, 'userId', currentUserId));
      if (userDoc.data().username) {
        setUsername(userDoc.data().username);
      }
    }
  }, [currentUserId]);

  return (
    <Wrapper>
      {showPopUp ? (
        <AddNewTimeBlock
          setShowPopUp={setShowPopUp}
          showPopUp={showPopUp}
          collectionID={'plans'}
          planDocRef={planDocRef}
          setAddedTimeBlock={setAddedTimeBlock}
          startDateValue={startDateValue}
        />
      ) : null}
      {showEditPopUp ? (
        <EditTimeBlock
          showEditPopUp={showEditPopUp}
          setShowEditPopUp={setShowEditPopUp}
          currentSelectTimeData={currentSelectTimeData}
          currentSelectTimeId={currentSelectTimeId}
          collectionID={'plans'}
          planDocRef={planDocRef}
          status={'origin'}
        />
      ) : null}
      <>
        {!hasCreatedCollection && (
          <InstructionText>
            Please create some basic info first!
          </InstructionText>
        )}
        <TopContainer>
          <TitleSection>
            <TextField
              required
              sx={{
                m: 1,
                width: 300,
                label: { color: themeColours.light_orange },
              }}
              label="Title"
              variant="outlined"
              value={planTitle}
              onChange={(e) => {
                setPlanTitle(e.target.value);
              }}
              autoComplete="off"
            />
            <CountrySelector setCountry={setCountry} country={country} />

            <DatePicker
              startDateValue={new Date()}
              endDateValue={new Date()}
              setStartDateValue={setStartDateValue}
              setEndDateValue={setEndDateValue}
            />

            {hasCreatedCollection && (
              <>
                <FormControlLabel
                  control={
                    <Switch
                      style={{ color: themeColours.light_orange }}
                      checked={isPublished}
                      onChange={() => setIsPublished(!isPublished)}
                    />
                  }
                  label="Published"
                />
                <div className="instruction_text">
                  Checking this will make your travel plan public to others.
                </div>
              </>
            )}
          </TitleSection>

          <FlexColumnWrapper>
            {mainImage && (
              <EditableMainImageContainer>
                <EditableMainImage src={mainImage}></EditableMainImage>
              </EditableMainImageContainer>
            )}

            <label htmlFor="icon-button-file" className="upload_icon">
              <Input
                accept="image/*"
                id="icon-button-file"
                type="file"
                onChange={(e) => {
                  handleMainImageUpload(e, setMainImage);
                }}
              />
              <Box textAlign="center">
                <IconButton
                  color="primary"
                  aria-label="upload picture"
                  component="div">
                  <PhotoCamera style={{ color: themeColours.light_blue }} />
                </IconButton>
              </Box>
            </label>
          </FlexColumnWrapper>
        </TopContainer>

        {hasCreatedCollection ? (
          <>
            <CalendarContainer>
              <CalendarColourBackground></CalendarColourBackground>
              <PlanCalendar
                startDateValue={startDateValue}
                setMyEvents={setMyEvents}
                myEvents={myEvents}
                setShowEditPopUp={setShowEditPopUp}
                setCurrentSelectTimeData={setCurrentSelectTimeData}
                setCurrentSelectTimeId={setCurrentSelectTimeId}
              />
            </CalendarContainer>
            <BottomBtnContainer>
              <LightBlueBtn
                onClick={() => {
                  setShowPopUp(true);
                }}>
                Add new event
              </LightBlueBtn>

              <LightBlueBtn
                onClick={() => setShowFavContainer(!showFavContainer)}>
                Import Favourite
              </LightBlueBtn>

              {showFavContainer && (
                <FavFolderDropdown
                  showFavPlans={showFavPlans}
                  favPlansNameList={favPlansNameList}
                  setSelectedPlanId={setSelectedPlanId}
                  selectedPlanId={selectedPlanId}
                  planDocRef={planDocRef}
                  startDateValue={startDateValue}
                  currentUserId={currentUserId}
                />
              )}

              <LightBlueBtn
                variant="contained"
                onClick={() => {
                  console.log(myEvents.length);
                  if (myEvents.length === 0) {
                    Swal.fire('Please create at least one event!');
                  } else {
                    if (
                      saveToDataBase(
                        myEvents,
                        planTitle,
                        country,
                        mainImage,
                        planDocRef,
                        startDateValue,
                        endDateValue,
                        isPublished
                      )
                    ) {
                      navigate('/dashboard');
                    }
                  }
                }}>
                Save
              </LightBlueBtn>
            </BottomBtnContainer>
          </>
        ) : (
          <ButtonContainer>
            <Stack direction="row" alignItems="center" spacing={2}>
              <LightBlueBtn
                variant="contained"
                onClick={() => {
                  if (startDateValue && endDateValue && planTitle) {
                    console.log('going to create new plan');
                    createNewCollection(
                      startDateValue,
                      endDateValue,
                      planTitle,
                      mainImage
                    );
                  } else {
                    Swal.fire('Please provide the required fields!');
                  }
                }}>
                All Set
              </LightBlueBtn>
              <PaleEmptyBtn onClick={() => navigate('/dashboard')}>
                Nah create later
              </PaleEmptyBtn>
            </Stack>
          </ButtonContainer>
        )}
      </>
    </Wrapper>
  );
}

export default AddNewPlan;
