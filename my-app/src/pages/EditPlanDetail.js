import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TextField, Button, IconButton, Box, Stack } from '@mui/material';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import Autocomplete from '@mui/material/Autocomplete';
import { PhotoCamera } from '@mui/icons-material';
import './../styles/calendarStyle.scss';
import PlanCalendar from './PlanCalendar';
import AddNewTimeBlock from './AddNewTimeBlock';
import EditTimeBlock from './EditTimeBlock';
import DatePicker from '../components/Input/DatePicker';
import CountrySelector from '../components/CountrySelector';
import FormControlLabel from '@mui/material/FormControlLabel';
import Switch from '@mui/material/Switch';
import {
  doc,
  getDoc,
  getDocs,
  collection,
  writeBatch,
} from 'firebase/firestore';
import firebaseDB from '../utils/firebaseConfig';
import { useNavigate, useLocation } from 'react-router-dom';
import ToggleAttractionSearch from '../components/travel_recommend/ToggleAttraction';
import {
  handleMainImageUpload,
  addPlanToAllPlans,
  saveToDataBase,
  listenToSnapShot,
  getFavPlan,
} from '../utils/functionList';
import FavFolderDropdown from '../components/FavFolderDropdown';
import {
  themeColours,
  EditableMainImageContainer,
  EditableMainImage,
  FlexColumnWrapper,
  LightBlueBtn,
  LightOrangeBtn,
  OrangeBtn,
  BlueBtn,
  PaleBtn,
} from '../styles/globalTheme';

const db = firebaseDB();

const Wrapper = styled.div`
  padding: 50px;
  margin: auto;
`;

const TopContainer = styled.div`
  display: flex;
  justify-content: center;
`;

const TitleSection = styled.div`
  display: flex;
  flex-direction: column;
  margin-right: 30px;
`;

const CalendarContainer = styled.div`
  width: 100%;
  height: 60vh;
  margin-top: 60px;
  margin-bottom: 40px;
`;

const Input = styled('input')({
  display: 'none',
});

const TypeInput = styled.input`
  width: 91%;
  margin-left: 8px;
  margin-bottom: 10px;
  height: 56px;
  padding-left: 20px;
  font-size: 16px;
  border-radius: 5px;
  border: 1px solid ${themeColours.llight_grey};

  &:focus,
  &:hover {
    border-color: ${themeColours.light_orange};
  }
`;

const BottomBtnContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;

  .left_btns {
    display: flex;
    align-items: center;
    position: relative;
  }
`;

const SelectImportDropdown = styled.div`
  position: absolute;
  display: flex;
  flex-direction: column;
  bottom: -60px;
  left: 164px;
