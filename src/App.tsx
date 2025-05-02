import { useState } from "react";
import "./App.css";
import { BASE_URL, ELEVEN_API_KEY } from "./constants";
import axios from "axios";
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
function App() {
  return (
    <>
      <PodcastGenerator />
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick={false}
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
        theme="light"
      />
    </>
  );
}

const PodcastGenerator = () => {
  console.log("BASE_URL", BASE_URL);
  console.log("ELEVEN", ELEVEN_API_KEY);
  const [query, setQuery] = useState<string>("");
  const [response, setResponse] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(false);
  const handleSubmit = async () => {
    try {
      setLoading(true);
      const res = await axios.post(`${BASE_URL}/generate-podcast`, {
        query,
      });

      if (!res.data.content) {
        toast.error("GenAI model overloaded");
        setLoading(false);
        return;
      }

      setResponse(res.data.content);
      setLoading(false);
      console.log({ res, response });
    } catch (error) {
      toast.error("GenAI model overloaded");
      setLoading(false);
      console.error("Error:", error);
    }
  };

  return (
    <>
      <input
        onChange={(e) => setQuery(e.target.value)}
        style={{
          width: "100%",
          height: "30px",
          fontSize: "20px",
          padding: "10px",
          marginBottom: "20px",
        }}
        placeholder="Enter your query here..."
      />
      {loading ? (
        <div>Creating Podcast...</div>
      ) : (
        !response && <button onClick={handleSubmit}>Generate</button>
      )}
      <div
        style={{
          maxHeight: "600px",
          overflow: "auto",
        }}
      >
        {response}
      </div>
      {response && <SpeakPodcast query={response} />}
    </>
  );
};

const SpeakPodcast = ({ query }: { query: string }) => {
  const [loading, setLoading] = useState(false);
  const getPlayableAudio = async () => {
    const response = await axios.post(
      `https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM`,
      {
        text: query,
        model_id: "eleven_monolingual_v1", 
        voice_settings: {
          stability: 0.5,
          similarity_boost: 0.75,
        },
      },
      {
        headers: {
          "xi-api-key": ELEVEN_API_KEY,
          "Content-Type": "application/json",
          Accept: "audio/mpeg",
        },
        responseType: "blob",
      }
    );

    return response.data;
  };

  const handlePlay = async () => {
    try {
      setLoading(true);
      const audioBlob = await getPlayableAudio();
      const audioUrl = URL.createObjectURL(audioBlob);
      const audio = new Audio(audioUrl);
      audio.play();
      setLoading(false);
    } catch (error) {
      console.error("TTS failed:", error);
    }
  };
  return (
    <div style={{
      marginTop: "20px",
    }}>
      {loading ? (
        <div>Please wait, generating playable audio...</div>
      ) : (
        <img
          onClick={handlePlay}
          src="https://cdn-icons-png.flaticon.com/512/59/59284.png"
          style={{
            height: "50px",
            width: "50px",
          }}
        />
      )}
    </div>
  );
};

export default App;
