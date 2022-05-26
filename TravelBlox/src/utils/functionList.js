import {
  FacebookAuthProvider,
  GoogleAuthProvider,
  getAdditionalUserInfo,
  getAuth,
  signInWithPopup,
} from 'firebase/auth';

import Swal from 'sweetalert2';
import firebaseService from './fireabaseService';

export function uploadImagePromise(imgFile) {
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
  };
}

export async function signInProvider(e, providerPlatform) {
  let provider;
  e.preventDefault();
  const auth = getAuth();

  if (providerPlatform === 'google') {
    provider = new GoogleAuthProvider();
    provider.setCustomParameters({
      prompt: 'select_account',
    });
  }

  if (providerPlatform === 'facebook') {
    provider = new FacebookAuthProvider();
    provider.setCustomParameters({
      display: 'popup',
    });
  }

  try {
    console.log(provider);
    const result = await signInWithPopup(auth, provider);

    if (
      getAdditionalUserInfo(result).isNewUser === true &&
      provider === 'google'
    ) {
      firebaseService.addNewUserToDataBase(result.user, 'google');
    }

    if (
      getAdditionalUserInfo(result).isNewUser === true &&
      provider === 'facebook'
    ) {
      firebaseService.addNewUserToDataBase(result.user, 'facebook');
    }
  } catch (error) {
    const errorCode = error.code;
    const email = error.customData.email;
    if (errorCode === 'auth/account-exists-with-different-credential') {
      Swal.fire(
        `Your email ${email} has signed in with another social provider already!`
      );
    } else if (error.code === 'auth/email-already-in-use') {
      Swal.fire('Email already in use, please pick another one!');
    }
  }
}

export function addDays(date, days) {
  var result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

export function loopThroughDays(startday, days) {
  const scheduleTimestampList = [];
  const lastDay = addDays(startday, days);

  for (let i = 0; i <= days; i++) {
    const nextday = addDays(startday, i);
    scheduleTimestampList.push(nextday);

    if (nextday === lastDay) {
      break;
    }
  }
  return scheduleTimestampList;
}

export async function getAutoCompleteData(
  autocompleteInputRef,
  handleDataCallback
) {
  const autocomplete = new window.google.maps.places.Autocomplete(
    autocompleteInputRef
  );
  autocomplete.addListener('place_changed', () => {
    const place = autocomplete.getPlace();
    console.log(12, place);
    handleDataCallback(place);
  });

  const place2 = autocomplete.getPlace();
  console.log(12, place2);
}
