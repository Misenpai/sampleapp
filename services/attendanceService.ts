import { db, storage } from "@/services/FirebaseConfig";
import { addDoc, collection, Timestamp } from "firebase/firestore";
import { getDownloadURL, ref, uploadBytes } from "firebase/storage";

interface Photo {
  uri: string;
}

interface AudioRecording {
  uri: string;
}

interface AttendanceProps {
  userId: string;
  photos: Photo[];
  audioRecording?: AudioRecording;
}

const uploadAttendanceData = async ({
  userId,
  photos,
  audioRecording,
}: AttendanceProps): Promise<{ success: boolean; error?: string }> => {
  try {
    const timestamp = Date.now();
    const photoUrls: string[] = [];
    let audioUrl: string | null = null;

    for (let i = 0; i < photos.length; i++) {
      const photo = photos[i];
      const response = await fetch(photo.uri);
      const photoBlop = await response.blob();
      const photoRef = ref(
        storage,
        `attendance/${userId}/${timestamp}/photo_${i + 1}.jpg`
      );

      await uploadBytes(photoRef, photoBlop);
      const photoUrl = await getDownloadURL(photoRef);
      photoUrls.push(photoUrl);
    }

    if (audioRecording) {
      const response = await fetch(audioRecording.uri);
      const audioBlop = await response.blob();
      const audioRef = ref(
        storage,
        `attendance/${userId}/${timestamp}/audio_rec.m4a}`
      );
      await uploadBytes(audioRef, audioBlop);
      audioUrl = await getDownloadURL(audioRef);
    }
    const attendanceDoc = {
      userId,
      photoUrls,
      audioUrl,
      timestamp: Timestamp.now(),
      createdAt: new Date().toISOString(),
    };

    const docRef = await addDoc(collection(db, "attendance"), attendanceDoc);
    console.log("Attendance record created with ID: ", docRef.id);
    return { success: true };
  } catch (error) {
    console.error("Error uploading attendance:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error),
    };
  }
};

export default uploadAttendanceData;
