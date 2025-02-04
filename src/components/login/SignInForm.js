import { Divider, InputWrapper, SignUpSwitcher, Title } from './login_styles';
import { Visibility, VisibilityOff } from '@mui/icons-material';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';

import GoogleLogin from './SocialProviderLogin';
import IconButton from '@mui/material/IconButton';
import { InputAdornment } from '@mui/material';
import { LightOrangeBtn } from '../../styles/globalTheme';
import PropTypes from 'prop-types';
import React from 'react';
import Swal from 'sweetalert2';
import TextField from '@material-ui/core/TextField';

function userLogIn(email, password) {
  const auth = getAuth();
  signInWithEmailAndPassword(auth, email, password)
    .then((userCredential) => {
      const user = userCredential.user;
      Swal.fire('Welcome back!', user.email);
    })
    .catch((error) => {
      if (error.message === 'EMAIL_NOT_FOUND') {
        Swal.fire('Email not found! Please check again!');
      }
    });
}

SignInForm.propTypes = {
  setEmail: PropTypes.func,
  setPassword: PropTypes.func,
  toggleShowPassword: PropTypes.func,
  toggleShowSignUp: PropTypes.func,
  email: PropTypes.string,
  password: PropTypes.string,
  showPassword: PropTypes.bool,
};

function SignInForm({
  setEmail,
  setPassword,
  toggleShowPassword,
  toggleShowSignUp,
  email,
  password,
  showPassword,
}) {
  return (
    <>
      <Title>Welcome Back!</Title>
      <InputWrapper>
        <TextField
          required
          fullWidth
          value={email}
          label="email"
          size="small"
          variant="outlined"
          onChange={(e) => {
            setEmail(e.target.value);
          }}
        />
      </InputWrapper>
      <InputWrapper>
        <TextField
          fullWidth
          required
          type={showPassword ? 'text' : 'password'}
          value={password}
          label="password"
          variant="outlined"
          size="small"
          onChange={(e) => {
            setPassword(e.target.value);
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton onClick={() => toggleShowPassword()} edge="end">
                  {showPassword ? <VisibilityOff /> : <Visibility />}
                </IconButton>
              </InputAdornment>
            ),
          }}
        />
      </InputWrapper>
      <LightOrangeBtn
        marginBottom="20px"
        marginTop="20px"
        padding="15px"
        radius="20px"
        onClick={() =>
          email && password
            ? (userLogIn(email, password), setEmail(''), setPassword(''))
            : Swal.fire('please fill in both !')
        }>
        Login
      </LightOrangeBtn>
      <Divider>
        {' '}
        {'\u2E3B'} or {'\u2E3B'}{' '}
      </Divider>
      <GoogleLogin />
      <SignUpSwitcher>
        Doesn't have an account yet?
        <div className="signSection">
          Sign up
          <div
            className="click_here hoverCursor"
            onClick={() => toggleShowSignUp()}>
            here!
          </div>
        </div>
      </SignUpSwitcher>
    </>
  );
}

export default SignInForm;
