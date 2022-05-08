import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { doc, getDoc, collection, setDoc } from 'firebase/firestore';
import { Avatar } from '@mui/material';
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import DayBlockCard from '../components/DailyEventCard/DayBlockCard';
import { useLocation } from 'react-router-dom';
import firebaseDB from '../utils/firebaseConfig';
import ExportGCalendarBtn from '../components/GoogleCalendar/ExportGCalendarBtn';
import { themeColours, LightOrangeBtn } from '../utils/globalTheme';
import '../styles/libraryStyles.scss';
import Timeline from '../components/DailyEventCard/Timeline';
import UserAvatar from '../components/user/Avatar';
import CheckIcon from '@mui/icons-material/Check';
import { fontWeight } from '@mui/system';
import DayCalendar from '../components/DailyEventCard/DayCalendar';

const db = firebaseDB();

const UpperContainer = styled.div`
  display: flex;
  flex-direction: column;
  /* justify-content: space-between; */
  box-sizing: content-box;
  width: 100%;
  margin-bottom: 30px;
`;

const LowerContainer = styled.div`
  display: flex;
  justify-content: center;
  box-sizing: content-box;
  width: 100%;
`;

const FavFolderWrapper = styled.div`
  display: flex;
  flex-direction: column;
  /* margin-bottom: 30px; */
`;

const PlanInfoWrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 0 20px;
  justify-content: center;
`;

const UserInfoContainer = styled.div`
  padding-top: 20px;
  display: flex;
  flex-direction: column;
  align-items: center;

  .user_info_title {
    text-align: center;
    display: flex;
    margin-top: 20px;
    color: ${themeColours.orange};
    font-weight: 600;
  }

  .authorId {
    color: ${themeColours.dark_blue};
    font-weight: 400;
    padding-left: 10px;
  }
`;

const PlanCardsWrapper = styled.div`
  margin-top: 50px;
  width: 950px;
  /* margin: 50px auto 0 auto; */
`;

const PlanMainImageContainer = styled.div`
  /* width: 600px; */
  width: auto;
  height: 300px;
  position: relative;
  overflow: hidden;
  border-radius: 10px;
  &:hover {
    .planTitle_text_bakground {
      transform: translate(0, 100%);
      transition: all 0.3s ease-in-out 0s;
      -webkit-transition: all 0.3s ease-in-out 0s;
    }

    /* img {
      object-fit: contain;
      transition: 0.35s;
    } */
  }
`;

const PlanMainImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 100%;
  border-radius: 15px;
  &:hover {
    /* object-fit: contain; */
    /* transition: 0.7s; */
  }
`;

const PlanTitleTextBakgroundOutterCircle = styled.div`
  width: 330px;
  height: 330px;
  top: 82px;
  left: 15px;
  border-radius: 50%;
  border: 2px solid #ffffff91;
  background-color: transparent;
  display: flex;
  position: absolute;
`;

const PlanTitleTextBakground = styled.div`
  width: 300px;
  height: 300px;
  top: 96px;
  left: 30px;
  border-radius: 50%;
  border: 10px solid transparent;
  background-color: #ffffff91;
  display: flex;
  position: absolute;
`;

const PlanTitleText = styled.div`
  position: absolute;
  font-weight: 800;
  top: 60px;
  left: 30px;
  font-size: 36px;
  letter-spacing: 3px;
  color: ${themeColours.dark_blue};
  text-shadow: 2px 1px ${themeColours.pale};

  .location_text {
    font-weight: 400;
    letter-spacing: 1px;
    font-size: 20px;
    text-shadow: none;
  }
`;

const BtnWrapper = styled.div`
  margin-top: 20px;
  display: flex;
  align-items: center;
  position: relative;
`;

const FavFolderAutocompleteWrapper = styled.div`
  position: absolute;
  top: 45px;
  left: 12px;
  display: flex;
  align-items: center;
`;

const FavFolderAutocomplete = styled(TextField)({
  '& label.Mui-focused': {
    color: themeColours.orange,
  },
  '& .MuiInput-underline:after': {
    borderBottomColor: themeColours.orange,
  },
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: themeColours,
    },
    '&:hover fieldset': {
      borderColor: 'yellow',
    },
    '&.Mui-focused fieldset': {
      borderColor: 'green',
    },
  },
});

const ColouredLine = ({ colour }) => (
  <hr
    style={{
      colour: colour,
      backgroundColor: colour,
      height: 2,
    }}
  />
);

function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  // console.log('777, nextday is ', result);
  return result;
}

function loopThroughDays(startday, days) {
  const scheduleTimestampList = [];
  const lastDay = addDays(startday, days);
  // console.log(111, startday);
  // console.log(222, lastDay);

  for (let i = 0; i <= days; i++) {
    const nextday = addDays(startday, i);
    scheduleTimestampList.push(nextday);
    // console.log(scheduleTimestampList);

    if (nextday === lastDay) {
      console.log('reached last day');
      break;
    }
  }
  return scheduleTimestampList;
}

