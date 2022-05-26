import {
  collection,
  doc,
  getDocs,
  onSnapshot,
  query,
  setDoc,
  where,
  writeBatch,
} from 'firebase/firestore';

import Swal from 'sweetalert2';
import firebaseDB from '../utils/firebaseConfig';

const db = firebaseDB();

export async function uploadImagePromise(imgFile) {
  const reader = new FileReader();
  reader.readAsDataURL(imgFile);

  return new Promise((resolve, reject) => {
    reader.onload = () => {
      resolve(reader.result);
    };

    reader.onerror = (error) => {
      reject(error);
    };
  });
}

export async function addPlanToAllPlans(
  currentUserId,
  planDocRef,
  planTitle,
  mainImage,
  country,
  isPublished
) {
  try {
    const allPlansRef = doc(db, 'allPlans', planDocRef);

    await setDoc(
      allPlansRef,
      {
        author: currentUserId,
        plan_doc_ref: planDocRef,
        title: planTitle,
        main_image: mainImage,
        country: country,
        published: isPublished,
      },
      { merge: true }
    );
  } catch (error) {
    console.log(error);
  }
}

export async function saveToDataBase(
  myEvents,
  planTitle,
  country,
  mainImage,
  planDocRef,
  startDateValue,
  endDateValue,
  isPublished
) {
  const batch = writeBatch(db);

  myEvents.forEach((singleEvent) => {
    const id = singleEvent.id;
    let updateRef = doc(db, 'plans', planDocRef, 'time_blocks', id);
    batch.update(updateRef, {
      end: singleEvent.end,
      start: singleEvent.start,
    });
  });

  const upperLevelUpdateRef = doc(db, 'plans', planDocRef);
  batch.update(upperLevelUpdateRef, {
    title: planTitle,
    country: country,
    main_image: mainImage,
    start_date: startDateValue,
    end_date: endDateValue,
    published: isPublished,
  });

  const allPlanRef = doc(db, 'allPlans', planDocRef);
  batch.update(
    allPlanRef,
    {
      title: planTitle,
      country: country,
      main_image: mainImage,
      published: isPublished,
    },
    { merge: true }
  );

  try {
    await batch.commit();
    Swal.fire('Successfully saved!');
    return true;
  } catch (error) {
    console.log(error.message);
    return false;
  }
}

export async function listenToSnapShot(planDocRef, handleSnapShotData) {
  const blocksListRef = collection(db, 'plans', planDocRef, 'time_blocks');

  onSnapshot(blocksListRef, (docs) => {
    const newEventList = Object.keys(docs.docs).map((e) => {
      const {
        start,
        end,
        title,
        id,
        status,
        place_format_address,
        place_name,
        place_id,
        place_img,
        place_url,
        place_types,
        place_formatted_phone_number,
        rating,
      } = docs.docs[e].data();

      return {
        start: new Date(start.seconds * 1000),
        end: new Date(end.seconds * 1000),
        title: title,
        id,
        status: status || '',
        place_format_address,
        place_name,
        place_id,
        place_img: place_img || '',
        place_url,
        place_types: place_types || '',
        place_formatted_phone_number: place_formatted_phone_number || '',
        rating: rating || '',
      };
    });

    handleSnapShotData(newEventList);
  });
}

export async function getFavPlan(
  folderName,
  currentUserId,
  setFavPlansNameList
) {
  const favRef = collection(db, 'userId', currentUserId, 'fav_plans');
  const planQuery = query(favRef, where('infolder', '==', folderName));

  try {
    const plansList = await getDocs(planQuery);
    const list = plansList.docs.map((e) => e.data());

    if (list.length === 0) {
      console.log('No fav plans yet!');
      setFavPlansNameList('');
    } else {
      setFavPlansNameList(list);
    }
  } catch (error) {
    console.log(error);
  }
}

export function renameGoogleMaDataIntoFirebase(location, placeId) {
  return {
    place_id: location.place_id || placeId,
    place_name: location.name,
    place_format_address: location.formatted_address,
    place_img: location.mainImg || location.photos[0].getUrl() || '',
    place_formatted_phone_number: location.formatted_phone_number || '',
    place_international_phone_number: location.international_phone_number || '',
    place_url: location.url,
    rating: location.rating || '',
    place_types: location.types || '',
    place_lat: location.geometry.location.lat(),
    place_lng: location.geometry.location.lng(),
    place_types: location.types || '',
  };
}
