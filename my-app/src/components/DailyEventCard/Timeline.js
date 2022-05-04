import React, { useState, useEffect } from 'react';
import { themeColours } from '../../utils/globalTheme';
import styled from 'styled-components';

const Container = styled.div`
  margin-right: 15px;
  transition: top 0.2s ease;
  font-size: 16px;
  flex: 0 0 70px;
`;
const DayBox = styled.div`
  position: sticky;
  top: 360px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  font-size: 20px;
  letter-spacing: 0.4px;
  font-family: 'Oswald', sans-serif;
`;

const Day = styled.div`
  font-weight: 500;
  width: 28px;
  text-align: center;
  cursor: pointer;
  text-transform: uppercase;
  margin-bottom: 15px;
`;

const NumberofDay = styled.div`
  text-align: center;
  margin-bottom: 15px;
  background-color: transparent;
  width: 28px;
  text-align: center;

  &:hover {
    background-color: ${themeColours.lighter_blue};
    border-radius: 50%;
  }
`;

function Timeline({ NumofDays }) {
  return (
    <Container>
      <DayBox>
        <Day>Day</Day>
        {[...Array(NumofDays)].map((e, index) => (
          <NumberofDay key={index} className="hoverCursor">
            {index + 1}
          </NumberofDay>
        ))}
      </DayBox>
    </Container>
  );
}

export default Timeline;