`;
// props
// userId={user.email} favFolderNames={favFolderNames}
//currentPlanRef
function EditPlanDetail(props) {
  const [planTitle, setPlanTitle] = useState('');
  const [country, setCountry] = useState('');
  const [mainImage, setMainImage] = useState(null);
  const [showPopUp, setShowPopUp] = useState(false);
  const [myEvents, setMyEvents] = useState([]);
  const [showEditPopUp, setShowEditPopUp] = useState(false);
  const [currentSelectTimeData, setCurrentSelectTimeData] = useState('');
  const [currentSelectTimeId, setCurrentSelectTimeId] = useState('');
  const [startDateValue, setStartDateValue] = useState(0);
  const [endDateValue, setEndDateValue] = useState(0);
  const [startInitDateValue, setStartInitDateValue] = useState(0);
  const [endInitDateValue, setEndInitDateValue] = useState(0);
  const [showFavContainer, setShowFavContainer] = useState(false);
  const [isPublished, setIsPublished] = useState(false);
  // import
  const [favPlansNameList, setFavPlansNameList] = useState(null);
  const [showFavPlans, setShowFavPlans] = useState(false);
  const [dropDownOption, setDropDownOption] = useState(
    props.favFolderNames || []
  );
  const [selectedPlanId, setSelectedPlanId] = useState('');
  const [importData, setImportData] = useState({});

  //React Route
  const location = useLocation();
  const planDocRef = location.state.planDocRef;
  const currentUserId = props.userId;
  // const blocksListRef = collection(db, 'plans', planDocRef, 'time_blocks');

  const navigate = useNavigate();

  const redirectToStatic = () => {
    navigate('/static-plan-detail', {
      state: {
        fromPage: 'editPlans',
        planDocRef: planDocRef,
      },
    });
  };

  const redirectToDashboard = () => {
    navigate('/dashboard');
  };

  async function deletePlan(planDocRef, currentUserId) {
    const batch = writeBatch(db);
    const plansRef = doc(db, 'plans', planDocRef);
    // const plansTimeblockRef = doc(db, 'plans', planDocRef, 'time_blocks');
    const userInfoRef = doc(
      db,
      'userId',
      currentUserId,
      'own_plans',
      planDocRef
    );
    const allPlansRef = doc(db, 'allPlans', planDocRef);

    batch.delete(allPlansRef);
    batch.delete(plansRef);
    // batch.delete(plansTimeblockRef);
    batch.delete(userInfoRef);

    try {
      await batch.commit();
      alert('Successfully deleted!');
      navigate('/dashboard');
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(async () => {
    const favFolderRef = collection(db, 'userId', currentUserId, 'fav_folders');

    try {
      const list = await getDocs(favFolderRef);
      list.docs.map((e) => console.log(e.data()));
      setDropDownOption(list.docs.map((e) => e.data().folder_name));
    } catch (error) {
      console.log(error);
    }
  }, []);

  useEffect(async () => {
    const docSnap = await getDoc(doc(db, 'plans', planDocRef));

    setCountry(docSnap.data().country);
    setPlanTitle(docSnap.data().title);
    setMainImage(docSnap.data().main_image);

    setStartDateValue(new Date(docSnap.data().start_date.seconds * 1000));
    setEndDateValue(new Date(docSnap.data().end_date.seconds * 1000));

    setStartInitDateValue(new Date(docSnap.data().start_date.seconds * 1000));
    setEndInitDateValue(new Date(docSnap.data().end_date.seconds * 1000));
  }, []);

  useEffect(async () => {
    listenToSnapShot(setMyEvents, planDocRef);
  }, []);

  return (
    <Wrapper>
      {showPopUp && (
        <AddNewTimeBlock
          setShowPopUp={setShowPopUp}
          showPopUp={showPopUp}
          planDocRef={planDocRef}
          startDateValue={startDateValue}
          endDateValue={endDateValue}
        />
      )}
      {showEditPopUp ? (
        <EditTimeBlock
          importData={importData}
          showEditPopUp={showEditPopUp}
          setShowEditPopUp={setShowEditPopUp}
          currentSelectTimeData={currentSelectTimeData}
          currentSelectTimeId={currentSelectTimeId}
          planDocRef={planDocRef}
        />
      ) : null}
      <ArrowBackIosIcon
        className="hoverCursor"
        onClick={() => redirectToDashboard()}
      />
      <TopContainer>
        <TitleSection>
          <TypeInput
            value={planTitle}
            onChange={(e) => {
              setPlanTitle(e.target.value);
            }}
            placeholder="Plan Title"></TypeInput>
          {/* <TextField
            sx={{ m: 1, minWidth: 80 }}
            label="Title"
            variant="outlined"
            value={planTitle}
            onChange={(e) => {
              setPlanTitle(e.target.value);
            }}
          /> */}
          <CountrySelector
            setCountry={setCountry}
            country={country}
            planTitle={planTitle}
          />

          <DatePicker
            setStartDateValue={setStartDateValue}
            setEndDateValue={setEndDateValue}
            startDateValue={startDateValue}
            endDateValue={endDateValue}
            startInitDateValue={startInitDateValue}
            endInitDateValue={endInitDateValue}
          />

          <FormControlLabel
            control={
              <Switch
                style={{ color: themeColours.orange }}
                checked={isPublished}
                onChange={() => setIsPublished(!isPublished)}
              />
            }
            label="Published"
          />
        </TitleSection>

        <FlexColumnWrapper>
          <EditableMainImageContainer>
            <EditableMainImage src={mainImage}></EditableMainImage>
          </EditableMainImageContainer>

          <label htmlFor="icon-button-file">
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
                style={{ color: themeColours.blue }}
                aria-label="upload picture"
                component="div">
                <PhotoCamera />
              </IconButton>
            </Box>
          </label>
        </FlexColumnWrapper>
      </TopContainer>

      <ToggleAttractionSearch />

      <CalendarContainer>
        <PlanCalendar
          setImportData={setImportData}
          setMyEvents={setMyEvents}
          myEvents={myEvents}
          setShowEditPopUp={setShowEditPopUp}
          setCurrentSelectTimeData={setCurrentSelectTimeData}
          setCurrentSelectTimeId={setCurrentSelectTimeId}
          startDateValue={startDateValue}
        />
      </CalendarContainer>
      <BottomBtnContainer>
        <div className="left_btns">
          <LightBlueBtn
            variant="contained"
            onClick={() => {
              setShowPopUp(true);
            }}>
            Add new event
          </LightBlueBtn>
          <LightBlueBtn
            variant="contained"
            onClick={() => setShowFavContainer(!showFavContainer)}>
            Import Favourite
          </LightBlueBtn>

          {showFavContainer && (
            <SelectImportDropdown>
              <Autocomplete
                disablePortal
                id="combo-box-demo"
                options={dropDownOption}
                sx={{ width: 160 }}
                renderInput={(params) => (
                  <TextField {...params} label="Folders" />
                )}
                onChange={(e) => {
                  setShowFavPlans(true);
                  console.log(e.target.textContent);
                  getFavPlan(
                    e.target.textContent,
                    currentUserId,
                    setFavPlansNameList
                  );
                }}
              />
              {showFavPlans && favPlansNameList && (
                <FavFolderDropdown
                  showFavPlans={showFavPlans}
                  favPlansNameList={favPlansNameList}
                  setSelectedPlanId={setSelectedPlanId}
                  selectedPlanId={selectedPlanId}
                  planDocRef={planDocRef}
                  startDateValue={startDateValue}
                />
              )}
            </SelectImportDropdown>
          )}

          <LightBlueBtn
            variant="contained"
            onClick={() => {
              try {
                saveToDataBase(
                  myEvents,
                  planTitle,
                  country,
                  mainImage,
                  planDocRef,
                  startDateValue,
                  endDateValue,
                  isPublished
                );
              } catch (error) {
                console.log(error);
                alert('Oops!Something went wrong, please try again!');
              }
            }}>
            Save
          </LightBlueBtn>
          {/* <Button
            variant="contained"
            onClick={() => {
              addPlanToAllPlans(
                currentUserId,
                planDocRef,
                planTitle,
                mainImage,
                country,
                isPublished
              );
              redirectToStatic();
            }}>
            Publish
          </Button> */}
        </div>
        <PaleBtn
          variant="contained"
          onClick={() => {
            deletePlan(planDocRef, currentUserId);
          }}>
          Delete
        </PaleBtn>
      </BottomBtnContainer>
    </Wrapper>
  );
}

export default EditPlanDetail;
