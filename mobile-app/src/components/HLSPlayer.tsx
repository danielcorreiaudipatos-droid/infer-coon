import React, { useRef, useState } from 'react';
import {
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ActivityIndicator,
} from 'react-native';
import { Video } from 'expo-av';

interface HLSPlayerProps {
  url: string;
  title?: string;
  onPlay?: () => void;
  onPause?: () => void;
}

export default function HLSPlayer({
  url,
  title,
  onPlay,
  onPause,
}: HLSPlayerProps) {
  const videoRef = useRef<Video>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [duration, setDuration] = useState(0);
  const [position, setPosition] = useState(0);

  const handlePlayPause = async () => {
    if (videoRef.current) {
      if (isPlaying) {
        await videoRef.current.pauseAsync();
        onPause?.();
      } else {
        await videoRef.current.playAsync();
        onPlay?.();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const handleLoadStart = () => {
    setIsLoading(true);
  };

  const handleLoadComplete = (status: any) => {
    setIsLoading(false);
    setDuration(status.durationMillis);
  };

  const handleProgressUpdate = (status: any) => {
    setPosition(status.positionMillis);
  };

  const formatTime = (millis: number) => {
    const seconds = Math.floor(millis / 1000);
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <View style={styles.container}>
      <Video
        ref={videoRef}
        source={{ uri: url }}
        style={styles.video}
        resizeMode="contain"
        isLooping={false}
        shouldPlay={false}
        onLoadStart={handleLoadStart}
        onLoad={handleLoadComplete}
        onPlaybackStatusUpdate={handleProgressUpdate}
        progressUpdateIntervalMillis={1000}
      />

      {isLoading && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#2563eb" />
        </View>
      )}

      <View style={styles.controls}>
        <TouchableOpacity
          style={styles.playButton}
          onPress={handlePlayPause}
        >
          <Text style={styles.playButtonText}>
            {isPlaying ? '⏸️' : '▶️'}
          </Text>
        </TouchableOpacity>

        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(position)}</Text>
          <View style={styles.progressBar}>
            <View
              style={[
                styles.progressFill,
                {
                  width: `${
                    duration > 0 ? (position / duration) * 100 : 0
                  }%`,
                },
              ]}
            />
          </View>
          <Text style={styles.timeText}>{formatTime(duration)}</Text>
        </View>
      </View>

      {title && <Text style={styles.title}>{title}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
  },
  video: {
    width: '100%',
    height: 200,
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  controls: {
    backgroundColor: '#1a1a1a',
    padding: 12,
  },
  playButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#2563eb',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  playButtonText: {
    fontSize: 20,
  },
  timeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  timeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  progressBar: {
    flex: 1,
    height: 4,
    backgroundColor: '#404040',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#2563eb',
  },
  title: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '600',
    padding: 12,
    backgroundColor: '#0f172a',
  },
});
