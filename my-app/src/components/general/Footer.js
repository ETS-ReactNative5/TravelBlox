import React from 'react';
import styled from 'styled-components';

const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  width: 100%;
  /* position: fixed; */
  /* bottom: 0; */
  background-color: black;
  color: white;
  height: 60px;
  padding: 15px 15px;
`;

const Title = styled.div`
  font-weight: 800;
  font-size: 16px;
  letter-spacing: 2px;
  margin-bottom: 10px;
`;

// const SubTitle = styled.div`
//   font-size: 12px;
//   text-align: center;
//   margin-bottom: 30px;
// `;

const Rights = styled.div`
  font-size: 12px;
`;

function Footer() {
  return (
    <Wrapper>
      <Title>EXPLORE. DRAG. PLAN. </Title>
      <Rights>© 2022 TripBlox. All Rights Reserved.</Rights>
    </Wrapper>
  );
}

export default Footer;
