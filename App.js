import { Audio } from "expo-av";
import { useEffect, useState } from "react";
import { StyleSheet, Text, View } from "react-native";
import { TextInput, Button } from "react-native-paper";
import Icon from "react-native-vector-icons/FontAwesome";
import { SafeAreaView } from "react-native-safe-area-context";
import { useWhisper } from "@chengsokdara/use-whisper";
import * as Permissions from "expo-permissions";
import * as FileSystem from "expo-file-system";
// import AudioRecorderPlayer from "react-native-audio-recorder-player";

// const audioRecorderPlayer = new AudioRecorderPlayer();

export default function App() {
  const [recording, setRecording] = useState();
  const [isRecording, setIsRecording] = useState(false);
  const [transcriptText, setTranscriptText] = useState("");

  const whisperApiKey = "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";

  const {
    transcribing,
    transcript,
    error,
    startTranscribing,
    stopTranscribing,
  } = useWhisper({
    apikey: whisperApiKey,
    onTranscribe: (text) => setTranscriptText(text),
  });

  useEffect(() => {
    return () => {
      if (recording) {
        recording.unloadAsync();
      }
    };
  }, [recording]);

  async function startRecording() {
    try {
      console.log("Requesting permissions..");
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      console.log("Starting recording..");
      if (recording) {
        await recording.stopAndUnloadAsync();
      }
      const newRecording = new Audio.Recording();
      await newRecording.prepareToRecordAsync(
        Audio.RECORDING_OPTIONS_PRESET_HIGH_QUALITY
      );
      await newRecording.startAsync();
      setRecording(newRecording);
      setIsRecording(true);
      console.log("Recording started");
      startTranscribing(newRecording.getURI());
    } catch (err) {
      console.error("Failed to start recording", err);
    }
  }

  async function stopRecording() {
    setIsRecording(false);
    console.log("Stopping recording..");
    if (recording) {
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      console.log("Recording stopped and stored at", uri);
      stopTranscribing();
    } else {
      console.log("No recording instance found");
    }
  }

  return (
    <View style={styles.container}>
      <View style={styles.voiceInput}>
        <Button
          icon={isRecording ? "pause" : "play"}
          mode="contained"
          onPress={isRecording ? stopRecording : startRecording}
        >
          {isRecording ? "Stop Recording" : "Start Recording"}
        </Button>
      </View>
      <View>
        <Text>Transcribed Text: {transcript.text}</Text>
      </View>
      {error && (
        <View>
          <Text>Error: {error.message}</Text>
        </View>
      )}
      {transcribing && (
        <View>
          <Text>Transcribing...</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
});
