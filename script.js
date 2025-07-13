document.addEventListener("DOMContentLoaded", function () {
  const searchButton = document.querySelector("#search");
  const usernameInput = document.querySelector("#user-input");
  const statsContainer = document.querySelector(".stats-container");
  const easyProgressCircle = document.querySelector(".easy-progress");
  const mediumProgressCircle = document.querySelector(".medium-progress");
  const hardProgressCircle = document.querySelector(".hard-progress");
  const easyLabel = document.querySelector("#easy-label");
  const mediumLabel = document.querySelector("#medium-label");
  const hardLabel = document.querySelector("#hard-label");
  const cardStatsContainer = document.querySelector(".stats-cards");

  function validate(username) {
    if (username.trim() === "") {
      alert("Username cannot be empty");
      return false;
    }

    const regex =
      /^(?!.*[_-]{2})(?![_-])[a-zA-Z0-9][a-zA-Z0-9_-]{1,14}[a-zA-Z0-9]$/;

    const isMatching = regex.test(username);
    if (!isMatching) {
      alert("Invalid username");
    }
    return isMatching;
  }

  async function fetchUserDetails(username) {
    
    try {
      searchButton.textContent = "Searching....";
      searchButton.disabled = true;

      const proxyUrl = 'https://cors-anywhere.herokuapp.com/'
      const targeturl = 'https://leetcode.com/graphql/';
      const myHeaders = new Headers();
      myHeaders.append("content-type", "application/json");

      const graphql = JSON.stringify({
        query: "\n  query userSessionProgress($username: String!) {\n allQuestionsCount {\n   difficulty\n    count\n   }\n matchedUser(username:  $username) {\n     submitStats {\n   acSubmissionNum {\n      difficulty\n  count\n         submissions\n   }\n     totalSubmissionNum {\n      difficulty\n    count\n       submissions\n   }\n     }\n  }\n   }\n  ",
        variables: { "username": `${username}` },
      })

      const requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: graphql,
        redirect: "follow",
      };

      const response = await fetch(proxyUrl+targeturl, requestOptions);
      if (!response.ok) {
        throw new Error("Unable to fetch user details");
      }
      const data = await response.json();
      console.log("logging data: ", data);

      displayUserData(data);

    } 
    catch(error){
      statsContainer.innerHTML = `<p> No data found </p>`;
    } finally {
      searchButton.textContent = "Search";
      searchButton.disabled = false;
    }
  }

  function updateProgress(solved , total ,label , circle){
    const progressDegree = (solved/total)*100;
    circle.style.setProperty("--progress-degree", `${progressDegree}%`);
    label.textContent = `${solved}/${total}`;
  }
  
  function displayUserData(parsedData){
    const totalQues = parsedData.data.allQuestionsCount[0].count;
    const totalEasyQues = parsedData.data.allQuestionsCount[1].count;
    const totalMediumQues = parsedData.data.allQuestionsCount[2].count;
    const totalHardQues = parsedData.data.allQuestionsCount[3].count;


    const solvedTotalQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[0].count;
    const solvedTotalEasyQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[1].count;
    const solvedTotalMediumQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[2].count;
    const solvedTotalHardQues = parsedData.data.matchedUser.submitStats.acSubmissionNum[3].count;

    updateProgress(solvedTotalEasyQues, totalEasyQues,easyLabel,easyProgressCircle);
    updateProgress(solvedTotalMediumQues, totalMediumQues,mediumLabel,mediumProgressCircle);
    updateProgress(solvedTotalHardQues, totalHardQues,hardLabel,hardProgressCircle);
  }

  searchButton.addEventListener("click", function () {
    const username = usernameInput.value;
    if (validate(username)) {
      fetchUserDetails(username);
    }
  });
});