// handleFavAction(collectionID, author)
async function handleFavAction(
  planDocRef,
  author,
  selectFavFolder,
  planTitle,
  setShowFavDropDown
) {
  const currentUserEmail = localStorage.getItem('userEmail');

  if (currentUserEmail === author) {
    alert('Do not favourite your own plan!');
  } else if (selectFavFolder !== '') {
    // console.log(selectFavFolder);
    const favRef = doc(db, 'userId', currentUserEmail, 'fav_plans', planDocRef);

    try {
      await setDoc(favRef, {
        fav_plan_doc_ref: planDocRef,
        infolder: selectFavFolder,
        fav_plan_title: planTitle,
      });
      setShowFavDropDown(false);
      alert('Successfully favourite this plan!');
    } catch (error) {
      console.log(error);
    }
  } else {
    alert('Please select a folder!');
  }
}

const SwitchTab = styled.div`
  display: flex;
  width: 500px;
  margin: auto;
  font-size: 18px;
  justify-content: space-evenly;
  align-items: center;

  .tab {
    padding: 10px;
    color: rgb(0 33 58 / 60%);
  }

  .tab_map {
    color: ${themeColours.dark_blue};
    font-weight: 600;
    border-bottom: 1px solid ${themeColours.dark_blue};
    /* border-bottom-style: ; */
  }

  &:hover {
    cursor: pointer;
  }
`;

const ToTopScroll = styled.div`
  letter-spacing: 3px;
  font-family: 'Oswald', sans-serif;
  font-size: 14px;
  float: right;
  /* position: absolute;
  bottom: 0; */
`;

