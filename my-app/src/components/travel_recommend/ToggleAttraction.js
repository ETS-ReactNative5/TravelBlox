import React, { useState, useEffect } from 'react';
import AttractionInput from './AttractionInput';
import styled from 'styled-components';
import { themeColours, LightOrangeBtn } from '../../styles/globalTheme';

const QuestionText = styled.div`
  margin-top: 50px;
  font-size: 25px;
  font-weight: 600px;
  font-style: italic;
  display: flex;
  div {
    padding: 0 8px;
    font-weight: 800;
    color: ${themeColours.blue};
    text-decoration: dotted 4px underline;
    &:hover {
      cursor: pointer;
    }
  }
`;

function ToggleAttractionSearch() {
  const [showRecommends, setShowRecommends] = useState(false);
  const [showSearch, setShowSearch] = useState(false);

  return (
    <>
      <QuestionText>
        Need some planning{' '}
        <div onClick={() => setShowSearch(!showSearch)}>idea</div>?
      </QuestionText>
      {showSearch && (
        <>
          <AttractionInput
            showRecommends={showRecommends}
            setShowRecommends={setShowRecommends}
          />
          <LightOrangeBtn onClick={() => setShowRecommends(!showRecommends)}>
            Hide Cards
          </LightOrangeBtn>
        </>
      )}
    </>
  );
}

export default ToggleAttractionSearch;
