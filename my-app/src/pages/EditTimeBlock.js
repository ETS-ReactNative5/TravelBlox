import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { TextField, Button, IconButton } from '@mui/material';
import { Delete, Close } from '@mui/icons-material';
import firebaseDB from '../utils/firebaseConfig';
import { doc, setDoc, addDoc, collection, getDoc } from 'firebase/firestore';
import DateTimeSelector from '../components/DateTimeSelector';

const BlackWrapper = styled.div`
  position: fixed;
  background: rgba(0, 0, 0, 0.64);
  width: 100%;
  height: 100vh;
  top: 0;
  left: 0;
  z-index: 10;
`;

const PopBox = styled.div`
  position: relative;
  width: 40vw;
  height: 70%;
  margin: 0 auto;
  background-color: white;
  margin-top: calc(100vh - 85vh - 20px);
  padding: 20px 20px;
  display: flex;
  flex-direction: column;
`;

const DeleteBtn = styled(IconButton)`
  position: relative;
  top: 0;
  width: 60px;
  margin-left: auto;
`;

const CloseBtn = styled(IconButton)`
  position: relative;
  top: 0;
  width: 60px;
  margin-left: auto;
`;

const ButtonContainer = styled.div`
  display: flex;
  justify-content: flex-end;
`;

const FormsContainer = styled.div`
  flex-direction: column;
  display: flex;
  margin: 20px 0 40px 0;
`;

const db = firebaseDB();

async function addToDataBase(
  blockTitle,
  description,
  startTimeValue,
  endTimeValue,
  address
) {
  const timeBlockRef = doc(
    collection(db, 'plan101', 'zqZZcY8RO85mFVmtHbVI', 'time_blocks_test')
  );

  await setDoc(timeBlockRef, {
    title: blockTitle,
    text: description,
    start: startTimeValue,
    end: endTimeValue,
    address: address,
    id: timeBlockRef.id,
  });
}

async function retreiveFromDataBase(id, setDataReady, setInitialTimeBlockData) {
  const timeBlockRef = doc(
    db,
    'plan101',
    'zqZZcY8RO85mFVmtHbVI',
    'time_blocks_test',
    id
  );
  const timeBlockSnap = await getDoc(timeBlockRef);

  if (timeBlockSnap.exists()) {
    console.log('retreived');
    const initialData = timeBlockSnap.data();
    console.log(initialData);
    if (setInitialTimeBlockData) {
      setInitialTimeBlockData(initialData);
    }
    if (setDataReady) {
      setDataReady(true);
    }
    return initialData;
  } else {
    console.log('No such document!');
  }
}

function EditTimeBlock(props) {
  const [initialTimeBlockData, setInitialTimeBlockData] = useState({});
  const [blockTitle, setBlockTitle] = useState('');
  const [address, setAddress] = useState('');
  const [description, setDescription] = useState('');
  const [startTimeValue, setStartTimeValue] = useState(
    props.currentSelectTimeData.start
  );
  const [endTimeValue, setEndTimeValue] = useState(
    props.currentSelectTimeData.end
  );
  const [dataReady, setDataReady] = useState(false);

  // console.log(initialTimeBlockData);

  useEffect(() => {
    retreiveFromDataBase(
      props.currentSelectTimeId,
      setDataReady,
      setInitialTimeBlockData
    );
  }, []);

  useEffect(() => {
    setDescription(initialTimeBlockData.text);
    setBlockTitle(initialTimeBlockData.title);
  }, [initialTimeBlockData]);

  return (
    <>
      <BlackWrapper>
        <PopBox>
          <ButtonContainer>
            <DeleteBtn aria-label="delete">
              <Delete />
            </DeleteBtn>
            <CloseBtn
              aria-label="close"
              onClick={() => {
                props.setShowEditPopUp(false);
              }}>
              <Close />
            </CloseBtn>
          </ButtonContainer>
          <FormsContainer>
            <TextField
              required
              sx={{ m: 1, minWidth: 80 }}
              size="small"
              label="Title"
              variant="outlined"
              value={blockTitle}
              onChange={(e) => {
                setBlockTitle(e.target.value);
              }}
            />
            <DateTimeSelector
              setStartTimeValue={setStartTimeValue}
              startTimeValue={startTimeValue}
              setEndTimeValue={setEndTimeValue}
              endTimeValue={endTimeValue}
            />

            <TextField
              required
              sx={{ m: 1, minWidth: 80 }}
              size="small"
              label="Address"
              variant="outlined"
              value={address}
              onChange={(e) => {
                setAddress(e.target.value);
              }}
            />
            <TextField
              sx={{ m: 1, minWidth: 8, minHeight: 120 }}
              multiline
              size="small"
              label="Description"
              variant="outlined"
              value={description}
              rows={4}
              helperText="Please enter description for this time block."
              onChange={(e) => {
                setDescription(e.target.value);
              }}
            />
          </FormsContainer>
          <Button
            variant="contained"
            onClick={(e) => {
              if (blockTitle && address && startTimeValue && endTimeValue) {
                addToDataBase(
                  blockTitle,
                  description,
                  startTimeValue,
                  endTimeValue,
                  address
                );
                props.setShowPopUp(false);
                alert('Successfully added!');
              } else {
                alert('Please fill in all the requirements!');
              }
            }}>
            Submit
          </Button>
        </PopBox>
      </BlackWrapper>
    </>
  );
}

export default EditTimeBlock;