function StaticPlanDetail(props) {
  const [mainImage, setMainImage] = useState(null);
  const [planTitle, setPlanTitle] = useState('');
  const [country, setCountry] = useState('');
  const [hasVisited, setHasVitied] = useState(true);
  const [author, setAuthor] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [numberofDays, setNumberofDays] = useState(0);
  const [timestampList, setTimestampList] = useState([]);
  const [showfavDropDown, setShowFavDropDown] = useState(false);
  const [selectedFavFolder, setSelectedFavFolder] = useState('');
  const [showTab, setShowTab] = useState('route');
  const [stopTimelineNav, settopTimelineNav] = useState(false);

  const location = useLocation();
  const planDocRef = location.state.planDocRef;

  const planCollectionRef = doc(db, 'plans', planDocRef);
  const itemEls = useRef(new Array());
  const timelineRefArray = useRef(new Array());

  const navTabDay = useRef(null);
  const navTabMap = useRef(null);
  const navTabCalendar = useRef(null);
  const refNames = [navTabDay, navTabMap, navTabCalendar];

  const navTimelineRef = useRef(null);

  function toSiwtchTab(tabName, tabRef) {
    for (let name of refNames) {
      const styles = {
        color: 'rgb(0 33 58 / 70%)',
        fontWeight: 'normal',
        borderBottomWidth: 'none',
        borderBottomStyle: 'none',
        paddingBottom: 'none',
      };
      if (name !== tabRef) {
        Object.assign(name.current.style, styles);
      }
    }

    const styles = {
      color: themeColours.dark_blue,
      fontWeight: 600,
      borderBottomWidth: '1px',
      borderBottomStyle: 'solid',
    };
    setShowTab(tabName);

    Object.assign(tabRef.current.style, styles);
  }

  useEffect(async () => {
    const docSnap = await getDoc(planCollectionRef);
    const data = docSnap.data();
    console.log(data);

    setPlanTitle(data.title);
    setCountry(data.country);
    setMainImage(data.main_image);
    setStartDate(data.start_date);
    setEndDate(data.end_date);
    setHasVitied(data.visited);
    setAuthor(data.author);
  }, []);

  useEffect(() => {
    const nofDays =
      (endDate.seconds * 1000 - startDate.seconds * 1000) /
      (1000 * 60 * 60 * 24);
    setNumberofDays(nofDays);
  }, [endDate, startDate]);

  // console.log('numberofDays should not change', numberofDays);

  useEffect(() => {
    if (loopThroughDays(startDate.seconds * 1000, numberofDays).length === 0) {
      setTimestampList(loopThroughDays(startDate.seconds * 1000, 0));
    } else {
      setTimestampList(loopThroughDays(startDate.seconds * 1000, numberofDays));
    }
  }, [numberofDays]);

  const FavFolderRef = useRef();
  useEffect(() => {
    const checkIfClickedOutside = (e) => {
      // If the menu is open and the clicked target is not within the menu,
      // then close the menu
      if (
        showfavDropDown &&
        FavFolderRef.current &&
        !FavFolderRef.current.contains(e.target)
      ) {
        setShowFavDropDown(false);
      }
    };

    document.addEventListener('mousedown', checkIfClickedOutside);

    return () => {
      // Cleanup the event listener
      document.removeEventListener('mousedown', checkIfClickedOutside);
    };
  }, [showfavDropDown]);

  if (itemEls.current.length > 0) {
    for (let ref of itemEls.current) {
      // console.log(223, ref.current);
      if (ref.current === null) {
        let index = itemEls.current.indexOf(ref);
        itemEls.current.splice(index, 1);
      }
    }
  }

  // console.log(777, itemEls);
  // console.log(888, itemEls.current[0]);
  // console.log(999, itemEls.current.length);

  return (
    <>
      <UpperContainer>
        <PlanMainImageContainer>
          <PlanMainImage src={mainImage} loading="lazy"></PlanMainImage>
          <PlanTitleTextBakgroundOutterCircle className="planTitle_text_bakground"></PlanTitleTextBakgroundOutterCircle>
          <PlanTitleTextBakground className="planTitle_text_bakground">
            <PlanTitleText>
              {planTitle}
              <div className="location_text">{country.label}</div>
            </PlanTitleText>
          </PlanTitleTextBakground>
        </PlanMainImageContainer>

        <PlanInfoWrapper>
          <UserInfoContainer>
            <UserAvatar currentUserId={author} fromLocate={'static'} />
            <div className="user_info_title">
              Planned by:
              <div className="authorId">{author}</div>
            </div>
          </UserInfoContainer>

          <BtnWrapper>
            <FavFolderWrapper>
              <LightOrangeBtn
                style={{ width: 210 }}
                variant="contained"
                onClick={() => setShowFavDropDown(!showfavDropDown)}>
                Favourite this plan
              </LightOrangeBtn>
              {showfavDropDown && (
                <FavFolderAutocompleteWrapper ref={FavFolderRef}>
                  <Autocomplete
                    disablePortal
                    id="combo-box-demo"
                    options={props.favFolderNames}
                    sx={{ width: 200 }}
                    renderInput={(params) => (
                      <FavFolderAutocomplete
                        {...params}
                        placeholder="Select Folder"
                        variant="standard"></FavFolderAutocomplete>
                    )}
                    onChange={(e) => {
                      setSelectedFavFolder(e.target.textContent);
                    }}
                  />
                  <CheckIcon
                    className="hoverCursor"
                    style={{
                      fontSize: 30,
                      marginLeft: 7,
                      color: themeColours.orange,
                    }}
                    onClick={() =>
                      handleFavAction(
                        planDocRef,
                        author,
                        selectedFavFolder,
                        planTitle,
                        setShowFavDropDown
                      )
                    }></CheckIcon>
                </FavFolderAutocompleteWrapper>
              )}
            </FavFolderWrapper>
            <ExportGCalendarBtn planDocRef={planDocRef} planTitle={planTitle} />
          </BtnWrapper>
        </PlanInfoWrapper>
      </UpperContainer>

      <ColouredLine colour={'black'} />

      <SwitchTab>
        <div
          ref={navTabMap}
          className="tab tab_map"
          onClick={() => {
            toSiwtchTab('route', navTabMap);
            settopTimelineNav(false);
          }}>
          Map
        </div>
        <div
          ref={navTabDay}
          className="tab"
          onClick={() => {
            toSiwtchTab('dayByday', navTabDay);
            settopTimelineNav(false);
          }}>
          Day by Day
        </div>
        <div
          ref={navTabCalendar}
          className="tab"
          onClick={() => {
            toSiwtchTab('calendar', navTabCalendar);
            settopTimelineNav(true);
          }}>
          Calendar
        </div>
      </SwitchTab>

      <LowerContainer>
        {stopTimelineNav ? (
          <Timeline
            // ref={navTimelineRef}
            NumofDays={timestampList.length}
            RefList={itemEls}
            timelineRefArray={timelineRefArray}
            stopTimelineNav={'none'}
          />
        ) : (
          <Timeline
            // ref={navTimelineRef}
            NumofDays={timestampList.length}
            RefList={itemEls}
            timelineRefArray={timelineRefArray}
            stopTimelineNav={'auto'}
          />
        )}
        <PlanCardsWrapper>
          {showTab !== 'calendar' &&
            timestampList.map((day, index) => {
              return (
                <DayBlockCard
                  timelineRefArray={timelineRefArray}
                  itemEls={itemEls}
                  currentDayDate={day}
                  day={day}
                  planDocRef={planDocRef}
                  index={index}
                  key={index}
                  showTab={showTab}
                />
              );
            })}
          {showTab === 'calendar' && (
            <DayCalendar
              planDocRef={planDocRef}
              currentDayDate={timestampList[0]}
              // showType={'week'}
            />
          )}
        </PlanCardsWrapper>
      </LowerContainer>
      <ToTopScroll
        className="hoverCursor"
        onClick={() => window.scrollTo({ top: 120, behavior: 'smooth' })}>
        ^Top
      </ToTopScroll>
    </>
  );
}
export default StaticPlanDetail;
