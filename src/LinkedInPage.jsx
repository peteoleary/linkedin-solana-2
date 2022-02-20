import React from "react";
import styled from "styled-components";
import { useLinkedIn } from "react-linkedin-login-oauth2";
import linkedin from "react-linkedin-login-oauth2/assets/linkedin.png";
import request from 'superagent'
import ProfileCard from "./ProfileCard";
import req from "express/lib/request";

function LinkedInPage() {
  const { linkedInLogin } = useLinkedIn({
    clientId: process.env.REACT_APP_CLIENT_ID,
    redirectUri: `${window.location.origin}/linkedin`,
    onSuccess: (code) => {
      console.log(`onSuccess ${code}`);
      request.get('/linkedin_token').query({code: code, state: '123456'}).then(res => {
        setProfile({
          firstName: res.body.localizedFirstName,
          lastName: res.body.localizedLastName,
          profileURL: `https://www.linkedin.com/in/${res.body.id}`,
          pictureURL: res.body.profilePicture['displayImage~'].elements.slice(-1)[0].identifiers[0].identifier
        });
      })
      
    },
    scope: "r_emailaddress r_liteprofile",
    onError: (error) => {
      console.log(error);
      setProfile(null);
      setErrorMessage(error.errorMessage);
    },
  });
  const [profile, setProfile] = React.useState(null);
  const [errorMessage, setErrorMessage] = React.useState("");

  return (
    <Wrapper>
      <img
        onClick={linkedInLogin}
        src={linkedin}
        alt="Log in with Linked In"
        style={{ maxWidth: "180px", cursor: "pointer" }}
      />

      {!profile && <div>No profile</div>}
      {profile && (
        <div>
           <ProfileCard
                firstName={profile.firstName}
                lastName={profile.lastName}
                profileURL={profile.profileURL}
                pictureURL={profile.pictureURL}
              />
        </div>
      )}
      {errorMessage && <div>{errorMessage}</div>}
    </Wrapper>
  );
}

const Wrapper = styled.div`
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

const Link = styled.a`
  font-size: 20px;
  font-weight: bold;
`;

export default LinkedInPage;