import React, { useContext, useEffect, useState } from 'react';

import FullLoading from '../components/general/FullLoading';
import PropTypes from 'prop-types';
import PublicPlanCard from '../components/discover/PublicPlanCard';
import SkyMainImg from '../components/discover/SkyMainImg';
import { UserContext } from '../App';
import firebaseService from '../utils/fireabaseService';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';

const AllPlansWrapper = styled.div`
  padding: 10px 20px;
  display: flex;
  justify-content: center;
`;

const PlanCollectionWrapper = styled.div`
  display: flex;
  padding: 15px;
  box-sizing: content-box;
  flex-wrap: wrap;
  justify-content: flex-start;
  width: 1290px;
  min-height: 450px;
  align-items: center;

  @media (max-width: 1300px) {
    width: 90%;
  }

  @media (max-width: 490px) {
    width: 100%;
  }
`;

const EmptyNotification = styled.div`
  font-size: 20px;
  padding: 0;
`;

Allplans.propTypes = {
  defaultImg: PropTypes.string,
};

function Allplans(props) {
  const [loadindOpacity, setLoadindOpacity] = useState(1);
  const [allPlansList, setAllPlansList] = useState([]);
  const [inputValue, setInputValue] = useState('');

  const [emptyMatch, setEmptyMatch] = useState(false);
  const [displayPlans, setDisplayPlans] = useState([]);

  const userInfo = useContext(UserContext);
  const navigate = useNavigate();

  useEffect(() => {
    if (!userInfo) {
      navigate('/');
    }
  }, [userInfo]);

  useEffect(async () => {
    const publishedPlans = await firebaseService.getPublishedPlans();
    setAllPlansList(publishedPlans);
    setDisplayPlans(publishedPlans);
  }, []);

  useEffect(() => {
    if (allPlansList.length > 0) {
      setLoadindOpacity(0);
    }
  }, [allPlansList]);

  useEffect(() => {
    if (inputValue !== '') {
      const filteredData = allPlansList.filter((item) => {
        if (
          item.title.toLowerCase().includes(inputValue.toLowerCase()) ||
          item.country.label
            ?.toLowerCase()
            .includes(inputValue.toLowerCase()) ||
          item.author.toLowerCase().includes(inputValue.toLowerCase())
        ) {
          return item;
        }
      });
      setDisplayPlans(filteredData);
    } else {
      setDisplayPlans(allPlansList);
    }
  }, [inputValue]);

  useEffect(() => {
    if (displayPlans.length < 1) {
      setEmptyMatch(true);
    } else {
      setEmptyMatch(false);
    }
  }, [displayPlans]);

  return (
    <>
      <FullLoading opacity={loadindOpacity} />
      <SkyMainImg setInputValue={setInputValue} inputValue={inputValue} />
      <AllPlansWrapper>
        <PlanCollectionWrapper>
          {emptyMatch && (
            <EmptyNotification>
              Oops, no results were found. Please try another search.
            </EmptyNotification>
          )}
          {displayPlans.map((planInfo, index) => (
            <PublicPlanCard
              planInfo={planInfo}
              key={index}
              defaultImg={props.defaultImg}
            />
          ))}
        </PlanCollectionWrapper>
      </AllPlansWrapper>
    </>
  );
}

export default Allplans;
