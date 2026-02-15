import { useQuery, useMutation } from '@tanstack/react-query';
import api from '@/lib/api';

// Fetch video feed
export function useVideoFeed(page: number) {
  return useQuery({
    queryKey: ['videoFeed', page],
    queryFn: async () => {
      const { data } = await api.get(`/videos/feed?page=${page}`);
      return data;
    },
  });
}

// Like a video
export function useVideoLike() {
  return useMutation({
    mutationFn: async (videoId: string) => {
      const { data } = await api.post(`/videos/${videoId}/like`);
      return data;
    },
  });
}

// Save a video
export function useVideoSave() {
  return useMutation({
    mutationFn: async (videoId: string) => {
      const { data } = await api.post(`/videos/${videoId}/save`);
      return data;
    },
  });
}
