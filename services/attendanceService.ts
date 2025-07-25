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
  location?: string | null;
}

const uploadAttendanceData = async ({
  userId,
  photos,
  audioRecording,
  location,
}: AttendanceProps): Promise<{ success: boolean; error?: string }> => {
  try {
    const ts = Date.now();
    const photoUrls: string[] = [];

    for (let i = 0; i < photos.length; i++) {
      const res = await fetch(photos[i].uri);
      const blob = await res.blob();
      const photoRef = ref(
        storage,
        `attendance/${userId}/${ts}/photo_${i + 1}.jpg`
      );
      await uploadBytes(photoRef, blob);
      photoUrls.push(await getDownloadURL(photoRef));
    }

    let audioUrl: string | null = null;
    if (audioRecording) {
      const res = await fetch(audioRecording.uri);
      const blob = await res.blob();
      const audioRef = ref(storage, `attendance/${userId}/${ts}/audio_rec.m4a`);
      await uploadBytes(audioRef, blob);
      audioUrl = await getDownloadURL(audioRef);
    }

    await addDoc(collection(db, "attendance"), {
      userId,
      photoUrls,
      audioUrl,
      location,
      timestamp: Timestamp.now(),
      createdAt: new Date().toISOString(),
    });

    return { success: true };
  } catch (e: any) {
    return { success: false, error: e.message };
  }
};

export default uploadAttendanceData;
