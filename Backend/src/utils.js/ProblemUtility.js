import axios from "axios";

function getLanguageById(language) {
  const map = {
    "cpp": 54,          // C++ (GCC)
    "c++": 54,          // alternate written form
    "java": 62,         // Java (OpenJDK)
    "javascript": 63,   // Node.js
    "js": 63            // optional alias
  };

  return map[language?.toLowerCase()] || null;
}




// const submitBatch = async (submissions) => {

//   console.log("object");
//   const options = {
//     method: 'POST',
//     url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//     params: {
//       base64_encoded: 'false'
//     },
//     headers: {
//       'x-rapidapi-key': process.env.JUDGE0_KEY,
//       'x-rapidapi-host': 'judge0-ce.p.rapidapi.com',
//       'Content-Type': 'application/json'
//     },
//     data: {
//       submissions
//     }
//   };

//   async function fetchData() {
//     try {
//       const response = await axios.request(options);
//       return response.data;
//     } catch (error) {
//       console.error(error);
//     }
//   }

//   return await fetchData();

// }


const submitBatch = async (submissions) => {
  try {
    const response = await axios.post(
      "https://judge0-ce.p.rapidapi.com/submissions/batch",
      { submissions },    // <--- Correct Format
      {
        params: { base64_encoded: "false", wait: false },
        headers: {
          "x-rapidapi-key": process.env.JUDGE0_KEY,
          "x-rapidapi-host": "judge0-ce.p.rapidapi.com",
          "Content-Type": "application/json"
        }
      }
    );

    return response.data;

  } catch (error) {
    console.log("submitBatch ERROR:", error.response?.data || error.message);
    return null;
  }
};


const waiting = async (timer) => {
  setTimeout(() => {
    return 1;
  }, timer);
}

// ["db54881d-bcf5-4c7b-a2e3-d33fe7e25de7","ecc52a9b-ea80-4a00-ad50-4ab6cc3bb2a1","1b35ec3b-5776-48ef-b646-d5522bdeb2cc"]

const submitToken = async (tokens) => {
  try {
    while (true) {
      const response = await axios.get(
        "https://judge0-ce.p.rapidapi.com/submissions/batch",
        {
          params: {
            tokens: tokens.join(","),
            base64_encoded: "false",
            fields: "*"
          },
          headers: {
            "x-rapidapi-key": process.env.JUDGE0_KEY,
            "x-rapidapi-host": "judge0-ce.p.rapidapi.com"
          }
        }
      );

      const results = response.data.submissions;

      // If any result is still processing, keep waiting
      const isPending = results.some(
        (r) => r.status?.id === 1 || r.status?.id === 2
      );

      if (!isPending) return results;

      // wait 1 second before checking again
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  } catch (error) {
    console.log("submitToken ERROR:", error.response?.data || error.message);
    return null;
  }
};



// const submitToken = async (resultToken) => {

//   const options = {
//     method: 'GET',
//     url: 'https://judge0-ce.p.rapidapi.com/submissions/batch',
//     params: {
//       tokens: resultToken.join(","),
//       base64_encoded: 'false',
//       fields: '*'
//     },
//     headers: {
//       'x-rapidapi-key': process.env.JUDGE0_KEY,
//       'x-rapidapi-host': 'judge0-ce.p.rapidapi.com'
//     }
//   };

//   async function fetchData() {
//     try {
//       const response = await axios.request(options);
//       return response.data;
//     } catch (error) {
//       console.error(error);
//     }
//   }


//   while (true) {

//     const result = await fetchData();

//     const IsResultObtained = result.submissions.every((r) => r.status_id > 2);

//     if (IsResultObtained)
//       return result.submissions;


//     await waiting(1000);
//   }
// }


export { getLanguageById, submitBatch, submitToken };
