import React, { useEffect } from 'react';
import './App.css';

// Docs: https://learn.microsoft.com/en-us/linkedin/shared/authentication/authorization-code-flow?tabs=HTTPS1

const clientId = 'CLIENT_ID';
const clientSecret = 'CLIENT_SECRET';
// need this to redirect from LinkedIn auth page,
// also this link is added to the LinkedIn app settings
const redirectUri = 'REDIRECT_URI';
// need this to bypass CORS error
const corsProxyUrl = 'https://cors-anywhere.herokuapp.com/';


function App() {
  useEffect(() => {
    const handleAuthorizationCallback = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const code = urlParams.get('code');

      if (code) {
        const accessToken = await getAccessToken(code);
        if(accessToken) {
          const userInfo = await getUserInfo(accessToken);
          if(userInfo?.serviceErrorCode) {
            alert(`Error: ${userInfo.message}, code: ${userInfo?.serviceErrorCode}, status: ${userInfo?.status}`);
          } else {
            alert(`LinkedIn credentials:\nName: ${userInfo?.name} \nEmail: ${userInfo?.email}\nPicture: ${userInfo?.picture}`);
          }
        }
      }
    };

    handleAuthorizationCallback();
  }, []);

  // Exchange authorization code for an access token
  const getAccessToken = async (code) => {  
    const tokenUrl = 'https://www.linkedin.com/oauth/v2/accessToken';
  
    const response = await fetch(corsProxyUrl + tokenUrl, {
      method: 'POST',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: `grant_type=authorization_code&code=${code}&client_id=${clientId}&client_secret=${clientSecret}&redirect_uri=${encodeURIComponent(redirectUri)}`,
    });

    const data = await response.json();
  return data.access_token;
  };

  // Fetch user information using the access token
  const getUserInfo = async (accessToken) => {
    const userInfoUrl = 'https://api.linkedin.com/v2/userinfo';
    const response = await fetch(corsProxyUrl + userInfoUrl, {
      method: 'GET',
      headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Bearer ${accessToken}`,
      },
  });
  
    return await response.json();
  };

  const loginWithLinkedIn = () => {    
    window.location.href = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=profile%20email%20openid&state=random_state`;
  };

  return (
    <div className="container">
      <h1>LinkedIn Auth App</h1>
      <button className="linkedin-button" onClick={loginWithLinkedIn}>
        Login with LinkedIn
      </button>
    </div>
  );
}

export default App;

